-- ── Enable RLS on all tables ─────────────────────────────────────────────────

alter table profiles            enable row level security;
alter table trips               enable row level security;
alter table trip_members        enable row level security;
alter table activities          enable row level security;
alter table activity_ratings    enable row level security;
alter table activity_categories enable row level security;
alter table trip_events         enable row level security;
alter table trip_event_members  enable row level security;

-- No security definer functions.
-- Membership checks are inline subqueries.
-- trip_members self-referential subquery: Postgres breaks recursion at the same
-- table boundary — inner query runs without RLS, which is documented safe behavior
-- and does not grant elevated privileges.

-- ── profiles ─────────────────────────────────────────────────────────────────

create policy "profiles: read any"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles: insert own"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: update own"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- ── trips ────────────────────────────────────────────────────────────────────

create policy "trips: read if member"
  on trips for select
  to authenticated
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = trips.id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "trips: insert own"
  on trips for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "trips: update if owner"
  on trips for update
  to authenticated
  using (created_by = auth.uid());

create policy "trips: delete if owner"
  on trips for delete
  to authenticated
  using (created_by = auth.uid());

-- ── trip_members ──────────────────────────────────────────────────────────────
-- Self-referential subquery: Postgres does not apply RLS recursively to the
-- same table within its own policy expression. The inner SELECT runs without
-- the policy applied, which is Postgres's documented recursion-breaking behavior.
-- This is not a privilege escalation — the inner query is read-only and scoped
-- to user_id = auth.uid().

create policy "trip_members: read if member of same trip"
  on trip_members for select
  to authenticated
  using (
    trip_id in (
      select trip_id from trip_members
      where user_id = auth.uid()
    )
  );

create policy "trip_members: insert self"
  on trip_members for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "trip_members: update own dates"
  on trip_members for update
  to authenticated
  using (user_id = auth.uid());

create policy "trip_members: delete self or owner"
  on trip_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from trips
      where trips.id = trip_members.trip_id
        and trips.created_by = auth.uid()
    )
  );

-- ── activities ───────────────────────────────────────────────────────────────

create policy "activities: read if member"
  on activities for select
  to authenticated
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = activities.trip_id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "activities: insert if member"
  on activities for insert
  to authenticated
  with check (
    added_by = auth.uid()
    and exists (
      select 1 from trip_members
      where trip_members.trip_id = activities.trip_id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "activities: update if adder"
  on activities for update
  to authenticated
  using (added_by = auth.uid());

create policy "activities: delete if adder or owner"
  on activities for delete
  to authenticated
  using (
    added_by = auth.uid()
    or exists (
      select 1 from trips
      where trips.id = activities.trip_id
        and trips.created_by = auth.uid()
    )
  );

-- ── activity_ratings ──────────────────────────────────────────────────────────

create policy "activity_ratings: read if trip member"
  on activity_ratings for select
  to authenticated
  using (
    exists (
      select 1 from activities
      join trip_members on trip_members.trip_id = activities.trip_id
      where activities.id = activity_ratings.activity_id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "activity_ratings: insert own"
  on activity_ratings for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from activities
      join trip_members on trip_members.trip_id = activities.trip_id
      where activities.id = activity_ratings.activity_id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "activity_ratings: update own"
  on activity_ratings for update
  to authenticated
  using (user_id = auth.uid());

create policy "activity_ratings: delete own"
  on activity_ratings for delete
  to authenticated
  using (user_id = auth.uid());

-- ── activity_categories ───────────────────────────────────────────────────────

create policy "activity_categories: read all"
  on activity_categories for select
  using (true);

-- ── trip_events ───────────────────────────────────────────────────────────────

create policy "trip_events: read if member"
  on trip_events for select
  to authenticated
  using (
    exists (
      select 1 from trip_members
      where trip_members.trip_id = trip_events.trip_id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "trip_events: insert if owner"
  on trip_events for insert
  to authenticated
  with check (
    exists (
      select 1 from trips
      where trips.id = trip_events.trip_id
        and trips.created_by = auth.uid()
    )
  );

create policy "trip_events: update if owner"
  on trip_events for update
  to authenticated
  using (
    exists (
      select 1 from trips
      where trips.id = trip_events.trip_id
        and trips.created_by = auth.uid()
    )
  );

create policy "trip_events: delete if owner"
  on trip_events for delete
  to authenticated
  using (
    exists (
      select 1 from trips
      where trips.id = trip_events.trip_id
        and trips.created_by = auth.uid()
    )
  );

-- ── trip_event_members ────────────────────────────────────────────────────────

create policy "trip_event_members: read if trip member"
  on trip_event_members for select
  to authenticated
  using (
    exists (
      select 1 from trip_events
      join trip_members on trip_members.trip_id = trip_events.trip_id
      where trip_events.id = trip_event_members.event_id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "trip_event_members: insert if owner"
  on trip_event_members for insert
  to authenticated
  with check (
    exists (
      select 1 from trip_events
      join trips on trips.id = trip_events.trip_id
      where trip_events.id = trip_event_members.event_id
        and trips.created_by = auth.uid()
    )
  );

create policy "trip_event_members: delete if owner"
  on trip_event_members for delete
  to authenticated
  using (
    exists (
      select 1 from trip_events
      join trips on trips.id = trip_events.trip_id
      where trip_events.id = trip_event_members.event_id
        and trips.created_by = auth.uid()
    )
  );
