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
insert into profiles (id, display_name, tier) values
  ('00000000-0000-0000-0000-000000000001', 'Marco',  'planner'),
  ('00000000-0000-0000-0000-000000000002', 'Sara',   'free'),
  ('00000000-0000-0000-0000-000000000003', 'Lena',   'free'),
  ('00000000-0000-0000-0000-000000000004', 'Chris',  'free'),
  ('00000000-0000-0000-0000-000000000005', 'Alex',   'planner'),
  ('00000000-0000-0000-0000-000000000006', 'Priya',  'enterprise'),
  ('00000000-0000-0000-0000-000000000007', 'Kai',    'free'),
  ('00000000-0000-0000-0000-000000000008', 'Nadia',  'free'),
  ('00000000-0000-0000-0000-000000000009', 'Tom',    'free'),
  ('00000000-0000-0000-0000-000000000010', 'Yuki',   'free')
on conflict (id) do update set display_name = excluded.display_name, tier = excluded.tier;

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

-- ════════════════════════════════════════════════════════════════════════════
-- STRESS-TEST TRIPS (4–12) — UI performance validation at scale
--
-- Sizes:  10 · 15 · 20 (Marco/planner) │ 50 · 75 · 100 · 125 · 150 · 200 (Priya/enterprise)
-- Tier assignments above in profiles upsert.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Bulk users 11–210 ─────────────────────────────────────────────────────────
-- One shared bcrypt hash for speed; all bulk users: password123
do $$
declare
  i   integer;
  uid text;
  pw  text;
begin
  pw := crypt('password123', gen_salt('bf'));
  for i in 11..210 loop
    uid := lpad(i::text, 12, '0');
    insert into auth.users (
      instance_id, id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      role, aud, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token,
      email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000',
      ('00000000-0000-0000-0000-' || uid)::uuid,
      'user' || i || '@example.com',
      pw,
      now(), now(), now(),
      'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}', '{}',
      false, '', '', '', ''
    );
    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at) values (
      'user' || i || '@example.com',
      ('00000000-0000-0000-0000-' || uid)::uuid,
      ('{"sub":"00000000-0000-0000-0000-' || uid || '","email":"user' || i || '@example.com"}')::jsonb,
      'email', now(), now()
    );
  end loop;
end $$;

-- Override display names (trigger created email-prefix names)
do $$
declare i integer; uid text;
begin
  for i in 11..210 loop
    uid := lpad(i::text, 12, '0');
    update profiles set display_name = 'User ' || i
    where id = ('00000000-0000-0000-0000-' || uid)::uuid;
  end loop;
end $$;

-- ── Stress trips ──────────────────────────────────────────────────────────────
insert into trips (id, name, destination, start_date, end_date, created_by, invite_code) values
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Lisbon Getaway',       'Lisbon, Portugal',  '2025-10-10', '2025-10-14', '00000000-0000-0000-0000-000000000001', 'lisbon25'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Swiss Alps Trek',      'Switzerland',       '2025-12-26', '2026-01-02', '00000000-0000-0000-0000-000000000001', 'swiss25'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Costa Rica',           'Costa Rica',        '2026-02-14', '2026-02-24', '00000000-0000-0000-0000-000000000001', 'costarica26'),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'Bali Retreat',         'Bali, Indonesia',   '2026-04-01', '2026-04-10', '00000000-0000-0000-0000-000000000006', 'bali26'),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'Iceland Winter',       'Iceland',           '2026-01-15', '2026-01-22', '00000000-0000-0000-0000-000000000006', 'iceland26'),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'Australian Road Trip', 'Australia',         '2026-11-01', '2026-11-21', '00000000-0000-0000-0000-000000000006', 'australia26'),
  ('aaaaaaaa-0000-0000-0000-000000000010', 'Safari South Africa',  'South Africa',      '2026-07-01', '2026-07-14', '00000000-0000-0000-0000-000000000006', 'safari26'),
  ('aaaaaaaa-0000-0000-0000-000000000011', 'European Grand Tour',  'Europe',            '2026-06-01', '2026-06-30', '00000000-0000-0000-0000-000000000006', 'eurogrand26'),
  ('aaaaaaaa-0000-0000-0000-000000000012', 'Around the World',     'Worldwide',         '2026-08-01', '2026-09-30', '00000000-0000-0000-0000-000000000006', 'aroundworld26');

-- ── Activities for stress trips (5 per trip) ──────────────────────────────────
insert into activities (id, trip_id, name, location, duration_hours, added_by) values
  -- Trip 4: Lisbon (10 members)
  ('00100001-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000004', 'Fado Show',               'Alfama, Lisbon',         2, '00000000-0000-0000-0000-000000000001'),
  ('00100001-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000004', 'Belém Tower',             'Belém, Lisbon',           1, '00000000-0000-0000-0000-000000000001'),
  ('00100001-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000004', 'Pastéis de Belém',        'Belém, Lisbon',           1, '00000000-0000-0000-0000-000000000002'),
  ('00100001-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000004', 'LX Factory Market',       'Alcântara, Lisbon',       3, '00000000-0000-0000-0000-000000000003'),
  ('00100001-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000004', 'Sintra Day Trip',         'Sintra',                  7, '00000000-0000-0000-0000-000000000004'),
  -- Trip 5: Swiss Alps (15 members)
  ('00100002-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000005', 'Matterhorn View Hike',    'Zermatt',                 5, '00000000-0000-0000-0000-000000000001'),
  ('00100002-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000005', 'Glacier Express Train',   'Zermatt to St. Moritz',   8, '00000000-0000-0000-0000-000000000001'),
  ('00100002-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000005', 'Grindelwald Skiing',      'Grindelwald',             6, '00000000-0000-0000-0000-000000000002'),
  ('00100002-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000005', 'Swiss Fondue Evening',    'Interlaken',              3, '00000000-0000-0000-0000-000000000003'),
  ('00100002-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000005', 'Jungfraujoch Summit',     'Jungfrau Region',         5, '00000000-0000-0000-0000-000000000004'),
  -- Trip 6: Costa Rica (20 members)
  ('00100003-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000006', 'Arenal Volcano Hike',     'La Fortuna',              4, '00000000-0000-0000-0000-000000000001'),
  ('00100003-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000006', 'Monteverde Cloud Forest', 'Monteverde',              5, '00000000-0000-0000-0000-000000000001'),
  ('00100003-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000006', 'Manuel Antonio Beach',    'Manuel Antonio',          4, '00000000-0000-0000-0000-000000000002'),
  ('00100003-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000006', 'Zip-lining Canopy Tour',  'Monteverde',              3, '00000000-0000-0000-0000-000000000003'),
  ('00100003-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000006', 'Coffee Farm Tour',        'Naranjo, Alajuela',       3, '00000000-0000-0000-0000-000000000004'),
  -- Trip 7: Bali (50 members)
  ('00100004-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000007', 'Ubud Rice Terraces',      'Ubud, Bali',              3, '00000000-0000-0000-0000-000000000006'),
  ('00100004-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000007', 'Tanah Lot Temple',        'Tabanan, Bali',           2, '00000000-0000-0000-0000-000000000006'),
  ('00100004-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000007', 'Sacred Monkey Forest',    'Ubud, Bali',              2, '00000000-0000-0000-0000-000000000006'),
  ('00100004-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000007', 'Surfing Lessons Kuta',    'Kuta Beach, Bali',        3, '00000000-0000-0000-0000-000000000006'),
  ('00100004-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000007', 'Balinese Cooking Class',  'Ubud, Bali',              4, '00000000-0000-0000-0000-000000000006'),
  -- Trip 8: Iceland (75 members)
  ('00100005-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000008', 'Blue Lagoon',             'Grindavík, Iceland',      3, '00000000-0000-0000-0000-000000000006'),
  ('00100005-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000008', 'Northern Lights Hunt',    'Iceland',                 4, '00000000-0000-0000-0000-000000000006'),
  ('00100005-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000008', 'Golden Circle Tour',      'South Iceland',           8, '00000000-0000-0000-0000-000000000006'),
  ('00100005-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000008', 'Glacier Walk',            'Vatnajökull',             6, '00000000-0000-0000-0000-000000000006'),
  ('00100005-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000008', 'Reykjavik Food Tour',     'Reykjavik',               3, '00000000-0000-0000-0000-000000000006'),
  -- Trip 9: Australia (100 members)
  ('00100006-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000009', 'Great Barrier Reef Dive', 'Cairns, QLD',             6, '00000000-0000-0000-0000-000000000006'),
  ('00100006-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000009', 'Sydney Opera House',      'Sydney, NSW',             2, '00000000-0000-0000-0000-000000000006'),
  ('00100006-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000009', 'Uluru Sunrise Walk',      'Uluru, NT',               4, '00000000-0000-0000-0000-000000000006'),
  ('00100006-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000009', 'Great Ocean Road',        'Victoria',                8, '00000000-0000-0000-0000-000000000006'),
  ('00100006-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000009', 'Daintree Rainforest',     'Daintree, QLD',           5, '00000000-0000-0000-0000-000000000006'),
  -- Trip 10: South Africa (125 members)
  ('00100007-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000010', 'Kruger Safari Drive',     'Kruger National Park',    8, '00000000-0000-0000-0000-000000000006'),
  ('00100007-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000010', 'Table Mountain Hike',     'Cape Town',               5, '00000000-0000-0000-0000-000000000006'),
  ('00100007-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000010', 'Robben Island',           'Cape Town',               3, '00000000-0000-0000-0000-000000000006'),
  ('00100007-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000010', 'Stellenbosch Wine Route', 'Stellenbosch',            4, '00000000-0000-0000-0000-000000000006'),
  ('00100007-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000010', 'Boulders Penguin Colony', 'Simon''s Town',           2, '00000000-0000-0000-0000-000000000006'),
  -- Trip 11: European Grand Tour (150 members)
  ('00100008-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000011', 'Eiffel Tower at Night',   'Paris, France',           2, '00000000-0000-0000-0000-000000000006'),
  ('00100008-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000011', 'Colosseum Rome',          'Rome, Italy',             3, '00000000-0000-0000-0000-000000000006'),
  ('00100008-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000011', 'Sagrada Família',         'Barcelona, Spain',        2, '00000000-0000-0000-0000-000000000006'),
  ('00100008-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000011', 'Amsterdam Canals Cruise', 'Amsterdam, Netherlands',  2, '00000000-0000-0000-0000-000000000006'),
  ('00100008-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000011', 'Prague Old Town',         'Prague, Czechia',         3, '00000000-0000-0000-0000-000000000006'),
  -- Trip 12: Around the World (200 members)
  ('00100009-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000012', 'Shibuya Crossing',        'Tokyo, Japan',            1, '00000000-0000-0000-0000-000000000006'),
  ('00100009-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000012', 'Times Square',            'New York, USA',           2, '00000000-0000-0000-0000-000000000006'),
  ('00100009-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000012', 'Christ the Redeemer',     'Rio de Janeiro, Brazil',  2, '00000000-0000-0000-0000-000000000006'),
  ('00100009-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000012', 'Pyramids of Giza',        'Cairo, Egypt',            4, '00000000-0000-0000-0000-000000000006'),
  ('00100009-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000012', 'Sydney Harbour Bridge',   'Sydney, Australia',       3, '00000000-0000-0000-0000-000000000006');

-- ── Trip members (generate_series) ────────────────────────────────────────────
-- Trip 4:  10 members — users 1–10
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000004',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(1, 10) as i;

-- Trip 5:  15 members — users 1–15
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000005',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(1, 15) as i;

-- Trip 6:  20 members — users 1–20
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000006',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(1, 20) as i;

-- Trip 7:  50 members — users 11–60
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000007',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(11, 60) as i;

-- Trip 8:  75 members — users 11–85
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000008',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(11, 85) as i;

-- Trip 9:  100 members — users 11–110
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000009',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(11, 110) as i;

-- Trip 10: 125 members — users 11–135
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000010',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(11, 135) as i;

-- Trip 11: 150 members — users 11–160
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000011',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(11, 160) as i;

-- Trip 12: 200 members — users 11–210
insert into trip_members (trip_id, user_id)
select 'aaaaaaaa-0000-0000-0000-000000000012',
       ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid
from generate_series(11, 210) as i;

-- ── Random ratings for stress trips (~70% coverage) ───────────────────────────
insert into activity_ratings (activity_id, user_id, rating)
select
  a.id,
  tm.user_id,
  ((array['MUST','WANT','MEH'])[floor(random() * 3 + 1)::integer])::rating
from activities a
join trip_members tm on tm.trip_id = a.trip_id
where a.trip_id in (
  'aaaaaaaa-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000005',
  'aaaaaaaa-0000-0000-0000-000000000006',
  'aaaaaaaa-0000-0000-0000-000000000007',
  'aaaaaaaa-0000-0000-0000-000000000008',
  'aaaaaaaa-0000-0000-0000-000000000009',
  'aaaaaaaa-0000-0000-0000-000000000010',
  'aaaaaaaa-0000-0000-0000-000000000011',
  'aaaaaaaa-0000-0000-0000-000000000012'
)
and random() < 0.7
on conflict (activity_id, user_id) do nothing;
