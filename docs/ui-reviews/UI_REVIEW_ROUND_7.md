# Pulse — UI/UX Audit Round 7

UX Strategy alignment pass — mobile safety gaps, social label upgrade, and the desktop split-pane path.
Work 1–3 items at a time. Check off as done.

---

## OPEN FROM ROUND 6

- [ ] **RN3** — NativeWind v4 `rounded-[var(--radius-*)]` render test needed. **[Impact: HIGH if broken]**

---

## CHECKLIST

### MOBILE — touch target: KebabMenu trigger too small

- [x] **M1** — `KebabMenu.tsx:24`: trigger button is `p-1` on a 14×14px icon — effective tap target is ~22×22px. This is the **only** way to reach Edit/Delete on activity cards. On mobile, a user who misses the kebab has no other path to edit or delete. Fix: bump to `p-2` minimum (→ ~30px, still under HIG's 44 but far more reliable), or `p-2.5` for full compliance. One-line change with no visual regression on desktop. **[Impact: HIGH — broken primary action path on touch]**

### MOBILE — safe area: toast and sticky footer overlap iPhone home indicator

- [x] **M2** — `ToastProvider.tsx:101`: toast container uses `bottom-6` (24px) with no safe area padding. On iPhone 14+ the home indicator is ~34px. On iPhones in Safari the bottom browser toolbar adds another ~50px in portrait. Fix: `bottom-6` → `bottom-[max(1.5rem,env(safe-area-inset-bottom))]`. One line; zero visual change on desktop. **[Impact: HIGH — every undo/delete confirmation is potentially obscured on the primary target device]**

- [x] **M3** — `CrewModal.tsx:125`: sticky rating footer uses `py-4` with no bottom safe area. When the modal covers full height on short iPhones, the rating buttons can sit under the home indicator zone. Fix: add `pb-[max(1rem,env(safe-area-inset-bottom))]` to that div. **[Impact: MED — rating is the core interaction; obscuring it on iPhone is a real regression]**

### MOBILE — touch target: ActivityDetailModal rating buttons undersize

- [x] **M4** — `ActivityDetailModal.tsx:129`: rating buttons use `py-2` (`text-sm` = 14px + 8+8px padding = ~30px height). `CrewModal` correctly uses `min-h-[44px]` on its rating buttons; `ActivityDetailModal` doesn't. Fix: add `min-h-[44px]` to the same button class. One token, consistent with the existing pattern. **[Impact: MED — inconsistency between two rating surfaces; thumb zone compliance]**

### SOCIAL — activity status labels replace raw crew counts

- [x] **S1** — `CrewCard.tsx:187` (`CrewFooter`): currently shows "3 going · 2 maybe" as numeric pills. This is a production metric, not a social signal. The UX strategy calls for emotional status labels ("Universal Favorite", "Split Crowd", etc.) — all required data is already in `CrewRowData` (`mustCount`, `maybeCount`, `skipMembers.length`, `unratedMembers.length`, total `members` via sum). Replace the numeric pills with a computed label. Retain the numbers as secondary context beneath or alongside the label. See NOTES for thresholds. **[Impact: HIGH — directly implements the "social coordination confidence" principle. This is the single highest-signal change that makes Pulse feel different from a voting app.]**

### DESKTOP — activity detail split-pane at lg:

- [x] **D1** — On desktop (`lg:` and above), clicking a `CrewCard` currently opens `CrewModal` as a fixed overlay — same as mobile. The UX strategy specifies a persistent right panel at lg: (list left, detail right) so trip leads can scan the list and drill into detail without losing context. Implementation: lift `openId` state out of `FindYourCrew` up to `trip/[id]/page.tsx`, render `CrewModal` content in a right-panel `<aside>` at lg: instead of a fixed overlay. Mobile keeps the existing bottom-sheet. See NOTES for layout sketch. **[Impact: MED — high-value for desktop trip leads, zero mobile change. Scope is ~50 lines across 2 files.]**

### ONBOARDING — new joiner has no "do this first" signal

- [x] **O1** — After joining a trip the new user lands on the activities tab with no orientation. The "Rate this →" pill exists on each card, and the P4 microcopy in CrewModal explains the vocabulary, but neither is proactive. A first-time user who's never seen Pulse may not understand *why* rating matters before they engage. Fix: detect "first visit" (check if `myRating === null` across **all** activities for the current user), and if so, show a single dismissible inline banner at the top of the activities list: `"Rate activities to find your crew for each one."` Dismiss on first interaction (any rating). Stored in `localStorage` so it only shows once. **[Impact: LOW — the existing UI handles this reasonably via "Rate this →" pills. This is polish, not a blocker. Implement last.]**

---

## WHAT'S SOLID — no action needed

**Hover-only actions:** No `group-hover:opacity-100` patterns gating critical functionality. The `group-hover` uses in `WelcomeScreen` and `TripSidebar` are cosmetic (icon background, underline) — not hidden controls. Mobile is fine. ✓

**Modal bottom-sheet pattern.** All modals use `items-end sm:items-center`. Applied consistently across `ActivityFormModal`, `ActivityDetailModal`, `CreateTripModal`, `MemberDatesModal`, `CrewModal`. ✓

**`max-h-[90dvh] overflow-y-auto` on modal inner divs.** Present in `ActivityFormModal`, `CreateTripModal`, `MemberDatesModal` — virtual keyboard safe. ✓

**CrewModal sticky rating footer (desktop).** `sticky bottom-0 bg-bg-card` keeps rating buttons in thumb zone when modal body scrolls. Right pattern — just needs the M3 safe area fix. ✓

**Activity Detail Modal auto-close after rating.** The 600ms delay + close-on-rating-complete (`justRated` + `useEffect`) is a good mobile pattern — keeps users moving without manual dismiss. ✓

**Toast swipe-to-dismiss.** Pointer capture + threshold dismiss is the correct mobile pattern and already implemented. ✓

**Tab order (activities → crew → timeline).** P3 from R6 correct — crew is second, which is right. ✓

---

## NOTES

### M1 — KebabMenu one-line fix
```tsx
// Before
className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
// After
className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
```

### M2 — Toast safe area
```tsx
// ToastProvider.tsx line 101
// Before
<div className="fixed bottom-6 inset-x-0 ...">
// After
<div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] inset-x-0 ...">
```

### S1 — Status label thresholds
Add a pure function `activityStatusLabel(mustCount, maybeCount, skipCount, totalMembers): string | null` — returns `null` when no label is warranted (fall back to existing numeric pills).

```ts
function activityStatusLabel(must: number, maybe: number, skip: number, total: number): string | null {
  if (must === 0 && maybe === 0) return null  // show "Nobody's excited" from existing code
  if (total >= 3 && must === total) return "Universal favorite"
  if (total >= 4 && must >= Math.ceil(total * 0.6) && skip === 0) return "Strong match"
  if (must >= 2 && skip >= 2) return "Split crowd"
  if (must >= 1 && must + maybe <= Math.max(2, Math.floor(total * 0.35)) && total >= 4) return "Niche pick"
  return null
}
```

Place the label **above** the numeric pills in `CrewFooter`, styled as `text-[11px] font-bold text-text-muted uppercase tracking-wide`. Keep "N going · N maybe" as secondary context so users can still see the counts. Example:

```
STRONG MATCH
3 going  2 maybe
```

Don't replace the numbers entirely — they're useful signal. The label adds the *social* layer on top.

### D1 — Split-pane layout sketch
In `FindYourCrew.tsx`, at `lg:` breakpoints, the component needs to know whether to render the detail as a fixed modal or an inline panel. The cleanest approach:

1. Accept an optional `selectedId / onSelect` prop pair (controlled from parent)
2. In `trip/[id]/page.tsx`, at lg: render a two-column grid: left = activity list (`min-w-0 flex-1`), right = detail panel (`lg:w-[380px] lg:shrink-0 sticky lg:top-[5rem]`)
3. The right panel renders `CrewModal`'s body content (without the fixed overlay wrapper) — or extract a `CrewDetail` component shared by both modal and panel
4. On mobile (< lg), keep `CrewModal` as-is

The detail panel can be the same `CrewModal` content wrapped in a `<aside>` instead of a `fixed inset-0` — the distinction is purely the wrapper, not the content.
