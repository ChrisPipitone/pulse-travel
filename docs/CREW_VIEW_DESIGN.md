# Find Your Crew — Design Sprint Handoff

Session date: 2026-05-23. Covers design decisions, iteration history, and direction for implementing the "Find your crew" view.

---

## Core Use Case (verbatim from Chris)

> "I like the idea that the view changes depending on the amount of people but I don't want to remove the avatars. remove the diverging bar from this view, maybe it can be used somewhere else. Perhaps we need an option to "deep dive" into an activity. where clicking this card opens a modal and is the deep dive. the card then becomes a quick view such that at small group numbers you see all you need to know and for this stage of the app the user doesn't need to do anything else. then for larger groups the full picture is gained from clicking and viewing the deep dive. later in the app we can put other features in this deep dive section to continue the trip planning. reminder the entire use-case and purpose for this app is to group people together based on who wants to do what. it should solve the use case of 'I want to do x,y,z who else wants the same? we will plan to go together to those activities. I would go to a,b,c lets see if we can make that work. I am indifferent about e,f,g maybe if I have remaining time in the day I can tag along if it works out, otherwise I don't care for it. perhaps I don't even like e,f,g and I find it a waste of time.' perhaps later in the development, post MVP we can reach a point where the entire trip planning can happen in the app."

---

## What "Find Your Crew" Is

The core differentiator of Pulse. Not a data dashboard — a group-formation tool. For each activity: who is excited enough to do it together? The view answers "who's my crew for this?" at a glance, and opens a planning space when you need more.

---

## Current Implementation (before this sprint)

File: `apps/web/src/components/CompatibilityMatrix.tsx`, function `CrewCards`.

- Activity cards sorted by `excitedCount` (MUST + WANT members), score as tiebreak
- Each card: activity name/location, excited count badge, MUST/WANT/MEH avatar rows, score bar
- MEH rows faded at 50% opacity
- Empty state: opacity-40 card, "Nobody's excited yet"
- Pagination via `crewSlice`

**Gaps identified:**
- No personalization — viewer can't locate themselves without hunting
- No conflict signal — 3 MUSTs + 3 MEHs looks identical to 6 WANTs
- Unrated members invisible (different from MEH — zero signal, not a non-vote)
- Sort is one-dimensional (excited count only)
- Doesn't scale — avatar rows become unreadable at 15+ members
- No action path from the view

---

## Design Decisions Made This Session

### Card = quick view. Modal = deep dive.

Cards must be self-sufficient for small groups. Modal exists for:
1. Full picture at large group sizes
2. Planning actions (now and future)
3. Future features: date suggestions, sub-group formation, itinerary, comments

### Avatars always stay

Never remove avatars regardless of group size. Identity matters. At large groups, truncate with "+N excited" overflow — never replace with bars alone.

### Adaptive card by group size

- **≤8 members**: Full MUST/WANT/MEH rating rows on the card. Every member's stance visible without opening anything.
- **>8 members**: Top 5 excited avatars + "+N excited" overflow + count pills (e.g. "11 MUST · 8 WANT · 3 MEH"). Deep dive required for full picture.

Threshold (8) is a tunable constant — adjust after seeing real data.

### Left stripe = viewer's own rating

4px left border on each card colored by the viewer's rating: coral (MUST), mint (WANT), yellow (MEH), gray (unrated). Instant personal orientation.

### "You: MUST/WANT/MEH/—" chip

Top-right of card. Self-chip always visible. Viewer's own avatar gets an accent outline ring in all avatar groups.

### Count pills on cards (large group mode)

Small colored pills: `11 MUST`, `8 WANT`, `3 MEH`. Gives distribution at a glance without a bar.

### Deep dive modal

Bottom sheet (slides up). Contains:
- Visual distribution bar (stacked, no % number — color proportions carry the story)
- Legend with counts: MUST N · WANT N · MEH N · unvoted N
- "Who's in" section: avatar + name chips per rating row (MUST/WANT/MEH)
- Unvoted members note
- **Options section** — the planning hub (see below)

### Options section in modal

Pattern: primary action (most contextually appropriate) is coral/highlighted. Secondary actions are neutral gray. Unavailable/future actions get "Soon" or "N/A" tag — not hidden.

Current options by state:

| State | Primary option | Secondary options |
|---|---|---|
| High enthusiasm, viewer rated | Suggest a day | Plan with MUSTs only, Nudge unrated |
| Split group (conflict) | Go as sub-group | Suggest a day, Discuss (Soon) |
| Viewer unrated | Rate inline (MUST/WANT/MEH buttons) | Nudge unrated |
| Large group | Suggest a day | Plan with MUSTs only, Nudge unrated, Discuss (Soon) |

The modal is the **future home** for: itinerary slot assignment, date voting, sub-group chat, ***REMOVED*** links to book the activity.

### Diverging bar: removed from this view

Shelved — may be useful in another view (e.g. conflict analysis, a future "Debate" view). Not appropriate in "Find your crew" where the goal is group formation, not debate framing.

### Distribution bar lives in modal only

Not on the card. Cards are visual (avatars, stripe, chip). Bars are data — belong in the deep dive.

### Poll visualization insight

"It's like a poll" — valid framing. Borrowed: stacked horizontal bar for distribution (scales to any group size), approval count in legend. Not borrowed: diverging bar (removed), percentage headlines (removed — too data-heavy for a visual view).

---

## Prototype Files

All in `apps/web/public/prototypes/`. Open directly in browser or via dev server at `/prototypes/crew-vN.html`.

| File | What it shows |
|---|---|
| `crew-v1.html` | First pass: stripe, you-chip, conflict pill, unrated count, sort bar |
| `crew-v2.html` | Scaling exploration: stacked bar + adaptive avatar truncation + diverging bar (rejected) |
| `crew-v3.html` | Card + modal split introduced. Bar moved to modal. Working click-to-open. |
| `crew-v4.html` | **Current best.** Full rating rows on small-group cards. Four modal states. Options section. Avatar+name chips in modal. ← Start here. |

v4 is the approved direction. Next step is implementing it in `CompatibilityMatrix.tsx`.

---

## Implementation Notes

### Files to touch

- `apps/web/src/components/CompatibilityMatrix.tsx` — `CrewCards` function (lines ~503–572), `CrewRow` interface, `crewRows` useMemo (lines ~731–742)
- No changes needed to hooks, store, or services — data model already has everything required

### Data already available

- `mustMembers`, `wantMembers`, `mehMembers` arrays per activity (already computed in `crewRows`)
- `excitedCount` per activity
- `score?.ratings[currentUserId]` gives viewer's own rating (need to pass `currentUserId` into `CrewCards`)
- Member `arrival_date` / `departure_date` on `Member` type (for future date-aware crew filtering)

### New props needed for CrewCards

```ts
interface CrewCardsProps {
  rows: CrewRow[]
  maxScore: number
  colorMap: Map<string, number>
  currentUserId: string   // ← new: for you-chip + avatar ring
  members: Member[]       // ← new: for unvoted count (totalMembers - rated)
}
```

### Group size threshold

```ts
const SMALL_GROUP_THRESHOLD = 8  // show full rows; above this, truncate
const MAX_CARD_AVATARS = 5       // max avatars shown on large-group card
```

### Modal

Implement as a new component `ActivityCrewModal.tsx` alongside `CompatibilityMatrix.tsx` or inside it. State: `const [selectedActivity, setSelectedActivity] = useState<string | null>(null)`.

Use existing modal pattern (fixed overlay, ESC closes, backdrop click closes) from `ActivityDetailModal.tsx`.

### Unvoted count

```ts
const unvotedCount = members.length - (mustMembers.length + wantMembers.length + mehMembers.length)
```

---

## What's Deliberately Not Built Yet

- Date-aware crew filtering (needs dates to be widely set by members — low signal now)
- "Nudge unrated members" action (needs notification system)
- "Suggest a day" action (needs itinerary builder)
- "Discuss" / comments (post-MVP)
- Sort modes beyond excited-count (defer until users ask)

These all live in the modal options section with "Soon" tags. The modal structure is already designed to absorb them.
