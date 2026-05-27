-- Supabase is removing auto-exposure of public schema tables to the Data API.
-- Existing projects lose the implicit behavior on 2026-10-30.
-- Add explicit grants now so the cutover has no impact.
--
-- anon role intentionally has no grants (see 20260518212030_revoke_anon_select).
-- All app access goes through the authenticated role enforced by RLS.

grant usage on schema public to authenticated;

grant select, insert, update, delete
  on all tables in schema public
  to authenticated;

grant usage, select
  on all sequences in schema public
  to authenticated;

-- Cover tables and sequences created in future migrations.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;
