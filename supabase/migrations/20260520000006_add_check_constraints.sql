-- Enforce at the DB layer the same invariants the UI enforces.

-- Fix any test rows with inverted dates created before UI validation existed.
update trips set end_date = start_date where end_date < start_date;

-- trips
alter table trips
  add constraint trips_name_length         check (char_length(trim(name)) between 1 and 100),
  add constraint trips_destination_length  check (char_length(trim(destination)) between 1 and 100),
  add constraint trips_date_order          check (start_date is null or end_date is null or end_date >= start_date);

-- activities
alter table activities
  add constraint activities_name_length     check (char_length(trim(name)) between 1 and 100),
  add constraint activities_location_length check (location is null or char_length(trim(location)) <= 100),
  add constraint activities_desc_length     check (description is null or char_length(trim(description)) <= 500),
  add constraint activities_url_length      check (url is null or char_length(url) <= 2000),
  add constraint activities_url_scheme      check (url is null or url ~ '^https?://');
