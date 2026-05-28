-- JAB-14: get_trip_by_invite_code returned setof trips (SELECT *).
-- Restrict to the 5 columns the join page actually needs.
-- Return type change requires DROP + recreate (OR REPLACE can't change return type).

drop function public.get_trip_by_invite_code(text);

create function public.get_trip_by_invite_code(p_code text)
returns table (id uuid, name text, destination text, start_date date, end_date date)
language sql
security definer
stable
set search_path = public
as $$
  select id, name, destination, start_date, end_date
  from trips
  where invite_code = p_code
  limit 1;
$$;

revoke all on function public.get_trip_by_invite_code(text) from public;
grant execute on function public.get_trip_by_invite_code(text) to authenticated;
