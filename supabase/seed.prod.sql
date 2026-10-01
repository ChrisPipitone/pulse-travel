-- Production demo seed — SAFE to run against the hosted project.
--
-- Unlike seed.sql this NEVER truncates and NEVER touches existing rows. It
-- creates one public demo trip so a first-time visitor sees the product working
-- instead of an empty trip list. Re-running it is a no-op.
--
--   psql "$DATABASE_URL" -v demo_password=<password> -f supabase/seed.prod.sql
--
-- Only demo@pulsetrip.app can be signed into. The seven other members exist so
-- crews and compatibility have real data behind them; their passwords are random
-- and discarded, so none of them is a usable account.

\set ON_ERROR_STOP on

-- pgcrypto lives in the extensions schema on hosted Supabase; crypt() and
-- gen_salt() are not on the default search_path without this.
set search_path = public, extensions;

-- psql substitutes :'demo_password' here; it cannot reach inside the dollar-quoted
-- block below, so hand it over as a setting the block can read.
select set_config('seed.demo_password', :'demo_password', false);

do $seed$
declare
  demo_pw   text := current_setting('seed.demo_password', true);
  v_trip_id uuid;
  v_start   date := current_date + 45;
begin
  if demo_pw is null or demo_pw = '' then
    raise exception 'Set the demo password: psql -v demo_password=<password>';
  end if;

  if exists (select 1 from public.trips where name = 'Italy 2026' and destination = 'Italy') then
    raise notice 'Demo trip already present — nothing to do.';
    return;
  end if;

  -- ── Accounts ───────────────────────────────────────────────────────────────
  -- The demo account is loginable. The rest get throwaway passwords.
  insert into auth.users (
    instance_id, id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, role, aud,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token, email_change, email_change_token_new
  )
  select
    '00000000-0000-0000-0000-000000000000',
    m.id,
    m.email,
    crypt(case when m.email = 'demo@pulsetrip.app' then demo_pw else gen_random_uuid()::text end,
          gen_salt('bf')),
    now(), now(), now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('display_name', m.name),
    false, '', '', '', ''
  from (values
    ('11111111-0000-4000-8000-000000000001'::uuid, 'demo@pulsetrip.app',  'You (demo)'),
    ('11111111-0000-4000-8000-000000000002'::uuid, 'sara@pulsetrip.app',  'Sara'),
    ('11111111-0000-4000-8000-000000000003'::uuid, 'lena@pulsetrip.app',  'Lena'),
    ('11111111-0000-4000-8000-000000000004'::uuid, 'marco@pulsetrip.app', 'Marco'),
    ('11111111-0000-4000-8000-000000000005'::uuid, 'alex@pulsetrip.app',  'Alex'),
    ('11111111-0000-4000-8000-000000000006'::uuid, 'priya@pulsetrip.app', 'Priya'),
    ('11111111-0000-4000-8000-000000000007'::uuid, 'kai@pulsetrip.app',   'Kai'),
    ('11111111-0000-4000-8000-000000000008'::uuid, 'yuki@pulsetrip.app',  'Yuki')
  ) as m(id, email, name)
  on conflict (id) do nothing;

  -- handle_new_user() normally creates these; upsert so display names are right
  -- even if the trigger shape changes.
  insert into public.profiles (id, display_name)
  select u.id, u.raw_user_meta_data->>'display_name'
  from auth.users u
  where u.email like '%@pulsetrip.app'
  on conflict (id) do update set display_name = excluded.display_name;

  -- The member-cap trigger reads the trip owner's tier; free caps at 5 and the
  -- demo trip needs 8 to make the crew split legible.
  update public.profiles
     set tier = 'planner'
   where id = '11111111-0000-4000-8000-000000000001';

  -- ── Trip ───────────────────────────────────────────────────────────────────
  insert into public.trips (name, destination, start_date, end_date, created_by, invite_code,
                            invite_code_expires_at)
  values ('Italy 2026', 'Italy', v_start, v_start + 21,
          '11111111-0000-4000-8000-000000000001',
          'demotrip', now() + interval '10 years')
  returning id into v_trip_id;

  -- Staggered arrivals are the point of the Plan tab — without overlap gaps
  -- there is no convergence to find.
  insert into public.trip_members (trip_id, user_id, arrival_date, departure_date)
  select v_trip_id, m.id, v_start + m.arrive, v_start + m.depart
  from (values
    ('11111111-0000-4000-8000-000000000001'::uuid,  0, 21),
    ('11111111-0000-4000-8000-000000000002'::uuid,  0, 21),
    ('11111111-0000-4000-8000-000000000003'::uuid,  4, 17),
    ('11111111-0000-4000-8000-000000000004'::uuid,  0, 12),
    ('11111111-0000-4000-8000-000000000005'::uuid,  7, 21),
    ('11111111-0000-4000-8000-000000000006'::uuid,  0, 15),
    ('11111111-0000-4000-8000-000000000007'::uuid,  4, 21),
    ('11111111-0000-4000-8000-000000000008'::uuid,  2, 13)
  ) as m(id, arrive, depart);

  -- ── Stops ──────────────────────────────────────────────────────────────────
  insert into public.stops (trip_id, name, date_from, date_to, position, created_by)
  select v_trip_id, s.name, v_start + s.from_off, v_start + s.to_off, s.pos,
         '11111111-0000-4000-8000-000000000001'
  from (values
    ('Rome',            0,  6, 0),
    ('Tuscany',         7,  9, 1),
    ('Naples & Amalfi', 10, 14, 2),
    ('Cinque Terre',    15, 17, 3),
    ('Florence',        18, 21, 4)
  ) as s(name, from_off, to_off, pos);

  -- ── Activities ─────────────────────────────────────────────────────────────
  insert into public.activities (trip_id, name, description, location, region, duration_hours,
                                 stop_id, added_by)
  select v_trip_id, a.name, a.descr, a.loc, a.region, a.hours,
         (select id from public.stops where stops.trip_id = v_trip_id and stops.name = a.stop),
         '11111111-0000-4000-8000-000000000001'
  from (values
    ('Colosseum Tour',          'Skip-the-line guided tour of the arena floor.',   'Piazza del Colosseo, Rome', 'Rome',            3,   'Rome'),
    ('Rome Food Tour',          'Evening street food through Trastevere.',          'Trastevere, Rome',          'Rome',            3,   'Rome'),
    ('Vatican Museums',         'Sistine Chapel and the Raphael Rooms.',            'Vatican City',              'Rome',            4,   'Rome'),
    ('Borghese Gallery',        'Bernini sculpture, timed entry.',                  'Villa Borghese, Rome',      'Rome',            2,   'Rome'),
    ('Trevi & Gelato Walk',     'Late evening wander, no queues.',                  'Trevi, Rome',               'Rome',            2,   'Rome'),
    ('Wine Tasting in Chianti', 'Three estates, long lunch.',                       'Chianti, Tuscany',          'Tuscany',         6,   'Tuscany'),
    ('Siena Half Day',          'Piazza del Campo and the duomo.',                  'Siena, Tuscany',            'Tuscany',         5,   'Tuscany'),
    ('Pompeii Day Trip',        'Guided ruins walk, early start to beat the heat.', 'Pompeii, Campania',         'Naples & Amalfi', 7,   'Naples & Amalfi'),
    ('Amalfi Coast Drive',      'Positano to Ravello with stops.',                  'Amalfi, Campania',          'Naples & Amalfi', 8,   'Naples & Amalfi'),
    ('Capri Day Trip',          'Ferry out, Blue Grotto if the sea is calm.',       'Capri',                     'Naples & Amalfi', 9,   'Naples & Amalfi'),
    ('Cinque Terre Hiking',     'Monterosso to Vernazza coastal trail.',            'Cinque Terre, Liguria',     'Cinque Terre',    5,   'Cinque Terre'),
    ('Uffizi Gallery',          'Botticelli, Caravaggio, timed entry.',             'Florence',                  'Florence',        3,   'Florence')
  ) as a(name, descr, loc, region, hours, stop);

  -- ── Ratings ────────────────────────────────────────────────────────────────
  -- Deliberately shaped so the crews are legible: a food/wine crew (Sara, Marco,
  -- Priya), a museum crew (Lena, Yuki), and an outdoors crew (Alex, Kai). A few
  -- genuine SKIPs so the split states render rather than everything being green.
  insert into public.activity_ratings (activity_id, user_id, rating)
  select a.id, u.id, r.rating::rating
  from (values
    ('Colosseum Tour',          'demo,sara,lena,marco,alex,yuki',  'priya,kai',        ''),
    ('Rome Food Tour',          'demo,sara,marco,priya,kai',       'lena,alex',        'yuki'),
    ('Vatican Museums',         'lena,yuki,priya',                 'demo,sara,marco',  'alex,kai'),
    ('Borghese Gallery',        'lena,yuki',                       'demo,sara,priya',  'marco,alex,kai'),
    ('Trevi & Gelato Walk',     'demo,sara,priya,kai',             'lena,marco,yuki',  'alex'),
    ('Wine Tasting in Chianti', 'demo,sara,marco,priya',           'lena,yuki',        'alex,kai'),
    ('Siena Half Day',          'lena,yuki',                       'demo,sara,marco',  'alex,kai'),
    ('Pompeii Day Trip',        'demo,lena,marco,yuki',            'sara,priya',       'alex,kai'),
    ('Amalfi Coast Drive',      'demo,sara,alex,kai,priya',        'lena,marco',       'yuki'),
    ('Capri Day Trip',          'alex,kai',                        'demo,sara,priya',  'lena,marco,yuki'),
    ('Cinque Terre Hiking',     'alex,kai,demo',                   'sara,lena',        'marco,priya,yuki'),
    ('Uffizi Gallery',          'lena,yuki,demo',                  'sara,priya',       'marco,alex,kai')
  ) as t(activity, musts, maybes, skips)
  cross join lateral (values
    ('MUST', t.musts), ('MAYBE', t.maybes), ('SKIP', t.skips)
  ) as r(rating, who)
  cross join lateral unnest(string_to_array(r.who, ',')) as h(handle)
  join public.activities a on a.trip_id = v_trip_id and a.name = t.activity
  join auth.users u on u.email = h.handle || '@pulsetrip.app'
  where r.who <> ''
  on conflict (activity_id, user_id) do nothing;

  -- ── A partly-built itinerary ───────────────────────────────────────────────
  -- Half-scheduled on purpose: the Plan tab should have something to resolve.
  insert into public.itinerary_slots (trip_id, activity_id, date, created_by)
  select v_trip_id, a.id, v_start + s.day_off, '11111111-0000-4000-8000-000000000001'
  from (values
    ('Colosseum Tour',          1),
    ('Rome Food Tour',          2),
    ('Vatican Museums',         4),
    ('Wine Tasting in Chianti', 8),
    ('Pompeii Day Trip',       11),
    ('Amalfi Coast Drive',     13)
  ) as s(name, day_off)
  join public.activities a on a.trip_id = v_trip_id and a.name = s.name;

  raise notice 'Demo trip created: % (invite code: demotrip)', v_trip_id;
end
$seed$;
