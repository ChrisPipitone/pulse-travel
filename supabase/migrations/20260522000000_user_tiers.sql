-- User tier system.
-- free: 5 members max, planner: 25, enterprise: unlimited.
-- Replaces the hardcoded 50-member cap with a tier-aware trigger.

create type public.user_tier as enum ('free', 'planner', 'enterprise');

alter table public.profiles
  add column tier public.user_tier not null default 'free';

drop trigger enforce_trip_member_limit on public.trip_members;
drop function public.check_trip_member_limit();

create function public.check_trip_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id   uuid;
  owner_tier public.user_tier;
  cap        integer;
  cnt        integer;
begin
  select created_by into owner_id from trips where id = new.trip_id;
  select tier        into owner_tier from profiles where id = owner_id;

  cap := case owner_tier
    when 'free'       then 5
    when 'planner'    then 25
    when 'enterprise' then null   -- unlimited
    else 5
  end;

  if cap is null then
    return new;
  end if;

  select count(*) into cnt from trip_members where trip_id = new.trip_id;

  if cnt >= cap then
    raise exception 'Trip is full (% plan allows up to % members)', owner_tier, cap
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger enforce_trip_member_limit
  before insert on public.trip_members
  for each row execute function public.check_trip_member_limit();
