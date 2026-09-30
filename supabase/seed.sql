-- Pulse seed — 5 curated trips showcasing all UI states:
--   filled/unfilled, rated/unrated, realistic and polarized.
-- All passwords: password123

-- ── Clear all data ───────────────────────────────────────────────────────────
truncate table
  itinerary_slot_members,
  itinerary_slots,
  stops,
  trip_event_members,
  trip_events,
  activity_ratings,
  activities,
  trip_members,
  trips,
  profiles
restart identity cascade;

delete from auth.users;

-- ── Auth users ───────────────────────────────────────────────────────────────

insert into auth.users (
  instance_id, id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  role, aud,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change, email_change_token_new
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'marco@example.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'sara@example.com',   crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'lena@example.com',   crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'chris@example.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005', 'alex@example.com',   crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000006', 'priya@example.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000007', 'kai@example.com',    crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000008', 'nadia@example.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000009', 'tom@example.com',    crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000010', 'yuki@example.com',   crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '');

insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at) values
  ('marco@example.com',  '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"marco@example.com"}',  'email', now(), now()),
  ('sara@example.com',   '00000000-0000-0000-0000-000000000002', '{"sub":"00000000-0000-0000-0000-000000000002","email":"sara@example.com"}',   'email', now(), now()),
  ('lena@example.com',   '00000000-0000-0000-0000-000000000003', '{"sub":"00000000-0000-0000-0000-000000000003","email":"lena@example.com"}',   'email', now(), now()),
  ('chris@example.com',  '00000000-0000-0000-0000-000000000004', '{"sub":"00000000-0000-0000-0000-000000000004","email":"chris@example.com"}',  'email', now(), now()),
  ('alex@example.com',   '00000000-0000-0000-0000-000000000005', '{"sub":"00000000-0000-0000-0000-000000000005","email":"alex@example.com"}',   'email', now(), now()),
  ('priya@example.com',  '00000000-0000-0000-0000-000000000006', '{"sub":"00000000-0000-0000-0000-000000000006","email":"priya@example.com"}',  'email', now(), now()),
  ('kai@example.com',    '00000000-0000-0000-0000-000000000007', '{"sub":"00000000-0000-0000-0000-000000000007","email":"kai@example.com"}',    'email', now(), now()),
  ('nadia@example.com',  '00000000-0000-0000-0000-000000000008', '{"sub":"00000000-0000-0000-0000-000000000008","email":"nadia@example.com"}',  'email', now(), now()),
  ('tom@example.com',    '00000000-0000-0000-0000-000000000009', '{"sub":"00000000-0000-0000-0000-000000000009","email":"tom@example.com"}',    'email', now(), now()),
  ('yuki@example.com',   '00000000-0000-0000-0000-000000000010', '{"sub":"00000000-0000-0000-0000-000000000010","email":"yuki@example.com"}',   'email', now(), now());

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- Trigger on_auth_user_created fires above and creates bare profiles.
-- Upsert here to set proper display names and tiers.

insert into profiles (id, display_name, tier) values
  ('00000000-0000-0000-0000-000000000001', 'Marco',  'planner'),
  ('00000000-0000-0000-0000-000000000002', 'Sara',   'free'),
  ('00000000-0000-0000-0000-000000000003', 'Lena',   'free'),
  ('00000000-0000-0000-0000-000000000004', 'Chris',  'free'),
  ('00000000-0000-0000-0000-000000000005', 'Alex',   'planner'),
  ('00000000-0000-0000-0000-000000000006', 'Priya',  'enterprise'),
  ('00000000-0000-0000-0000-000000000007', 'Kai',    'free'),
  ('00000000-0000-0000-0000-000000000008', 'Nadia',  'planner'),
  ('00000000-0000-0000-0000-000000000009', 'Tom',    'free'),
  ('00000000-0000-0000-0000-000000000010', 'Yuki',   'planner')
on conflict (id) do update set display_name = excluded.display_name, tier = excluded.tier;

-- ── Bulk users 11–30 ─────────────────────────────────────────────────────────
-- Generic filler members for large-trip showcasing (Italy, Patagonia, Lisbon).

do $$
declare
  i   integer;
  uid uuid;
  eml text;
begin
  for i in 11..30 loop
    uid := ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;
    eml := 'user' || i || '@example.com';

    insert into auth.users (
      instance_id, id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      role, aud,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000'::uuid,
      uid, eml, crypt('password123', gen_salt('bf')),
      now(), now(), now(),
      'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}', '{}',
      false, '', '', '', ''
    );

    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (eml, uid, json_build_object('sub', uid::text, 'email', eml)::jsonb, 'email', now(), now());

    insert into profiles (id, display_name, tier)
    values (uid, 'User ' || i, 'free')
    on conflict (id) do update set display_name = excluded.display_name, tier = excluded.tier;
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- Trip 1: Italy 2025 — flagship realistic trip
--
-- 14 members (10 named + bulk 11–14). Staggered arrivals/departures.
-- Rossi Wedding event (Marco, Sara, Alex). 5 stops.
-- 12 activities: 9 fully rated by all named, 1 partial (7/14), 1 zero-rated.
-- Rating design: unanimous MUST (food tour), SKIP splits visible, clear
--   sub-groups (Cinque Terre, Amalfi), strong consensus (Vatican), real
--   disagreement (Pompeii). Borghese + Siena added as new activities.
-- Owner: Marco (planner)
-- ════════════════════════════════════════════════════════════════════════════

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Italy 2025', 'Italy',
   '2025-06-03', '2025-06-24', '00000000-0000-0000-0000-000000000001', 'italy25');

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2025-06-03', '2025-06-24'), -- Marco: full trip
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '2025-06-03', '2025-06-24'), -- Sara: full trip
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '2025-06-07', '2025-06-20'), -- Lena: arrives late, leaves early
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '2025-06-03', '2025-06-15'), -- Chris: leaves halfway
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '2025-06-10', '2025-06-24'), -- Alex: arrives for wedding
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', '2025-06-03', '2025-06-18'), -- Priya: leaves a week early
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', '2025-06-07', '2025-06-24'), -- Kai: arrives with Lena
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', '2025-06-03', '2025-06-16'), -- Nadia: leaves midway
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', '2025-06-05', '2025-06-24'), -- Tom: arrives day 3
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '2025-06-10', '2025-06-24'), -- Yuki: arrives for wedding week
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '2025-06-03', '2025-06-24'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', '2025-06-05', '2025-06-18'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', '2025-06-07', '2025-06-24'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000014', '2025-06-03', '2025-06-20');

insert into trip_events (id, trip_id, name, start_date, end_date) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Rossi Wedding', '2025-06-10', '2025-06-12');

insert into trip_event_members (event_id, user_id) values
  ('bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'), -- Marco
  ('bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'), -- Sara
  ('bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005'); -- Alex

-- Stops: Rome → Tuscany → Naples/Amalfi → Cinque Terre → Florence
insert into stops (id, trip_id, name, date_from, date_to, position, created_by) values
  ('55555555-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Rome',            '2025-06-03', '2025-06-09', 1, '00000000-0000-0000-0000-000000000001'),
  ('55555555-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Tuscany',         '2025-06-10', '2025-06-12', 2, '00000000-0000-0000-0000-000000000001'),
  ('55555555-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Naples & Amalfi', '2025-06-13', '2025-06-17', 3, '00000000-0000-0000-0000-000000000001'),
  ('55555555-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'Cinque Terre',    '2025-06-18', '2025-06-20', 4, '00000000-0000-0000-0000-000000000001'),
  ('55555555-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'Florence',        '2025-06-21', '2025-06-24', 5, '00000000-0000-0000-0000-000000000001');

-- Activities — 8 assigned to stops, 2 unassigned (Trevi + Capri)
insert into activities (id, trip_id, name, description, url, location, region, duration_hours, category_id, added_by, stop_id) values
  -- Rome stop
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Colosseum Tour',
   'Skip-the-line guided tour of the Colosseum, Roman Forum, and Palatine Hill.',
   'https://www.coopculture.it',
   'Piazza del Colosseo, Rome', 'Rome', 3,
   (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000001',
   '55555555-0000-0000-0000-000000000001'),

  ('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Vatican Museums',
   'Sistine Chapel, St. Peter''s Basilica, and the museum galleries.',
   null, 'Vatican City, Rome', 'Rome', 4,
   (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000001',
   '55555555-0000-0000-0000-000000000001'),

  ('cccccccc-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Rome Food Tour',
   'Evening street food tour through Trastevere and Campo de'' Fiori.',
   null, 'Trastevere, Rome', 'Rome', 3,
   (select id from activity_categories where slug = 'food-drink'),
   '00000000-0000-0000-0000-000000000002',
   '55555555-0000-0000-0000-000000000001'),

  -- Tuscany stop
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Wine Tasting in Tuscany',
   'Half-day tour of two Chianti vineyards with guided tasting and lunch.',
   null, 'Chianti, Tuscany', 'Tuscany', 5,
   (select id from activity_categories where slug = 'food-drink'),
   '00000000-0000-0000-0000-000000000002',
   '55555555-0000-0000-0000-000000000002'),

  -- Naples & Amalfi stop
  ('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Pompeii Day Trip',
   'Full-day guided tour of the ancient ruins of Pompeii.',
   null, 'Pompeii, Campania', 'Naples', 8,
   (select id from activity_categories where slug = 'day-trip'),
   '00000000-0000-0000-0000-000000000003',
   '55555555-0000-0000-0000-000000000003'),

  ('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Amalfi Coast Drive',
   'Scenic drive along the Amalfi Coast with stops at Positano and Ravello.',
   null, 'Amalfi, Campania', 'Naples', 6,
   (select id from activity_categories where slug = 'adventure'),
   '00000000-0000-0000-0000-000000000004',
   '55555555-0000-0000-0000-000000000003'),

  -- Cinque Terre stop
  ('cccccccc-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Cinque Terre Hiking',
   'Hike the coastal trail connecting all five villages.',
   null, 'Cinque Terre, Liguria', 'Cinque Terre', 7,
   (select id from activity_categories where slug = 'adventure'),
   '00000000-0000-0000-0000-000000000003',
   '55555555-0000-0000-0000-000000000004'),

  -- Florence stop
  ('cccccccc-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Uffizi Gallery',
   'Florence''s premier art museum — Botticelli, Leonardo, Michelangelo.',
   null, 'Piazzale degli Uffizi, Florence', 'Florence', 4,
   (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000004',
   '55555555-0000-0000-0000-000000000005'),

  -- Unassigned — shows "not yet planned" dashed section in timeline
  ('cccccccc-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Trevi Fountain & Gelato Walk',
   'Evening stroll to the Trevi Fountain, then the best gelato in Rome.',
   null, 'Trevi, Rome', 'Rome', 2,
   (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000002',
   null),

  ('cccccccc-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Capri Day Trip',
   'Ferry to Capri — Blue Grotto, Via Krupp, and Villa Jovis.',
   null, 'Capri, Campania', 'Naples', 9,
   (select id from activity_categories where slug = 'day-trip'),
   '00000000-0000-0000-0000-000000000001',
   null),

  -- Rome stop (new)
  ('cccccccc-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Borghese Gallery',
   'Bernini sculptures and Caravaggio paintings in a villa with gorgeous gardens.',
   null, 'Villa Borghese, Rome', 'Rome', 3,
   (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000001',
   '55555555-0000-0000-0000-000000000001'),

  -- Tuscany stop (new)
  ('cccccccc-0000-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Siena Half Day',
   'Medieval city centre, Piazza del Campo, and the Duomo — stunning from Tuscany.',
   null, 'Siena, Tuscany', 'Tuscany', 6,
   (select id from activity_categories where slug = 'day-trip'),
   '00000000-0000-0000-0000-000000000002',
   '55555555-0000-0000-0000-000000000002');

-- Italy ratings
-- Colosseum:   Marco+Chris+Alex MUST,  Sara+Lena+Priya WANT         — strong group, no conflict
-- Wine Tasting:Sara+Lena MUST, Marco+Alex WANT, Chris MAYBE, Priya SKIP — SKIP visible
-- Vatican:     Sara+Priya MUST, rest WANT                            — consensus
-- Pompeii:     Chris+Alex MUST, Marco+Sara WANT, Lena+Priya MAYBE    — real split
-- Amalfi:      Marco+Chris+Alex MUST, Sara+Lena WANT, Priya SKIP     — adventure sub-group
-- Cinque Terre:Sara+Lena MUST, Alex WANT, Marco+Chris MAYBE, Priya SKIP — clear sub-group
-- Food Tour:   all 6 MUST                                            — slam dunk
-- Uffizi:      Priya MUST, Marco+Sara+Alex WANT, Chris+Lena MAYBE
-- Trevi:       Sara+Lena MUST, Marco+Chris WANT — Alex+Priya unrated (partial)
-- Capri:       no ratings (just added)

insert into activity_ratings (activity_id, user_id, rating) values
  -- Colosseum
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  -- Wine Tasting
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  -- Vatican
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- Pompeii
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  -- Amalfi
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  -- Cinque Terre
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  -- Rome Food Tour (unanimous MUST)
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- Uffizi
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- Trevi Fountain (partial: 4/6 — Alex + Priya haven't rated yet)
  ('cccccccc-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000004', 'MAYBE');
  -- Capri: no ratings
  -- Trevi: Alex(05), Priya(06), Nadia(08), bulk 11-14 still unrated

-- Italy ratings — new named members (Kai/Nadia/Tom/Yuki) on existing activities
-- + full named crew on cc11 (Borghese) and cc12 (Siena)
insert into activity_ratings (activity_id, user_id, rating) values
  -- Colosseum: Kai MUST, Nadia WANT, Tom MUST, Yuki WANT
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  -- Wine Tasting: Kai MAYBE, Nadia SKIP, Tom WANT, Yuki MUST
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'SKIP'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Vatican: Kai WANT, Nadia MUST, Tom WANT, Yuki MUST
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Pompeii: Kai WANT, Nadia MAYBE, Tom MUST, Yuki WANT
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  -- Amalfi: Kai MUST, Nadia SKIP, Tom MUST, Yuki WANT
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'SKIP'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  -- Cinque Terre: Kai WANT, Nadia SKIP, Tom MUST, Yuki MUST
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'SKIP'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Food Tour: unanimous MUST (Kai/Nadia/Tom/Yuki join the party)
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Uffizi: Kai MAYBE, Nadia MUST, Tom WANT, Yuki MUST
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Trevi: Kai+Tom+Yuki rated; Alex/Priya/Nadia/bulk still unrated (partial)
  ('cccccccc-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Borghese Gallery (cc11): culture lovers MUST
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Siena Half Day (cc12): day-tripper split
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004', 'SKIP'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000007', 'SKIP'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('cccccccc-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000010', 'MUST');

-- ════════════════════════════════════════════════════════════════════════════
-- Trip 2: Barcelona Weekend — 9 members, fully rated, complete matrix
--
-- Every activity rated by every member (72 ratings). No gaps.
-- Showcases: polarization (Camp Nou — 4 MUST vs 4 SKIP), sub-group crews
--   (Flamenco = Alex+Sara+Lena+Priya+Nadia MUST, Kai SKIP), warm consensus
--   (Park Güell — all WANT or MUST), beach crowd.
-- Owner: Alex (planner). Sara arrives day 2. Priya+Nadia leave early.
-- ════════════════════════════════════════════════════════════════════════════

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Barcelona Weekend', 'Barcelona, Spain',
   '2025-09-12', '2025-09-15', '00000000-0000-0000-0000-000000000005', 'bcn25');

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '2025-09-12', '2025-09-15'), -- Alex: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2025-09-12', '2025-09-15'), -- Marco: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '2025-09-13', '2025-09-15'), -- Sara: arrives day 2
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '2025-09-12', '2025-09-15'), -- Lena: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', '2025-09-12', '2025-09-15'), -- Kai: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', '2025-09-12', '2025-09-15'), -- Tom: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', '2025-09-12', '2025-09-14'), -- Nadia: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', '2025-09-12', '2025-09-15'), -- Chris: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', '2025-09-12', '2025-09-14'); -- Priya: leaves early

insert into activities (id, trip_id, name, description, location, duration_hours, category_id, added_by) values
  ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Sagrada Família', 'Gaudí''s iconic basilica — book skip-the-line tickets in advance.',
   'Eixample, Barcelona', 2, (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000005'),
  ('dddddddd-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002',
   'La Boqueria Market', 'Famous covered market on Las Ramblas — go early to avoid crowds.',
   'La Rambla, Barcelona', 1, (select id from activity_categories where slug = 'food-drink'),
   '00000000-0000-0000-0000-000000000002'),
  ('dddddddd-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Park Güell', 'Gaudí''s mosaic-covered park with sweeping city views.',
   'Gràcia, Barcelona', 2, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000003'),
  ('dddddddd-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Barceloneta Beach', 'Afternoon at the city beach — swimming, sangria, people-watching.',
   'Barceloneta, Barcelona', 4, (select id from activity_categories where slug = 'relaxation'),
   '00000000-0000-0000-0000-000000000007'),
  ('dddddddd-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Flamenco Show', 'Intimate tablao performance in the Gothic Quarter.',
   'Barri Gòtic, Barcelona', 2, (select id from activity_categories where slug = 'nightlife'),
   '00000000-0000-0000-0000-000000000001'),
  ('dddddddd-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Camp Nou Stadium Tour', 'Self-guided tour of FC Barcelona''s iconic ground.',
   'Les Corts, Barcelona', 2, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000007'),
  ('dddddddd-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Gothic Quarter Walk', 'Labyrinthine medieval streets, hidden squares, and Roman ruins underfoot.',
   'Barri Gòtic, Barcelona', 2, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000003'),
  ('dddddddd-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Tapas Crawl in El Born', 'Bar-hop through El Born''s best pintxos bars ending at El Xampanyet.',
   'El Born, Barcelona', 3, (select id from activity_categories where slug = 'food-drink'),
   '00000000-0000-0000-0000-000000000001');

-- All 42 ratings present
insert into activity_ratings (activity_id, user_id, rating) values
  -- Sagrada (near-universal MUST — easy yes)
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', 'MUST'),
  -- Boqueria (food lovers MUST, Kai MAYBE)
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  -- Park Güell (Lena MUST, everyone else WANT — warm consensus)
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  -- Beach (Alex+Sara+Kai+Tom+Nadia MUST, Marco MAYBE, Lena WANT)
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'MUST'),
  -- Flamenco (Alex+Sara+Lena+Nadia MUST, Marco WANT, Tom MAYBE, Kai SKIP)
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', 'SKIP'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'MUST'),
  -- Camp Nou (Marco+Kai+Tom MUST, Alex+Sara+Lena SKIP, Nadia MAYBE — polarizes)
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'SKIP'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'SKIP'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'SKIP'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'MAYBE');

-- Barcelona — Chris(04)+Priya(06) on existing activities + all 9 on dd07/dd08
insert into activity_ratings (activity_id, user_id, rating) values
  -- Sagrada: Chris MUST, Priya MUST
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- Boqueria: Chris WANT, Priya WANT
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  -- Park Güell: Chris WANT, Priya MUST
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- Beach: Chris MUST, Priya SKIP
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  -- Flamenco: Chris WANT, Priya MUST
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- Camp Nou: Chris MUST, Priya SKIP
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  -- Gothic Quarter Walk (dd07): local lovers + cultural crowd
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Tapas Crawl (dd08): food crowd MUST, Kai SKIP
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000007', 'SKIP'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('dddddddd-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', 'MUST');

-- ════════════════════════════════════════════════════════════════════════════
-- Trip 3: Tokyo Deep Dive — 10 members (all named)
--
-- 8 activities: 6 well-rated, 1 partial (Hakone — 9/10), 1 zero-rated (Akihabara).
-- Showcases: full named crew, near-unanimous excitement (Kyoto all MUST),
--   polarizing nightlife (Robot Restaurant), zero-rating state.
-- Owner: Yuki (planner). Staggered arrivals/departures across all 10.
-- ════════════════════════════════════════════════════════════════════════════

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Tokyo Deep Dive', 'Tokyo, Japan',
   '2026-03-01', '2026-03-10', '00000000-0000-0000-0000-000000000010', 'tokyo26');

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', '2026-03-01', '2026-03-10'), -- Yuki: full
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', '2026-03-03', '2026-03-10'), -- Kai: arrives late
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', '2026-03-01', '2026-03-07'), -- Priya: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2026-03-02', '2026-03-10'), -- Marco: arrives day 2
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '2026-03-01', '2026-03-10'), -- Sara: full
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '2026-03-01', '2026-03-08'), -- Lena: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '2026-03-04', '2026-03-10'), -- Chris: arrives late
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '2026-03-01', '2026-03-09'), -- Alex: leaves day before end
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', '2026-03-01', '2026-03-06'), -- Nadia: leaves very early
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', '2026-03-03', '2026-03-10'); -- Tom: arrives late

insert into activities (id, trip_id, name, description, location, duration_hours, category_id, added_by) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003',
   'Tsukiji Outer Market', 'Fresh sushi breakfast at the outer market stalls.',
   'Tsukiji, Tokyo', 2, (select id from activity_categories where slug = 'food-drink'),
   '00000000-0000-0000-0000-000000000010'),
  ('eeeeeeee-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003',
   'teamLab Borderless', 'Immersive digital art museum — book tickets weeks ahead.',
   'Odaiba, Tokyo', 3, (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000006'),
  ('eeeeeeee-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003',
   'Shibuya Crossing at Night', 'Walk the world''s busiest pedestrian crossing after dark.',
   'Shibuya, Tokyo', 1, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000007'),
  ('eeeeeeee-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003',
   'Kyoto Day Trip', 'Shinkansen to Kyoto — Fushimi Inari, Arashiyama bamboo grove.',
   'Kyoto', 10, (select id from activity_categories where slug = 'day-trip'),
   '00000000-0000-0000-0000-000000000010'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000003',
   'Hakone Hot Springs', 'Ryokan stay and onsen with Mt. Fuji views. Overnight option.',
   'Hakone', 8, (select id from activity_categories where slug = 'relaxation'),
   '00000000-0000-0000-0000-000000000010'),
  ('eeeeeeee-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000003',
   'Akihabara Electronics District', 'Browse multi-floor electronics stores and retro game shops.',
   'Akihabara, Tokyo', 3, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000010'),
  ('eeeeeeee-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000003',
   'Nikko Day Trip', 'UNESCO shrines, waterfalls, and mountain scenery — 2 hrs by Shinkansen.',
   'Nikko', 9, (select id from activity_categories where slug = 'day-trip'),
   '00000000-0000-0000-0000-000000000010'),
  ('eeeeeeee-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000003',
   'Robot Restaurant Show', 'Sensory overload cabaret — neon robots, dancers, and taiko drums.',
   'Shinjuku, Tokyo', 2, (select id from activity_categories where slug = 'nightlife'),
   '00000000-0000-0000-0000-000000000007');

insert into activity_ratings (activity_id, user_id, rating) values
  -- Tsukiji (all 3)
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- teamLab (all 3 — Kai MAYBE so not in his excited set)
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'MUST'),
  -- Shibuya (all 3)
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  -- Kyoto (all 3)
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  -- Hakone (only Yuki — Kai/Priya still unrated for now)
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'MUST');
  -- Akihabara: no ratings

-- Tokyo — 7 new named members (01–05, 08–09) on ee01–ee05 + all 10 on ee07/ee08
insert into activity_ratings (activity_id, user_id, rating) values
  -- Tsukiji: Marco WANT, Sara MUST, Lena MUST, Chris WANT, Alex WANT, Nadia WANT, Tom MUST
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'MUST'),
  -- teamLab: Marco WANT, Sara MUST, Lena MUST, Chris MAYBE, Alex MUST, Nadia WANT, Tom WANT
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Shibuya: Marco MUST, Sara WANT, Lena WANT, Chris MUST, Alex WANT, Nadia WANT, Tom MUST
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 'MUST'),
  -- Kyoto: all 7 new MUST — unanimous across the board
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', 'MUST'),
  -- Hakone: most WANT/MUST, Chris SKIP — Kai/Priya still unrated
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'SKIP'),
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Nikko Day Trip (ee07): all 10 rated
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', 'SKIP'),
  ('eeeeeeee-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Robot Restaurant (ee08): polarizing nightlife
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'SKIP'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 'SKIP'),
  ('eeeeeeee-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', 'MUST');

-- ════════════════════════════════════════════════════════════════════════════
-- Trip 4: Patagonia Expedition — 20 members (10 named + bulk 11–20)
--
-- Nadia + 5 named added curated ratings. Tom has 0 named ratings (unresponsive
-- showcase). Chris/Lena sparse. El Chaltén has zero named ratings.
-- Bulk users add random density via the final ratings block.
-- Showcases: large-group sparse state, unresponsive member, zero-rated activity.
-- Owner: Nadia (planner). No shared events, no stops.
-- ════════════════════════════════════════════════════════════════════════════

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Patagonia Expedition', 'Patagonia, Argentina',
   '2026-11-10', '2026-11-24', '00000000-0000-0000-0000-000000000008', 'patagonia26');

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', '2026-11-10', '2026-11-24'), -- Nadia: full
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', '2026-11-10', '2026-11-24'), -- Tom: full (0 named ratings)
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '2026-11-12', '2026-11-24'), -- Chris: arrives late
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '2026-11-10', '2026-11-20'), -- Lena: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '2026-11-10', '2026-11-24'), -- Marco: full
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-11-10', '2026-11-20'), -- Sara: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '2026-11-12', '2026-11-24'), -- Alex: arrives late
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', '2026-11-10', '2026-11-24'), -- Priya: full
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', '2026-11-10', '2026-11-22'), -- Kai: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', '2026-11-14', '2026-11-24'); -- Yuki: arrives very late

do $$
declare
  i integer;
  uid uuid;
begin
  for i in 11..20 loop
    uid := ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;
    insert into trip_members (trip_id, user_id, arrival_date, departure_date)
    values (
      'aaaaaaaa-0000-0000-0000-000000000004',
      uid,
      '2026-11-10'::date + ((i - 11) % 3),
      '2026-11-24'::date - ((i - 11) % 4)
    );
  end loop;
end $$;

insert into activities (id, trip_id, name, description, location, duration_hours, category_id, added_by) values
  ('ffffffff-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000004',
   'Torres del Paine Trek',
   'Multi-day hike through the most dramatic scenery in Patagonia.',
   'Torres del Paine, Chile', 8, (select id from activity_categories where slug = 'adventure'),
   '00000000-0000-0000-0000-000000000008'),
  ('ffffffff-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000004',
   'Perito Moreno Glacier Walk',
   'Crampons on — guided walk on one of the world''s most active glaciers.',
   'El Calafate, Argentina', 6, (select id from activity_categories where slug = 'adventure'),
   '00000000-0000-0000-0000-000000000008'),
  ('ffffffff-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000004',
   'Ushuaia — End of the World',
   'Southernmost city on Earth. Tierra del Fuego National Park.',
   'Ushuaia, Argentina', 8, (select id from activity_categories where slug = 'day-trip'),
   '00000000-0000-0000-0000-000000000008'),
  ('ffffffff-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000004',
   'El Chaltén Hiking',
   'Base camp town for the Fitz Roy massif — best free hiking in Argentina.',
   'El Chaltén, Argentina', 7, (select id from activity_categories where slug = 'adventure'),
   '00000000-0000-0000-0000-000000000008'),
  ('ffffffff-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000004',
   'Puerto Natales Kayaking',
   'Full-day sea kayak through Ultima Esperanza Sound with glacier views.',
   'Puerto Natales, Chile', 8, (select id from activity_categories where slug = 'adventure'),
   '00000000-0000-0000-0000-000000000008'),
  ('ffffffff-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000004',
   'Stargazing at Dark Sky Reserve',
   'Night tour of the southern hemisphere sky — Magellanic Clouds visible to naked eye.',
   'Patagonia Steppe', 3, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000009');

insert into activity_ratings (activity_id, user_id, rating) values
  -- Torres: only Nadia
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', 'MUST'),
  -- Perito Moreno: only Nadia
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'MUST'),
  -- Ushuaia: Nadia + Lena — Chris + Tom unrated
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'MUST');
  -- El Chaltén: no named ratings (zero-rating showcase — bulk may add some)

-- Patagonia — new named members (Marco/Sara/Alex/Priya/Kai/Yuki) on ff01–ff03 + all named on ff05/ff06
insert into activity_ratings (activity_id, user_id, rating) values
  -- Torres: Marco MUST, Sara WANT, Alex MUST, Priya MAYBE, Kai MUST, Yuki MUST
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Perito Moreno: Marco MUST, Sara MUST, Alex WANT, Priya SKIP, Kai MUST, Yuki MUST
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Ushuaia: Marco WANT, Sara MUST, Alex MUST, Priya SKIP, Kai WANT, Yuki WANT
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  -- Kayaking (ff05): adventure split — Sara+Priya SKIP, Tom excluded (0 ratings)
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'SKIP'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Stargazing (ff06): near-universal MUST — Tom excluded (0 ratings)
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', 'MUST');

-- ════════════════════════════════════════════════════════════════════════════
-- Trip 5: Lisbon Weekend — 30 members (10 named + bulk 11–30)
--
-- Biggest trip. Prominent SKIP usage. Travel Twin spread wide across 30.
-- Pastéis unanimous MUST across all named. Surf and Fado polarize hard.
-- 10 activities: 9 fully rated by all named, 1 zero-rated (Mouraria).
-- Owner: Priya (enterprise). Staggered arrivals for named crew.
-- ════════════════════════════════════════════════════════════════════════════

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Lisbon Weekend', 'Lisbon, Portugal',
   '2025-10-10', '2025-10-14', '00000000-0000-0000-0000-000000000006', 'lisbon25');

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', '2025-10-10', '2025-10-14'), -- Priya: full
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '2025-10-10', '2025-10-14'), -- Marco: full
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2025-10-10', '2025-10-14'), -- Sara: full
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '2025-10-11', '2025-10-14'), -- Alex: arrives day 2
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', '2025-10-10', '2025-10-14'), -- Kai: full
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', '2025-10-10', '2025-10-13'), -- Nadia: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', '2025-10-10', '2025-10-14'), -- Tom: full
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2025-10-10', '2025-10-14'), -- Lena: full
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', '2025-10-10', '2025-10-13'), -- Chris: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', '2025-10-11', '2025-10-14'); -- Yuki: arrives day 2

do $$
declare
  i integer;
  uid uuid;
begin
  for i in 11..30 loop
    uid := ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;
    insert into trip_members (trip_id, user_id, arrival_date, departure_date)
    values (
      'aaaaaaaa-0000-0000-0000-000000000005',
      uid,
      '2025-10-10'::date + ((i - 11) % 2),
      '2025-10-14'::date - ((i - 11) % 3)
    );
  end loop;
end $$;

insert into activities (id, trip_id, name, description, location, duration_hours, category_id, added_by) values
  ('99999999-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Fado Show at Alfama',
   'Intimate fado performance at a traditional tasca in the oldest quarter.',
   'Alfama, Lisbon', 2, (select id from activity_categories where slug = 'nightlife'),
   '00000000-0000-0000-0000-000000000006'),
  ('99999999-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Belém Tower & Jerónimos',
   'Two UNESCO landmarks in the same neighbourhood — iconic Manueline architecture.',
   'Belém, Lisbon', 3, (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000001'),
  ('99999999-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Pastéis de Belém',
   'Queue for the original pastel de nata — still made to the 1837 recipe.',
   'Belém, Lisbon', 1, (select id from activity_categories where slug = 'food-drink'),
   '00000000-0000-0000-0000-000000000002'),
  ('99999999-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000005',
   'LX Factory Sunday Market',
   'Creative hub in a converted industrial complex — food, art, vintage.',
   'Alcântara, Lisbon', 3, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000007'),
  ('99999999-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Sintra Day Trip',
   'Fairytale palaces and moorish castles — 40 min train from Rossio station.',
   'Sintra', 7, (select id from activity_categories where slug = 'day-trip'),
   '00000000-0000-0000-0000-000000000006'),
  ('99999999-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Wine & Petiscos Evening',
   'Natural wine bar in Mouraria with a rotating petiscos menu.',
   'Mouraria, Lisbon', 2, (select id from activity_categories where slug = 'food-drink'),
   '00000000-0000-0000-0000-000000000001'),
  ('99999999-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Surf Lesson in Cascais',
   'Two-hour beginner lesson on Atlantic swells, 30 min from the city.',
   'Cascais', 3, (select id from activity_categories where slug = 'adventure'),
   '00000000-0000-0000-0000-000000000009'),
  ('99999999-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Mouraria Street Food Walk',
   'Self-guided walk through Lisbon''s most multicultural neighbourhood.',
   'Mouraria, Lisbon', 2, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000009'),
  ('99999999-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Palácio da Pena',
   'Romantic palace perched above Sintra — colourful towers, misty views, fairy-tale vibes.',
   'Sintra', 3, (select id from activity_categories where slug = 'culture'),
   '00000000-0000-0000-0000-000000000006'),
  ('99999999-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000005',
   'Sunset at Miradouro da Graça',
   'Best sunset viewpoint in Lisbon — bring wine, watch the city go orange.',
   'Graça, Lisbon', 2, (select id from activity_categories where slug = 'local'),
   '00000000-0000-0000-0000-000000000001');

-- 7×7 = 49 ratings (gg01–gg07). gg08 Mouraria has no ratings.
-- Fado:   Priya+Sara+Nadia MUST, Marco+Tom WANT, Alex MAYBE, Kai SKIP
-- Belém:  Priya MUST, all others WANT — warm consensus
-- Pastéis:all 7 MUST — universal slam dunk
-- LX:     Sara+Kai MUST, Marco+Alex+Nadia+Tom WANT, Priya MAYBE
-- Sintra: Priya+Sara+Alex MUST, Marco+Tom WANT, Kai MAYBE, Nadia SKIP
-- Wine:   Marco+Sara+Alex MUST, Priya+Nadia WANT, Kai+Tom SKIP
-- Surf:   Marco+Alex+Kai+Tom MUST, Sara+Priya SKIP, Nadia MAYBE

insert into activity_ratings (activity_id, user_id, rating) values
  -- Fado
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'SKIP'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Belém Tower
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Pastéis (unanimous MUST)
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 'MUST'),
  -- LX Factory
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Sintra
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'SKIP'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'MAYBE'),
  -- Wine & Petiscos
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'SKIP'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', 'SKIP'),
  -- Surf Lesson
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', 'SKIP'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'SKIP'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009', 'MUST');
  -- Mouraria (gg08): no ratings

-- Lisbon — Lena(03)+Chris(04)+Yuki(10) on gg01–gg07, all named on gg09+gg10
insert into activity_ratings (activity_id, user_id, rating) values
  -- Fado: Lena MUST, Chris WANT, Yuki MUST
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Belém: Lena WANT, Chris WANT, Yuki WANT
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  -- Pastéis: Lena MUST, Chris MUST, Yuki MUST (still unanimous — 10/10)
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('99999999-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- LX Factory: Lena MUST, Chris WANT, Yuki WANT
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  -- Sintra: Lena MUST, Chris WANT, Yuki MUST
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Wine: Lena MUST, Chris WANT, Yuki SKIP
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', 'SKIP'),
  -- Surf: Lena SKIP, Chris MUST, Yuki WANT
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'SKIP'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('99999999-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010', 'MAYBE'),
  -- Palácio da Pena (gg09): 8/10 named — Chris+Tom unrated
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000005', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000007', 'MAYBE'),
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('99999999-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000010', 'MUST'),
  -- Sunset Miradouro (gg10): all 10 named MUST — universal slam dunk
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000004', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000008', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000009', 'MUST'),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', 'MUST');

-- ── Bulk random ratings ───────────────────────────────────────────────────────
-- 65% coverage for bulk users (user11–user30) across activities in their trips.
-- Weighted toward MUST/WANT. Curated named-user ratings are protected by
-- ON CONFLICT DO NOTHING.

insert into activity_ratings (activity_id, user_id, rating)
select
  a.id,
  tm.user_id,
  ((array['MUST','MUST','MAYBE','MAYBE','MAYBE','SKIP'])[floor(random() * 6 + 1)::integer])::rating
from activities a
join trip_members tm on tm.trip_id = a.trip_id
join auth.users u on u.id = tm.user_id
where u.email like 'user%@example.com'
  and random() < 0.65
on conflict (activity_id, user_id) do nothing;

-- ── Itinerary slots — Italy 2025 (Plan / convergence calendar) ────────────────
-- A slot = a proposed day for an activity + the crew subset joined for it.
-- Multiple slots on one activity IS the 2+N split. See docs/decisions/CONVERGENCE_CALENDAR.md.
--
-- Italy legs: Rome 06-03…09 · Tuscany 06-10…12 · Naples 06-13…17 ·
--             Cinque Terre 06-18…20 · Florence 06-21…24
--
-- Deliberately covers every Plan UI state:
--   06-06 / 06-12  Colosseum Tour split — early-arrivers vs late-arrivers (isSplit)
--   06-09          double-book — Sara in Rome Food Tour AND Trevi, same day, same region
--   06-11          clean slot, all MUST crew present (works = true)
--   06-14          clean slot, all MUST crew present (works = true)
--   06-16          region clash — Vatican (Rome) vs Amalfi (Naples) on one day
--   06-19          clean slot, all MUST crew present (works = true)
--   06-22          placed but works = false — Nadia/Priya/User 12 have already left
--
-- Other trips keep zero slots on purpose: they exercise the Plan empty state.

insert into itinerary_slots (id, trip_id, activity_id, date, created_by) values
  -- Colosseum Tour split (Rome) — MUST crew can't all be in Italy on one day
  ('66666666-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '2025-06-06', '00000000-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '2025-06-12', '00000000-0000-0000-0000-000000000001'),
  -- Rome, last day of the leg — two slots, same region, Sara in both (double-book)
  ('66666666-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000007', '2025-06-09', '00000000-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000009', '2025-06-09', '00000000-0000-0000-0000-000000000001'),
  -- Clean converged slots
  ('66666666-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2025-06-11', '00000000-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '2025-06-14', '00000000-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '2025-06-19', '00000000-0000-0000-0000-000000000001'),
  -- Region clash — Rome and Naples proposed for the same day
  ('66666666-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '2025-06-16', '00000000-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '2025-06-16', '00000000-0000-0000-0000-000000000001'),
  -- Placed in the Florence leg, but its MUST crew has already flown home
  ('66666666-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000008', '2025-06-22', '00000000-0000-0000-0000-000000000001');

insert into itinerary_slot_members (slot_id, user_id) values
  -- Colosseum split A (06-06): early arrivers
  ('66666666-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'), -- Marco
  ('66666666-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'), -- Chris
  ('66666666-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009'), -- Tom
  -- Colosseum split B (06-12): late arrivers
  ('66666666-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005'), -- Alex
  ('66666666-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007'), -- Kai
  -- Rome Food Tour (06-09)
  ('66666666-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'), -- Marco
  ('66666666-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002'), -- Sara  ← also on Trevi
  ('66666666-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008'), -- Nadia
  ('66666666-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006'), -- Priya
  ('66666666-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000014'), -- User 14
  -- Trevi Fountain & Gelato Walk (06-09)
  ('66666666-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'), -- Sara  ← double-booked
  ('66666666-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003'), -- Lena
  ('66666666-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013'), -- User 13
  -- Wine Tasting in Tuscany (06-11) — full MUST crew
  ('66666666-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003'), -- Lena
  ('66666666-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002'), -- Sara
  ('66666666-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000013'), -- User 13
  ('66666666-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010'), -- Yuki
  -- Pompeii Day Trip (06-14) — full MUST crew
  ('66666666-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005'), -- Alex
  ('66666666-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004'), -- Chris
  ('66666666-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009'), -- Tom
  -- Cinque Terre Hiking (06-19) — full MUST crew
  ('66666666-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003'), -- Lena
  ('66666666-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002'), -- Sara
  ('66666666-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009'), -- Tom
  ('66666666-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000014'), -- User 14
  ('66666666-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010'), -- Yuki
  -- Vatican Museums (06-16) — Rome half of the region clash
  ('66666666-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008'), -- Nadia
  ('66666666-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006'), -- Priya
  -- Amalfi Coast Drive (06-16) — Naples half of the region clash, disjoint crew
  ('66666666-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001'), -- Marco
  ('66666666-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000007'), -- Kai
  ('66666666-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009'), -- Tom
  ('66666666-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000011'), -- User 11
  -- Uffizi Gallery (06-22) — crew already departed, so works = false
  ('66666666-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000008'), -- Nadia
  ('66666666-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000006'), -- Priya
  ('66666666-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000012'), -- User 12
  ('66666666-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'); -- Yuki
