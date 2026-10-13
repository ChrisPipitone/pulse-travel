-- Per-visitor demo sandbox.
--
-- Before: every visitor signed into one shared demo account, so they overwrote
-- each other's ratings, vandalism needed a manual reseed, and the account's
-- password shipped in the client bundle.
--
-- After: /demo signs the visitor in anonymously and calls create_demo_trip(),
-- which clones the seeded template trip (supabase/seed.prod.sql) into a trip the
-- visitor owns. Clones are purged after 24 hours.
--
--   * trips.is_demo            — marks a clone; settable only by create_demo_trip().
--   * member cap               — skipped for clones (the template has 8 members,
--                                a free owner caps at 5).
--   * anonymous users          — confined to their clone: no creating trips, no
--                                joining by invite code.
--   * purge_demo_sandboxes()   — hourly via pg_cron.
--
-- Requires enable_anonymous_sign_ins (config.toml locally, dashboard when hosted).

-- ── is_demo flag ─────────────────────────────────────────────────────────────

alter table public.trips
  add column is_demo boolean not null default false;

-- trips INSERT/UPDATE are table-level grants, so a column-level revoke cannot
-- protect is_demo (same limitation as profiles.tier). SECURITY INVOKER on
-- purpose: current_user is the API role for client writes and the function owner
-- inside create_demo_trip(), which is how the two are told apart.
create function public.guard_trip_is_demo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.is_demo := case when tg_op = 'UPDATE' then old.is_demo else false end;
  end if;
  return new;
end;
$$;

create trigger guard_trip_is_demo
  before insert or update on public.trips
  for each row execute function public.guard_trip_is_demo();

revoke all on function public.guard_trip_is_demo() from public;
revoke execute on function public.guard_trip_is_demo() from anon, authenticated;

-- ── Member cap: skip demo clones ─────────────────────────────────────────────

create or replace function public.check_trip_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id   uuid;
  demo       boolean;
  owner_tier public.user_tier;
  cap        integer;
  cnt        integer;
begin
  select created_by, is_demo into owner_id, demo from trips where id = new.trip_id;

  if demo then
    return new;
  end if;

  select tier into owner_tier from profiles where id = owner_id;

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

-- ── Anonymous users: confined to their clone ─────────────────────────────────

create function public.is_anonymous_user()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

revoke all on function public.is_anonymous_user() from public;
revoke execute on function public.is_anonymous_user() from anon;
grant execute on function public.is_anonymous_user() to authenticated;

create policy "trips: no anonymous insert"
  on public.trips as restrictive for insert
  to authenticated
  with check (not public.is_anonymous_user());

-- Anonymous sign-ins have no email and no name metadata, so the old fallback
-- resolved to NULL and the NOT NULL display_name aborted the sign-in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Guest'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Joining: anonymous users cannot join anything, and nobody can join a clone
-- (it is uncapped and gets purged).
create or replace function public.join_trip_by_invite_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip_id uuid;
begin
  if public.is_anonymous_user() then
    raise exception 'Demo sessions cannot join trips';
  end if;

  select id into v_trip_id
  from trips
  where upper(invite_code) = public.normalize_invite_code(p_code)
    and invite_code_expires_at > now()
    and not is_demo
  limit 1;

  if v_trip_id is null then
    return null;  -- invalid / expired code
  end if;

  -- Already a member: no-op success (re-clicking the link), and avoids a false
  -- member-limit trigger error when the trip is at cap.
  if exists (
    select 1 from trip_members where trip_id = v_trip_id and user_id = auth.uid()
  ) then
    return v_trip_id;
  end if;

  insert into trip_members (trip_id, user_id) values (v_trip_id, auth.uid());
  return v_trip_id;
end;
$$;

-- ── Clone ────────────────────────────────────────────────────────────────────

-- Returns the caller's demo trip, cloning the template on first call. Idempotent,
-- so reloading /demo lands in the same sandbox instead of minting another.
create function public.create_demo_trip()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  -- The template owner seeded by supabase/seed.prod.sql.
  c_template_owner constant uuid := '11111111-0000-4000-8000-000000000001';
  v_uid      uuid := auth.uid();
  v_template trips%rowtype;
  v_trip_id  uuid;
  v_shift    integer;
begin
  -- Anonymous only: a real account calling this would get an uncapped trip.
  if v_uid is null or not public.is_anonymous_user() then
    raise exception 'Demo trips are only available to demo sessions';
  end if;

  select id into v_trip_id from trips where created_by = v_uid and is_demo limit 1;
  if v_trip_id is not null then
    return v_trip_id;
  end if;

  select * into v_template
  from trips
  where created_by = c_template_owner and not is_demo
  order by created_at
  limit 1;
  if not found then
    raise exception 'Demo template trip is missing — run make seed-prod';
  end if;

  -- The template's dates are frozen at seed time; re-anchor every clone so the
  -- trip is always 45 days out.
  v_shift := coalesce((current_date + 45) - v_template.start_date, 0);

  update profiles set display_name = 'You' where id = v_uid;

  insert into trips (name, destination, start_date, end_date, created_by, is_demo)
  values (v_template.name, v_template.destination,
          v_template.start_date + v_shift, v_template.end_date + v_shift, v_uid, true)
  returning id into v_trip_id;

  -- The visitor takes the template owner's seat; the other members are shared
  -- across every clone.
  insert into trip_members (trip_id, user_id, arrival_date, departure_date)
  select v_trip_id,
         case when user_id = c_template_owner then v_uid else user_id end,
         arrival_date + v_shift, departure_date + v_shift
  from trip_members
  where trip_id = v_template.id;

  -- One statement so the old → new id maps are shared by every insert. The
  -- template owner's ratings are left out: the visitor starts unrated.
  with stop_map as materialized (
    select id as old_id, gen_random_uuid() as new_id from stops where trip_id = v_template.id
  ),
  activity_map as materialized (
    select id as old_id, gen_random_uuid() as new_id from activities where trip_id = v_template.id
  ),
  slot_map as materialized (
    select id as old_id, gen_random_uuid() as new_id from itinerary_slots where trip_id = v_template.id
  ),
  new_stops as (
    insert into stops (id, trip_id, name, date_from, date_to, position, created_by)
    select m.new_id, v_trip_id, s.name, s.date_from + v_shift, s.date_to + v_shift, s.position, v_uid
    from stops s
    join stop_map m on m.old_id = s.id
  ),
  new_activities as (
    insert into activities (id, trip_id, name, description, url, location, region,
                            duration_hours, category_id, stop_id, added_by)
    select am.new_id, v_trip_id, a.name, a.description, a.url, a.location, a.region,
           a.duration_hours, a.category_id, sm.new_id, v_uid
    from activities a
    join activity_map am on am.old_id = a.id
    left join stop_map sm on sm.old_id = a.stop_id
  ),
  new_ratings as (
    insert into activity_ratings (activity_id, user_id, rating)
    select am.new_id, r.user_id, r.rating
    from activity_ratings r
    join activity_map am on am.old_id = r.activity_id
    where r.user_id <> c_template_owner
  ),
  new_slots as (
    insert into itinerary_slots (id, trip_id, activity_id, date, created_by)
    select sm.new_id, v_trip_id, am.new_id, s.date + v_shift, v_uid
    from itinerary_slots s
    join slot_map sm on sm.old_id = s.id
    join activity_map am on am.old_id = s.activity_id
  )
  insert into itinerary_slot_members (slot_id, user_id)
  select sm.new_id, case when m.user_id = c_template_owner then v_uid else m.user_id end
  from itinerary_slot_members m
  join slot_map sm on sm.old_id = m.slot_id;

  return v_trip_id;
end;
$$;

revoke all on function public.create_demo_trip() from public;
revoke execute on function public.create_demo_trip() from anon;
grant execute on function public.create_demo_trip() to authenticated;

-- ── Purge ────────────────────────────────────────────────────────────────────

-- Trips first: deleting the owner only nulls trips.created_by, which would leave
-- the clone orphaned rather than removed.
create function public.purge_demo_sandboxes()
returns void
language sql
security definer
set search_path = public
as $$
  delete from trips
  where is_demo and created_at < now() - interval '24 hours';

  delete from auth.users u
  where u.is_anonymous
    and u.created_at < now() - interval '24 hours'
    and not exists (select 1 from trips t where t.created_by = u.id);
$$;

revoke all on function public.purge_demo_sandboxes() from public;
revoke execute on function public.purge_demo_sandboxes() from anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule('purge-demo-sandboxes', '17 * * * *', 'select public.purge_demo_sandboxes()');
