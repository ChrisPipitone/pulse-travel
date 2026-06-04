---
tier: canonical
status: active
supersedes: [screen_inventory.md, user_journey.md]
updated: 2026-06-04
---

# UX_SPEC

> Canonical owner of the **current, implemented** Pulse user experience.
> Sources of truth: `PRODUCT.md`, `NEW_USER_UX.md`, `UI_DESIGN.md`, `TRIP_FLOW.md`, and verified application behavior.
> Documents current state only — no proposals, no future-state.

---

## Purpose

Pulse is a group vacation planner that answers one question: *who should do what, and with whom?* Members rate proposed activities MUST / MAYBE / SKIP; the app turns those individual ratings into group signal — per-activity crews, consensus status labels, and pairwise compatibility — and lets the group sequence agreed activities into a timeline. The experience is built for non-technical members to join via a share link and rate in under a minute, while giving the trip organizer the social signal needed to prune and plan.

---

## User Types

### Trip Lead (creator / owner)
- **Goals:** Set up a trip, propose activities, recruit members, see where the group agrees, and sequence the plan.
- **Primary actions:** Create trip; add/edit activities; invite members (copy link / email); add and assign Stops on the Timeline; rate activities (Leads are also members); set own dates.
- **Success criteria:** Activities proposed; members joined and rating; consensus visible (Universal Favorite / Split Crowd etc.); activities assigned to Stops in the Timeline.

### Trip Member (invited)
- **Goals:** Join the right trip quickly, signal preferences, and see who they align with.
- **Primary actions:** Open invite link; authenticate; set display name; rate activities MUST/MAYBE/SKIP; set arrival/departure dates; view crews and compatibility.
- **Success criteria:** Joined; all activities rated (progress reaches 100%); crew and Travel Twin visible; dates contributed to the overlap window.

---

## Navigation Model

Global navigation: persistent top bar (`AppNav`) with a link to Home and a Sign Out action. Within a trip, a three-way tab toggle switches between perspectives without leaving the page. Each tab has a short label (mobile), a full label (desktop), and a sub-label.

| Surface | Route | Purpose | Primary user question |
|---|---|---|---|
| Login | `/login` | Authenticate (email+password, email OTP, Google OAuth) | "How do I get in?" |
| Home | `/` | Overview of all trips; create or join | "Which of my trips need attention?" |
| Join | `/join?code=<invite_code>` | Convert an invite link into membership | "Is this my group's trip?" |
| Trip View | `/trip/[id]` | The trip workspace (three tabs below) | — |

Trip View tabs (default tab = **Rate**):

| Tab (internal key) | Label (full) | Sub-label | Renders |
|---|---|---|---|
| `activities` | **Rate** | "What do you want to do?" | `FindYourCrew` — activity list + per-activity crew |
| `crew` | **Find Your Crew** | "Who are you going with?" | `FindYourCrewOverview` — compatibility / Travel Twin |
| `timeline` | **Timeline** | "When and where?" | `TripTimeline` — Stops + assigned activities |

---

## Screen Inventory

### Login — `/login`
- **Purpose:** Authenticate and establish identity.
- **Primary actions:** Email + password sign-in; email OTP (request + verify 6-digit code); Google OAuth.
- **Information shown:** Sign-in form; brand tagline panel.
- **Desktop:** Center form with brand panel.
- **Mobile web:** Single-column form, mobile wordmark.
- **React Native:** Not implemented.

### Home — `/`
- **Purpose:** Triage across all trips; entry point to create or join.
- **Primary actions:** Create trip (`CreateTripModal`); join by entering a code (routes to `/join?code=`); open a trip.
- **Information shown:** `WelcomeScreen` when empty; trip cards with name, destination, dates, member count, and personal rating progress (`my_rated_count / activity_count` + progress bar).
- **Desktop:** Multi-card grid.
- **Mobile web:** Stacked cards, safe-area aware.
- **React Native:** Not implemented.

### Join — `/join?code=<invite_code>`
- **Purpose:** Convert an invite link into membership.
- **Primary actions:** Confirm/Join; set display name (inline in join flow).
- **Information shown:** Trip preview (name, destination, dates); post-join celebration toast.
- **Behavior:** If unauthenticated, redirects to `/login?returnTo=...`, then back. On join, auto-redirects to `/trip/[id]`.
- **Desktop / Mobile web:** Single confirmation view.
- **React Native:** Not implemented.

### Trip View → Rate tab — `/trip/[id]` (default)
- **Purpose:** Rate activities and see each activity's crew.
- **Primary actions:** Rate MUST/MAYBE/SKIP; add activity (`ActivityFormModal`); open activity detail (`ActivityDetailModal` / `CrewModal`); sort (Popular / Can't Miss / My Recs / Newest / By Stop).
- **Information shown:** Activity rows; per-activity crew (MUST crew + MAYBE capacity), member avatars, and consensus status labels (Universal Favorite, Strong Match, Split Crowd, Niche Favorite, Safe Consensus, No Signal); persistent rating banner until all rated, then a completion banner that switches to the Crew tab; creator setup strip (`TripSetupStrip`) for new trips.
- **Desktop:** Split-pane — activity list on the left, crew breakdown panel (`aside`, ~360px) on the right.
- **Mobile web:** Single-column list; crew opens in a modal/bottom-sheet (`CrewModal`); side panel hidden.
- **React Native:** Not implemented.

### Trip View → Find Your Crew tab — `/trip/[id]`
- **Purpose:** Visualize compatibility and sub-groups.
- **Primary actions:** Explore compatibility / Travel Twin cards; view member profiles (`GroupiesMemberCard`, `TravelTwinCard`).
- **Information shown:** Pairwise Jaccard compatibility, shared MUSTs, member overview.
- **Desktop:** Card/overview layout.
- **Mobile web:** Scrollable card stack.
- **React Native:** Not implemented.

### Trip View → Timeline tab — `/trip/[id]`
- **Purpose:** Sequence agreed activities into the trip's flow.
- **Primary actions:** Add/edit Stop (`StopFormModal`, owner only); assign activities to Stops.
- **Information shown:** Stops with dates and assigned activities (`TripTimeline`, `StopsPanel`).
- **Desktop / Mobile web:** Sequential stop list.
- **React Native:** Not implemented.

### Trip sidebar (within Trip View)
- **Purpose:** Members, availability, and invite actions.
- **Primary actions:** Add/edit own dates (`MemberDatesModal`); invite members (`InviteMemberModal` — copy link / email); view member schedules (`MemberSchedulesModal`).
- **Information shown:** Member roster with avatars; date status; invite card.
- **Desktop:** Persistent sidebar.
- **Mobile web:** Collapses / accessed via in-page controls.
- **React Native:** Not implemented.

### Modals (transient, across Trip View)
`CreateTripModal`, `ActivityFormModal` (add/edit), `ActivityDetailModal`, `CrewModal`, `InviteMemberModal`, `MemberDatesModal`, `MemberSchedulesModal`, `SetDisplayNameModal`, `StopFormModal`.

---

## Core User Flows

### Create Trip
1. Authenticate at `/login`.
2. Land on Home (`/`); on `WelcomeScreen`, choose "Plan a trip."
3. Fill `CreateTripModal` — name, destination, dates — and submit.
4. Trip row inserted (`invite_code` generated by Postgres default); creator inserted as a member.
5. Redirect to `/trip/[id]`.
6. `TripSetupStrip` shows the creator sequence: ① add activities → ② invite your group → ③ done; starter activity suggestions available.

### Join Trip
1. Open shared link `/join?code=<invite_code>`.
2. If unauthenticated → `/login?returnTo=/join...`; sign in (OTP / password / Google) → back to `/join`.
3. Trip preview (name, destination, dates) is shown; set display name.
4. Confirm "Join."
5. Membership upserted (duplicate joins are a safe no-op; trip-member tier cap enforced by DB trigger — error surfaced as "Trip is full (X plan allows up to Y members)").
6. Redirect to `/trip/[id]`; celebration toast; auto-open the first unrated activity.

### Rate Activities
1. Open the trip → **Rate** tab (default).
2. Browse the activity list; optionally sort (Popular / Can't Miss / My Recs / Newest / By Stop).
3. Open an activity; set MUST, MAYBE, or SKIP.
4. Persistent banner ("Rate activities to build your crew →") remains until all activities are rated.
5. Crew, status labels, and avatar rows update in real time as ratings change.
6. On rating the last activity, the banner becomes a completion CTA that switches to the Find Your Crew tab.

### Find Your Crew
1. On the **Rate** tab, each activity card shows its crew: MUST members (definite crew) + MAYBE members (available capacity), with a consensus status label.
2. Desktop: the right-side panel shows the selected activity's crew breakdown.
3. Switch to the **Find Your Crew** tab for compatibility — pairwise Jaccard scores and Travel Twin cards surfacing who shares the most MUSTs.

### Build Timeline
1. Open the **Timeline** tab.
2. Trip owner adds a Stop (`StopFormModal`) with dates.
3. Assign activities to Stops.
4. Timeline renders the sequence of Stops with their assigned activities.

### Set Availability
1. In the trip sidebar, choose "+ Add your dates."
2. Enter arrival and departure dates (`MemberDatesModal`).
3. Dates feed the group overlap; member schedules are viewable via `MemberSchedulesModal`.

---

## Platform Behavior

| Area | Desktop Web | Mobile Web | React Native |
|---|---|---|---|
| Rate tab | Split-pane: activity list left, crew panel (~360px) right | Single-column list; crew in modal/bottom-sheet; side panel hidden | Not implemented |
| Find Your Crew tab | Card/overview layout | Scrollable card stack | Not implemented |
| Forms / details | Center-screen dialogs | Bottom-sheet drawers (thumb zone) | Not implemented |
| Global nav | Static top bar | Mobile browser safe-area aware | Not implemented |
| Tab labels | Full labels + sub-labels | Short labels | Not implemented |
| Theme | `modern` (coral + mint, DM Sans), light-only; `next-themes` runtime switching | Same | NativeWind primitives exist (`Button`, `Card`, `Input`, `Badge`); no app shell |
| Sync | Supabase Realtime keeps all members' views in sync | Same | Not implemented |

React Native status: `apps/mobile` contains a README only — no application shell. `packages/ui` ships four `.native.tsx` primitives (`Button`, `Card`, `Input`, `Badge`) under the dual-file pattern. No mobile screens, navigation, or flows are implemented.

---

## Non-Goals

### Not part of the product (intentionally out of scope)
- Booking / reservation engine.
- Payments or expense tracking.
- Maps / map view.
- Real-time chat.
- AI itinerary generation from docs or photos.

### Documented but not implemented
- Overlap calendar (days × members grid with crew dots).
- Gap detector (surfacing crew/timing conflicts).
- Shareable per-activity crew card.
- Sub-trip clustering.
- Organizer role — trip owner who does not rate or appear in crew/compatibility (planned, JAB-86).
- React Native mobile application (primitives exist; no app).

### Current UX items not yet shipped
- Split-pane crew panel default-populated on desktop load.
- Inline date picker in the sidebar (dates currently set via modal).
- "Unrated" option in the activity sort bar.
- Rating-progress ring on the member avatar.
