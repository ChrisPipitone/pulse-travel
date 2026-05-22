# Pulse — UI/UX Audit Round 2

Round 1 is fully complete. This round focuses on motion (two high-impact animations), visual consistency gaps, and a handful of styling items that are genuinely worth doing — the rest from the 1.5 draft got cut.
Work 1–3 items at a time. Check off as done.

---

## OPEN FROM ROUND 1
None — all Round 1 items are done.

---

## CHECKLIST

### ANIMATION — two that earn their keep

- [x] **AN1** — Modal enter/exit animation. All 4 modals snap in with no transition — the most jarring moment in the app. Mobile: slide up from bottom (`translate-y-full` → `translate-y-0`). Desktop: fade + slight scale (`scale-95 opacity-0` → `scale-100 opacity-1`). 200ms ease-out. CSS `@keyframes` in globals.css, no library. **[Impact: HIGH]**

- [x] **AN2** — Toast enter/exit animation. Toasts currently pop in and out instantly. A slide-up from below on enter + fade-down on exit (~180ms) turns a functional system into a polished one. `@keyframes toast-in` / `toast-out` in globals.css. **[Impact: HIGH]**

- [x] **AN3** — Score bar animated width on mount. Width transitions 0 → actual% over 400ms, staggered by row index (40ms delay each). Communicates "data loaded" in a way that feels alive without being decorative — the motion explains the data. Use `useState(false)` + `useEffect` to trigger after paint. **[Impact: MED]**

### VISUAL — things that are clearly off

- [x] **V1** — Activity card hover border direction is wrong. `hover:border-border/60` makes the border *lighter* — hover should signal activation, not fade. Change to `hover:border-accent/20 hover:shadow-sm`. One line. **[Impact: MED]**

- [x] **V2** — "Rate" ghost badge needs more presence. `border-dashed border-border text-text-subtle` is so faint it defeats the nudge purpose. Change to `bg-accent/8 border border-accent/20 text-accent`. Still understated, but actually readable. **[Impact: MED]**

- [x] **V3** — "Owner" badge on trip cards is invisible. `bg-border text-text-subtle` means it blends into the card. `bg-accent/10 text-accent` makes ownership scannable at a glance — consistent with how accent communicates "this is yours." **[Impact: MED]**

- [x] **V4** — Edit/delete icons on activity cards: desktop clutter + mobile touch target problem. Two fixes in one: (1) hide on desktop until hover (`sm:opacity-0 sm:group-hover:opacity-100`), keep always visible below `sm`. (2) Touch targets are `p-1.5` + 13px icon ≈ 25px square — below the 44px Apple HIG minimum. Change to `p-2.5 sm:p-1.5` so mobile gets a usable target while desktop stays compact. Both fixes go on the same buttons. **[Impact: MED]**

- [x] **V5** — Trip identity sidebar card has equal visual weight to Schedules and Invite cards. It's the most important card on the page — trip name, destination, dates. Give it more presence: remove the border, use a slightly different background (`bg-bg` instead of `bg-bg-card`), or at minimum increase the trip name to `text-xl`. The three-card sidebar currently reads as three equals. **[Impact: MED]**

### CONSISTENCY — things that don't match

- [ ] **C1** — Modal inner container radius is hardcoded in ActivityDetailModal and ActivityFormModal (`rounded-t-2xl sm:rounded-2xl`) but uses `var(--radius-card)` correctly in CreateTripModal and MemberDatesModal. In the editorial theme (8px radius) the hardcoded modals will look wrong. Fix: replace with `rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)]` in both. **[Impact: MED]**

- [ ] **C2** — Member avatar color is inconsistent. The matrix uses a per-member PALETTE (10 distinct colors). Sidebar schedule and activity row chips use gray for everyone. Same person should have the same color everywhere. Extract `buildColorMap(members: Member[])` from CompatibilityMatrix into a shared util (or the Zustand store) and use it in both places. **[Impact: MED]**

- [ ] **C3** — Close button pattern is inconsistent. ActivityDetailModal uses an SVG icon (good — precise, controllable). CreateTripModal and MemberDatesModal use a raw `×` text character. Standardize all to the SVG pattern. Three lines each. **[Impact: LOW]**

### LOADING — the one gap that matters

- [x] **L1** — Trip page loading state is a centered "Loading…" text. Home page has skeleton cards. The trip page loading state should be a skeleton matching its actual layout: a narrow sidebar placeholder (3 stacked card outlines) + a wide main area placeholder (a few activity row outlines). Dramatically reduces perceived load time and prevents layout jump. **[Impact: HIGH]**

### ACCESSIBILITY — new gap

- [ ] **AC1** — Edit and delete icon buttons on activity cards use `title="Edit"` / `title="Delete"` (tooltip only). Screen readers get nothing. Change to `aria-label="Edit activity"` / `aria-label="Delete activity"`. Two attributes, two minutes. **[Impact: MED]**

### REACT NATIVE — component drift since Round 1

The `.native.tsx` files in `packages/ui/src/` have not been updated since Round 1 web changes. Two real issues, one tracking note:

- [ ] **RN1** — `Input.native.tsx` line 16: `placeholderTextColor="var(--text-subtle)"` is a bug. CSS custom properties are not valid React Native color values — this prop is silently ignored, placeholder text will use the system default color instead of the theme value. Fix: pass a hardcoded fallback for now (`#A8A49A` modern / `#A89178` editorial) or resolve via a theme context. **[Impact: MED — silent visual bug when RN app ships]**

- [ ] **RN2** — `Button.native.tsx`: web Button now uses `rounded-lg` for `outline`/`ghost` variants (fixed, theme-agnostic) while primary uses `rounded-[var(--radius-btn)]`. Native still uses `rounded-[var(--radius-btn)]` for all three variants. Sync the radius split to match web intent. **[Impact: LOW — visual inconsistency when themes diverge]**

- [ ] **RN3** — All four native components use `rounded-[var(--radius-*)]` arbitrary CSS vars. Verify NativeWind v4 resolves these correctly at runtime. If not, the border radius will silently fall back to 0 in the native app. Needs a test render. **[Impact: HIGH if broken, unknown until tested]**

---

## WHAT'S SOLID — no action needed

**Token color system.** The two-theme CSS var setup is clean and well-structured. `@theme inline` mapping is correct. Nothing to change.

**Toast design.** The accent-tinted `bg-accent/10 border-accent/30` treatment is tasteful and theme-aware. The undo button placement and behavior is exactly right. Leave it alone.

**Modal backdrop.** `bg-black/40 backdrop-blur-sm` is the correct amount of blur — present but not theatrical. ✓ Done — no further action.

**Focus ring system.** `focus-visible:ring-2 focus-visible:ring-accent/50` on buttons and inputs is correct and complete. ✓ Done — no further action.

**Rating chip active state.** `ring-2 ring-offset-2` with rating-color ring is clear and unambiguous. The `justRated` → `✓` → auto-close flow is good UX. ✓ Done — no further action.

**AppNav.** Clean, appropriately minimal. The Pulse logo mark is good. The back-to-trips pattern on trip pages works. Height is fine at h-16 — compressing it would save ~8px and break nothing, but it's not worth the complexity.

**Scroll behavior.** `scrollbar-hide` on matrix overflow areas and `overflow-x-clip` on page mains are correct. ✓ Done — no further action.

**Button radius.** Primary pill, outline/ghost rounded-lg — the hierarchy reads correctly. ✓ Done — no further action.

---

## NOTES

### AN1 — Modal animation implementation

Avoid Tailwind animate utilities here — Tailwind v4's built-ins may need plugin config. Use raw `@keyframes` in globals.css:

```css
@keyframes modal-overlay-in {
  from { opacity: 0 }
  to   { opacity: 1 }
}
@keyframes modal-sheet-in {
  from { transform: translateY(100%) }
  to   { transform: translateY(0) }
}
@keyframes modal-dialog-in {
  from { opacity: 0; transform: scale(0.96) }
  to   { opacity: 1; transform: scale(1) }
}
.modal-overlay  { animation: modal-overlay-in 200ms ease-out }
.modal-sheet    { animation: modal-sheet-in 220ms cubic-bezier(0.32, 0.72, 0, 1) }
.modal-dialog   { animation: modal-dialog-in 180ms ease-out }
```

Apply: overlay div → `modal-overlay`, mobile inner div → `modal-sheet`, `sm:modal-dialog`. The easing `cubic-bezier(0.32, 0.72, 0, 1)` on the sheet is the iOS sheet easing — snappy start, smooth landing.

Exit animation requires either CSS `animation-fill-mode` tricks or a small state machine (`closing` boolean that adds exit class, `onAnimationEnd` fires actual close). Simpler to skip exit animation on first pass — enter animation alone is the 80% win.

### AN2 — Toast animation

```css
@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px) }
  to   { opacity: 1; transform: translateY(0) }
}
.toast-enter { animation: toast-in 180ms ease-out }
```

Add `toast-enter` class to each toast `<div>`. No exit animation needed on first pass (same reasoning as AN1).

Also: cap the toast stack at 3. When a 4th toast fires, silently dismiss the oldest. Multiple stacked undo toasts are visually noisy. Add to `showToast`: `setToasts(prev => [...prev.slice(-2), { id, message, onUndo }])`.

### C2 — Avatar color consistency

CompatibilityMatrix already has this logic inline. Extract it:

```typescript
// apps/web/src/lib/memberColors.ts
const PALETTE = [
  { bg: '#ef4444', fg: '#fff' }, { bg: '#f97316', fg: '#fff' },
  { bg: '#eab308', fg: '#000' }, { bg: '#22c55e', fg: '#fff' },
  { bg: '#14b8a6', fg: '#fff' }, { bg: '#3b82f6', fg: '#fff' },
  { bg: '#8b5cf6', fg: '#fff' }, { bg: '#ec4899', fg: '#fff' },
  { bg: '#64748b', fg: '#fff' }, { bg: '#a16207', fg: '#fff' },
]
export function memberPalette(index: number) {
  return PALETTE[index % PALETTE.length]
}
export function buildColorMap(members: { id: string }[]) {
  return new Map(members.map((m, i) => [m.id, i]))
}
```

Then: trip page builds `colorMap` once from `members`, passes it (or slice of it) to the sidebar schedule and activity chip renderers.

### What was cut from the 1.5 draft and why

- **AN4** (matrix view crossfade), **AN5** (rating chip scale), **AN6** ("Copied!" fade): decorative. The matrix views are distinct enough that abrupt switching is fine. The rating chips already have ring feedback. "Copied!" is clear without animation.
- **S4** (sidebar gradient): gradients are the "AI-generated design" tell. Avoid.
- **S6** (twin grid heatmap range): the two-color linear interpolation in the current code is doing the right thing for the data. Changing to a multi-stop gradient for aesthetics risks misrepresenting the underlying Jaccard scores.
- **S7** (score bar height h-2): the pts label already from R1 makes the score readable. Adding height just for visual weight is noise.
- **S9** (invite code `tracking-widest`): short alphanumeric codes don't need widened tracking — they read fine at normal spacing.
- **S10** (compress AppNav to h-12 on mobile): h-16 is 64px, a standard mobile nav height. Not worth touching.
- **UX2** (schedules card contextual note): adds copy to explain a UI that's already self-evident. Skip.
- **AN7** (tab switch fade): LOW impact. The tab bar's active indicator already signals context. Content changing is expected behavior.
