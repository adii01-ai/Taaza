alter table public.profiles add column email text;
alter table public.profiles rename column whatsapp_alerts to notifications_on;
comment on column public.profiles.phone is 'Unused: app signs in with Google only.';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  hid uuid;
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  insert into public.households (name, created_by)
  values ('My Kitchen', new.id)
  returning id into hid;

  insert into public.household_members (household_id, user_id, role)
  values (hid, new.id, 'owner');

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
