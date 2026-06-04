Pulse — Product Alignment Review

1. Thesis ↔ Architecture Alignment

Thesis: "Help groups reach social coordination confidence" — answering two co-primary questions: who wants to do what? and when is everyone
actually there?

Verdict: The architecture is ~70% aligned, with one structural undersell and one missing place.

The nav is organized around the domain nouns — Activity (Rate), Compatibility (Crew), Stop (Timeline) — arranged as a workflow funnel. That
funnel happens to track the Lead's journey, so it reads aligned. But the product names two co-primary goals and the IA only gives one of them
first-class status:

┌─────────────────────────────────────────┬──────────────────────────────────────────┬──────────────────────────────────────────────┐
│ Primary goal │ Nav status │ Mismatch │
├─────────────────────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Alignment ("who wants what") │ Default tab + the engine │ Correctly central │
├─────────────────────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Availability ("when is everyone there") │ Sidebar widget (Schedules + Best Window) │ Co-primary goal demoted to ambient reference │
├─────────────────────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Itinerary │ Top-level tab (Timeline) │ Reasonable — it's downstream │
└─────────────────────────────────────────┴──────────────────────────────────────────┴──────────────────────────────────────────────┘

"Peak Overlap" is listed as a key product moment and a top confidence driver ("theoretical trip → physical reality"), yet it has no navigable
destination. It's a callout box inside a sidebar. The IA contradicts the journey doc on the relative weight of availability.

---

2. Navigation Analysis (per screen)

┌───────────────────────────────┬───────────────────────────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────┐
│ Screen │ Question it answers │ Central to thesis? │ Prominence correct? │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Login │ "How do I get in?" │ No (gate) │ ✅ Minimal, as it should be │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Home │ "Where do I owe attention?" │ Yes — the triage/nag │ ✅ Correctly elevated │
│ │ │ engine │ │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Join │ "Is this my group's trip?" │ Yes — acquisition │ ✅ Path-appropriate │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Activities (Rate) │ "What does the group want?" + secretly "who's going │ Yes — the core engine │ ✅ Default, correct │
│ │ to this?" │ │ │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Crew │ "Who am I like?" (compatibility) │ Yes │ ⚠️ Overlaps Activities' social signal; concept │
│ │ │ │ is split │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Timeline │ "What follows what?" │ Partial — downstream │ ✅ but leaks "Stop" │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Member Dates (modal) │ "When am I there?" │ Yes — feeds co-primary │ ❌ Buried in a modal, divorced from its payoff │
│ │ │ goal │ │
├───────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────┤
│ Schedules / Best Window │ "When is the core group present?" │ Yes — co-primary │ ❌ Reference real-estate for a primary answer │
│ (sidebar) │ │ │ │
└───────────────────────────────┴───────────────────────────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────┘

│ Activities (Rate) │ "What does the group want?" + secretly │ Yes — the core engine │ ✅ Default, correct │
│ │ "who's going to this?" │ │ │
├──────────────────────────┼─────────────────────────────────────────────┼───────────────────────┼──────────────────────────────────────────┤
│ Crew │ "Who am I like?" (compatibility) │ Yes │ ⚠️ Overlaps Activities' social signal; │
│ │ │ │ concept is split │
├──────────────────────────┼─────────────────────────────────────────────┼───────────────────────┼──────────────────────────────────────────┤
│ Timeline │ "What follows what?" │ Partial — downstream │ ✅ but leaks "Stop" │
├──────────────────────────┼─────────────────────────────────────────────┼───────────────────────┼──────────────────────────────────────────┤
│ Member Dates (modal) │ "When am I there?" │ Yes — feeds │ ❌ Buried in a modal, divorced from its │
│ │ │ co-primary goal │ payoff │
├──────────────────────────┼─────────────────────────────────────────────┼───────────────────────┼──────────────────────────────────────────┤
│ Schedules / Best Window │ "When is the core group present?" │ Yes — co-primary │ ❌ Reference real-estate for a primary │
│ (sidebar) │ │ │ answer │
└──────────────────────────┴─────────────────────────────────────────────┴───────────────────────┴──────────────────────────────────────────┘

Two findings fall out immediately:

- The default tab is right (rating is the only fuel; nothing downstream works without data density).
- Availability is structurally underweighted — both its capture (dates modal) and its payoff (best window) live off to the side.

---

3. Information Architecture Analysis

Missing conceptual grouping — "the Pulse" itself.
The product's emotional climax is the gestalt: "Italy isn't 14 individuals; it's a group that loves the Vatican but is split on hiking." No
screen renders that aggregate. The group's shape is only inferrable by scanning per-activity labels and per-pair compatibility. The thesis names
a collective signal the IA never gives a home. The Lead's "Decision Making" stage (prune the plan, handle split crowds) has no decision surface —
they prune from the raw rating list. This is the single biggest IA gap.

Overloaded concept — "Crew."
The social truth is split across two locations:

- Activities tab → "who's going to this activity" (avatar rows, going/maybe, consensus labels)
- Crew tab → "who am I like" (Travel Twin, compatibility)

Both answer "crew" questions; the user can't resolve "who's actually in and engaged" in one place. The word "Crew" is doing two jobs.

Misnamed / inconsistent navigation grammar.
Tab labels mix grammatical categories: "Rate" (action verb) / "Find Your Crew" (discovery verb-phrase) / "Timeline" (artifact noun). Inconsistent
grammar is a tell that the nav grew from the schema, not from a journey. A coherent journey reads in one voice.

Implementation-detail leakage — "Stop."
"Stop" is a data-model bucket. The user's concept is a leg / day / place ("Rome → Tuscany"). Exposing "Stop" as a navigable noun makes the user
learn the storage abstraction. Mild, but it's the data model surfacing through the UI.

Data-model-vs-mental-model summary:

- Mental model: Align → see the shape → confirm who & when → sequence.
- Current nav: Rate (Activity) → Crew (Compatibility) → Timeline (Stop).
- The nav is a table-of-contents of the database, lightly reordered into a funnel. It works, but it asks the user to think in entities.

---

4. Confidence Journey Mapping

┌──────────────────────────────────────────┬──────────────────────────────────────────────────────────────┐
│ Confidence role │ Screens │
├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Building (accrue data/signal) │ Activities (rating), Member Dates capture, Join (commitment) │
├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Validation (confirm the signal is safe) │ Activities consensus labels, Crew / Travel Twin, Best Window │
├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Execution (turn signal into a real plan) │ Timeline / Stops │
├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Administrative (enable, don't build) │ Login, Share/Invite, Home-as-triage │
└──────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘

Note the imbalance: Building and Validation are richly served; the Lead's Decision act — the bridge between Validation and Execution — has no
screen. Confidence is built and validated, then the user drops straight into itinerary construction with no place to actually make the cut.
That's where the missing "Pulse/Overview" belongs.

---

5. Recommendations (IA only)

1. Promote Availability to a first-class concept, co-equal with Alignment. "When is everyone there" deserves a navigable destination, not a
   sidebar callout — and its capture (dates) should sit with its payoff (overlap), not in a detached modal.
1. Disambiguate "Crew." Either unify all social truth under one People concept, or explicitly split activity attendance (stays on Rate) from
   compatibility and stop labeling both "crew."
1. Introduce a trip-level "Pulse / Overview" — the aggregate shape: universal favorites, split crowds, no-signal items, missing raters, overlap
   window. This is the decision surface the journey requires and the product currently lacks.
1. Re-label tabs as user questions in one consistent voice — move from data nouns ("Rate / Crew / Timeline") to journey questions ("What we'll do
   / Who's in / When & where"). The sub-labels already attempt this; the primary labels should commit to it.
1. Reconsider "Stop" as a user-facing noun — present as legs/days/places.

---

6. Defense vs. Argument

Defense of the current architecture:
The three tabs map cleanly to a learnable temporal funnel — what → who-with → when — which mirrors the Lead's real decision order.
Rating-as-default is strictly correct: progress is the only early metric that matters, and the engine is front-and-center. Reference data
(schedules, stops, share) sits ambiently in the sidebar without stealing the action column. Home's progress bars correctly elevate the
retention/nag mechanic. Critically, the surface area is tiny — 3 tabs + home — which directly honors the hard constraint: non-technical family
onboarding in under 60 seconds. Every concept you add is cognitive load on the least-technical user. The current IA is defensible precisely
because it is minimal and funnel-shaped.

Argument against:
The IA is organized around database entities lightly disguised as a workflow. It serves Alignment with a tab and the default slot, but demotes
Availability — a co-primary goal — to a sidebar widget, undersized for its stated confidence value. It fragments the "crew" concept across two
tabs so no single place answers "who's actually in and engaged." Most damningly, the product's emotional payload — the group's collective shape,
"the Pulse" — has no screen. It's an inference, not a destination. The nav's inconsistent grammar (verb / verb-phrase / noun) confirms the
structure was derived from the schema rather than the journey. The user is asked to think in Activities, Compatibility, and Stops; the user
actually thinks in alignment, presence, and plan.

---

Conclusion

If building this product from scratch today, I would organize the experience around **\_\_** the three questions a group must answer to feel
coordinated — "What are we agreed on?", "Who's in and when?", and "What's the plan?" — with a trip-level Pulse view as the home of the collective
signal, rather than around the data entities (Activity, Compatibility, Stop) the current tabs expose.
