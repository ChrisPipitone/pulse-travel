-- JAB-46: turn the invite code from a permanent, low-entropy bearer token into a
-- proper capability token — higher entropy, expiring, owner-regenerable.
--
-- Before: invite_code = substr(md5/gen_random_bytes hex, 1, 8) → 32 bits, never expires,
-- no revoke. A leaked link granted permanent join access.
--
-- After:
--   * 12-char Crockford base32 (~60 bits) — infeasible to enumerate; also makes the
--     anon get_trip_preview enumeration oracle a non-threat (no need for a Postgres
--     rate-limiter that would only ever see the Kong gateway IP).
--   * invite_code_expires_at (default 14 days) — lookups/join reject expired codes.
--   * regenerate_invite_code(trip_id) — owner mints a fresh code, old link dies instantly.
--
-- Lock toggle (hard block on new joins) intentionally deferred — expiry + regenerate
-- already cover the leak threat.

-- ── Code generator: Crockford base32, CSPRNG ────────────────────────────────
-- Alphabet excludes I, L, O, U to avoid visual/verbal ambiguity. Each char takes
-- the low 5 bits of one gen_random_bytes() byte → uniform over 32, crypto-quality.
create or replace function public.gen_invite_code()
returns text
language plpgsql
volatile
-- pgcrypto (gen_random_bytes) lives in the extensions schema on Supabase; pin the
-- search_path so the column DEFAULT and SECURITY DEFINER callers both resolve it.
set search_path = public, extensions
as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  bytes    bytea := gen_random_bytes(12);
  result   text  := '';
  i        int;
begin
  for i in 0..11 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return result;
end;
$$;

-- New trips get a 12-char base32 code. Existing rows keep their old code (throwaway
-- local data — app is not yet deployed).
alter table trips alter column invite_code set default public.gen_invite_code();

-- ── Expiry column ───────────────────────────────────────────────────────────
alter table trips
  add column invite_code_expires_at timestamptz not null default (now() + interval '14 days');

-- ── Input normalization: case-insensitive + Crockford I/L→1, O→0 ────────────
-- Stored codes are canonical (base32 uppercase, no I/L/O; legacy hex lowercase),
-- so callers compare upper(invite_code) = normalize_invite_code(p_code).
create or replace function public.normalize_invite_code(p_code text)
returns text
language sql
immutable
as $$
  select upper(translate(coalesce(p_code, ''), 'iloILO', '110110'));
$$;

-- ── Recreate lookups: normalize input + reject expired ──────────────────────
create or replace function public.get_trip_by_invite_code(p_code text)
returns table (id uuid, name text, destination text, start_date date, end_date date)
language sql
security definer
stable
set search_path = public
as $$
  select id, name, destination, start_date, end_date
  from trips
  where upper(invite_code) = public.normalize_invite_code(p_code)
    and invite_code_expires_at > now()
  limit 1;
$$;

create or replace function public.get_trip_preview(p_code text)
returns table (
  name           text,
  destination    text,
  start_date     date,
  end_date       date,
  member_count   bigint,
  activity_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    t.name,
    t.destination,
    t.start_date,
    t.end_date,
    count(distinct tm.user_id) as member_count,
    count(distinct a.id)       as activity_count
  from trips t
  left join trip_members tm on tm.trip_id = t.id
  left join activities    a  on a.trip_id  = t.id
  where upper(t.invite_code) = public.normalize_invite_code(p_code)
    and t.invite_code_expires_at > now()
  group by t.name, t.destination, t.start_date, t.end_date
  limit 1;
$$;

create or replace function public.join_trip_by_invite_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip_id uuid;
begin
  select id into v_trip_id
  from trips
  where upper(invite_code) = public.normalize_invite_code(p_code)
    and invite_code_expires_at > now()
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

-- ── Regenerate: owner-only, returns the fresh code + new expiry ─────────────
create or replace function public.regenerate_invite_code(p_trip_id uuid)
returns table (invite_code text, invite_code_expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not exists (
    select 1 from trips where id = p_trip_id and created_by = auth.uid()
  ) then
    raise exception 'Only the trip owner can regenerate the invite code';
  end if;

  v_code := public.gen_invite_code();

  return query
    update trips
      set invite_code = v_code,
          invite_code_expires_at = now() + interval '14 days'
      where id = p_trip_id
      returning trips.invite_code, trips.invite_code_expires_at;
end;
$$;

-- Grants. gen_invite_code / normalize are internal helpers — no public execute.
revoke all on function public.gen_invite_code()              from public;
revoke all on function public.normalize_invite_code(text)    from public;

revoke all     on function public.regenerate_invite_code(uuid) from public;
revoke execute on function public.regenerate_invite_code(uuid) from anon;
grant  execute on function public.regenerate_invite_code(uuid) to authenticated;

-- get_trip_by_invite_code / get_trip_preview / join_trip_by_invite_code retain
-- their existing grants (create or replace does not reset them).
