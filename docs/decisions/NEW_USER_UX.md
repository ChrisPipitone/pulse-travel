---
tier: decision
status: accepted
updated: 2026-06-04
---

# New User Experience — Journey Archetypes & Friction Analysis

Pulse serves three distinct types of new users. Each requires a different balance of education, validation, and speed.

---

## 1. The Archetypes

### A. The "Curious Wanderer" (Organic / Marketing)
- **Source:** Finds `pulse.travel` via search, ads, or social.
- **Goal:** Understand value and convert to "Trip Lead."
- **Status:** ✅ Shipped — `LandingPage.tsx` renders at `/` for unauthenticated users. Headline: "Move your trip out of the group chat." Three feature highlights. Create/Join CTAs. AppNav shows Sign in.
- **Still open:** Read-only demo trip ("See a Sample Trip") — deferred post-MVP (item 17).

### B. The "Invited Guest" (Share Link)
- **Source:** Clicks a WhatsApp/iMessage link (`/join?code=xxx`).
- **Goal:** Social validation ("Is this my group?") and friction-free joining.
- **Status:** ✅ Shipped — `VibeCheckCard.tsx` renders at `/join?code=...` for unauthenticated users. Shows trip name, destination, dates, member count, activity count. Animated crew formation teases the grouping concept. "Join the Crew" CTA → auth → existing join flow. Backed by `get_trip_preview` Postgres function (anon-safe, no trip ID exposed).

### C. The "Power User" (Native App)
- **Source:** Downloads the app.
- **Goal:** Efficiency and "Daily Driver" status.
- **Proposed Solution: Interactive Training.**
    - **The 3-Card Stack:** A quick interactive tutorial using MUST/MAYBE/SKIP on 3 sample activities. 
    - **Immediate Context:** "Now, let's get your first trip started."

---

## 2. Friction Analysis & Improvements

> Synthesized 2026-05-28 from two independent AI reviews of the current codebase.
> Implementation order agreed at bottom. Check off as each ships.

---

## Current Flows

### Member path (most common — responds to invite)

```
share link → /join?code=xxx
  → not logged in → /login?returnTo=/join...
  → email OTP (~30s roundtrip)
  → code verified → back to /join
  → trip preview (name, destination, dates) → "Join" button
  → /trip/[id]
  → ??? nothing tells them what to do
```

### Creator path

```
/login → / → WelcomeScreen → "Plan a trip"
  → CreateTripModal → /trip/[id]
  → blank trip, 1 member (themselves)
  → ??? nothing tells them what to do next
```

**Current time-to-first-rating (member):** ~2–3 minutes. Goal: under 60 seconds total.

---

## Friction Points

### F1 — No direction after joining
After join, the trip page has zero onboarding context. A one-time `localStorage`-gated nudge banner appears but is weak and dismissible. Nothing surfaces the two required actions: **rate activities** and **set dates**.

### F2 — Two critical actions are hidden
- **Ratings:** discovered by accident; no persistent prompt
- **Dates:** buried in a kebab menu in the sidebar; "+ Add your dates" text is not interactive enough

### F3 — Creator blank-slate paralysis
Empty trip gives no signal about what to do first. The dependency (add activities → invite → rate) is invisible. "+ Add" button is small, tucked away.

### F4 — Tab names don't communicate function
- "Activities" tab actually renders `FindYourCrew` (rating + crew cards) — users expect a list
- "Crew" tab shows a crew overview — name is ambiguous (roster? chat? compatibility?)
- No sub-labels, no empty-state descriptions, no first-time tooltips

### F5 — Activities tab IS the crew view but isn't named that
`FindYourCrew` renders under "Activities." Separate "Crew" tab shows `FindYourCrewOverview`. Two surfaces showing overlapping content with names that don't differentiate them.

### F6 — Invite CTA leads with wrong action
Sidebar invite card: "Send them an email invite" is the primary button. Reality: 90% of sharing is via WhatsApp/iMessage. "Copy link" is smaller, secondary. Backwards.

### F7 — Activity status value is hidden
Group enthusiasm is expressed as numeric counts. No social signal labels ("Universal Favorite", "Split Crowd", "No Signal"). The product's core value — "see if the group aligns" — requires interpretation instead of being instant.

### F8 — SetDisplayNameModal is a login interruption
Fires as a blocking modal the moment a new user authenticates, before they've seen anything. Wrong context, wrong time. Should appear during the join flow ("What should we call you?") or inline on first landing.

### F9 — Rating progress signal is passive
`X/Y` chip on home page trip card is good data but has no action path. Clicking the trip just opens it — doesn't filter to unrated activities.

### F10 — Split-pane crew panel doesn't auto-populate on landing
Desktop: the right-side crew panel is blank until a card is clicked. The "social coordination" value is invisible on load. Should show the top-scored activity's crew breakdown by default.

---

## Improvements — Prioritized

### P0 — Close the 60s gap

**[1] Tab rename + sub-labels** `[ ]`
- "Activities" → **"Rate"**
- Add one-line sub-label under each tab:
  - Rate: *"What do you want to do?"*
  - Crew: *"Who are you going with?"*
  - Timeline: *"When and where?"*
- Files: `apps/web/src/app/trip/[id]/page.tsx` (TAB_LABELS + sub-label render)
- Effort: 15 min

**[2] Activity Status Labels** `[ ]`
Already specced in `docs/decisions/CREW_VIEW_DESIGN.md`. Implement on crew card header + modal.

| Label | Trigger |
|---|---|
| Universal Favorite | ≥70% MUST, low SKIP |
| Strong Match | ≥50% MUST, some MAYBE |
| Split Crowd | High MUST + high SKIP |
| Niche Favorite | 1–3 MUST, rest unrated/MAYBE |
| Safe Consensus | Mostly MAYBE, few MUST |
| No Signal | <2 ratings total |

- Files: `apps/web/src/components/CrewCard.tsx`, `CrewModal.tsx`
- Effort: 1 session

**[3] Post-join: auto-open first unrated activity** `[ ]`
- After joining, auto-scroll to first unrated activity card and open its crew modal
- Replace the weak `localStorage` nudge with a persistent inline banner: *"Rate activities to build your crew →"* that stays until all rated (not dismissible)
- Files: `apps/web/src/components/FindYourCrew.tsx`, `apps/web/src/app/join/page.tsx`
- Effort: 1 session

**[4] Flip invite CTA** `[ ]`
- Primary: large "Copy invite link" button
- Secondary: "Email invite"
- Third: "Share via WhatsApp" — direct deep link `https://wa.me/?text=...` (mobile only, `hidden sm:flex`)
- Files: `apps/web/src/components/TripSidebar.tsx`, `InviteMemberModal.tsx`
- Effort: 30 min

### P1 — Core "aha" moments

**[5] SetDisplayNameModal: defer the interruption** `[ ]`
- Remove from immediate post-login trigger
- Surface during join flow: step 2 of `/join` page after accepting invite ("What should the group call you?")
- Or: inline editable name chip on home page, soft-prompt only
- Files: `apps/web/src/components/SetDisplayNameModal.tsx`, `apps/web/src/app/join/page.tsx`, `Providers.tsx`
- Effort: 1 session

**[6] Post-join celebration toast** `[ ]`
- On first join: show "You're in! ✈️ [Trip Name]" toast (use destination flag emoji if parseable, else ✈️)
- Distinct from the existing join success redirect
- Files: `apps/web/src/app/join/page.tsx`, `ToastProvider.tsx`
- Effort: 30 min

**[7] Completion moment: all activities rated** `[ ]`
- When last unrated activity is rated: banner transitions to "You're done — see your crew →" CTA
- Button switches to Crew tab
- Files: `apps/web/src/components/FindYourCrew.tsx`
- Effort: 30 min

### P2 — Creator setup + polish

**[8] Creator setup sequence** `[ ]`
- After creating a trip, show inline 3-step strip at top of main area:
  `① Add activities → ② Invite your group → ③ You're set`
- Step 1 also shows 3 starter activity suggestions to kill blank-page anxiety:
  e.g. "Group Dinner 🍽️", "City Walk 🗺️", "Beach Day 🏖️" — clicking one pre-fills the activity form
- Collapses permanently once all three steps touched
- Files: new component `TripSetupStrip.tsx`, `apps/web/src/app/trip/[id]/page.tsx`
- Effort: 1 session

**[9] Split-pane: crew panel default populated on desktop** `[ ]`
- On desktop load, set `openId` to the top-scored activity by default
- Panel renders immediately with crew breakdown rather than blank
- Files: `apps/web/src/components/FindYourCrew.tsx`
- Effort: 15 min

**[10] Set dates inline in sidebar** `[ ]`
- "+ Add your dates" text → expands an inline date picker directly in the sidebar
- Remove the modal path for this action (or keep modal as fallback for editing)
- Files: `apps/web/src/components/TripSidebar.tsx`, `MemberDatesModal.tsx`
- Effort: 1 session

**[11] Unrated sort filter** `[ ]`
- Add "Unrated" option to activities sort bar (already has: Popular / Can't Miss / My Recs / Newest / By Stop)
- Files: `apps/web/src/components/FindYourCrew.tsx`
- Effort: 20 min

**[12] Rating progress ring on member avatar** `[ ]`
- Thin arc on member avatar in sidebar: shows rated/total ratio
- Passive, zero layout cost
- Files: `apps/web/src/components/MemberAvatar.tsx`, `TripSidebar.tsx`
- Effort: 30 min

---

## Structural question (deferred)

**Are "Rate" and "Crew" the right tab split?**

Option A (rename only — item 1 above): Activities → Rate. Simple, effective.

Option B (restructure): Crew tab becomes Travel Twin view (distinct value, not an "overview" of the same data). The two-tab split becomes: Rate / Travel Twin / Timeline. Deferred until Travel Twin is more prominent.

---

## Implementation Log

| # | Item | Status | Commit |
|---|---|---|---|
| 1 | Tab rename + sub-labels | ✅ done | — |
| 2 | Activity Status Labels | ✅ done | — |
| 3 | Post-join: auto-open first unrated | ✅ done | — |
| 4 | Flip invite CTA | ✅ done | — |
| 5 | SetDisplayNameModal defer | ✅ done | — |
| 6 | Post-join celebration toast | ✅ done | — |
| 7 | Completion moment | ✅ done | — |
| 8 | Creator setup sequence | ✅ done | — |
| 9 | Split-pane default populated | — | — |
| 10 | Set dates inline | — | — |
| 11 | Unrated sort filter | — | — |
| 12 | Rating progress ring | — | — |
| 13 | Vibe Check — unauthenticated /join preview | ✅ done | 0b2643a |
| 14 | Marketing landing page at / (Curious Wanderer) | ✅ done | 0b2643a |
| 15 | Returning user empty state (personalized, no re-education) | ✅ done | 867f57a |
| 16 | display_name persisted to user_metadata on onboarding | ✅ done | e80965e |
| 17 | Read-only demo trip (Curious Wanderer deep hook) | deferred post-MVP | — |
