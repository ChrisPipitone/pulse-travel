# Pulse — UI/UX Review

You are conducting a structured UI/UX review of the Pulse frontend. This is an iterative, professional design audit — not a feature wishlist. Every suggestion must justify its existence.

---

## Before you start

1. Determine the current round number: read `docs/ui-reviews/` and find the highest existing `UI_REVIEW_ROUND_N.md`. This review is round N+1.
2. Read ALL prior round files to understand what has already been addressed. Do not re-suggest completed items.
3. Read the current state of the codebase — specifically:
   - `apps/web/src/app/globals.css` — design tokens, themes, CSS vars
   - `apps/web/src/app/page.tsx` — home page
   - `apps/web/src/app/trip/[id]/page.tsx` — trip page (primary view)
   - `apps/web/src/components/AppNav.tsx`
   - `apps/web/src/components/ActivityDetailModal.tsx`
   - `apps/web/src/components/ActivityFormModal.tsx`
   - `apps/web/src/components/CreateTripModal.tsx`
   - `apps/web/src/components/MemberDatesModal.tsx`
   - `apps/web/src/components/CompatibilityMatrix.tsx`
   - `apps/web/src/components/ToastProvider.tsx`
   - `packages/ui/src/Button.tsx`
   - `packages/ui/src/Input.tsx`
4. Read any open items in the most recent prior round that are NOT yet checked off. Those carry forward — do not re-list them, but note them as "open from round N".

---

## The design standard

Evaluate everything through this lens. Internalize it before writing a single suggestion.

**What Pulse should feel like:**
- Clean and spacious — whitespace is a feature, not wasted space
- Personal and warm — this is a product for friends planning trips together, not an enterprise dashboard
- Cultured — tasteful typography, restrained color use, details that reward attention
- Opinionated but not loud — accent color used sparingly, earns attention when it appears
- Fast and responsive — interactions feel immediate, never sluggish

**What Pulse must never feel like:**
- "Built by AI" — generic rounded corners everywhere, gradient blobs, over-smoothed everything, motion for the sake of motion
- Over-animated — animations must communicate state change, causality, or progress. Decorative animation is noise.
- Clunky — heavy shadows, thick borders, oversized touch targets, excessive padding
- Corporate SaaS — no dashboards, no data tables, no enterprise-grey everything
- Noisy — too many colors, too many font weights, too many competing elements

**Honesty rules — you MUST apply these:**
- If something is well-executed and has no meaningful room for improvement, say: `✓ Done — no further action.`
- If a common suggestion would make it worse (too much animation, too many visual treatments), say so and explain why. Push back.
- Do not suggest something just to fill the list. A short, high-signal review beats a padded one.
- Rate each item by impact: **HIGH** / **MED** / **LOW**. Impact means user-perceived quality improvement — how much better does the app *feel* with this done. Code size and implementation effort are irrelevant to the rating. A one-line fix can be HIGH; a large refactor can be LOW. If you can't get something above LOW, question whether it belongs.
- Do not suggest adding libraries. Work with what exists: Tailwind v4, CSS custom properties, React state, no animation libraries.

---

## Dimensions to evaluate

Evaluate in this order. Not every dimension will have findings every round — that's fine.

### 1. Visual hierarchy & typography
Does the eye land in the right place? Is the reading order clear? Are there competing weights or sizes? Is type used consistently?

### 2. Color and contrast
Is the accent used sparingly and intentionally? Are rating colors (MUST/WANT/MEH) consistent across all surfaces? Is contrast accessible? Are neutral grays doing real work or just filling space?

### 3. Spacing and density
Is padding consistent at each level (card, section, page)? Does the layout breathe without wasting space? Are there places that feel cramped or bloated?

### 4. Component consistency
Do cards, buttons, badges, and inputs follow the same visual language? Are there one-off treatments that should be unified?

### 5. Interaction feedback
Do interactive elements clearly signal their state (hover, active, disabled, loading)? Are there state changes that happen without any feedback?

### 6. Animations and motion
Are there state transitions that would benefit from motion? Are there existing transitions that should be removed or toned down? Apply the rule: motion should explain what happened, not decorate it.

### 7. Empty and loading states
Do empty states give the user clear context and a path forward? Are loading states appropriately skeletal (not just spinners)?

### 8. Mobile experience — treat as a first-class surface, not an afterthought

Pulse's primary success condition (per CLAUDE.md): non-technical family members onboarding on phones in under 60 seconds. Mobile is not a "responsive desktop" — it is a different context with different constraints.

Evaluate both surfaces explicitly:

**Layout breakpoints** — the app uses `sm:` for most switches and `lg:` for the sidebar/main split. Check:
- Does the sidebar collapse correctly to stacked on mobile (`flex-col lg:flex-row`)?
- Do all 5 matrix views have mobile card layouts (not just horizontal-scrolling tables)?
- Does the tab bar label shortening (`sm:hidden` / `hidden sm:inline`) work at narrow widths?

**Touch vs. hover** — hover states don't exist on touch. Flag any feature that is hover-only and therefore invisible on mobile:
- `group-hover:opacity-100` patterns for revealing controls — if this is the only way to access an action, it's broken on touch
- `title=""` tooltips — invisible on touch
- Hover-dependent visual feedback that communicates state

**Touch targets** — Apple HIG minimum is 44×44px. Flag any interactive element below ~36px total (padding + content). Icon buttons with `p-1.5` on a 13×13 icon = ~25px square. Too small.

**Modal/sheet behavior** — modals use `items-end sm:items-center` (bottom sheet on mobile, centered on desktop). This is the right pattern. Check that it's applied consistently across all modals and that the sheet has enough height to be usable on small screens.

**Keyboard and form UX on mobile** — virtual keyboards push the viewport up. Forms in modals should account for this. `max-h-[90dvh] overflow-y-auto` on the modal inner div is the right fix — verify it's applied where needed.

**What to skip** — do not suggest making mobile a pixel-perfect clone of desktop. Different layouts for different contexts is correct. The goal is that mobile is fully functional and feels intentional, not that it matches the desktop layout.

### 9. Accessibility and keyboard UX
Are there regressions from prior work? New interactive elements without aria-labels? Color-only information?

### 10. Gut check — "does this feel good?"
After reading the code, does anything feel off that doesn't fit a neat category? Trust the instinct, then articulate it.

---

## Output format

Write the review to `docs/ui-reviews/UI_REVIEW_ROUND_N.md` where N is the correct round number.

Structure:

```markdown
# Pulse — UI/UX Audit Round N

One sentence framing what this round focuses on.
Work 1–3 items at a time. Check off as done.

---

## OPEN FROM ROUND N-1
List any unchecked items from the prior round here with their original IDs. Do not re-evaluate them — just carry them forward.

---

## CHECKLIST

### [CATEGORY] — [description]
- [ ] **XN** — [item]. [Impact: HIGH/MED/LOW]

...

---

## WHAT'S SOLID — no action needed
List areas that are well-executed and don't need changes. Be specific. This section is not filler — it communicates what to protect.

---

## NOTES
Implementation guidance for non-obvious items.
```

Do not pad. Do not suggest something just because a category feels empty. A "What's solid" section with five items is better than five LOW-impact checklist items.

---

## After writing the file

Tell the user:
- The round number
- How many items are in the checklist, broken down by category
- The 2–3 highest-impact items to start with
- Anything you pushed back on and why
