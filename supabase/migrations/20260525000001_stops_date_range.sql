-- Upgrade stops.date (single) to date_from + date_to range.
-- Both remain optional — partial ranges (from-only, to-only) are valid.

alter table public.stops
  drop column date,
  add column date_from date,
  add column date_to   date;

alter table public.stops
  add constraint stops_date_range_order
  check (date_from is null or date_to is null or date_from <= date_to);
