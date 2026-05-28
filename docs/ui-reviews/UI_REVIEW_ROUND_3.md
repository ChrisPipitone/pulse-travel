# Pulse — UI/UX Audit Round 3

This round focuses on the `overview-v13.html` prototype — a stop-spine trip overview with per-stop crew tiers and per-activity rating drill-down. Evaluating design decisions before production implementation.

Work 1–3 items at a time. Check off as done.

---

## OPEN FROM ROUND 2

- [ ] **RN3** — All four native components use `rounded-[var(--radius-*)]` arbitrary CSS vars. Verify NativeWind v4 resolves these correctly at runtime. If not, border radius silently falls back to 0 in the native app. Needs a test render. **[Impact: HIGH if broken, unknown until tested]**

---

## CHECKLIST

### VOCABULARY — inconsistent rating labels across the same screen

- [ ] **VX1** — Ratings grid sections say "Can't miss" / "Want to" — the app vocabulary is **MUST / WANT / MAYBE / SKIP**. These are the same concepts with different names on the same screen. Pick one and never deviate. The tier-block already uses "MUST" / "WANT" / "OUT" correctly. Fix the ratings-grid sections to match: `MUST` (not "Can't miss"), `WANT` (not "Want to"), `MAYBE`, `SKIP`. **[Impact: HIGH]**

- [ ] **VX2** — "OUT" in the tier-block (stop-level) means "nobody who SKIP'd this stop's activities". But "OUT" isn't part of the MUST/WANT/MAYBE/SKIP vocabulary — it's a derived state. Label it `SKIP` (singular rating) or rename to make it explicit: `NOT GOING`. The current label is ambiguous — does OUT mean they rated SKIP, or that they're not attending this stop at all (e.g. date gap)? These are different facts. Decide and commit. **[Impact: HIGH]**

### INFORMATION DESIGN — ambiguous data labels

- [ ] **ID1** — The activity badge "5 of 5" / "4 of 5" / "3 of 5" has no label — a first-time user cannot infer what these numbers mean. From the data: X = members who rated MUST or WANT (excited), Y = members attending this stop. This is genuinely useful but only when labeled. Add a small superscript unit or tooltip: "5 excited" or "5 of 5 in". Alternatively compress to just the excited count: "5 excited" as the badge text. **[Impact: HIGH]**

- [ ] **ID2** — Summary bar reads "Sara joins all stops · 3 sub-crews split" — the second stat is opaque. "3 sub-crews split" requires knowing how crews are counted. Replace with concrete scannable stats that anyone can parse: "5 stops · 8 activities · 3 crew splits" where "crew splits" has a defined meaning (activities where the MUST/WANT group differs from the default full-group). Or drop the second stat entirely in MVP — the per-stop tier display already communicates splits. **[Impact: MED]**

### VISUAL — things that are off

- [ ] **VS1** — OUT / skip members in the tier-block render as plain text: `Luca (skip)` or `Marco (skip) · Giulia (maybe)`. MUST and WANT use avatar grids with name labels. Skip members deserve the same treatment — a greyed avatar (neutral bg) + name. Text for OUT is harder to scan when there are 3+ members and inconsistent with the avatar language used for MUST/WANT. **[Impact: MED]**

- [ ] **VS2** — Naples card uses `opacity: .72` on the entire `stop-card` element. This dims the tier data (which is still valid information) along with the chrome. The signal "no dates set" should apply to the node and date field only, not the content. Fix: full opacity on card content, dim only `.sc-dates.nodates` + the stop-node border/fill. The card as a whole shouldn't be faded — that implies the stop itself is unimportant, when it's just undated. **[Impact: MED]**

- [ ] **VS3** — Tier-member name labels are `font-size: 7px` in the prototype. At any real render DPI this is illegible on mobile. Minimum 9px. When implemented in production, use `text-[9px]` or `text-[10px]`. The avatar-name unit is the core information primitive of this view — it must be readable. **[Impact: MED]**

### INTERACTION — behavioral decisions to make before implementing

- [ ] **IX1** — `toggleStop()` closes all other stops before opening the selected one (single-open accordion). On mobile this is fine. On desktop (lg: layout), users may want to compare Rome vs. Amalfi activities simultaneously. Recommendation: allow multi-open. The accordion close behavior is a pattern borrowed from FAQ pages — not the right default for content comparison. If single-open is kept, motivate it explicitly. **[Impact: MED]**

- [ ] **IX2** — Activity ratings panels also enforce single-open via `toggleRatings()`. This is even more restrictive than stop-level single-open — you can only read one activity's ratings at a time. Remove the "close all others" behavior from `toggleRatings`. Let multiple ratings panels be open simultaneously. The panels are compact; multiple open is not visually problematic. **[Impact: MED]**

### PRODUCTION IMPLEMENTATION — notes before porting

- [ ] **PI1** — Prototype uses system sans-serif. Production uses DM Sans (modern) and Playfair Display (editorial) loaded from Google Fonts. The prototype's typographic rhythm will shift when DM Sans is applied — DM Sans is slightly wider. Verify the tier-member name labels and rating pill text still read at size after font swap. **[Impact: LOW — verify at implementation time]**

- [ ] **PI2** — Unassigned activities section shows no rating summary — just the name and "+ Assign stop". To help users decide which stop to assign to, show a compact excitement summary: "MUST: 2 · WANT: 1" or the tier avatars in miniature. Without this, the user has to mentally recall who wanted what for unassigned items. **[Impact: LOW]**

---

## WHAT'S SOLID — no action needed

**Spine journey narrative.** The vertical line + circular node metaphor for a multi-stop trip is correct. It communicates temporal sequence and geographic progression simultaneously without a map. The neutral color choice (✓ on the comparison) is right — orange/teal would bleed into MUST/WANT semantics; dark is too heavy for a travel product.

**Two-tier MUST/WANT stop summary.** The tier-block pattern — avatar grid for MUST, avatar grid for WANT, text note for OUT — with name labels always visible, is exactly aligned with the product's "eyes-only information density" principle. The commitment hierarchy is visible at a glance without clicking.

**Stop accordion → activity accordion.** Two levels of progressive disclosure, both opt-in. You see stop-level crew at a glance; expand to see activities; expand activity to see individual ratings. Each level adds granularity without forcing it. This is the right structure.

**Ratings grid (2-col, sectioned).** The 2-column layout with tier section headers (Can't miss / Want to / etc.) is dense and readable. Each entry is [avatar][name][pill] — complete data in one row. The section grouping means you can scan "who's excited" without reading every row. ✓ Good — fix labels per VX1 but don't change the layout.

**Unassigned section with dashed border.** Dashed border correctly signals "incomplete / needs action." The "+ Assign stop" button in context (on each unassigned item) is the right placement. No separate settings page needed.

**Naples "no dates" state.** `.nodates` with subtle color on the date field and the dimmed stop-node correctly communicates "this stop is real but undated." The state is explicit, not just an absence. Fix VS2 to limit the dimming scope but keep the concept.

**Fixed summary bar.** Sticky bottom bar is the right mobile pattern for a primary CTA ("Build itinerary →"). The stats + CTA layout is clean. Fix ID2 for stat clarity but keep the bar.

**ESC closes expanded ratings.** Correct keyboard UX. ✓

---

## NOTES

### VX2 — "OUT" vs. "SKIP" vs. "not attending this stop"

There's a semantic distinction worth deciding:
- **"Skipped all activities at this stop"** → derived from ratings, means the person rated SKIP on every activity at this stop
- **"Not attending this stop"** → derived from dates, means the person's arrival/departure doesn't include this stop's dates

These are different facts. "Luca (skip)" = active choice. "Giulia (unavailable)" = date gap. Both might show in the third tier of the stop header, but they mean different things. In MVP: if date-gap detection isn't implemented yet, use `SKIP` as the label and make clear it's a rating signal, not a schedule signal.

### ID1 — "X of Y" badge options

Three options, pick one:
- **"5 excited"** — explicit, self-documenting, no ambiguity about Y
- **"5 / 5"** with a label in the section header ("Excited") — scannable across rows
- Keep "5 of 5" but add a subtle section header: "Excitement" above the column — works if this is always in context

Simplest: change badge text to `"{n} excited"`. Scales to partial groups (e.g. "3 excited" is clear even without knowing the denominator).

### VS1 — Skip tier avatar treatment

Use the same `.tier-member` structure as MUST/WANT but with neutral avatar bg (`bg-text-subtle/30`) and name at reduced opacity (`opacity-60`). This visually communicates "present but not going" — part of the group, opted out of this stop.
