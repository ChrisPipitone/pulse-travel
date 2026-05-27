# Pulse — UI/UX Audit Round 5

Animation pass — focused on interactions that communicate state change: drawers, rating feedback, and content transitions. Rule applied throughout: motion explains what happened, decorative motion gets cut.

Work 1–3 items at a time. Check off as done.

---

## OPEN FROM ROUND 4

- [ ] **RN3** — NativeWind v4 `rounded-[var(--radius-*)]` test render needed. **[Impact: HIGH if broken]**

---

## CHECKLIST

### ANIMATION — drawer expand/collapse

- [x] **AN1** — `ActivityRow` in TripTimeline uses `{isOpen && <ActivityRatingsGrid>}` — content hard-snaps in and out. Fix: replace with CSS grid height trick (`grid-rows-[0fr]` → `grid-rows-[1fr]`, 200ms ease-out). Always render the content div, animate its visibility via grid row height. The chevron already rotates on open — the content should follow with the same motion. Same fix applies to the `ActivityRatingsGrid` drawer inside FindYourCrew's CrewModal. **[Impact: HIGH — most jarring snap in the app]**

### ANIMATION — rating interaction feedback

- [x] **AN2** — FindYourCrew crew modal: when `pendingRating` changes, the entire CTA callout section (wave / MUST / MAYBE / SKIP) swaps instantly. Add `key={pendingRating ?? 'null'}` on the callout wrapper + a `callout-in` CSS animation (`opacity 0→1`, `translateY 6px→0`, 160ms ease-out). React unmounts/remounts on key change, triggering the animation. Makes the rating feel registered — the UI responds visibly. **[Impact: HIGH — rating is the core interaction, it should feel alive]**

- [x] **AN3** — `ActivityDetailModal` rating confirmation: `showCheck ? '✓' : label` currently snaps. Wrap the button content in a `<span key={showCheck ? 'check' : r}>` so the ✓ mounts fresh and plays a `pop-in` keyframe (`scale 0.5→1`, `opacity 0→1`, 120ms). Small detail, high perceived polish — it's the moment the user knows their tap registered. **[Impact: MED]**

### ANIMATION — FindYourCrew crew sections

- [x] **AN4** — When the CrewModal expands from the activity card, the MUST/MAYBE/SKIP member pills appear instantly. A single `section-in` fade (`opacity 0→1`, `translateY 4px→0`, 180ms, staggered 30ms per section) gives the crew reveal a sense of "loading in." Stagger only the three section blocks (not individual pills — per-pill stagger on 20+ members would be noise). **[Impact: MED — the crew reveal is a hero moment, should feel intentional]**

---

## WHAT'S SOLID — no action needed

**Modal enter/exit.** Sheet-in on mobile, dialog-in on desktop, overlay fade. Correct easing. ✓

**Toast enter.** `toast-in` slide-up, swipe-to-dismiss. No exit animation needed — the instant disappear is fine; the undo window makes the exit inconsequential. ✓

**Rating chip `transition-all`.** The color/border swap on active chips animates smoothly. ✓

**CrewCard hover.** `hover:shadow-md hover:-translate-y-px active:scale-[.998]` — exactly right. Responsive without being theatrical. ✓

**Chevron rotation on ActivityRow.** `transition-transform duration-200` already applied. ✓

---

## PUSHED BACK — not doing these

**Page-level entrance stagger (trip cards, stop cards, crew pills).** Staggered entrance on static content is the defining "AI template" pattern. If content loads fast, the stagger is cosmetic lag. If it loads slow, it makes the skeleton-to-content transition feel jerky. Skip.

**Modal exit animation.** Requires a `closing` boolean state + `onAnimationEnd` → actual close. Adds ~20 lines of state machine per modal for ~150ms of fade that users don't consciously register. The enter animation is the 80% win; exit is diminishing returns at meaningful complexity cost.

**Tab content crossfade.** Pushed back in R2 and again here. The active tab indicator already communicates context switch. Content changing is expected behavior; animating it is noise.

**Per-pill member stagger inside MUST/MAYBE sections.** With 10+ members, staggered reveal creates a distracting ripple. Stagger the section blocks only (AN4), not individual pills.

---

## NOTES

### AN1 — Grid rows height trick

```css
/* No new keyframe needed — pure Tailwind */
```

```tsx
// Replace {isOpen && <ActivityRatingsGrid>} with:
<div className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
  <div className="overflow-hidden">
    <ActivityRatingsGrid ... />
  </div>
</div>
```

Always renders the grid content (no mount/unmount). CSS grid animates the row height. The `overflow-hidden` on the inner div clips the content during the transition. This is the correct pattern for height-unknown content — no JS height measurement needed.

### AN2 — Callout fade

Add to globals.css:
```css
@keyframes callout-in {
  from { opacity: 0; transform: translateY(6px) }
  to   { opacity: 1; transform: translateY(0) }
}
.callout-in { animation: callout-in 160ms ease-out both }
```

In FindYourCrew modal, wrap the entire callout conditional in:
```tsx
<div key={pendingRating ?? 'null'} className="callout-in">
  {/* existing conditional callout JSX */}
</div>
```

### AN3 — ✓ pop-in

Add to globals.css:
```css
@keyframes pop-in {
  from { transform: scale(0.5); opacity: 0 }
  to   { transform: scale(1);   opacity: 1 }
}
.pop-in { animation: pop-in 120ms cubic-bezier(0.34, 1.56, 0.64, 1) both }
```

The cubic-bezier here is a slight overshoot spring — feels satisfying for a confirmation tick. In ActivityDetailModal:
```tsx
<span key={showCheck ? 'check' : r} className={showCheck ? 'pop-in' : ''}>
  {showCheck ? '✓' : ratingLabel[r]}
</span>
```

### AN4 — Section stagger

Add to globals.css:
```css
@keyframes section-in {
  from { opacity: 0; transform: translateY(4px) }
  to   { opacity: 1; transform: translateY(0) }
}
.section-in { animation: section-in 180ms ease-out both }
```

Apply to the MUST div, MAYBE div, SKIP div in the modal body, with inline `animationDelay`:
```tsx
<div className="section-in" style={{ animationDelay: '0ms' }}>   {/* MUST */}
<div className="section-in" style={{ animationDelay: '40ms' }}>  {/* MAYBE */}
<div className="section-in" style={{ animationDelay: '80ms' }}>  {/* SKIP */}
```

Only applies when the modal first opens (component mounts). No re-trigger on re-render.
