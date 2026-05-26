# Pulse — UI/UX Audit Round 4

Round focuses on production aftermath of the WANT→MAYBE merge and the new 3-rating model: dead tokens, contrast failures, mobile gaps that survived prior rounds, and a carried-forward skeleton mismatch.
Work 1–3 items at a time. Check off as done.

---

## OPEN FROM ROUND 3

**R3 was prototype-specific** (`overview-v13.html`). Most items were design decisions "before implementing in production." TripTimeline is now the production implementation — checking which R3 items landed correctly:

- VX1 (label vocabulary): TripTimeline uses MUST/MAYBE/SKIP. ✓ Implemented.
- VX2 (OUT label): TripTimeline uses SKIP. ✓ Implemented.
- VS1 (skip tier avatars): TripTimeline uses `MemberAvatar withLabel` for skip members. ✓ Implemented.
- VS2 (undated card opacity): TripTimeline only dims the date text, not the full card. ✓ Implemented.
- VS3 (font sizes ≥ 9px): Production uses `text-[9px]`/`text-[10px]`. ✓ Acceptable.
- PI1 (DM Sans swap): Production already uses DM Sans. ✓ N/A.
- ID2, PI2: Summary bar and unassigned excitement summary — not implemented yet, carry forward below as P2.
- **IX1**: Single-open stop accordion in TripTimeline — R3 recommended multi-open on desktop. Still single-open. Carry forward.

From Round 2, still open:
- [ ] **RN3** — All four native components use `rounded-[var(--radius-*)]` arbitrary CSS vars. Verify NativeWind v4 resolves these correctly at runtime. If not, border radius silently falls back to 0 in the native app. Needs a test render. **[Impact: HIGH if broken, unknown until tested]**

---

## CHECKLIST

### MODEL CLEANUP — dead tokens after WANT→MAYBE merge

- [x] **MC1** — `globals.css` retains `--want-bg`, `--want-text`, `--cell-want` in both themes, and `--color-want`, `--color-want-text`, `--color-cell-want` in `@theme inline`. WANT is removed from the model and no production component reads these. Dead tokens confuse any future reader. Remove all seven. While there: `--accent-2` exists in both themes but is not mapped in `@theme inline` (unlike every other token) and was the same value as `--want-bg`. Confirm it's unused; remove if so. **[Impact: MED — low effort, eliminates false signal that WANT exists]**

### COLOR — contrast failure

- [x] **CC1** — MAYBE rating pill background `--maybe-bg: #FFF0A0` is near-invisible on white cards (`bg-bg-card: #FFFFFF`). Contrast ratio ≈ 1.07:1 — a flat failure. Affects the group ratings section in `ActivityDetailModal` and any chip that uses `bg-maybe`. `--cell-maybe: #FFE566` is already noticeably darker. Align: change `--maybe-bg` to `#FFE566` (modern theme) and `#FFE566` (editorial) to match the cell color and pass contrast. FindYourCrew's rating chips hardcode `bg-[#FFE566]` — consistent after this fix, so update `--maybe-bg` to match rather than the reverse. **[Impact: HIGH — current state is visually broken for MAYBE ratings]**

### MOBILE — touch targets

- [x] **MT1** — All four modal close buttons use `p-1.5` + 16px icon ≈ 25×25px square — same touch target problem as R2/V4 (which fixed activity card edit icons). Fix: change `p-1.5` to `p-2.5` on close buttons in `ActivityDetailModal`, `ActivityFormModal`, `CreateTripModal`, `MemberDatesModal`. Result: ~41px square, acceptable. **[Impact: HIGH — currently untappable on mobile]**

- [x] **MT2** — `ActivityDetailModal` and `ActivityFormModal` and `MemberDatesModal` lack `max-h-[90dvh] overflow-y-auto` on the inner modal div. `CreateTripModal` already has it (correct). On mobile with virtual keyboard raised, these modals will overflow off-screen — form fields hidden, no scroll to reach them. Add `max-h-[90dvh] overflow-y-auto` to all three. **[Impact: HIGH — form fields unreachable on mobile with keyboard open]**

### COMPONENT — semantic color misuse

- [ ] **CG1** — `Button.tsx` ghost variant: `hover:bg-maybe` uses the MAYBE rating semantic color (`#FFF0A0`) as a generic UI hover state. Rating colors should only appear in rating contexts. Ghost hover should be neutral. Change to `hover:bg-bg`. **[Impact: MED]**

### LOADING — skeleton mismatch

- [ ] **LS1** — Default tab on trip page is `"crew"` (`FindYourCrewOverview` — member card grid). Loading skeleton shows 4 activity-style rows with rating chip placeholders. The skeleton previews what `"activities"` looks like, but crew loads first. Fix: change default tab from `"crew"` to `"activities"` so the skeleton matches. If crew-first is intentional product behavior, update the skeleton to show member card placeholders instead. **[Impact: MED — causes visible layout jump on load]**

### ACCESSIBILITY — tab semantics

- [ ] **AC1** — Trip page tab bar uses plain `<button>` elements with no ARIA roles. Assistive tech cannot identify this as a tab interface. Add `role="tablist"` to the container `<div>`, `role="tab"` and `aria-selected={tab === t}` to each button. Two attributes per element. **[Impact: MED]**

### INTERACTION — accordion behavior (from R3/IX1)

- [ ] **IX1** — `TripTimeline` stop accordion is single-open: opening one stop closes all others. On desktop (lg: layout), users comparing "Rome activities vs Amalfi activities" must toggle back and forth. R3 recommended multi-open. Fix: change `openStopId: string | null` to `openStopIds: Set<string>` (same pattern as `openActivityIds` already uses). One stop can stay open while another is opened. **[Impact: MED]**

---

## WHAT'S SOLID — no action needed

**Modal animation system.** `@keyframes` in globals.css, `.modal-overlay` / `.modal-panel` classes applied consistently. Sheet-in on mobile, dialog-in on desktop. Easing is correct (`cubic-bezier(0.32, 0.72, 0, 1)` on sheet). ✓ Done — no further action.

**Toast implementation.** Swipe-to-dismiss with pointer events, 3-toast cap, undo button, `toast-enter` animation. The `color-mix` shadow is the right level of expressive. ✓ Done — no further action.

**MUST and SKIP contrast.** MUST (#FF5C35) on white is legible and distinct. SKIP (#EDECEA bg, #6B6864 text) is neutral and readable. Only MAYBE fails — see CC1.

**FindYourCrew rating chips.** `min-h-[44px]` on the 3 rating buttons in the sticky footer — correct touch target. ✓

**Trip identity card.** `border-t-2 border-t-accent` accent stripe gives the sidebar card visual priority without using a different background. Correct hierarchy signal.

**Invite card design.** Dashed accent border + `bg-accent/5` on the invite button is exactly the right level of expressive — present without dominating. ✓

**Loading skeletons.** Both home page and trip page have structured skeletons that match their respective layouts. Trip page skeleton gets sidebar + content area right. Only the tab mismatch (LS1) undermines it.

**Close button SVG pattern.** All modals use the SVG × icon (not raw text character). Consistent since R2/C3 was applied. ✓

---

## NOTES

### CC1 — Why `#FFE566` not a dimmer yellow

`#FFE566` on `#FFFFFF` has a contrast ratio of ~1.27:1 — still doesn't pass the 3:1 WCAG threshold for UI components against a white background. However, MAYBE pills appear in the ratings section alongside name labels (the text provides the semantic meaning), so the pill background acts more as a highlight zone than a standalone information carrier. Combined with the dark `--maybe-text: #8B7400` label text on top, the overall chip is readable. The background just needs enough presence to be visually distinct from the card surface — `#FFE566` achieves that. Going darker risks clashing with MUST's orange.

If stricter accessibility is required post-MVP: add `border border-maybe/60` to all MAYBE pills as a fallback that works at any yellow.

### LS1 — Default tab decision

The current `useState<Tab>("crew")` starts on Find Your Crew. This is a product intent decision. If "find your crew" is the primary reason users open a trip, keep it as default but fix the skeleton. If "activities" is where users do primary work (rating, adding), switch the default. Either way, skeleton + default must match.

### MC1 — Confirm accent-2 usage before removing

Search codebase for `accent-2` and `var(--accent-2)` before deleting. If it's unused in production (likely, given it was the WANT color), remove. If it's used in a prototype file (CompatibilityMatrix in src/prototypes), that's fine to remove from production CSS.
