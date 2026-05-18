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
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, role, aud
) values
  (
    '00000000-0000-0000-0000-000000000001',
    'marco@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'sara@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'lena@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'chris@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(), 'authenticated', 'authenticated'
  );

-- ── Profiles ──────────────────────────────────────────────────────────────────

insert into profiles (id, display_name) values
  ('00000000-0000-0000-0000-000000000001', 'Marco'),
  ('00000000-0000-0000-0000-000000000002', 'Sara'),
  ('00000000-0000-0000-0000-000000000003', 'Lena'),
  ('00000000-0000-0000-0000-000000000004', 'Chris');

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
