-- JAB-56 CRUD audit, Layer 0 — grant baseline hardening.
-- See docs/code-reviews/CRUD_PERMISSIONS_AUDIT.md.
--
-- Legacy Supabase defaults granted ALL on public to anon + authenticated.
-- Only anon SELECT was ever revoked. This enforces the intended model:
--   anon         => no grants at all (no anonymous access; RLS + grants both deny)
--   authenticated => SELECT/INSERT/UPDATE/DELETE only (no TRUNCATE/REFERENCES/TRIGGER)
-- RLS already gates row access; this removes privileges the app never uses and
-- that policies cannot constrain (TRUNCATE is not subject to RLS).

-- ── F1: anon has no business holding any table privilege ─────────────────────
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- ── F2: trim authenticated to the four DML verbs the app uses ────────────────
revoke truncate, references, trigger on all tables in schema public from authenticated;
-- Future tables: default to the four verbs only (replaces the broad default set
-- in 20260527000000, which granted s/i/u/d but Postgres also auto-adds the rest
-- only via explicit ALL — keeping this explicit and tight).
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

-- ── F3: scope stops + activity_categories policies to authenticated ──────────
-- These were created with no role clause (=> {public}). Harmless once anon has
-- no grants, but make the intent explicit and consistent with every other table.

drop policy if exists "activity_categories: read all" on activity_categories;
create policy "activity_categories: read all"
  on activity_categories for select
  to authenticated
  using (true);

drop policy if exists "trip members can view stops" on stops;
create policy "trip members can view stops"
  on stops for select
  to authenticated
  using (public.is_trip_member(trip_id));

drop policy if exists "trip members can create stops" on stops;
create policy "trip members can create stops"
  on stops for insert
  to authenticated
  with check (public.is_trip_member(trip_id) and created_by = (select auth.uid()));

drop policy if exists "creator or owner can update stop" on stops;
create policy "creator or owner can update stop"
  on stops for update
  to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.trips where id = trip_id and created_by = (select auth.uid())
    )
  );

drop policy if exists "creator or owner can delete stop" on stops;
create policy "creator or owner can delete stop"
  on stops for delete
  to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.trips where id = trip_id and created_by = (select auth.uid())
    )
  );
