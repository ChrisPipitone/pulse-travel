-- Invite code lookup bypasses RLS so a non-member can resolve a trip
-- from a shared link before joining. Returns only the row matching the
-- exact code — no other trips are exposed.
--
-- RLS cannot express "allow SELECT if the queried invite_code matches"
-- because policy expressions have no access to query parameters.
-- SECURITY DEFINER (same pattern as is_trip_member) is the correct solution.

create function public.get_trip_by_invite_code(p_code text)
returns setof trips
language sql
security definer
stable
set search_path = public
as $$
  select * from trips where invite_code = p_code limit 1;
$$;

revoke all on function public.get_trip_by_invite_code(text) from public;
grant execute on function public.get_trip_by_invite_code(text) to authenticated;
