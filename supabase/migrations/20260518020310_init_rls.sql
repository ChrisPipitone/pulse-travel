-- Enable RLS on all tables

alter table profiles            enable row level security;
alter table trips               enable row level security;
alter table trip_members        enable row level security;
alter table activities          enable row level security;
alter table activity_ratings    enable row level security;
alter table activity_categories enable row level security;
alter table trip_events         enable row level security;
alter table trip_event_members  enable row level security;

-- profiles
-- Any authenticated user can read profiles (needed to display member names).
-- Each user manages only their own row.

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

-- trips
-- Visible only to members. Only the creator can edit or delete.

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

-- trip_members
-- The SELECT policy is self-referential: Postgres does not apply RLS
-- recursively when a policy's own table appears in a subquery within that
-- same policy expression. The inner SELECT runs as a plain read scoped to
-- auth.uid() -- no elevated privileges, no security definer.

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

-- activities
-- Trip members can read and add activities.
-- Only the adder (or trip owner) can delete.

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

-- activity_ratings
-- Trip members see all ratings (required for compatibility matrix).
-- Each user manages only their own rating.

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

-- activity_categories
-- Public read-only reference data. No user writes.

create policy "activity_categories: read all"
  on activity_categories for select
  using (true);

-- trip_events
-- Trip members can read. Only the trip owner can create, edit, or delete.

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

-- trip_event_members
-- Trip members can read. Only the trip owner can add or remove.

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
