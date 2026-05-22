# Pulse — UI/UX Audit Round 2

Focus: styling appeal, quality-of-life animations, visual consistency.
Work 1–3 items at a time. Check off as done.

---

## CHECKLIST

### ANIMATIONS — motion that earns its keep

- [ ] **AN1** — Modal enter/exit: slide-up on mobile (translate-y: 100% → 0), fade+scale on desktop (scale-95 opacity-0 → scale-100 opacity-100). 200ms ease-out. Apply to all 4 modals. Biggest single UX improvement on this list.
- [ ] **AN2** — Toast slide-in/out: slide up from below + fade on enter; fade + slide down on exit. CSS @keyframes in globals.css, ~200ms. Currently toasts just pop — jarring.
- [ ] **AN3** — Score bars animated width on mount: width transitions from 0 → actual% over 500ms, staggered by row index (50ms delay each). Classic "data reveals" effect, reads as alive.
- [ ] **AN4** — Matrix view switch fade: 150ms opacity crossfade when switching between the 5 views. Content change is currently instant and abrupt.
- [ ] **AN5** — Rating chip tap feedback: brief `scale-95 → scale-100` on click (active state). Adds tactile feel to rating action.
- [ ] **AN6** — "Copy link" → "Copied!" transition: fade-swap the label text rather than instant replace. 150ms. Small but noticeable.
- [ ] **AN7** — Tab switch fade: 150ms opacity transition when switching Activities ↔ Matrix tab. Avoids jarring layout jump.

### STYLING — visual appeal and hierarchy

- [ ] **S1** — Activity card left accent stripe: `border-l-[3px]` in your own rating color (must=orange, want=teal, meh=yellow, unrated=transparent). Instant at-a-glance self-context, no hover required. High impact.
- [ ] **S2** — Edit/delete icons on activity cards: hide by default (`opacity-0`), show on group-hover (`group-hover:opacity-100`). Desktop only — touch needs them visible. Removes clutter from long lists.
- [ ] **S3** — Avatar color consistency: sidebar schedule avatars and activity list member chips are all gray. Matrix uses per-member PALETTE colors — bring those same colors to every avatar in the app (schedule list, rating chips in activity rows).
- [ ] **S4** — Sidebar card visual hierarchy: trip identity card should feel like the parent of the other two. Give it slightly heavier treatment: `bg-gradient-to-br from-bg-card to-bg` or a slightly deeper border. Schedule and invite cards feel visually equal right now.
- [ ] **S5** — "Rate" ghost badge: change from `border-dashed border-border text-text-subtle` → `bg-accent/8 border border-accent/20 text-accent` — subtle orange tint makes it feel like an invitation, not a placeholder.
- [ ] **S6** — Twin grid heatmap color range: low compat scores (0–30%) are barely distinguishable from mid (40–60%). The heatmap needs a wider perceived range — try interpolating from `bg-cell-empty` (light gray) → `bg-want` (teal) → `bg-must` (orange) at 100% instead of just lightening one color.
- [ ] **S7** — Score bar height: `h-1.5` is barely visible at small sizes. Bump to `h-2` and add a numeric label (`3 pts`) next to bar — wait, I2/I5 in round 1 already did the pts label. Just do the height bump.
- [ ] **S8** — Trip card "Owner" badge: currently `bg-border text-text-subtle` (gray pill). Change to `bg-accent/10 text-accent` — makes ownership visible at a glance, matches accent system.
- [ ] **S9** — Invite code display: add `tracking-widest` and `uppercase` to the `<code>` element. Short random codes are more scannable with wider letter spacing.
- [ ] **S10** — AppNav height + logo: nav is `h-16`. On mobile this eats screen real estate. At sm: and below, compress to `h-12`. Also add `hover:scale-105 transition-transform` to just the logo icon (not text) — subtle logo delight.
- [ ] **S11** — Activity card hover: `hover:border-border/60` makes border *lighter* on hover — counterintuitive. Change to `hover:border-accent/25 hover:shadow-sm` so hover reads as activation, not fade.
- [ ] **S12** — Empty state icons: trip page empty state uses "No activities yet" text with no icon. Home page "No trips yet" uses ✈️ emoji. Standardize to consistent SVG illustrations, no emojis in empty states.

### CONSISTENCY — things that don't match across views

- [ ] **C1** — Member avatar color: same person appears as PALETTE color in matrix, gray dot in activity chips, gray circle in sidebar schedule. One canonical helper (`memberColor(id, colorMap)`) should drive all three locations.
- [ ] **C2** — Border radius: activity cards use `rounded-[var(--radius-card)]`, modal inner div uses hardcoded `rounded-t-2xl sm:rounded-2xl` in ActivityFormModal. Audit: all card-shaped divs should use `var(--radius-card)`, all modals consistent.
- [ ] **C3** — Loading states: trip page shows plain "Loading…" text center-screen. Home page shows skeleton cards. Trip page should show a skeleton layout matching the 2-col sidebar+main structure — dramatically reduces perceived load time.

### UX — interaction quality

- [ ] **UX1** — Activity card actions (edit/delete) stop propagation correctly but the click target on the card row is the whole row. On mobile, the action buttons are very small (p-1.5 icons). Increase touch target to `p-2.5` on mobile.
- [ ] **UX2** — Schedules card: when no member has set dates, every row shows "Full trip" — the card looks like a placeholder. Add a small contextual note: "Set your dates to help the group plan around you." with a `→ Edit` link.
- [ ] **UX3** — Stacked toasts: currently unlimited stack. Cap at 3; when a 4th arrives, dismiss the oldest silently. Multiple undo toasts stacking is visually noisy.

---

## NOTES

### AN1 — Modal animation pattern

Tailwind approach (no extra library):
- Outer overlay: `animate-in fade-in` (Tailwind v4 has `@keyframes` utilities)
- Mobile sheet inner div: `animate-in slide-in-from-bottom`
- Desktop inner div: `animate-in fade-in zoom-in-95`
- Duration: `duration-200 ease-out`

If Tailwind's built-in animate utilities aren't available in v4 without a plugin, use CSS `@keyframes` in globals.css directly.

### AN3 — Score bar animation

Use inline `style={{ transitionDelay: \`${i * 50}ms\` }}` on the bar fill div, with `transition-[width] duration-500`. Mount state: start `w-0`, set actual width after first paint via `useState(false)` + `useEffect`.

### S1 — Left accent stripe

Apply to the outer activity card div:
```
border-l-[3px] border-l-transparent
myRating === 'MUST' → border-l-must
myRating === 'WANT' → border-l-want
myRating === 'MEH'  → border-l-meh
```
Needs `--color-must/want/meh` mapped to `border-l-*` via `@theme inline` (already mapped).

### S3 / C1 — Avatar color consistency

CompatibilityMatrix builds a `colorMap: Map<userId, paletteIndex>` from member array position. This same logic needs to run wherever member avatars appear. Recommend extracting `buildColorMap(members: Member[])` to a shared utility in `packages/hooks` (or a local helper) and passing `colorMap` as a prop or reading from the store.

---

## FUTURE / POST-ROUND

- Dark mode toggle in AppNav (CSS vars already support it)
- Micro-interaction: activity card rows animate in on first load (staggered fade-up, 30ms delay each)
- Confetti burst when all members have rated an activity
- Pull-to-refresh on mobile (PWA)
