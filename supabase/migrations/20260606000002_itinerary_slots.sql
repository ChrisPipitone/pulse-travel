-- Convergence Calendar (Plan surface) — see docs/decisions/CONVERGENCE_CALENDAR.md.
--
-- A slot = a proposed day for an activity, with a crew subset. Nothing is booked.
-- One activity may have MULTIPLE slots (that IS the 2+N split) — so NO unique(activity_id).
-- itinerary_slot_members holds the per-slot crew subset and also implements
-- "any user can be added to any slot regardless of rating".
--
-- RLS: SELECT = trip member; INSERT/UPDATE/DELETE = trip owner (organizer curates the
-- sequence; members influence via their own dates, not by editing slots). Mirrors the
-- trip_events / stops owner-only pattern (20260603000004).

create table public.itinerary_slots (
  id          uuid        primary key default gen_random_uuid(),
  trip_id     uuid        not null references public.trips(id) on delete cascade,
  activity_id uuid        not null references public.activities(id) on delete cascade,
  date        date        not null,
  created_by  uuid        not null references public.profiles(id),
  created_at  timestamptz not null default now()
);

create index idx_itinerary_slots_trip_id on public.itinerary_slots(trip_id);
create index idx_itinerary_slots_activity_id on public.itinerary_slots(activity_id);

create table public.itinerary_slot_members (
  slot_id uuid not null references public.itinerary_slots(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (slot_id, user_id)
);

create index idx_itinerary_slot_members_user_id on public.itinerary_slot_members(user_id);

-- ── RLS: itinerary_slots ─────────────────────────────────────────────────────
alter table public.itinerary_slots enable row level security;

create policy "itinerary_slots: select if member"
  on public.itinerary_slots for select
  to authenticated
  using (public.is_trip_member(trip_id));

create policy "itinerary_slots: insert if owner"
  on public.itinerary_slots for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from public.trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  );

create policy "itinerary_slots: update if owner"
  on public.itinerary_slots for update
  to authenticated
  using (
    exists (select 1 from public.trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  );

create policy "itinerary_slots: delete if owner"
  on public.itinerary_slots for delete
  to authenticated
  using (
    exists (select 1 from public.trips where trips.id = trip_id and trips.created_by = (select auth.uid()))
  );

-- ── RLS: itinerary_slot_members (gated via parent slot's trip) ───────────────
alter table public.itinerary_slot_members enable row level security;

create policy "itinerary_slot_members: select if member"
  on public.itinerary_slot_members for select
  to authenticated
  using (
    exists (
      select 1 from public.itinerary_slots s
      where s.id = slot_id and public.is_trip_member(s.trip_id)
    )
  );

create policy "itinerary_slot_members: insert if owner"
  on public.itinerary_slot_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.itinerary_slots s
      join public.trips t on t.id = s.trip_id
      where s.id = slot_id and t.created_by = (select auth.uid())
    )
  );

create policy "itinerary_slot_members: delete if owner"
  on public.itinerary_slot_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.itinerary_slots s
      join public.trips t on t.id = s.trip_id
      where s.id = slot_id and t.created_by = (select auth.uid())
    )
  );
