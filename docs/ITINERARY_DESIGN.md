# Itinerary Design

Session date: 2026-05-24.

---

## Core Insight

> **Find Your Crew shows the *potential* crew — everyone who'd go under ideal conditions. The itinerary is where the *actual* crew per scheduled instance gets resolved.**

These are two separate problems. The crew view answers "who would go." The itinerary answers "who goes when." Conflating them produces a bad UX for both.

---

## The Four Layers

### Layer 1 — Who (Find Your Crew, MVP now)

MUST + WANT ratings define the potential crew per activity.

| Rating | Crew membership |
|---|---|
| MUST | Definite crew — going regardless of timing |
| WANT | Conditional crew — in unless timing/logistics conflict |
| MAYBE | Flexible capacity — joins if it works out, no loss if not |
| SKIP | Out — not part of any crew calculation |

The Find Your Crew card presents MUST and WANT as two tiers within one group. MUST = solid commitment. WANT = likely, subject to schedule. No labels on the card — visual weight carries the distinction.

### Layer 2 — Where (activity region clustering)

Activities have a `region` field (e.g. Rome, Tuscany, Amalfi, Naples). Region is the natural clustering unit for day planning: Rome activities cluster to Rome days, Amalfi to Amalfi days.

This is the heuristic that makes "I'll be doing activity A on this day, so I could fit activity B here but not here" feel natural. The user thinks in terms of where they are that day.

**Data implication:** `region` on the `activities` table needs to be treated as a first-class field, not freetext. Suggest normalising to a controlled list per trip (user-defined regions: "Rome", "Amalfi Coast", "Naples day trip") rather than a global taxonomy.

### Layer 3 — When (manual for MVP, smart later)

The user assigns activities to calendar days. Constraints:
- Member arrival/departure dates bound which days they can attend
- Region clustering suggests which activities belong on the same day
- No two activities can fully overlap for the same person on the same day (basic conflict)

**MVP: manual.** User drags or assigns activities to days. The UI suggests compatible groupings based on region + attendance, but the user decides.

**Post-MVP: smart scheduling.** Given ratings + regions + member dates, suggest an optimised schedule. Activities in the same region, on days when the most MUST crew members overlap, get grouped. The algorithm minimises sub-group splits (but cannot eliminate them).

### Layer 4 — Conflict resolution (the 2+2 split)

When two crew members share a MUST for activity A but their other MUSTs create an impossible day, they both still go to activity A — just at different times. The crew splits into sub-instances.

Example:
- Activity A: Colosseum. Crew: Marco, Sara, Chris, Lena (all MUST)
- Activity B: Pompeii. Crew: Marco, Sara (MUST), Chris, Lena (WANT, but also MUST for activity C that day)
- Result: Marco + Sara do Colosseum Day 3. Chris + Lena do Colosseum Day 7.

The potential crew (4 people, all MUST) is correct. The actual instances (2+2) are resolved at scheduling time.

**This is expected and correct.** The app should present sub-group splits as a natural outcome, not a failure state. "You're going with Marco and Sara on Day 3. Chris and Lena are going on Day 7."

---

## Roster Model

The crew is a **default invite list**, not a locked roster.

- Any non-crew member can be added to any scheduled instance at any time
- A SKIP member can still show up if they change their mind or are invited
- This matters for destination weddings where non-interested guests may still join activities socially

---

## Future Consideration — Same Activity, Multiple Date Windows

Same activity, different date options within the trip. E.g.:
- "Colosseum Tour — Mar 21–23 window"
- "Colosseum Tour — Mar 23–25 window"

Allows sub-groups to self-select into a time window that works for them without requiring full-group consensus. Effectively creates multiple instances of the same activity at the rating stage.

**Scope: post-MVP.** Adds significant data model complexity (activity instances vs activities). Worth revisiting when real usage data shows this is a common workaround.

---

## Build Order

### MVP
- [ ] Manual day assignment — drag activity onto calendar day
- [ ] Region field normalised (user-defined per trip)
- [ ] Member date bounds respected (can't schedule activity on days they're not there)
- [ ] "Your crew" shown per scheduled instance (subset of potential crew who are present that day)
- [ ] Non-crew add: anyone can be added to any instance

### Post-MVP (rough order)
- [ ] Smart scheduling suggestion — region + attendance overlap heuristic
- [ ] Conflict detection — flag when two MUSTs for the same person can't fit
- [ ] Sub-group split UI — show "2 people going Day 3, 2 people going Day 7" as first-class state
- [ ] Same-activity multiple windows (date variant rating)
- [ ] Calendar export (Google, Apple, Proton)
- [ ] Full auto-schedule — bin-packing with constraints, generate itinerary from ratings alone

---

## Data Model Implications

Current schema already has:
- `activities.location` (freetext) — needs `region` as normalised field
- `members.arrival_date` / `members.departure_date` — already present
- `trip_events` table (fixed shared events like weddings) — already present

New tables needed for itinerary:
```sql
-- A scheduled instance of an activity (one activity can have multiple instances)
create table itinerary_slots (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references trips(id) on delete cascade,
  activity_id uuid references activities(id) on delete cascade,
  scheduled_date date not null,
  start_time  time,   -- nullable for MVP
  end_time    time,   -- nullable for MVP
  created_by  uuid references profiles(id),
  created_at  timestamptz default now()
);

-- Who is confirmed for a specific slot (subset of potential crew)
create table slot_members (
  slot_id uuid references itinerary_slots(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  added_by uuid references profiles(id),
  primary key (slot_id, user_id)
);
```

The `slot_members` table is how "non-crew members can always be added" is implemented — any user can be added to a slot regardless of their activity rating.
