# Pulse — Code Review Round 1

Full-stack audit: readability, lean code, security, modularity, reusability.
Priority = user-perceived quality × maintenance cost × risk.

---

## Reconciliation — 2026-06-04

> Verified against current code. **All ~18 findings below shipped in subsequent sessions.** This document is a historical record; do not re-action resolved items (per CLAUDE.md "open items carry forward, don't re-evaluate completed ones"). Only the file-size residuals remain open → tracked in **JAB-96**.

| Item | Status | Evidence |
|---|---|---|
| C1 split `FindYourCrew.tsx` | ✅ done | 824 → 352 lines; `CrewCard.tsx`/`CrewModal.tsx` extracted (flat, not under `crew/`) |
| C2 split `trip/[id]/page.tsx` | ✅ done | 642 → 430; `TripSidebar.tsx` + `TripLoadingSkeleton.tsx` extracted |
| D1 date utility | ✅ done | `apps/web/src/lib/date.ts` |
| D2 rating pill/button styles | ✅ done | `RATING_PILL` + `RATING_BUTTON` in `@pulse/types` |
| D3 undo timer | ✅ done | `packages/hooks/src/useUndoAction.ts` |
| D4 `MemberDots` | ✅ done | `components/MemberDots.tsx` |
| T1 `TripPreview` type | ✅ done | `getTripByInviteCode → TripPreview` |
| T2 `any` in services | ✅ done | explicit inline shapes |
| T3 magic error codes | ✅ done | `PG_NOT_FOUND` / `PG_UNIQUE_VIOLATION` in `lib/constants.ts` |
| T4 `joinTrip` dead branch | ✅ done | single throw |
| S1 `addActivity` silent null | ✅ done | throws on error (`trips.ts:192`) |
| S2 `upsertRating` ignores error | ✅ done | throws on error (`trips.ts:219`) |
| S3 O(n²) lookup | ✅ done | map-based lookup |
| P5 magic numbers | ✅ done | `lib/constants.ts` |
| P6 modal state | ✅ done | discriminated union `ModalState` |
| P7 standards | ✅ done | CLAUDE.md "Code Standards" section |
| **Residual — file size** | ◻ **open** | `FindYourCrew.tsx` 352 > 300; `page.tsx` 430 > 250 → **JAB-96** |

The original findings are preserved below as written.

---

## PRIORITY 1 — CRITICAL: Monolithic files

These files need to be split. Each is doing 3–5 things that should live in separate files.

### C1 — `FindYourCrew.tsx` (824 lines) — split into 6 files
**Impact: HIGH** — 824 lines is unnavigable. All sub-components live inline.

Sub-components to extract:
| New file | Extracted from | Approx lines |
|---|---|---|
| `components/crew/AvatarChip.tsx` | `AvatarChip` function | ~30 |
| `components/crew/StatusPill.tsx` | `StatusPill` function | ~30 |
| `components/crew/AvatarRow.tsx` | `AvatarRow` function | ~50 |
| `components/crew/TierBlock.tsx` | `TierBlock` function | ~55 |
| `components/crew/CrewCard.tsx` | `CrewCard` function | ~130 |
| `components/crew/CrewModal.tsx` | `CrewModalD2` function | ~245 |
| `FindYourCrew.tsx` | shell + sort/filter logic | ~180 |

`CrewModalD2` is a full-screen modal with its own rating UI — it absolutely should not be embedded in the parent component file.

### C2 — `apps/web/src/app/trip/[id]/page.tsx` (642 lines) — split into 4 files
**Impact: HIGH**

Extractable pieces:
| New file | What it contains |
|---|---|
| `components/TripSidebar.tsx` | ~200 lines of sidebar JSX (trip identity card, members, stops panel, invite card) |
| `components/TripLoadingSkeleton.tsx` | ~50 lines of skeleton JSX (duplicated from real layout) |
| `hooks/useActivityUndo.ts` | undo timer logic for activity + trip delete (currently ad-hoc inline) |
| `trip/[id]/page.tsx` | modal state, handlers, tab switcher — ~200 lines |

The sidebar and loading skeleton are fully static layout concerns — they have zero business logic and no reason to inflate the page component.

---

## PRIORITY 2 — HIGH: Duplicated logic (DRY violations)

These patterns appear in 3–5 places each. Every new feature will copy-paste them again.

### D1 — Date formatting duplicated in 4 files
**Impact: HIGH** — Any format change requires 4 edits.

Instances:
- `apps/web/src/app/page.tsx:11` — `formatDateRange`
- `apps/web/src/app/trip/[id]/page.tsx:41` — `formatDateRange`
- `apps/web/src/app/trip/[id]/page.tsx:50` — `formatMemberDates`
- `apps/web/src/app/join/page.tsx:11` — `formatDateRange`
- `apps/web/src/components/TripTimeline.tsx:26` — `fmtDate` / `formatStopDates`

Fix: single file `apps/web/src/lib/date.ts`:
```ts
export function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function fmtDateRange(from?: string | null, to?: string | null, labels = { from: 'From', to: 'Until' }): string | null {
  if (from && to) return `${fmtDate(from)} – ${fmtDate(to)}`
  if (from) return `${labels.from} ${fmtDate(from)}`
  if (to) return `${labels.to} ${fmtDate(to)}`
  return null
}
```
All 5 instances collapse to imports.

### D2 — Rating pill styles in 3 files (4 different definitions)
**Impact: HIGH** — `MUST` color already differs between files (`bg-must/12` vs `bg-[rgba(255,92,53,0.12)]`).

Instances:
- `ActivityDetailModal.tsx:14` — `ratingColor` (filled background variant)
- `FindYourCrewOverview.tsx:91` — `ratingPillStyle` (inline rgba — already stale)
- `TripTimeline.tsx:42` — `ratingPill` (semantic token variant)
- `FindYourCrew.tsx:476` — inline object (active + ghost variants)

Fix: export from `@pulse/types` (it already owns `Rating` and `RATING_LABELS`):
```ts
// packages/types/src/index.ts
export const RATING_PILL: Record<Rating, string> = {
  MUST:  'bg-must/12 text-must',
  MAYBE: 'bg-maybe text-maybe-text',
  SKIP:  'bg-skip text-skip-text',
}

export const RATING_BUTTON: Record<Rating, { active: string; idle: string }> = {
  MUST:  { active: 'bg-must text-must-text border-transparent',  idle: 'border-must/40 text-must/60' },
  MAYBE: { active: 'bg-maybe text-maybe-text border-transparent', idle: 'border-maybe/40 text-maybe-text/60' },
  SKIP:  { active: 'bg-skip text-skip-text border-transparent',  idle: 'border-skip/40 text-skip-text/60' },
}
```

### D3 — Undo timer pattern in 2+ files
**Impact: MED** — identical `setTimeout` + `Map<string, NodeJS.Timeout>` + `showToast` pattern in:
- `apps/web/src/app/trip/[id]/page.tsx:174` — activity delete
- `apps/web/src/app/trip/[id]/page.tsx:220` — trip delete
- `apps/web/src/components/CreateTripModal.tsx` — member remove

Fix: `packages/hooks/src/useUndoAction.ts`:
```ts
export function useUndoAction(duration = 4000) {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  function schedule(key: string, onCommit: () => void) {
    const t = setTimeout(() => {
      timers.current.delete(key)
      onCommit()
    }, duration)
    timers.current.set(key, t)
    return () => { clearTimeout(timers.current.get(key)); timers.current.delete(key) }
  }

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])
  return { schedule }
}
```

### D4 — `MemberDots` component defined inline in home page
**Impact: LOW** — `apps/web/src/app/page.tsx:23` defines `MemberDots` as a local function. It overlaps semantically with `MemberAvatar`. Either move to `components/MemberDots.tsx` or confirm it can be built from `MemberAvatar` with an overlap container.

---

## PRIORITY 3 — HIGH: Type safety gaps

### T1 — `getTripByInviteCode` return type is a lie (JAB-14 regression)
**Impact: HIGH** — After JAB-14, the Postgres function returns only `{id, name, destination, start_date, end_date}`. The service still returns `Trip | null`. At runtime, `trip.invite_code` is `undefined` — TypeScript thinks it's `string`.

Fix: add a narrow type to `packages/types/src/index.ts`:
```ts
export type TripPreview = Pick<Trip, 'id' | 'name' | 'destination' | 'start_date' | 'end_date'>
```
Update service:
```ts
export async function getTripByInviteCode(client: SupabaseClient, code: string): Promise<TripPreview | null>
```
Update `join/page.tsx` to use `TripPreview` state.

### T2 — `any` casts in services bypass type checking
**Impact: MED** — `trips: any`, `activities: any`, `profiles: any` in `getUserTrips`. A schema change silently breaks the transform.

Fix: define inline types or use `as unknown as T` with a comment. Prefer `as { id: string; trip_id: string }[]` over `as any[]`.

### T3 — Magic error codes as raw strings
**Impact: LOW** — `'PGRST116'` and `'23505'` appear as magic strings. If Supabase or Postgres change them, failures are silent.

Fix: a small constants file (see P1 below).

### T4 — `joinTrip` dead branch
**Impact: LOW** — `packages/services/src/trips.ts:251–254`: both arms of the `if (error.message.startsWith('Trip is full'))` do `throw new Error(error.message)` — identical. The special case accomplishes nothing.

Fix: collapse to `throw new Error(error.message)`.

---

## PRIORITY 4 — MED: Silent errors in services

### S1 — `addActivity` silently returns `null` on failure
`packages/services/src/trips.ts:183`:
```ts
const { data } = await client.from('activities').insert(activity).select().single()
return data  // error is ignored
```
The caller (`useAddActivity`) does `if (!activity) return false` — success and failure look identical. If the insert fails (RLS, network), the activity silently disappears.

Fix:
```ts
const { data, error } = await client.from('activities').insert(activity).select().single()
if (error) throw new Error(error.message)
return data
```

### S2 — `upsertRating` ignores all errors
`packages/services/src/trips.ts:210`:
```ts
await client.from('activity_ratings').upsert(rating, { onConflict: 'activity_id,user_id' })
// no error check
```
The optimistic update in `useRateActivity` will show the rating in the UI even if the DB write failed. There's no rollback trigger.

Fix: destructure `{ error }` and throw.

### S3 — `getUserTrips` has an O(n²) activity→trip lookup
`packages/services/src/trips.ts:66`:
```ts
const tripId = activities.find((a: any) => a.id === r.activity_id)?.trip_id
```
Called inside a loop over `myRatings`. At 200 trips × 20 activities × all ratings, this scans the activities array per rating. At MVP scale it's fine; at stress-test scale (200 trips, bulk users) it will be measurable.

Fix: build a `Map<activityId, tripId>` before the loop:
```ts
const activityTripMap = new Map(activities.map((a: any) => [a.id, a.trip_id]))
// then: activityTripMap.get(r.activity_id)
```

---

## PRIORITY 5 — MED: Magic numbers — centralize in one constants file

**Impact: MED** — scattered across 5+ files, will drift.

| Value | Current locations | Meaning |
|---|---|---|
| `4000` | `trip/[id]/page.tsx:185,198`, `ToastProvider.tsx` | undo/toast duration ms |
| `5000` | `trip/[id]/page.tsx:228` | trip delete undo duration ms |
| `5` | `services/trips.ts:29,77`, `ActivityDetailModal` | member avatar preview cap |
| `'PGRST116'` | `services/trips.ts:138` | Postgres row not found |
| `'23505'` | `services/trips.ts:102` | Postgres unique violation |

Fix: `apps/web/src/lib/constants.ts`:
```ts
export const UNDO_DURATION_MS   = 4000
export const TRIP_DELETE_DELAY  = 5000
export const AVATAR_PREVIEW_CAP = 5
export const PG_NOT_FOUND       = 'PGRST116'
export const PG_UNIQUE_VIOLATION = '23505'
```

---

## PRIORITY 6 — LOW: Modal state explosion

**Impact: LOW** — `trip/[id]/page.tsx` has 7 separate modal state variables:
```ts
const [modal, setModal]                 // activity add/edit
const [stopModal, setStopModal]         // stop add/edit
const [showDatesModal, setShowDatesModal]
const [showEditTrip, setShowEditTrip]
const [showSchedulesModal, setShowSchedulesModal]
const [showInviteModal, setShowInviteModal]
const [copied, setCopied]
```

Not broken, but when the trip page gains more features each new modal adds 2 state lines + 2 handler functions. Consider a single discriminated union if this grows past 8 modals:
```ts
type ActiveModal = 'none' | 'activity-add' | 'activity-edit' | 'stop-add' | 'stop-edit' | 'dates' | 'edit-trip' | 'schedules' | 'invite'
const [activeModal, setActiveModal] = useState<ActiveModal>('none')
```

---

## WHAT'S SOLID — no action needed

- **Zustand store** (`tripStore.ts`) — clean, flat, correct cascading in `removeStop`. No over-abstraction.
- **Hooks architecture** — one hook per concern, all portable, zero platform APIs. Exactly right.
- **`useTripData`** — two-phase parallel fetch is correct. Real-time subscriptions are clean.
- **Services signature** — accepting `SupabaseClient` as a param (not importing it directly) is correct for portability.
- **RLS + migrations** — well-structured, each migration is single-purpose with clear comments.
- **`packages/types`** — `Rating` as a string union (not enum) is correct for TypeScript/JSON boundary compatibility.
- **`MemberAvatar`** — single-responsibility, well-parameterized.
- **`TripTimeline`** — after the previous session's refactor it's clean. Good use of the CSS grid height-animation trick.
- **Error boundary at hook level** — every hook returns `{ loading, error }` consistently.

---

## PRIORITY 7 — Configuration: How to keep standards going

### Add a "Code Standards" section to `CLAUDE.md`

These rules should be machine-enforced via instructions so you never have to re-discover them:

```markdown
## Code Standards

### File size limits
- Components: 300 lines max. Above that = split into sub-components.
- Services: no limit, but group by domain (trips, members, ratings) if > 250 lines.
- Pages: 250 lines max. Extract sidebar, skeleton, and sub-views to separate files.

### Utilities — canonical locations
- Date formatting: `apps/web/src/lib/date.ts` — `fmtDate`, `fmtDateRange`. Never inline.
- Constants (timeouts, caps, PG codes): `apps/web/src/lib/constants.ts`. Never inline magic numbers.
- Rating styles: `RATING_PILL` and `RATING_BUTTON` exported from `@pulse/types`. Never redefine.

### Patterns
- Undo/timer logic: use `useUndoAction` from `@pulse/hooks`. Never inline setTimeout + Map.
- Modal sub-components (200+ lines): always extract to own file in `components/`.
- New services functions: always destructure `{ data, error }` and throw on error. No silent null returns.
- No `any` in services: use `as { id: string; ... }[]` with explicit shape, or Supabase typed client.

### Component organization
- Local helper components (used only in one file and < 50 lines): OK inline.
- Local helper components (used only in one file but > 50 lines): extract to adjacent file or `components/[feature]/`.
- Shared components: always in `apps/web/src/components/` or `packages/ui/`.
```

### Add a `/review` skill (or extend `/ui-review`)

Create `docs/code-reviews/ROUND_N.md` as the review format — same pattern as UI reviews:
- Checklist items with IDs (C1, D1, T1, etc.)
- Impact ratings
- "What's solid" section
- Carry open items forward each round

Run a code review round whenever a significant feature lands. This keeps the codebase honest without requiring manual audits.

### ESLint rules that enforce the above

Add to `apps/web/.eslintrc` (or eslint config):
```json
{
  "rules": {
    "no-magic-numbers": ["warn", { "ignore": [0, 1, -1], "ignoreArrayIndexes": true }],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

---

## Implementation order

Do in this sequence to avoid regressions:

1. **D1** — `lib/date.ts` utility. Zero risk, isolated. Removes 5 duplicates in one PR.
2. **T1** — `TripPreview` type + service fix. Closes a real type safety hole from JAB-14.
3. **S1 + S2** — Fix silent errors in `addActivity` + `upsertRating`. These are correctness bugs.
4. **T4 + S3** — `joinTrip` dead branch + O(n²) fix. Small, zero-risk cleanup.
5. **D2** — `RATING_PILL` / `RATING_BUTTON` in `@pulse/types`. Eliminates visual inconsistency.
6. **D3** — `useUndoAction` hook. Extract before adding more undo-able actions.
7. **P5** — `lib/constants.ts`. Trivial.
8. **C2** — Split `trip/[id]/page.tsx` — do sidebar + skeleton first (zero logic change).
9. **C1** — Split `FindYourCrew.tsx` — extract modals first (`CrewModal`), then sub-components.
10. **CLAUDE.md update** — add Code Standards section.
