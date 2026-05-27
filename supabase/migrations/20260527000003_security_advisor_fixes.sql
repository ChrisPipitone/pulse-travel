-- Fix Supabase security advisor warnings.
--
-- 1. stops table was created after the anon revoke migration (20260518212030)
--    so it inherited the default anon SELECT grant. Revoke it.
--
-- 2. Trigger functions (check_trip_member_limit, handle_new_user) are callable
--    via RPC by both anon and authenticated. They are only meant to be invoked
--    by triggers, never directly. Revoke EXECUTE from both roles.
--
-- 3. is_trip_member and is_trip_member_by_email: anon has no legitimate use.
--    authenticated needs EXECUTE because RLS policies call these functions.
--    Revoke from anon only.
--
-- 4. get_trip_by_invite_code: anon callable is INTENTIONAL — unauthenticated
--    users need to look up a trip by invite code before signing up.
--    Leave as-is.
--
-- 5. "Signed-in users can see table in GraphQL schema" warnings are false
--    positives — authenticated access is correct, RLS enforces row security,
--    and the app does not use the GraphQL endpoint.

-- ── 1. Revoke anon SELECT on stops ───────────────────────────────────────────

revoke select on public.stops from anon;

-- ── 2. Trigger functions — revoke from both roles ────────────────────────────

revoke execute on function public.check_trip_member_limit() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;

-- ── 3. RLS helper functions — revoke from anon only ──────────────────────────

revoke execute on function public.is_trip_member(uuid) from anon;
revoke execute on function public.is_trip_member_by_email(uuid, text) from anon;
