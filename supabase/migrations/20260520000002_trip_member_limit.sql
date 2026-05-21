-- Hard cap: 50 members per trip.
-- Enforced via trigger so it applies to all inserts regardless of path
-- (RLS policies, service role, direct SQL). Magic number 50 is arbitrary —
-- revisit before launch based on actual usage patterns.

create function public.check_trip_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from trip_members where trip_id = new.trip_id) >= 50 then
    raise exception 'Trip has reached the maximum of 50 members'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger enforce_trip_member_limit
  before insert on trip_members
  for each row execute function public.check_trip_member_limit();
