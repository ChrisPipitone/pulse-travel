-- JAB-13: Restrict profiles SELECT to co-trip members + self.
-- Previous policy ("profiles: read any") allowed any authenticated user to
-- read any other user's display_name, avatar_url, and tier — full enumeration.
--
-- New policy: a user can read a profile if:
--   a) it is their own row (id = auth.uid()), OR
--   b) they share at least one trip with that user
--
-- JAB-15: Revoke SELECT on profiles.tier from authenticated.
-- tier is sensitive business data (subscription level). No frontend code reads
-- it yet (JAB-9 open). When JAB-9 is implemented, expose tier only via a
-- self-scoped query or SECURITY DEFINER function — never via a broad SELECT.

-- ── JAB-13 ────────────────────────────────────────────────────────────────────

drop policy "profiles: read any" on public.profiles;

create policy "profiles: select co-trip members and self"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.trip_members tm1
      join public.trip_members tm2 on tm1.trip_id = tm2.trip_id
      where tm1.user_id = auth.uid()
        and tm2.user_id = profiles.id
    )
  );

-- ── JAB-15 ────────────────────────────────────────────────────────────────────
-- Column-level REVOKE cannot override a table-level GRANT in PostgreSQL.
-- Must revoke table-level SELECT and re-grant only the safe columns.
-- When JAB-9 exposes tier to the client, use a SECURITY DEFINER function or
-- a self-scoped query (id = auth.uid()) — never a broad SELECT.

revoke select on public.profiles from authenticated;
grant select (id, display_name, avatar_url, created_at) on public.profiles to authenticated;
revoke update (tier) on public.profiles from authenticated;
