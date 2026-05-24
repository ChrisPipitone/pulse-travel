-- ── Types ───────────────────────────────────────────────────────────────────

create type rating as enum ('MUST', 'WANT', 'MAYBE', 'SKIP');

-- ── Lookup tables ────────────────────────────────────────────────────────────

create table activity_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  slug  text not null unique,
  icon  text  -- emoji or icon identifier
);

-- ── Core tables ──────────────────────────────────────────────────────────────

create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text not null,
  avatar_url   text,
  created_at   timestamptz default now()
);

create table trips (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  destination text not null,
  start_date  date,
  end_date    date,
  created_by  uuid not null references auth.users,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_at  timestamptz default now()
);

create table trip_members (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references trips on delete cascade,
  user_id        uuid not null references auth.users on delete cascade,
  arrival_date   date,
  departure_date date,
  joined_at      timestamptz default now(),
  unique (trip_id, user_id)
);

create table activities (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references trips on delete cascade,
  name          text not null,
  description   text,
  url           text,
  location      text,
  region        text,
  duration_hours numeric,
  category_id   uuid references activity_categories,
  added_by      uuid not null references auth.users,
  created_at    timestamptz default now()
);

create table activity_ratings (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  rating      rating not null,
  unique (activity_id, user_id)
);

create table trip_events (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references trips on delete cascade,
  name       text not null,
  start_date date not null,
  end_date   date not null,
  created_at timestamptz default now()
);

create table trip_event_members (
  event_id uuid not null references trip_events on delete cascade,
  user_id  uuid not null references auth.users on delete cascade,
  primary key (event_id, user_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index on trip_members (trip_id);
create index on trip_members (user_id);
create index on activities (trip_id);
create index on activity_ratings (activity_id);
create index on activity_ratings (user_id);
create index on trip_events (trip_id);

-- ── Seed: activity categories ─────────────────────────────────────────────────

insert into activity_categories (name, slug, icon) values
  ('Culture',        'culture',      '🏛️'),
  ('Food & Drink',   'food-drink',   '🍷'),
  ('Adventure',      'adventure',    '🧗'),
  ('Nightlife',      'nightlife',    '🎶'),
  ('Relaxation',     'relaxation',   '🌿'),
  ('Shopping',       'shopping',     '🛍️'),
  ('Day Trip',       'day-trip',     '🚌'),
  ('Local Experience', 'local',      '📍');
