-- Enables unauthenticated trip preview for the /join page Vibe Check.
-- Intentionally separate from get_trip_by_invite_code (authenticated-only, returns trip ID).
-- This function returns only display-safe fields — no trip ID, no emails, no rating data.
-- Safe to expose to anon because:
--   1. Invite code is already public knowledge (it's in the URL the user received).
--   2. No trip ID returned — anon can't perform any action with this data.
--   3. RLS still blocks all write operations regardless.

create function public.get_trip_preview(p_code text)
returns table (
  name           text,
  destination    text,
  start_date     date,
  end_date       date,
  member_count   bigint,
  activity_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    t.name,
    t.destination,
    t.start_date,
    t.end_date,
    count(distinct tm.user_id) as member_count,
    count(distinct a.id)       as activity_count
  from trips t
  left join trip_members tm on tm.trip_id = t.id
  left join activities    a  on a.trip_id  = t.id
  where t.invite_code = p_code
  group by t.name, t.destination, t.start_date, t.end_date
  limit 1;
$$;

revoke all  on function public.get_trip_preview(text) from public;
grant execute on function public.get_trip_preview(text) to anon;
grant execute on function public.get_trip_preview(text) to authenticated;
