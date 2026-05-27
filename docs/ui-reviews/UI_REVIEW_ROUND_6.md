# Pulse — UI/UX Audit Round 6

Positioning pass — TripRelay has near-identical 4-way voting vocabulary. This round finds every UI surface where Pulse fails to say "who goes together" and fixes the copy/structure before a side-by-side comparison hurts us.

Work 1–3 items at a time. Check off as done.

---

## OPEN FROM ROUND 5

- [ ] **RN3** — NativeWind v4 `rounded-[var(--radius-*)]` test render needed. **[Impact: HIGH if broken]**

---

## CHECKLIST

### POSITIONING — WelcomeScreen "Plan a trip" card

- [x] **P1** — `WelcomeScreen.tsx` line 53: sub-description reads "Create a trip and invite your group to rate activities together." This is indistinguishable from TripRelay's copy — it says nothing about crew or compatibility. Change to: `"See who's excited for each activity — and who you'll actually be doing it with."` That sentence cannot belong to a destination-routing tool. **[Impact: HIGH — first thing a new invited user reads; the 60-second onboarding window starts here]**

### POSITIONING — Home page tagline

- [x] **P2** — `page.tsx` line 188: `"Plan, rate, and explore with your group."` Generic. Swap to: `"Find out who's doing what — before the group chat melts down."` Alternatively use the one-liner from CLAUDE.md: `"Who should do what together?"` Either is accurate and un-copyable by TripRelay. **[Impact: MED — only visible to returning users (they already have trips), but it's the persistent ambient message of what Pulse is for]**

### POSITIONING — Tab ordering buries the differentiator

- [x] **P3** — `trip/[id]/page.tsx` line 491: tabs render in order `activities → timeline → crew`. "Find your crew" — the feature TripRelay cannot replicate — is last. Swap to `activities → crew → timeline`. Crew is the hook; Timeline is the power feature for committed users. The tab a new user sees second should be the one that makes them say "oh, this is different." Also: `TAB_LABELS.crew.short` is "Find your crew" (same as full) — no shortening on mobile. On narrow screens "Find your crew" wraps or crowds. Change `short` to `"Crew"`. **[Impact: HIGH — tab order is permanent ambient information architecture; burying crew at position 3 trains users to ignore it]**

### POSITIONING — Rating vocabulary disconnected from crew formation

- [x] **P4** — `ActivityDetailModal.tsx`: the three rating buttons (MUST / MAYBE / SKIP) appear with no context about what the rating *does*. TripRelay's `super yes / yes / opt-out` does the same thing visually. Add one line of microcopy below the button row: `"MUST = you're in the crew. MAYBE = you're flexible. SKIP = you're out."` Style it as `text-[11px] text-text-subtle text-center`. This is the moment where Pulse's vocabulary becomes legible as crew language rather than generic voting. **[Impact: MED — the rating interaction is the most-repeated action in the app; this copy runs every time a new user sees the modal]**

---

## WHAT'S SOLID — no action needed

**FindYourCrewOverview content.** Groupies + Travel Twin views are genuinely differentiated. The Jaccard score, shared MUSTs, twin preview chips — nothing like this in TripRelay or any competitor. The logic is solid; this round is about making users *see* it sooner, not changing it.

**TripPulseStrip crew framing.** "Most popular: X · N going" already uses crew language implicitly. ✓

**Rating chip colors (MUST/MAYBE/SKIP).** Consistent, accessible since R4/CC1. The visual language is there — just needs the connecting copy (P4).

**Tab active-indicator.** `border-b-2 border-accent` on active tab is clean and sufficient. No changes needed.

---

## NOTES

### P1 — Why this copy
"See who's excited for each activity — and who you'll actually be doing it with" answers the question TripRelay can't: not just what activity got votes, but *which specific people are going together*. "Actually be doing it with" signals crew resolution, which is the potential→actual pipeline that's the whole product thesis.

Avoid: "discover your travel squad" or any group-chat-speak. This is a warm, specific product claim, not a tagline.

### P3 — Tab swap implementation
Change in `trip/[id]/page.tsx`:
```tsx
// Before
{(["activities", "timeline", "crew"] as Tab[]).map((t) => (

// After
{(["activities", "crew", "timeline"] as Tab[]).map((t) => (
```

And update `TAB_LABELS`:
```tsx
const TAB_LABELS: Record<Tab, { short: string; full: string }> = {
  activities: { short: "Activities", full: "Activities" },
  timeline:   { short: "Timeline",   full: "Timeline" },
  crew:       { short: "Crew",       full: "Find your crew" },
};
```

### P4 — Microcopy placement
The rating buttons in `ActivityDetailModal` are inside the sticky footer section. Place the microcopy directly below the three rating buttons, above the close/edit controls if any:

```tsx
<p className="text-[11px] text-text-subtle text-center mt-1">
  MUST = you&apos;re in the crew · MAYBE = flexible · SKIP = you&apos;re out
</p>
```

This should only render when no rating has been set yet (`myRating === null`), or always — either is defensible. If always shown it reinforces vocabulary for new group members joining late; if only on unrated it avoids repeating known information. Prefer always-shown for the first launch cycle — vocabulary needs repetition.
