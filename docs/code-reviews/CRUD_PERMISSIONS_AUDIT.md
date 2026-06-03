# CRUD Permissions Audit (JAB-56)

> Date: 2026-06-03 · Method: live introspection of the local Postgres (RLS state, all `pg_policies`, `role_table_grants`, function `EXECUTE` grants), cross-checked against service-layer calls in `packages/services/src/trips.ts`.
>
> Premise (from JAB-56): **RLS is the last line of defence — the REST API is fully bypassable via direct Supabase calls with a valid JWT.** Every gap below is therefore reachable by any authenticated user crafting raw PostgREST requests, not just through the app UI.

RLS is `ENABLED` on all 9 public tables (none `FORCED`, which is fine — table owner/service role bypass is intended).

---

## Layer 0 — Grant baseline (not covered by JAB-56; found during audit)

JAB-56 reviewed *policies*. But policies only matter for a role that also holds the table *privilege*. The grant baseline is wrong, independent of policies:

| Role | Current grants (every table) | Should be |
|---|---|---|
| `anon` | `INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER` (SELECT already revoked) | **nothing** |
| `authenticated` | `SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER` | `SELECT, INSERT, UPDATE, DELETE` only |

**Cause:** legacy Supabase default granted `ALL` to `anon` + `authenticated` on `public`. Migration `20260518212030` revoked only `anon`'s SELECT; `20260527000000` *added* authenticated grants but never trimmed the inherited extras. The stated model ("anon has no grants, all access via authenticated + RLS") was never actually enforced at the grant layer.

- **`anon` writes (F1, HIGH):** today RLS still denies them (every write policy is `to authenticated`, and the `{public}` stops/categories policies evaluate `auth.uid()` → NULL → false for anon). But it is one mis-scoped `to public` policy away from anonymous writes. Revoke.
- **`TRUNCATE` (F2):** *not subject to RLS* — a privilege holder can empty a table regardless of policy. Not currently exposed through PostgREST (no truncate verb), so not remotely exploitable today, but it has no business being granted. Revoke from both roles.
- `REFERENCES`, `TRIGGER`: unused, revoke from both.

**Action: fixed now** — see migration `20260603000003`.

---

## Per-resource review (JAB-56 format: current / intended / gap / action)

### trips
- **Create** — current: any authenticated, `with check (created_by = uid)`. Intended: same. ✓
- **Read** — current: `created_by = uid OR is_trip_member(id)`. Intended: members + owner. ✓
- **Update** — current: owner only (`using created_by = uid`). Intended: owner only. ✓ logic. **Gap: no `WITH CHECK`** (F4) — owner can rewrite `created_by` to another user (hand off / orphan the trip). Low impact, but unintended.
- **Delete** — current: owner only. ✓. Cascades verified at schema level (FKs `on delete cascade`/`set null`); end-to-end deletion is tracked separately ("Fix account deletion" ticket).

### stops
- **Create** — current: **any trip member** (`is_trip_member(trip_id) and created_by = uid`). Intended per **JAB-81: owner-only**. **Gap (F6): too permissive.** Decision below.
- **Read** — current: any trip member. ✓
- **Update / Delete** — current: creator or owner. JAB-81 says owner-only. **Gap (F6).** Also **no `WITH CHECK`** (F4) → a stop's `trip_id` can be repointed to another trip.
- All four stops policies are `to {public}` not `to authenticated` (F3) — cosmetic once F1 lands, tighten anyway.

### activities
- **Create** — current: any trip member, `with check (added_by = uid AND member-of(trip_id))`. Intended: any member (anyone can suggest). ✓
- **Read** — any trip member. ✓
- **Update / Delete** — current: creator or trip owner. Intended: same. ✓ logic. **Gap (F4, MEDIUM): no `WITH CHECK`.** The UPDATE `USING` only checks the *old* row. A member who added an activity can `PATCH` its `trip_id` to **any other trip — including trips they are not a member of** — injecting a row into a foreign trip. Reachable via direct API. Needs a `WITH CHECK` that re-validates membership of the *new* `trip_id`.
- **Assign to stop (`stop_id`)** — currently rides the activities UPDATE policy (creator or owner). Acceptable for MVP; revisit if stop assignment should be any-member.

### activity_ratings
- **Create / Update / Delete** — current: own only. ✓. **Gap (F4): UPDATE/DELETE have no `WITH CHECK`** → `UPDATE` could reassign `user_id`/`activity_id` to another user/activity. Mirror `USING` into `WITH CHECK`.
- **Owner moderation** — current: owner cannot delete others' ratings. Intended: **accept for MVP** (no moderation). Revisit if abuse appears.

### trip_members
- **Insert (join)** — current: `with check (user_id = uid)` **and nothing else** (F5, HIGH-ish). **Any authenticated user can insert themselves into any `trip_id` they know** — the invite code is resolved client-side and **never verified by RLS**. Trip ids are UUIDs (not enumerable), so the practical secret is the UUID, not the invite code. This means invite-code expiry/lock/regenerate (a separate backlog ticket) is **unenforceable at the data layer** as written. Product decision below.
- **Read** — any trip member (`is_trip_member(trip_id)`). ✓
- **Update (dates)** — current: own row only. Intended: own row (owner-on-behalf is a nice-to-have, not MVP). ✓ logic. **Gap (F4): no `WITH CHECK`** → could change own row's `trip_id`/`user_id`.
- **Delete (leave/remove)** — current: self OR owner-of-trip. Self-leave ✓, owner-removes-others ✓. Correct.

### profiles
- **Read** — co-trip members + self (JAB-13). ✓
- **Insert** — own (`id = uid`) + `handle_new_user` trigger. ✓
- **Update** — own row; column grant now limited to `display_name, avatar_url` (JAB-15 follow-up, commit `9f3b2bf`). ✓. `tier`/`id` no longer writable. **No `WITH CHECK`** but mitigated by the column grant.
- **Delete** — no policy → denied; profile removal via auth-user cascade. ✓

### activity_categories
- Read-only reference. SELECT `to {public}` (tighten to authenticated, F3); no write policies → writes denied. ✓

### Functions (`SECURITY DEFINER`)
All correct: `check_trip_member_limit`, `handle_new_user` → no EXECUTE for anon/authenticated (trigger-only); `is_trip_member`, `is_trip_member_by_email`, `get_trip_by_invite_code` → authenticated-only, anon revoked (commit `9721e54`). ✓

---

## Findings summary

| ID | Severity | Finding | Status |
|---|---|---|---|
| F1 | HIGH | `anon` holds write grants on all tables | **Fixed** (`...0003`) |
| F2 | MED | `authenticated` holds TRUNCATE/REFERENCES/TRIGGER | **Fixed** (`...0003`) |
| F3 | LOW | stops + activity_categories policies are `to public` | **Fixed** (`...0003`) |
| F4 | MED | All 7 UPDATE policies lack `WITH CHECK` (cross-trip row relocation; id/owner rewrite) | **Decision** |
| F5 | HIGH? | `trip_members` INSERT has no trip-scoped authorization — any auth user joins any trip by UUID | **Decision** (product) |
| F6 | — | stops CRUD is any-member; JAB-81 wants owner-only | **Decision** (product, align w/ JAB-81) |

---

## Decisions needed

1. **F4 — add `WITH CHECK` to UPDATE policies.** Self-scoped tables (`activity_ratings`, `trip_members`, `trips`, `trip_events`) → mirror `USING`. `activities`/`stops` → `WITH CHECK` must require membership/ownership of the **new** `trip_id` to block cross-trip relocation. Recommend doing all of these.
2. **F5 — invite enforcement.** Is "knowing the trip UUID = allowed to join" acceptable for MVP (UUID is the secret), or should joining require a verified invite code at the RLS layer (e.g. a `SECURITY DEFINER` join function that checks the code)? The latter is required before invite expiry/lock/regenerate can mean anything.
3. **F6 — stops owner-only?** JAB-81 (in review) states owner-only stop CRUD. If confirmed, tighten create/update/delete from creator-or-member to owner-only.
