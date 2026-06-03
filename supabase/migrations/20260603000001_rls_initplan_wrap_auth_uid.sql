-- Performance advisor lint 0003 (auth_rls_initplan): bare auth.uid() in an RLS
-- policy is re-evaluated per row. Wrapping it as (select auth.uid()) lets the
-- planner hoist it to an InitPlan (evaluated once per query). No semantic change.
--
-- Recreates the 28 flagged policies identically except for the wrap.
-- Policies that only call public.is_trip_member(...) are unaffected and untouched.

-- ── profiles ─────────────────────────────────────────────────────────────────

drop policy if exists "profiles: insert own" on profiles;
create policy "profiles: insert own"
  on profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles: update own" on profiles;
create policy "profiles: update own"
  on profiles for update
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles: select co-trip members and self" on profiles;
create policy "profiles: select co-trip members and self"
  on profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.trip_members tm1
      join public.trip_members tm2 on tm1.trip_id = tm2.trip_id
      where tm1.user_id = (select auth.uid())
        and tm2.user_id = profiles.id
    )
  );

-- ── trips ────────────────────────────────────────────────────────────────────

drop policy if exists "trips: insert own" on trips;
create policy "trips: insert own"
  on trips for insert
  to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists "trips: update if owner" on trips;
create policy "trips: update if owner"
  on trips for update
  to authenticated
  using (created_by = (select auth.uid()));

drop policy if exists "trips: delete if owner" on trips;
create policy "trips: delete if owner"
  on trips for delete
  to authenticated
  using (created_by = (select auth.uid()));

drop policy if exists "trips: read if member or owner" on trips;
create policy "trips: read if member or owner"
  on trips for select
  to authenticated
  using (created_by = (select auth.uid()) or public.is_trip_member(id));

-- ── trip_members ─────────────────────────────────────────────────────────────

drop policy if exists "trip_members: insert self" on trip_members;
create policy "trip_members: insert self"
  on trip_members for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "trip_members: update own dates" on trip_members;
create policy "trip_members: update own dates"
  on trip_members for update
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "trip_members: delete self or owner" on trip_members;
create policy "trip_members: delete self or owner"
  on trip_members for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from trips
      where trips.id = trip_members.trip_id
        and trips.created_by = (select auth.uid())
    )
  );

-- ── activities ───────────────────────────────────────────────────────────────

drop policy if exists "activities: read if member" on activities;
create policy "activities: read if member"
  on activities for select
  to authenticated
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = activities.trip_id
        and trip_members.user_id = (select auth.uid())
    )
  );

drop policy if exists "activities: insert if member" on activities;
create policy "activities: insert if member"
  on activities for insert
  to authenticated
  with check (
    added_by = (select auth.uid())
    and exists (
      select 1 from trip_members
      where trip_members.trip_id = activities.trip_id
        and trip_members.user_id = (select auth.uid())
    )
  );

drop policy if exists "activities: update if adder or owner" on activities;
create policy "activities: update if adder or owner"
  on activities for update
  to authenticated
  using (
    added_by = (select auth.uid())
    or exists (
      select 1 from trips
      where trips.id = activities.trip_id
        and trips.created_by = (select auth.uid())
    )
  );

drop policy if exists "activities: delete if adder or owner" on activities;
create policy "activities: delete if adder or owner"
  on activities for delete
  to authenticated
  using (
    added_by = (select auth.uid())
    or exists (
      select 1 from trips
      where trips.id = activities.trip_id
        and trips.created_by = (select auth.uid())
    )
  );

-- ── activity_ratings ─────────────────────────────────────────────────────────

drop policy if exists "activity_ratings: read if trip member" on activity_ratings;
create policy "activity_ratings: read if trip member"
  on activity_ratings for select
  to authenticated
  using (
    exists (
      select 1 from activities
      join trip_members on trip_members.trip_id = activities.trip_id
      where activities.id = activity_ratings.activity_id
        and trip_members.user_id = (select auth.uid())
    )
  );

drop policy if exists "activity_ratings: insert own" on activity_ratings;
create policy "activity_ratings: insert own"
  on activity_ratings for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from activities
      join trip_members on trip_members.trip_id = activities.trip_id
      where activities.id = activity_ratings.activity_id
        and trip_members.user_id = (select auth.uid())
    )
  );

drop policy if exists "activity_ratings: update own" on activity_ratings;
create policy "activity_ratings: update own"
  on activity_ratings for update
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "activity_ratings: delete own" on activity_ratings;
create policy "activity_ratings: delete own"
  on activity_ratings for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ── trip_events ──────────────────────────────────────────────────────────────

drop policy if exists "trip_events: read if member" on trip_events;
create policy "trip_events: read if member"
  on trip_events for select
  to authenticated
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = trip_events.trip_id
        and trip_members.user_id = (select auth.uid())
    )
  );

drop policy if exists "trip_events: insert if owner" on trip_events;
create policy "trip_events: insert if owner"
  on trip_events for insert
  to authenticated
  with check (
    exists (
      select 1 from trips
      where trips.id = trip_events.trip_id
        and trips.created_by = (select auth.uid())
    )
  );

drop policy if exists "trip_events: update if owner" on trip_events;
create policy "trip_events: update if owner"
  on trip_events for update
  to authenticated
  using (
    exists (
      select 1 from trips
      where trips.id = trip_events.trip_id
        and trips.created_by = (select auth.uid())
    )
  );

drop policy if exists "trip_events: delete if owner" on trip_events;
create policy "trip_events: delete if owner"
  on trip_events for delete
  to authenticated
  using (
    exists (
      select 1 from trips
      where trips.id = trip_events.trip_id
        and trips.created_by = (select auth.uid())
    )
  );

-- ── trip_event_members ───────────────────────────────────────────────────────

drop policy if exists "trip_event_members: read if trip member" on trip_event_members;
create policy "trip_event_members: read if trip member"
  on trip_event_members for select
  to authenticated
  using (
    exists (
      select 1 from trip_events
      join trip_members on trip_members.trip_id = trip_events.trip_id
      where trip_events.id = trip_event_members.event_id
        and trip_members.user_id = (select auth.uid())
    )
  );

drop policy if exists "trip_event_members: insert if owner" on trip_event_members;
create policy "trip_event_members: insert if owner"
  on trip_event_members for insert
  to authenticated
  with check (
    exists (
      select 1 from trip_events
      join trips on trips.id = trip_events.trip_id
      where trip_events.id = trip_event_members.event_id
        and trips.created_by = (select auth.uid())
    )
  );

drop policy if exists "trip_event_members: delete if owner" on trip_event_members;
create policy "trip_event_members: delete if owner"
  on trip_event_members for delete
  to authenticated
  using (
    exists (
      select 1 from trip_events
      join trips on trips.id = trip_events.trip_id
      where trip_events.id = trip_event_members.event_id
        and trips.created_by = (select auth.uid())
    )
  );

-- ── stops (no role clause, matching original definitions) ──────────────────────

drop policy if exists "trip members can create stops" on stops;
create policy "trip members can create stops"
  on stops for insert
  with check (public.is_trip_member(trip_id) and created_by = (select auth.uid()));

drop policy if exists "creator or owner can update stop" on stops;
create policy "creator or owner can update stop"
  on stops for update
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.trips where id = trip_id and created_by = (select auth.uid())
    )
  );

drop policy if exists "creator or owner can delete stop" on stops;
create policy "creator or owner can delete stop"
  on stops for delete
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.trips where id = trip_id and created_by = (select auth.uid())
    )
  );
