# Pulse — UI/UX Audit & Working Checklist

Work through these together, 1–3 at a time. Check off as done.

---

## CHECKLIST

### FIX — broken / clearly wrong

- [x] **F1** — "+ New trip" button text clips on home page (px-6 → px-4 sm:px-6 on home `<main>`)
- [x] **F2** — No ESC key to dismiss modals (all 4: CreateTripModal, ActivityFormModal, ActivityDetailModal, MemberDatesModal)
- [x] **F3** — Native `confirm()` dialogs for delete activity + delete trip — replace with polished pattern (see notes)
- [x] **F4** — Destructive action buttons ("Remove", "Delete", "Leave") not visually red — should always show red text, not just on hover

### ADD — new features

- [x] **A2** — Lightweight toast system: "Activity added", "Removed Marco", "Failed — check connection". ~50 lines, no library, CSS slide-in, 3s auto-dismiss. _(See notes for details)_
- [x] **A3** — Copy invite code button: clipboard icon next to code, "Copied!" flash for 2s
- [x] **A4** — Empty state for matrix views: friendly prompt when 0 activities or 0 ratings exist
- [x] **A5** — Trip edit: owner can rename trip, update destination + dates. Edit icon on sidebar trip card. Same modal as CreateTripModal. _(See notes for details)_

### IMPROVE — better execution of existing features

- [x] **I1** — Rating chip active state: add `ring-2 ring-offset-1` or `font-bold` so selected rating is unmistakably distinct from unselected
- [x] **I2** — Unrated activity nudge: small ghost "Rate it" badge on activities the current user hasn't rated yet
- [x] **I3** — Matrix cell sizing consistency: standardize to `h-8 w-8` with `text-[10px]` across all views
- [x] **I4** — Tab bar label shortening at narrow widths: "Travel Twin" → "Twin" at xs, or icon-only variant
- [x] **I5** — Score bars: show numeric score next to bar (`3 pts`) so rank is readable without inferring from fill width

### POLISH — spacing, rounding, visual refinement

- [x] **P1** — Home page join section: wrap in card (`bg-bg-card border border-border rounded-[var(--radius-card)] p-5`)
- [x] **P2** — Modal backdrop blur: add `backdrop-blur-sm` to all modal overlays
- [x] **P3** — Button radius audit: CTAs → pill (`rounded-[var(--radius-btn)]`), secondary/ghost → `rounded-lg`. Audit: "Sign out", "Join", "Add Activity", "Save"
- [x] **P4** — Focus rings: replace `focus:outline-none` with `focus-visible:ring-2 focus-visible:ring-accent/50` on all interactive elements
- [x] **P5** — Scrollbar hide on overflow-x-auto: matrix tabs + horizontal scroll areas

### UX FLOW

- [x] **U1** — Auto-focus first input when modal opens (autoFocus or useEffect + .focus())
- [x] **U2** — After rating in ActivityDetailModal: brief "Saved ✓" in chip, auto-close after 600ms (reduces friction for batch rating)
- [x] **U3** — Click backdrop closes modal: verify consistent across all 4 modals (some may already work)

### ACCESSIBILITY

- [x] **AC1** — Focus trap in modals: Tab cycles within modal only when open
- [x] **AC2** — `aria-label` on icon-only buttons: × close, copy icon, remove member
- [x] **AC3** — Matrix cells: `aria-label="Marco: MUST"` on each colored cell

---

## DECISIONS & NOTES

### F3 — Destructive confirm pattern

Two options to explore — decide when we get there:

**Option A: Inline double-confirm**

- First click: button turns red, label changes → "Tap again to delete"
- Second click within ~3s: executes
- Third option: click elsewhere to cancel
- Pros: no overlay, works great on mobile, feels modern
- Cons: slightly less explicit; could confuse first-time users

**Option B: Custom confirm modal**

- Small centered modal: "Delete this activity?" — gray Cancel + red Delete buttons
- Same pattern as a system alert but themed
- Pros: explicit, familiar, no timing logic
- Cons: extra modal layer; one more thing to dismiss

**F4 note**: Regardless of which pattern, "Remove", "Delete", "Leave" text should always be `text-red-500` (not just on hover). This is separate from the confirm pattern.

---

### A1 — Profile pictures

**Now**: Google OAuth `avatar_url` only. No upload UI.
**Future (not now)**: Allow users to upload a custom photo via Supabase Storage. Requires: Storage bucket, signed upload URL, profile edit UI. Add to `TODO.md` as post-MVP.

---

### A2 — Toast system

Lightweight, no library. Fixed-position stack in bottom-right (or top-center on mobile). Covers:

- Success: "Activity added", "Rating saved", "Removed Marco", "Joined trip"
- Error: "Failed to save — check your connection", "Couldn't remove member"
- Rollback explanation: currently optimistic updates snap back silently — toast explains why

---

### A5 — Trip edit

Owner-only. Edit (pencil) icon on sidebar trip info card → opens modal pre-filled with current name/destination/dates. Same fields as CreateTripModal. Service call: `UPDATE trips WHERE id = ? AND created_by = auth.uid()`. RLS already enforces owner-only writes.

---

## Comments

---

## FUTURE / POST-MVP

- Profile pictures: `<img src={avatar_url}>` where populated, initials fallback everywhere (member list, chips, matrix, crew cards, twin grid). Google OAuth only; no upload UI for now.
- Profile photo upload via Supabase Storage (manual upload, not OAuth)
- Dark mode (CSS vars already support it — just add `[data-theme="dark"]` block)
- Keyboard shortcuts: `n` for new activity, `/` for search
- `beforeunload` warning when form is dirty in modal
- Revist UI for past Trips
