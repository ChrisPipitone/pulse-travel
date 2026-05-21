-- After createTrip inserts the row, the .select() call triggers PostgREST to
-- apply the SELECT policy to the RETURNING result. The creator is not yet a
-- trip_member at that point, so is_trip_member() returns false, and PostgREST
-- reports "new row violates row-level security policy".
--
-- Fix: let the creator (created_by = auth.uid()) read their own trip without
-- requiring membership. This is semantically correct — the owner should always
-- be able to see their trip.
drop policy if exists "trips: read if member" on trips;
drop policy if exists "trips: read if member or owner" on trips;

create policy "trips: read if member or owner"
  on trips for select
  to authenticated
  using (created_by = auth.uid() OR public.is_trip_member(id));
