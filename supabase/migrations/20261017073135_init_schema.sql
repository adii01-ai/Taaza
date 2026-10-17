-- Enums
create type public.diet_pref as enum ('veg', 'non_veg', 'eggetarian', 'jain', 'vegan');
create type public.app_language as enum ('en', 'hi');
create type public.storage_place as enum ('fridge', 'pantry', 'freezer');
create type public.item_status as enum ('fresh', 'used', 'wasted', 'shared');
create type public.item_source as enum ('manual', 'fridge_photo', 'grocery_bill', 'order_screenshot');
create type public.member_role as enum ('owner', 'member');
create type public.share_status as enum ('open', 'claimed', 'closed', 'expired');
create type public.request_status as enum ('pending', 'accepted', 'declined', 'cancelled');

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  diet public.diet_pref not null default 'veg',
  language public.app_language not null default 'en',
  reminder_time time not null default '08:00',
  whatsapp_alerts boolean not null default true,
  streak_days integer not null default 0 check (streak_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Households (a shared kitchen)
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Kitchen' check (char_length(name) between 1 and 60),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);
create index household_members_user_idx on public.household_members (user_id);

-- Food items in a kitchen
create table public.items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  category text,
  quantity numeric(10,2) check (quantity is null or quantity > 0),
  unit text,
  place public.storage_place not null default 'fridge',
  price_inr numeric(10,2) check (price_inr is null or price_inr >= 0),
  source public.item_source not null default 'manual',
  added_by uuid references auth.users (id) on delete set null,
  added_at timestamptz not null default now(),
  expires_on date,
  status public.item_status not null default 'fresh',
  status_changed_at timestamptz
);
create index items_household_status_expiry_idx on public.items (household_id, status, expires_on);
create index items_added_by_idx on public.items (added_by);

-- Reference shelf-life table (estimates, editable by admins only)
create table public.shelf_life (
  food_name text primary key,
  category text not null,
  fridge_days integer check (fridge_days > 0),
  pantry_days integer check (pantry_days > 0),
  freezer_days integer check (freezer_days > 0)
);

-- Recipes (read-only for users)
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  minutes integer check (minutes > 0),
  servings integer check (servings > 0),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  ingredients text[] not null default '{}',
  steps jsonb not null default '[]',
  tags text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);
create index recipes_ingredients_idx on public.recipes using gin (ingredients);
create index recipes_tags_idx on public.recipes using gin (tags);

-- Food sharing with neighbours
create table public.share_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  details text check (char_length(details) <= 300),
  cooked_at timestamptz,
  pickup_by timestamptz not null,
  area text,
  approx_lat numeric(7,4),
  approx_lng numeric(7,4),
  status public.share_status not null default 'open',
  created_at timestamptz not null default now(),
  check (cooked_at is null or cooked_at <= pickup_by)
);
create index share_posts_user_idx on public.share_posts (user_id);
create index share_posts_open_idx on public.share_posts (status, pickup_by);

create table public.share_requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.share_posts (id) on delete cascade,
  requester_id uuid not null references auth.users (id) on delete cascade,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (post_id, requester_id)
);
create index share_requests_requester_idx on public.share_requests (requester_id);

-- Helper: is the current user in this household?
create or replace function public.is_household_member(hid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hid and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_household_owner(hid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hid and m.user_id = (select auth.uid()) and m.role = 'owner'
  );
$$;

-- New signup: create profile + a default kitchen with the user as owner
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  hid uuid;
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone);

  insert into public.households (name, created_by)
  values ('My Kitchen', new.id)
  returning id into hid;

  insert into public.household_members (household_id, user_id, role)
  values (hid, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at / status_changed_at current
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.touch_item_status()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;
create trigger items_status_touch before update on public.items
  for each row execute function public.touch_item_status();

-- Monthly savings per household (respects caller's RLS)
create view public.household_monthly_stats
with (security_invoker = true) as
select
  household_id,
  date_trunc('month', status_changed_at)::date as month,
  count(*) filter (where status in ('used', 'shared')) as items_saved,
  count(*) filter (where status = 'wasted') as items_wasted,
  coalesce(sum(price_inr) filter (where status in ('used', 'shared')), 0) as money_saved_inr
from public.items
where status <> 'fresh' and status_changed_at is not null
group by household_id, date_trunc('month', status_changed_at);

-- Row level security
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.items enable row level security;
alter table public.shelf_life enable row level security;
alter table public.recipes enable row level security;
alter table public.share_posts enable row level security;
alter table public.share_requests enable row level security;

create policy "own profile read" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "members read household" on public.households for select to authenticated
  using (public.is_household_member(id));
create policy "owner renames household" on public.households for update to authenticated
  using (public.is_household_owner(id)) with check (public.is_household_owner(id));

create policy "members read members" on public.household_members for select to authenticated
  using (public.is_household_member(household_id));
create policy "owner removes member or self leaves" on public.household_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_household_owner(household_id));

create policy "members read items" on public.items for select to authenticated
  using (public.is_household_member(household_id));
create policy "members add items" on public.items for insert to authenticated
  with check (public.is_household_member(household_id) and added_by = (select auth.uid()));
create policy "members update items" on public.items for update to authenticated
  using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "members delete items" on public.items for delete to authenticated
  using (public.is_household_member(household_id));

create policy "anyone signed in reads shelf life" on public.shelf_life for select to authenticated using (true);
create policy "anyone signed in reads recipes" on public.recipes for select to authenticated using (true);

create policy "read open or own posts" on public.share_posts for select to authenticated
  using (status = 'open' or user_id = (select auth.uid()));
create policy "create own posts" on public.share_posts for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "update own posts" on public.share_posts for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "delete own posts" on public.share_posts for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "requester or poster reads requests" on public.share_requests for select to authenticated
  using (
    requester_id = (select auth.uid())
    or exists (select 1 from public.share_posts p where p.id = post_id and p.user_id = (select auth.uid()))
  );
create policy "request open posts of others" on public.share_requests for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and status = 'pending'
    and exists (select 1 from public.share_posts p where p.id = post_id and p.status = 'open' and p.user_id <> (select auth.uid()))
  );
create policy "requester or poster updates request" on public.share_requests for update to authenticated
  using (
    requester_id = (select auth.uid())
    or exists (select 1 from public.share_posts p where p.id = post_id and p.user_id = (select auth.uid()))
  );

revoke execute on function public.handle_new_user() from public, anon, authenticated;
