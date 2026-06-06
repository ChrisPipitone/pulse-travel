---
tier: decision
status: proposed
updated: 2026-06-06
note: supersedes ITINERARY_DESIGN.md's "manual-only MVP, smart scheduling post-MVP" stance. NOT current truth until a human flips status to accepted. Building schema/code is gated on acceptance.
---

# Convergence Calendar

Session date: 2026-06-06. Prototyped as `ia-calendar-v11.html` (steps v6→v11). Thesis carried in
memory `project_convergence_calendar_thesis`. Implementation handoff (non-authoritative):
`docs/research/calendar_v11_implementation_handoff_2026-06-06.md`.

---

## Decision

The **Plan** surface is a calendar that decides *when* each already-grouped activity happens across
members' **tentative** date windows. Nothing is booked. A day "works" for an activity when **all its
MUST crew are present and unblocked**. When a crew can't converge on any day, the engine finds the
**smallest single-person date shift** that fixes it and offers it as a gentle ask (the hero);
**splitting the crew** is the fallback. Everything re-flows live as dates change. The calendar is the
centerpiece; "Bring together" and "Conflicts" are tools layered over it.

This convergence behavior — nudging one person's tentative dates so a crew can be in the same place on
the same day — **is Pulse's core purpose**, not a post-MVP nicety.

---

## What this supersedes

`ITINERARY_DESIGN.md` (accepted 2026-06-04) scoped **manual day-assignment as the MVP** and filed
"smart scheduling," "conflict detection," and "sub-group split UI" under *post-MVP*. This ADR
**pulls those forward**: convergence + conflict-detection + the 2+N split are the MVP point of the
Plan surface, with manual placement as one interaction within it rather than the whole feature.

The four-layer model, the potential-vs-actual crew insight, the region clustering, and the 2+2 split
framing from `ITINERARY_DESIGN.md` all **still hold** — this ADR builds on them; it does not discard
them. It only changes *sequencing and emphasis*.

`ITINERARY_DESIGN.md` should be annotated as superseded-by this doc once this is accepted. The Stops
Timeline (`TripTimeline.tsx`) is **not** retired. The Plan↔Timeline relationship is **undetermined**:
they may coexist, combine features, or the calendar may become a *subsection of* Timeline on desktop.
Chris decides later — for now build Plan as an additive surface that does not disturb Timeline.

---

## Persistence model

A **slot** = a proposed day for an activity, with a crew subset. One activity may have multiple slots
(that *is* the split).

```sql
public.itinerary_slots
  id          uuid pk default gen_random_uuid()
  trip_id     uuid references trips(id) on delete cascade
  activity_id uuid references activities(id) on delete cascade
  date        date not null          -- the proposed day (tentative; nothing booked)
  created_by  uuid references profiles(id)
  created_at  timestamptz default now()
  -- NO unique(activity_id): multiple slots per activity power the split

public.itinerary_slot_members        -- crew subset for a slot (powers the 2+N split)
  slot_id uuid references itinerary_slots(id) on delete cascade
  user_id uuid references profiles(id)
  pk (slot_id, user_id)
```

- A normal placement = one slot whose members = the activity's full MUST crew.
- A split = 2+ slots for the same `activity_id`, each with a different member subset.
- `itinerary_slot_members` also implements "non-crew members can always be added" (any user → any
  slot, regardless of rating) — same role `ITINERARY_DESIGN.md`'s `slot_members` played.
- **RLS:** SELECT = trip member; INSERT/UPDATE/DELETE = trip **owner** (organizer curates the
  sequence; members influence it via their own *dates* + soft signals, not by editing slots). Mirror
  the `trip_events` owner-only policy. SECURITY DEFINER helpers follow the `search_path` convention
  (memory `reference_pgcrypto_search_path`).

### Naming note (reconcile with old ADR)
`ITINERARY_DESIGN.md` sketched these as `itinerary_slots(scheduled_date, start_time, end_time)` +
`slot_members(added_by)`. This ADR uses `date` (not `scheduled_date`) and `itinerary_slot_members`
(not `slot_members`), and **drops `start_time`/`end_time`** (Plan is day-granular; nothing is booked,
so times are noise for MVP). No table exists yet, so there is no migration cost to choosing these
names — this ADR's names are authoritative.

### Elastic bounds (derive, don't store)
The calendar envelope = `min(arrival) … max(departure)` across members, **not** `trips.start/end`.
Compute in a hook. An owner "extend trip?" nudge may optionally write `trips.start/end` (later phase).

---

## Where the logic lives

Per `MVP_ARCHITECTURE` logic-placement rules:

| Logic | Home | Why |
|---|---|---|
| `present(m,d)`, `works(a,d)`, per-day crews, best-overlap week, what-if preview | **client hook** | Must be instant — drag dates → re-flow, no round-trip |
| Auto-draft, nudge search, split plan, conflict detection (region/double/lock) | **API route** `/api/trip/[id]/plan` | Complex, expensive, one source of truth |
| Persisted slots, date writes, asks | **services + API** | Never trust client for writes |

The pure engine functions (`works`/`present`/`nudgesFor`/`splitPlan`/`regionClashes`/`doubleBooks`/
best-week — ~63 LOC in the proto) live in a **shared module** so client preview and server truth run
the same code. The API is authoritative on commit and initial auto-draft.

---

## Reuses (already in the app)

`trips.start/end_date`; `trip_members.arrival/departure_date` (+ member self-update RLS — this *is*
the nudge-accept write, via `useUpdateMemberDates`); `activities.region`/`duration_hours`/`stop_id`;
`stops` (legs) + `useStopActions`; `activity_ratings` + `useCrewRows` (grouping — the calendar
**consumes**, does not re-group); `trip_events` + `trip_event_members` (whole-group lock = event whose
members = all); `tripStore`; `useTripData`; `RATING_PILL`.

---

## Deferred (later phases, with debt notes)

- **Convergence asks** ("ask Marco → he accepts → his dates move"): **client-only for MVP**. *Debt: if
  asks are kept, real cross-device delivery needs a `convergence_asks` table + RLS + Realtime/poll.*
- **Soft signals** (works-for-me / need-other-dates): **client-only for MVP**. *Debt: persisting needs
  a new per-user-per-slot table + RLS + store slice + sync.*
- Data-prereq capture (region/duration/dates into onboarding) + graceful degradation hardening.
- ***REMOVED*** "book" handoff — out of scope; nothing books here.

---

## Open decisions (confirm at impl time)

- Nudge forcefulness: ask the blocker directly vs surface to organizer only. Leaning: rationale-backed
  opt-in ask.
- Plan↔Timeline relationship: coexist, combine features, or calendar-as-subsection-of-Timeline on
  desktop. Chris decides later.

---

## Prototype stubs that need real implementations

- Gap warning `dur > presentCount` is meaningless (hours vs people) — **drop or replace**, do not port.
- Split tie-break is greedy-first — make it leg/region-aware.
- "Viewing as" switcher → real signed-in user (`useSession`).
- Sample region-mismatch/double-book injected via "Load sample clashes" → in-app they arise from real
  placements, detected continuously.
- Nudge 2-day cap is arbitrary.
