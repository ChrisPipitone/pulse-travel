-- ── Clear all data tables (safe to re-run against live local DB) ─────────────
-- Cascade handles FK order automatically. activity_categories excluded —
-- seeded in the schema migration and treated as static reference data.

truncate table
  trip_event_members,
  trip_events,
  activity_ratings,
  activities,
  trip_members,
  trips,
  profiles
restart identity cascade;

-- Also clear auth users so seed is fully self-contained on re-run.
-- Safe local-only: auth.users is accessible to postgres role in local dev.
delete from auth.users;

-- ── Auth users ────────────────────────────────────────────────────────────────
-- Password for all test users: password123
-- crypt() requires pgcrypto (enabled by default in Supabase local dev)

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

-- ── Auth identities (required for email+password login) ──────────────────────

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

-- ── Profiles ──────────────────────────────────────────────────────────────────

-- on_auth_user_created trigger fires on auth.users INSERT above, creating profiles
-- with email-prefix names. Override with proper display names here.
insert into profiles (id, display_name) values
  ('00000000-0000-0000-0000-000000000001', 'Marco'),
  ('00000000-0000-0000-0000-000000000002', 'Sara'),
  ('00000000-0000-0000-0000-000000000003', 'Lena'),
  ('00000000-0000-0000-0000-000000000004', 'Chris'),
  ('00000000-0000-0000-0000-000000000005', 'Alex'),
  ('00000000-0000-0000-0000-000000000006', 'Priya'),
  ('00000000-0000-0000-0000-000000000007', 'Kai'),
  ('00000000-0000-0000-0000-000000000008', 'Nadia'),
  ('00000000-0000-0000-0000-000000000009', 'Tom'),
  ('00000000-0000-0000-0000-000000000010', 'Yuki')
on conflict (id) do update set display_name = excluded.display_name;

-- ── Trip ─────────────────────────────────────────────────────────────────────

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Italy 2025',
    'Italy',
    '2025-06-03',
    '2025-06-24',
    '00000000-0000-0000-0000-000000000001', -- Marco is owner
    'italy25'
  );

-- ── Trip members + availability ───────────────────────────────────────────────

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2025-06-03', '2025-06-24'), -- Marco: full trip
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '2025-06-03', '2025-06-24'), -- Sara: full trip
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '2025-06-07', '2025-06-20'), -- Lena: arrives late, leaves early
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '2025-06-03', '2025-06-15'); -- Chris: leaves halfway

-- ── Shared event ─────────────────────────────────────────────────────────────

insert into trip_events (id, trip_id, name, start_date, end_date) values
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Rossi Wedding',
    '2025-06-10',
    '2025-06-12'
  );

-- Wedding blocks Marco and Sara (not Lena or Chris)
insert into trip_event_members (event_id, user_id) values
  ('bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- ── Activities ────────────────────────────────────────────────────────────────

insert into activities (id, trip_id, name, description, url, location, region, duration_hours, category_id, added_by) values
  (
    'cccccccc-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Colosseum Tour',
    'Skip-the-line guided tour of the Colosseum, Roman Forum, and Palatine Hill.',
    'https://www.coopculture.it',
    'Piazza del Colosseo, Rome',
    'Rome',
    3,
    (select id from activity_categories where slug = 'culture'),
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Wine Tasting in Tuscany',
    'Half-day tour of two Chianti vineyards with guided tasting and lunch.',
    null,
    'Chianti, Tuscany',
    'Tuscany',
    5,
    (select id from activity_categories where slug = 'food-drink'),
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Vatican Museums',
    'Sistine Chapel, St. Peter''s Basilica, and the museum galleries.',
    null,
    'Vatican City, Rome',
    'Rome',
    4,
    (select id from activity_categories where slug = 'culture'),
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    'cccccccc-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Pompeii Day Trip',
    'Full-day guided tour of the ancient ruins of Pompeii.',
    null,
    'Pompeii, Campania',
    'Naples',
    8,
    (select id from activity_categories where slug = 'day-trip'),
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'cccccccc-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Amalfi Coast Drive',
    'Scenic drive along the Amalfi Coast with stops at Positano and Ravello.',
    null,
    'Amalfi, Campania',
    'Naples',
    6,
    (select id from activity_categories where slug = 'adventure'),
    '00000000-0000-0000-0000-000000000004'
  ),
  (
    'cccccccc-0000-0000-0000-000000000006',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Cinque Terre Hiking',
    'Hike the coastal trail connecting all five villages.',
    null,
    'Cinque Terre, Liguria',
    'Cinque Terre',
    7,
    (select id from activity_categories where slug = 'adventure'),
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'cccccccc-0000-0000-0000-000000000007',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Rome Food Tour',
    'Evening street food tour through Trastevere and Campo de'' Fiori.',
    null,
    'Trastevere, Rome',
    'Rome',
    3,
    (select id from activity_categories where slug = 'food-drink'),
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'cccccccc-0000-0000-0000-000000000008',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Uffizi Gallery',
    'Florence''s premier art museum — Botticelli, Leonardo, Michelangelo.',
    null,
    'Piazzale degli Uffizi, Florence',
    'Florence',
    4,
    (select id from activity_categories where slug = 'culture'),
    '00000000-0000-0000-0000-000000000004'
  );

-- ── Ratings ───────────────────────────────────────────────────────────────────
-- Designed to produce an interesting compatibility matrix:
-- strong consensus on some, real disagreement on others.
--
-- Activity ref:
--   cc..01 Colosseum   cc..02 Wine Tasting  cc..03 Vatican    cc..04 Pompeii
--   cc..05 Amalfi      cc..06 Cinque Terre  cc..07 Food Tour  cc..08 Uffizi

insert into activity_ratings (activity_id, user_id, rating) values
  -- Colosseum: everyone wants it, Marco and Chris are MUST
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'MUST'),

  -- Wine Tasting: Sara and Lena love it, Marco and Chris are MEH
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MEH'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'MEH'),

  -- Vatican: Sara is MUST, others are WANT
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'WANT'),

  -- Pompeii: real disagreement — Chris MUST, Lena MEH, others WANT
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'MEH'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'MUST'),

  -- Amalfi: Chris and Marco MUST, others WANT
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'MUST'),

  -- Cinque Terre: Lena MUST, Sara MUST, others MEH — great sub-group activity
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MEH'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'MEH'),

  -- Food Tour: universal MUST — easy win, schedule it
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('cccccccc-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'MUST'),

  -- Uffizi: Chris and Lena MEH, Marco and Sara WANT
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'WANT'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'MEH'),
  ('cccccccc-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', 'MEH');

-- ════════════════════════════════════════════════════════════════════════════
-- Trip 2: Barcelona Weekend — 8 members (medium group)
-- Owner: Alex. Members: all 10 users except Nadia and Tom.
-- ════════════════════════════════════════════════════════════════════════════

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Barcelona Weekend', 'Barcelona, Spain', '2025-09-12', '2025-09-15', '00000000-0000-0000-0000-000000000005', 'bcn25');

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '2025-09-12', '2025-09-15'), -- Alex: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', '2025-09-12', '2025-09-15'), -- Priya: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', '2025-09-12', '2025-09-15'), -- Kai: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2025-09-12', '2025-09-15'), -- Marco: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '2025-09-13', '2025-09-15'), -- Sara: arrives day 2
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '2025-09-12', '2025-09-15'), -- Lena: full
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', '2025-09-12', '2025-09-14'), -- Yuki: leaves early
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', '2025-09-12', '2025-09-15'); -- Chris: full

insert into activities (id, trip_id, name, description, location, duration_hours, added_by) values
  ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'Sagrada Família', 'Gaudí''s iconic basilica — book skip-the-line tickets in advance.', 'Eixample, Barcelona', 2, '00000000-0000-0000-0000-000000000005'),
  ('dddddddd-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'La Boqueria Market', 'Famous covered market on Las Ramblas — go early to avoid crowds.', 'La Rambla, Barcelona', 1, '00000000-0000-0000-0000-000000000006'),
  ('dddddddd-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', 'Park Güell', 'Gaudí''s mosaic-covered park with sweeping city views.', 'Gràcia, Barcelona', 2, '00000000-0000-0000-0000-000000000001'),
  ('dddddddd-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'Barceloneta Beach', 'Afternoon at the city beach — swimming, sangria, people-watching.', 'Barceloneta, Barcelona', 4, '00000000-0000-0000-0000-000000000007'),
  ('dddddddd-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'Flamenco Show', 'Intimate tablao performance in the Gothic Quarter.', 'Barri Gòtic, Barcelona', 2, '00000000-0000-0000-0000-000000000002');

insert into activity_ratings (activity_id, user_id, rating) values
  -- Sagrada Família: near-universal MUST
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'WANT'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'WANT'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'MEH'),
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'MUST'),
  -- Boqueria: food lovers MUST, others WANT
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'WANT'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'WANT'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'WANT'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'WANT'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'MEH'),
  -- Beach: split — half MUST, half MEH
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MEH'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'WANT'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'MUST'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'MEH');

-- ════════════════════════════════════════════════════════════════════════════
-- Trip 3: Tokyo Solo-ish — 3 members (small group)
-- Owner: Yuki.
-- ════════════════════════════════════════════════════════════════════════════

insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Tokyo Deep Dive', 'Tokyo, Japan', '2026-03-01', '2026-03-10', '00000000-0000-0000-0000-000000000010', 'tokyo26');

insert into trip_members (trip_id, user_id, arrival_date, departure_date) values
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', '2026-03-01', '2026-03-10'), -- Yuki: full
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', '2026-03-03', '2026-03-10'), -- Kai: arrives late
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', '2026-03-01', '2026-03-07'); -- Priya: leaves early

insert into activities (id, trip_id, name, description, location, duration_hours, added_by) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'Tsukiji Outer Market', 'Fresh sushi breakfast at the outer market stalls.', 'Tsukiji, Tokyo', 2, '00000000-0000-0000-0000-000000000010'),
  ('eeeeeeee-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', 'teamLab Borderless', 'Immersive digital art museum — book tickets weeks ahead.', 'Odaiba, Tokyo', 3, '00000000-0000-0000-0000-000000000006'),
  ('eeeeeeee-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', 'Shibuya Crossing at night', 'Walk the world''s busiest pedestrian crossing after dark.', 'Shibuya, Tokyo', 1, '00000000-0000-0000-0000-000000000007'),
  ('eeeeeeee-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003', 'Kyoto Day Trip', 'Shinkansen to Kyoto — Fushimi Inari, Arashiyama bamboo grove.', 'Kyoto', 10, '00000000-0000-0000-0000-000000000010');

insert into activity_ratings (activity_id, user_id, rating) values
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'WANT'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'WANT'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'MEH'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'WANT'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'WANT'),
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'MUST'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'WANT'),
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'MUST');
