create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.is_household_member(uuid) set schema private;
alter function public.is_household_owner(uuid) set schema private;

revoke execute on function private.is_household_member(uuid) from public, anon;
revoke execute on function private.is_household_owner(uuid) from public, anon;
grant execute on function private.is_household_member(uuid) to authenticated;
grant execute on function private.is_household_owner(uuid) to authenticated;

create index households_created_by_idx on public.households (created_by);
