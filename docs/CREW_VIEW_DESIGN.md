# Find Your Crew — Design Sprint Handoff

Session date: 2026-05-23. Updated to sharpen sub-group formation as the core model.

---

## Core Use Case (verbatim from Chris)

> "I like the idea that the view changes depending on the amount of people but I don't want to remove the avatars. remove the diverging bar from this view, maybe it can be used somewhere else. Perhaps we need an option to "deep dive" into an activity. where clicking this card opens a modal and is the deep dive. the card then becomes a quick view such that at small group numbers you see all you need to know and for this stage of the app the user doesn't need to do anything else. then for larger groups the full picture is gained from clicking and viewing the deep dive. later in the app we can put other features in this deep dive section to continue the trip planning. reminder the entire use-case and purpose for this app is to group people together based on who wants to do what. it should solve the use case of 'I want to do x,y,z who else wants the same? we will plan to go together to those activities. I would go to a,b,c lets see if we can make that work. I am indifferent about e,f,g maybe if I have remaining time in the day I can tag along if it works out, otherwise I don't care for it. perhaps I don't even like e,f,g and I find it a waste of time.' perhaps later in the development, post MVP we can reach a point where the entire trip planning can happen in the app."

> "Part of the point of this application is to split the people who are going on this trip up into potential sub-groups based on the activities they like. the users rate the activities and are grouped by their ratings. we want to perform that feature very well. its our core seller. we then take that feature and expand, iterate, dive deeper and also include fun, nice to have features that supplement that main goal."

---

## What "Find Your Crew" Is

**Sub-group formation is the primary purpose of Pulse.** Not a dashboard. Not a conflict resolver. Not a rating summary.

The entire rating system exists to answer one question per activity: **who is my crew for this?** MUST ratings define the natural sub-group. MAYBE says "I'm flexible — I'll join if it works out, skip if it doesn't." Unrated = no signal.

A group vacation is not one group doing everything together. It's overlapping sub-groups, each optimized around shared enthusiasm. Pulse's job is to surface those sub-groups so the trip can be planned around them instead of guessed at.

The "Find your crew" view is where that happens. Every card is an activity + its natural sub-group, ready to plan around.

---

## The Sub-Group Model

| Rating | What it means | Sub-group membership |
|---|---|---|
| MUST | I need to do this | Core sub-group — always in |
| MAYBE | Indifferent — I'll go or skip | Flexible — join if timing works, no loss if not |
| SKIP | Not interested | Out — excluded from crew |
| Unrated | No signal yet | Not counted |

**The crew for an activity = everyone who rated it MUST.**

This is not a "conflict" when different people have different crews for different activities — that's the feature. The trip is a collection of sub-group experiences. Someone's crew for the museum is different from their crew for the beach hike, and that's exactly what the trip should reflect.

MAYBE members are not obstacles. They are available capacity. If the timing works for a MAYBE member to join a sub-group, great. If not, no friction — they weren't defining the activity anyway.

---

## Current Implementation

Files: `apps/web/src/components/FindYourCrew.tsx`, `CrewCard.tsx`, `CrewModal.tsx`.

- Activity cards sorted by score (MUST×3 + MAYBE×1), excited count as tiebreak
- Each card: activity name/location, MUST/MAYBE/SKIP avatar rows, left stripe = viewer's own rating
- SKIP rows faded; MAYBE members shown as available capacity
- Empty state: opacity-40 card, "Nobody's excited yet"
- Desktop: split-pane (card list + detail panel). Mobile: card list + bottom-sheet modal.
- CrewModal handles both panel (desktop) and full-screen modal (mobile) via `variant` prop

---

## Design Decisions

### Card = quick view. Modal = sub-group planning hub.

Cards must be self-sufficient for small groups. Modal is where you act on what you see:
1. Full picture at large group sizes
2. Sub-group composition at a glance
3. Current: inline rating if unrated
4. Future: schedule for this sub-group, notify them, book for this size, itinerary slot

The modal is the **permanent home for sub-group planning features**. Every new feature that involves a sub-group gets built here first.

### Avatars always stay

Never remove avatars regardless of group size. People need to see *who* is in their crew, not just a count. At large groups, truncate with "+N excited" overflow — never replace with bars alone.

### Adaptive card by group size

- **≤8 members**: Full MUST/MAYBE rating rows on the card. Every member visible without opening anything.
- **>8 members**: Top 5 excited avatars + "+N more" overflow + count pills (e.g. "11 MUST · 8 MAYBE"). Deep dive for full picture.

MAYBE row on cards: show at ≤8, omit at >8 (they're flexible capacity, not the crew — deprioritize at scale).

Threshold (8) is a tunable constant — adjust after seeing real data.

### Left stripe = viewer's own rating

4px left border on each card colored by the viewer's rating: coral (MUST), yellow (MAYBE), gray (unrated/SKIP). Instant personal orientation — viewer knows at a glance whether they're in this crew, flexible, or uncommitted.

### "You: MUST/MAYBE/SKIP/—" chip

Top-right of card. Always visible. Viewer's own avatar gets an accent outline ring in all avatar groups.

### Count pills on cards (large group mode)

Small colored pills: `11 MUST`, `8 MAYBE`. Gives crew size at a glance without a bar.

### Deep dive modal — sub-group view

Contains:
- Activity name + location header
- Visual distribution bar (stacked — color proportions carry the story, no % number)
- Legend with counts: MUST N · MAYBE N · SKIP N · unvoted N
- **"Your crew"** section: avatar + name chips for MUST members — these are the people to plan with
- MAYBE members noted below ("also available")
- Unvoted members noted ("haven't weighed in")
- **Actions section** — the planning hub (see below)

### Actions section in modal

The primary framing is always: **"Here's your crew. What do you want to do with them?"**

There is no "conflict" state. Different crews for different activities is expected and correct. The actions reflect what stage of planning you're at, not whether something is broken.

| Viewer state | Primary action | Secondary actions |
|---|---|---|
| In the crew (MUST) | Plan with your crew | Nudge unvoted members (Soon) |
| MAYBE — flexible | Join this crew? → Rate MUST inline | — |
| Unrated | What's your take? → Rate MUST/MAYBE/SKIP inline | — |
| Small crew (1–2 excited) | Recruit more → Nudge unvoted (Soon) | Rate if unrated |

"Plan with your crew" is the primary CTA for anyone already in the crew. For MVP it opens the itinerary/scheduling surface (Soon tag). The button exists now, the feature ships later.

**"Soon" tags are not placeholders to hide.** They tell the user: this is coming, and this is where it will live. They build trust in the product direction.

### Diverging bar: removed from this view

Shelved — may be useful in another view (e.g. a future "Debate" or tension analysis view). Not appropriate here where the goal is crew formation, not framing opposition.

### Activity Status Labels (Social Energy)

Every card and modal header should feature a high-signal "Social Energy" label. This summarizes the distribution of enthusiasm instantly, solving the cognitive load of interpreting raw numbers.

| Status | Distribution | Meaning |
|---|---|---|
| **Universal Favorite** | High MUST, Low/No MAYBE | Everyone is in. This is a core trip anchor. |
| **Strong Match** | High MUST, Some MAYBE | A clear sub-group exists with flexible capacity. |
| **Split Crowd** | High MUST + High MAYBE/Unrated | Divisive or half the group is indifferent. |
| **Polarizing** | High MUST + High SKIP | People either love it or hate it. Plan as a niche sub-group. |
| **Niche Favorite** | Small but intense MUST cluster | Perfect for a small sub-group breakout. |
| **Safe Consensus** | Mostly MAYBE, few MUST | Nobody is dying to do it, but everyone is okay with it. |

### Distribution bar (Social Energy Bar)

Stacked horizontal bar that lives in the modal only.
- Colors: Coral (MUST), Yellow (MAYBE), Gray (SKIP/unvoted).
- Purpose: Show the *proportions* of enthusiasm. A "Split Crowd" bar looks 50% Coral and 50% Gray/Yellow.
- No percentages needed on the bar itself; the legend handles counts.

### "You Align With..." (Social Stickiness)

Post-MVP, the deep dive modal should surface "Social Similarity":
- "You align 92% with Sam on this activity."
- "You and Nina both have this as a MUST."
This turns a planning tool into a social discovery tool.

### Poll visualization insight

"It's like a poll" — valid framing for the distribution bar in the modal. Borrowed: stacked horizontal bar, approval counts in legend. Not borrowed: diverging bar (removed), percentage headlines (removed — too data-heavy for a formation view).

---

## Prototype Files

All in `apps/web/public/prototypes/`. Open directly in browser or via dev server at `/prototypes/crew-vN.html`.

| File | What it shows |
|---|---|
| `crew-v1.html` | First pass: stripe, you-chip, conflict pill, unrated count, sort bar |
| `crew-v2.html` | Scaling exploration: stacked bar + adaptive avatar truncation + diverging bar (rejected) |
| `crew-v3.html` | Card + modal split introduced. Bar moved to modal. Working click-to-open. |
| `crew-v4.html` | **Current best.** Full rating rows on small-group cards. Four modal states. Options section. Avatar+name chips in modal. ← Start here. |

v4 was the approved direction and is now implemented across `FindYourCrew.tsx`, `CrewCard.tsx`, `CrewModal.tsx`.

---

## Implementation Notes

### Files (current)

- `apps/web/src/components/FindYourCrew.tsx` — card list + desktop split-pane, row computation
- `apps/web/src/components/CrewCard.tsx` — individual activity card (adaptive small/large)
- `apps/web/src/components/CrewModal.tsx` — modal/panel with crew composition + actions; `variant: 'modal' | 'panel'`
- `apps/web/src/components/FindYourCrewOverview.tsx` — overview for the Crew tab
- No changes needed to hooks, store, or services — data model has everything required

### Data available per row

- `mustMembers`, `maybeMembers`, `skipMembers` arrays per activity
- `excitedCount` = mustMembers.length (core crew count)
- `score` = must×3 + maybe×1
- Viewer's own rating via `score?.ratings[currentUserId]`
- Member `arrival_date` / `departure_date` on `Member` type (for future date-aware crew filtering)

### Group size threshold

```ts
const SMALL_GROUP_THRESHOLD = 8  // show full rows; above this, truncate
const MAX_CARD_AVATARS = 5       // max avatars shown on large-group card
```

### Unvoted count

```ts
const unvotedCount = members.length - (mustMembers.length + maybeMembers.length + skipMembers.length)
```

---

## Sub-Group Features — Build Order

MVP (shipped):
- [x] Adaptive cards (small/large group modes)
- [x] Left stripe + you-chip
- [x] Modal with crew composition (MUST/MAYBE/SKIP/unvoted)
- [x] Inline rating from modal when viewer unrated
- [x] "Plan with your crew" button — Soon tag, permanent slot in modal

Post-MVP, in rough order:
- [ ] Schedule for this sub-group — "which days work for everyone in this crew?" (needs date availability data)
- [ ] Notify sub-group — message or push to crew members for this activity
- [ ] Book for this size — ***REMOVED*** link pre-filtered to crew count (***REMOVED***, ***REMOVED***)
- [ ] Sub-group overlap — surface activities where two crews share members (sequence them on the same day)
- [ ] Nudge unvoted — prompt unrated members to weigh in, expands the crew signal
- [ ] Sub-group chat — discuss just this activity with your crew (needs messaging infra)
- [ ] Date voting — crew votes on which day to do the activity
- [ ] Full itinerary slot assignment — drag crew activity onto calendar day

Each of these lives in the modal. The modal's actions section absorbs them one at a time without restructuring anything.
