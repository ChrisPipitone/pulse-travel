-- Supersedes item 4 of 20260527000003_security_advisor_fixes.sql.
--
-- That migration left get_trip_by_invite_code anon-executable, assuming the
-- invite-code lookup happened before sign-in. The join flow no longer works
-- that way: apps/web/src/app/join/page.tsx redirects unauthenticated users to
-- sign-in and only calls getTripByInviteCode once a session exists. So anon
-- EXECUTE is unused and the function should be authenticated-only, matching
-- is_trip_member / is_trip_member_by_email.
--
-- Clears security advisor lint 0028 (anon_security_definer_function_executable).
-- The authenticated 0029 warning remains and is intentional — SECURITY DEFINER
-- is required to resolve a trip by invite code across RLS.

revoke execute on function public.get_trip_by_invite_code(text) from anon;
