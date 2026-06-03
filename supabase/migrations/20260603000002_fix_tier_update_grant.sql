-- JAB-15 follow-up: the `revoke update (tier)` in 20260527000005 is a no-op.
-- authenticated holds table-level UPDATE (granted in 20260527000000_explicit_grants),
-- and a column-level REVOKE cannot override a table-level GRANT in PostgreSQL.
-- So tier stayed user-updatable: with RLS "profiles: update own" permitting a
-- user to write their own row, anyone could self-assign any subscription tier.
--
-- Fix mirrors the SELECT pattern 20260527000005 used for the read leak: revoke
-- table-level UPDATE, then re-grant UPDATE only on the columns users may edit.

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
