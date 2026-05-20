-- RLS on trip_members self-references trip_members, causing infinite recursion
-- when the trips policy queries trip_members (which triggers trip_members RLS).
-- Fix: security-definer helper reads trip_members without RLS applied.

create function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_trip_member(uuid) from public;
grant execute on function public.is_trip_member(uuid) to authenticated;

-- trips: replace inline subquery with helper
drop policy if exists "trips: read if member" on trips;
create policy "trips: read if member"
  on trips for select
  to authenticated
  using (public.is_trip_member(id));

-- trip_members: replace self-referential subquery with helper
drop policy if exists "trip_members: read if member of same trip" on trip_members;
create policy "trip_members: read if member of same trip"
  on trip_members for select
  to authenticated
  using (public.is_trip_member(trip_id));
