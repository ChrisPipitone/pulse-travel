---
tier: decision
status: proposed
note: formerly canonical.md — unaccepted IA proposal, not current truth
updated: 2026-06-04
---

Pulse — Canonical Information Architecture

1. Core Product Structure — The Three Questions

The entire product collapses to three questions a group must answer to feel coordinated. Every feature and concept maps to exactly one — plus a
cross-cutting aggregate layer.

┌──────────────┬───────────────────────────┬─────────────────────────────────────────────────────────────────────────────────┬───────────────┐
│ Pillar │ The question │ Domain concepts it owns │ Confidence │
│ │ │ │ role │
├──────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼───────────────┤
│ │ │ Activity, Rating (MUST/MAYBE/SKIP), consensus labels (Universal Favorite, Split │ │
│ Agreement │ What do we agree on? │ Crowd, Safe Consensus, No Signal), going/maybe counts, sort modes, personal │ Building │
│ │ │ rating progress │ │
├──────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼───────────────┤
│ People & │ Who's in, and when are │ Member, Profile, Member dates, Peak Overlap / Best Window, Schedules, │ │
│ Presence │ they here? │ Compatibility / Travel Twin, engagement (joined-but-0%-rated), Invite Code / │ Validation │
│ │ │ Share │ │
├──────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼───────────────┤
│ Plan │ What's the final plan? │ Stop, Timeline, Activity→Stop assignment, sequence, geographic/temporal flow │ Execution │
├──────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼───────────────┤
│ Pulse │ Does this plan represent │ │ Synthesis / │
│ (overlay) │ the group? Where do I │ Aggregate of all three: the social shape, coverage gaps, the decision queue │ triage │
│ │ act? │ │ │
└──────────────┴───────────────────────────┴─────────────────────────────────────────────────────────────────────────────────┴───────────────┘

The decisive move: "who is in" and "when are they present" are the same question. The current IA splits them (Crew tab vs Schedules sidebar).
They are two facets of one truth — the human reality of the group — and belong in one pillar.

---

2. Canonical Navigation Model

Principle: Navigation labels are user questions, not database entities. An entity name is permitted only where it is also the user's own word
(e.g., "Activity" = "things to do" — justified; "Stop" = storage bucket — not justified, nav label becomes "Plan").

Primary structure (two tiers):

- Tier 1 — Cross-trip (global): Home is the cross-trip Pulse — aggregate status across all trips. This already exists and is correct.
- Tier 2 — Within a trip: a Trip Pulse landing + three pillar destinations.

Top-level vs nested:

┌─────────────────────────────────┬────────────────────────────────────────────────────────────────┬─────────────────────────────────────────┐
│ Level │ Surfaces │ Justification │
├─────────────────────────────────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┤
│ First-class (destinations) │ Trip Pulse, Agreement, People & Presence, Plan │ The four things a user navigates │
│ │ │ between │
├─────────────────────────────────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┤
│ Nested (within a pillar) │ Compatibility & Overlap (both inside Presence); per-activity │ Facets of one question, not separate │
│ │ consensus (inside Agreement) │ questions │
├─────────────────────────────────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┤
│ Modal (capture/CRUD, never a │ Set Display Name, My Dates, Add/Edit Activity, Add/Edit Stop, │ Inputs and edits — they interrupt, they │
│ destination) │ Invite/Share │ don't relocate │
└─────────────────────────────────┴────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┘

Four trip-level surfaces (Pulse + 3 pillars) still honors the hard 60-second non-technical-onboarding constraint. The surface area stays tiny;
it's just renamed from entities to questions and one fragmented pillar is unified.

---

3. The Pulse Layer

What it is: the trip-level aggregate surface — the single-trip analog of Home. Where Home answers "which of my trips need me," the Trip Pulse
answers "where does this trip stand, and where do I act."

What it aggregates:

- Social shape: counts of Universal Favorites, Split Crowds, No-Signal items — the group rendered as patterns, not 14 individuals.
- Coverage: % of group rated, who is missing (joined-but-0%), the Peak Overlap window summary.
- Decision queue: what's locked (consensus), what's contested (splits awaiting a call), what's dead (no signal to cut).

What decisions it enables: the Decision Making stage — currently homeless. Today the Lead prunes from a raw rating list with no synthesis
surface. The Pulse is where "what do we cut / how do I handle the split crowd" becomes an actual place instead of a mental act.

Questions it answers:

- (Lead) "Does this plan represent the group? What's still unresolved?"
- (Member) "Where am I behind, and is my MUST safe?"

Why it is necessary: The product's stated emotional climax — "Italy isn't 14 individuals; it's a group that loves the Vatican but is split on
hiking" — has no screen. The thesis names a gestalt the IA never renders. Home already proves the pattern works at the cross-trip level; the trip
level is missing its twin. The Confidence Model's entire "Validation → Decision" bridge has no surface.

Honest counter (why it might not be): for a 2-person weekend the shape is trivial and the Pulse collapses to noise. Resolution: the Pulse scales
with group size — near-empty for tiny trips, essential for a 14-person trip. It is canonical but adaptive, not always-heavy.

---

4. Screen Consolidation

┌───────────┬──────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┐
│ Action │ Screens │ Rationale │
├───────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ MERGE │ Crew tab + Schedules/Best Window sidebar → People & │ Both answer "who's real and when." Unifies the product's two │
│ │ Presence │ fragmented social truths into one pillar. │
├───────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ SPLIT │ Activities tab → rating act stays in Agreement; │ The tab currently does double duty (act + synthesis). Synthesis is │
│ │ aggregate consensus lifts out into the Pulse │ a trip-level question, not a per-activity one. │
├───────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ ELEVATE │ Peak Overlap / Availability: sidebar widget → │ A co-primary goal currently sized as ambient reference. │
│ │ first-class facet of Presence │ │
├───────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ ELEVATE │ New Trip Pulse to primary/landing │ Gives the Decision stage and the "social shape" a home. │
├───────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ CO-LOCATE │ My Dates capture (modal) with its payoff (Overlap, │ Today capture and reward are divorced. Keep capture a modal; │
│ │ inside Presence) │ surface the result in Presence, not a detached sidebar. │
├───────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ KEEP │ Set Display Name, My Dates, Activity CRUD, Stop CRUD, │ Quick inputs/edits — correctly transient. │
│ MODAL │ Invite │ │
└───────────┴──────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────┘

No screen is deleted. The change is regrouping by question, not adding mass.

---

5. Mental Model Alignment

Current model (what the nav forces): the user thinks in entities — Activity (Rate), Compatibility (Crew), Stop (Timeline). The table of contents
is the database, lightly reordered into a funnel.

Ideal model: the user thinks in questions and a gestalt — What do we agree on? · Who's in and when? · What's the plan? — over the shape of the
group.

Where the system forces data-structure thinking:

- "Stop" — exposes the storage bucket; user concept is leg/place/day.
- "Crew" — overloaded across two locations (activity attendance vs compatibility); neither is the full answer.
- "Schedules" sitting apart from people — splits one human question ("who & when") into two nav concepts.

Where the system already matches user intent (keep, don't touch):

- Home progress triage — "which trip needs me" is a literal user question, answered directly.
- Activities-first default — fuel-first is correct; no data, no product.
- Consensus labels — the one place the product already translates raw ratings into social meaning ("Universal Favorite," "Split Crowd"). This is
  the model done right, and it's exactly the language the Pulse layer should be built from.

---

6. Final Proposed Architecture

Navigation tree

/login Gate
/ Home = Cross-trip Pulse
/join Join

/trip/[id] Trip Pulse (landing / spine)
├── Agreement "What do we agree on?"
├── People & Presence "Who's in, and when?"
│ ├─ (facet) Compatibility / Travel Twin
│ └─ (facet) Presence / Peak Overlap
└── Plan "What's the final plan?"

Modals (capture & CRUD — not destinations)
Set Display Name · My Dates · Add/Edit Activity
Add/Edit Stop · Invite / Share

Screen list

┌────────────────────────┬───────────────┬──────────────────────────────────────────────────┬────────────────────────────────────────────────┐
│ Screen │ Tier │ Purpose │ Question it answers │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Login │ Global │ Authenticate │ "How do I get in?" │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Home (Cross-trip │ Global │ Triage across all trips │ "Which of my trips need me?" │
│ Pulse) │ │ │ │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Join │ Global │ Convert invite → membership │ "Is this my group's trip?" │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Trip Pulse │ Trip / │ Aggregate shape + decision queue │ "Where does this trip stand, and where do I │
│ │ landing │ │ act?" │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Agreement │ Trip pillar │ Rate activities; see per-item consensus │ "What do we agree on?" │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ People & Presence │ Trip pillar │ Who's in, engagement, compatibility, overlap │ "Who's in, and when are they here?" │
│ │ │ window │ │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Plan │ Trip pillar │ Sequence agreed activities into the trip's flow │ "What's the final plan?" │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ My Dates │ Modal │ Capture personal availability │ "When will I be there?" │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Add/Edit Activity │ Modal │ Propose / edit a thing to do │ — (input) │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Add/Edit Stop │ Modal │ Define a leg of the trip │ — (input) │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Invite / Share │ Modal │ Acquire members │ — (action) │
├────────────────────────┼───────────────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Set Display Name │ Modal │ Establish identity │ "How do I appear?" │
└────────────────────────┴───────────────┴──────────────────────────────────────────────────┴────────────────────────────────────────────────┘

The one-line summary of the change

The current IA is a table of contents of the schema (Activity / Compatibility / Stop). The canonical IA is a table of contents of the journey
(Agree / Who & When / Plan), spined by a Pulse that renders the group as a shape — the thing the thesis promises and the product currently never
shows.
