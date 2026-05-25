-- Trip stops: named geographic legs (Rome, Amalfi, Florence).
-- Activities optionally assigned to a stop via stop_id FK.
-- date is a single advisory date for MVP; see JAB-55 for date range upgrade.

create table public.stops (
  id          uuid        primary key default gen_random_uuid(),
  trip_id     uuid        not null references public.trips(id) on delete cascade,
  name        text        not null,
  date        date,
  position    integer     not null default 0,
  created_by  uuid        not null references public.profiles(id),
  created_at  timestamptz not null default now(),
  constraint stops_name_length check (char_length(trim(name)) >= 1 and char_length(trim(name)) <= 100)
);

create index idx_stops_trip_id on public.stops(trip_id);

-- Link activities to a stop (nullable — unassigned activities are fine).
alter table public.activities add column stop_id uuid references public.stops(id) on delete set null;

-- RLS
alter table public.stops enable row level security;

create policy "trip members can view stops"
  on public.stops for select
  using (public.is_trip_member(trip_id));

create policy "trip members can create stops"
  on public.stops for insert
  with check (public.is_trip_member(trip_id) and created_by = auth.uid());

create policy "creator or owner can update stop"
  on public.stops for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.trips where id = trip_id and created_by = auth.uid()
    )
  );

create policy "creator or owner can delete stop"
  on public.stops for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.trips where id = trip_id and created_by = auth.uid()
    )
  );
