create or replace function private.shares_household(other uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.household_members me
    join public.household_members them on them.household_id = me.household_id
    where me.user_id = (select auth.uid()) and them.user_id = other
  );
$$;

revoke execute on function private.shares_household(uuid) from public, anon;
grant execute on function private.shares_household(uuid) to authenticated;

create policy "family members read each other" on public.profiles for select to authenticated
  using (private.shares_household(id));
