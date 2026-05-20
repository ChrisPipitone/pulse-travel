-- activities UPDATE policy only allowed the adder. Trip owner needs it too.
drop policy if exists "activities: update if adder" on activities;

create policy "activities: update if adder or owner"
  on activities for update
  to authenticated
  using (
    added_by = auth.uid()
    or exists (
      select 1 from trips
      where trips.id = activities.trip_id
        and trips.created_by = auth.uid()
    )
  );
