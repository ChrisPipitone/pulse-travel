-- JAB-60: Fix account deletion blocked by FK constraints.
--
-- Two FKs reference auth.users / profiles without ON DELETE, causing
-- user deletion to fail with a FK violation:
--   • trips.created_by    → auth.users (NOT NULL, no cascade)
--   • stops.created_by    → profiles   (NOT NULL, no cascade)
--
-- activities.added_by was already fixed in 20260526000000.
--
-- Strategy: SET NULL on delete. The row (trip/stop) survives for other
-- members; attribution is cleared. RLS uses `created_by = auth.uid()` for
-- owner-level writes — NULL = auth.uid() evaluates to NULL (falsy), so
-- orphaned rows become read-only for remaining members. Acceptable for MVP.

-- ── trips.created_by ──────────────────────────────────────────────────────────

alter table public.trips
  alter column created_by drop not null;

alter table public.trips
  drop constraint trips_created_by_fkey;

alter table public.trips
  add constraint trips_created_by_fkey
    foreign key (created_by) references auth.users on delete set null;

-- ── stops.created_by ──────────────────────────────────────────────────────────

alter table public.stops
  alter column created_by drop not null;

alter table public.stops
  drop constraint stops_created_by_fkey;

alter table public.stops
  add constraint stops_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;
