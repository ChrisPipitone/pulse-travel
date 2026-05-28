-- check_trip_member_limit and handle_new_user have EXECUTE granted to PUBLIC
-- (Postgres default on CREATE FUNCTION). Role-specific revokes don't override
-- a PUBLIC grant — must revoke from PUBLIC directly.
--
-- These are trigger functions, not RPC endpoints. Trigger execution does not
-- check the calling role's EXECUTE privilege, so revoking from PUBLIC is safe
-- and does not affect trigger firing.

revoke execute on function public.check_trip_member_limit() from public;
revoke execute on function public.handle_new_user() from public;
