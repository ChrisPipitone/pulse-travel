-- JAB-56 follow-up: F4 (WITH CHECK on UPDATE policies) + F6 (stops owner-only).
-- See docs/code-reviews/CRUD_PERMISSIONS_AUDIT.md.
--
-- F4: every UPDATE policy had USING but no WITH CHECK, so the *new* row was
-- unvalidated. Via direct API a user could mutate the row out of scope — worst
-- case relocate an activity/stop into a trip they don't belong to. Add WITH
-- CHECK to constrain the post-update row. Self-scoped tables mirror USING;
-- activities additionally require membership of the (new) trip_id.
--
-- F6 (per JAB-81): stops CRUD is owner-only (was any-member create, creator-or-
-- owner update/delete).

-- ── trips: update if owner — mirror USING into WITH CHECK ────────────────────
drop policy if exists "trips: update if owner" on trips;
create policy "trips: update if owner"
  on trips for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

-- ── trip_events: update if owner ─────────────────────────────────────────────
drop policy if exists "trip_events: update if owner" on trip_events;
create policy "trip_events: update if owner"
  on trip_events for update
  to authenticated
  using (
    exists (select 1 from trips where trips.id = trip_events.trip_id and trips.created_by = (select auth.uid()))
  )
  with check (
    exists (select 1 from trips where trips.id = trip_events.trip_id and trips.created_by = (select auth.uid()))
  );

-- ── trip_members: update own dates ───────────────────────────────────────────
drop policy if exists "trip_members: update own dates" on trip_members;
create policy "trip_members: update own dates"
  on trip_members for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── activity_ratings: update own ─────────────────────────────────────────────
drop policy if exists "activity_ratings: update own" on activity_ratings;
create policy "activity_ratings: update own"
  on activity_ratings for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── profiles: update own (mitigated by column grant; add CHECK for completeness)
drop policy if exists "profiles: update own" on profiles;
create policy "profiles: update own"
  on profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ── activities: update if adder or owner — block cross-trip relocation ───────
-- WITH CHECK requires the post-update row to live in a trip the user belongs to,
-- and to either remain their own or belong to a trip they own.
drop policy if exists "activities: update if adder or owner" on activities;
create policy "activities: update if adder or owner"
  on activities for update
  to authenticated
  using (
    added_by = (select auth.uid())
    or exists (select 1 from trips where trips.id = activities.trip_id and trips.created_by = (select auth.uid()))
  )
  with check (
    public.is_trip_member(trip_id)
    and (
      added_by = (select auth.uid())
      or exists (select 1 from trips where trips.id = activities.trip_id and trips.created_by = (select auth.uid()))
    )
  );

-- ── stops: owner-only CRUD (F6) + WITH CHECK (F4) ────────────────────────────
drop policy if exists "trip members can create stops" on stops;
create policy "trip owner can create stops"
  on stops for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  );

drop policy if exists "creator or owner can update stop" on stops;
create policy "trip owner can update stop"
  on stops for update
  to authenticated
  using (
    exists (select 1 from trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  )
  with check (
    exists (select 1 from trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  );

drop policy if exists "creator or owner can delete stop" on stops;
create policy "trip owner can delete stop"
  on stops for delete
  to authenticated
  using (
    exists (select 1 from trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  );
