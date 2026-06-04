Pulse Travel: Complete Screen Inventory

This inventory documents every screen and major interaction point within the Pulse Travel ecosystem as of the current implementation.

---

1. Login Page

- Route: /login
- Platform: Web (Desktop/Mobile)
- Purpose: Authenticate the user and establish identity.
- Product Importance: Administrative. Required for security and data persistence.

Confidence Analysis

- User Question: "How do I get into my trips?"
- Confidence Increase: Low. Essential friction but builds trust via secure authentication (Google/OTP).
- Information Gained: Access to private coordination data.
- User Action: Enters email, verifies OTP, or clicks Google OAuth.

Emotional State

- Before: Focused/Determined (I need to get to my plan).
- After: Relieved/Authorized (I am in).

---

2. Home Page (Command Center)

- Route: /
- Platform: Web (Desktop/Mobile)
- Purpose: High-level overview of all coordination efforts.
- Product Importance: Core Alignment Screen. It shows the aggregate state of all social coordination.

Confidence Analysis

- User Question: "Where do I need to pay attention?"
- Confidence Increase: High. The Progress Bar on each trip card tells the Lead if they need to nag people and tells the Member if they are
  "done."
- Information Gained: Summary of trips, destination, dates, member count, and personal rating progress.
- User Action: Selects a trip to enter or starts a new trip.

Emotional State

- Before: Uncertain (What's the status of the Italy trip?).
- After: Informed/Directed (I see I'm 4/12 rated in Italy; I need to finish that).

---

3. Join / Onboarding Page

- Route: /join
- Platform: Web (Desktop/Mobile)
- Purpose: Convert an invite link into trip membership.
- Product Importance: Onboarding Screen. Critical for viral growth and member acquisition.

Confidence Analysis

- User Question: "Is this the right trip? What am I joining?"
- Confidence Increase: Mid. Seeing the trip name, destination, and dates confirms the context.
- Information Gained: Trip name, destination, dates, and current membership status.
- User Action: Clicks "Join Trip" and sets display name.

Emotional State

- Before: Curious/Wary (Someone sent me a link, what is this?).
- After: Welcomed/Committed (I'm officially part of the Italy crew).

---

4. Trip View: Activities Tab (The Engine)

- Route: /trip/[id] (Default Tab)
- Platform: Web (Desktop/Mobile)
- Purpose: The primary environment for rating and seeing group consensus.
- Product Importance: Core Alignment Screen. This is where the "Social Coordination Confidence" is manufactured.

Confidence Analysis

- User Question: "What are the group's favorites?"
- Confidence Increase: Peak. Seeing Consensus Labels (Universal Favorite) removes the fear of choosing the "wrong" thing.
- Information Gained: Individual activity details, social signals (going/maybe counts), and personalized "Next unrated" guidance.
- User Action: Rates activities (MUST, MAYBE, SKIP).

Emotional State

- Before: Overwhelmed (There are 20 things to do, where do we start?).
- After: Aligned (Okay, everyone loves the Rome Food Tour, that's a lock).

---

5. Trip View: Crew Tab (Social Matrix)

- Route: /trip/[id] (Tab: crew)
- Platform: Web (Desktop/Mobile)
- Purpose: Visualize social proximity and compatibility.
- Product Importance: Core Alignment Screen. Validates the user's social place in the group.

Confidence Analysis

- User Question: "Who am I most like? Who is actually going on this trip?"
- Confidence Increase: High. Finding a Travel Twin reduces the anxiety of group travel by finding a 1-on-1 match.
- Information Gained: Compatibility scores, shared "MUSTs," and detailed member profiles.
- User Action: Explores compatibility matrix and "Travel Twin" cards.

Emotional State

- Before: Isolated (I hope I'm not the only one who wants to hike).
- After: Connected (Sam and I both love hiking; I have a partner for that activity).

---

6. Trip View: Timeline Tab

- Route: /trip/[id] (Tab: timeline)
- Platform: Web (Desktop/Mobile)
- Purpose: Transition from "What" to "When."
- Product Importance: Supporting Planning Screen. Orchestrates the logistics once alignment is reached.

Confidence Analysis

- User Question: "How does the actual week look?"
- Confidence Increase: Mid-High. Seeing activities flow into Stops makes the trip feel "real" and achievable.
- Information Gained: Sequence of activities, dates of stops, and geographic flow.
- User Action: Views the itinerary; Trip Lead adds/edits stops.

Emotional State

- Before: Disorganized (We have a lot of favorites, but when do we do them?).
- After: Prepared (I see the flow from Rome to Tuscany).

---

7. Member Dates Modal

- Type: Modal
- Platform: Web (Desktop/Mobile)
- Purpose: Collect individual arrival and departure data.
- Product Importance: Supporting Planning Screen. Powers the "Peak Overlap" engine.

Confidence Analysis

- User Question: "When will I actually be there?"
- Confidence Increase: Mid. Contributing your dates makes the "Best Window" calculation more accurate for everyone.
- Information Gained: Personal schedule constraints.
- User Action: Inputs arrival/departure dates.

---

Navigation Model

- Global Navigation: AppNav (Top bar) provides a persistent link to the Home Page and the Sign Out action.
- Contextual Tab Navigation: Inside a Trip, a three-way toggle (Rate, Timeline, Crew) allows non-destructive switching between domain
  perspectives.
- Invite-Link Path: Invite Link -> Join Page -> Login (if unauth) -> Onboarding (Set Name) -> Trip View.
- Deep-Link: /trip/[id]?newMember=1 automatically scrolls to and opens the first unrated activity to reduce friction.

---

Platform Differences

┌──────────────┬─────────────────────────────────────┬─────────────────────────────────────────────┬───────────────────────┐
│ Screen │ Desktop Web │ Mobile Web │ React Native │
├──────────────┼─────────────────────────────────────┼─────────────────────────────────────────────┼───────────────────────┤
│ Activities │ Split-pane (List on left, detail on │ List view with bottom-sheet detail drawers. │ (Not yet implemented) │
│ Tab │ right). │ │ │
│ Crew Tab │ Persistent matrix grid. │ Scrollable card stack (Groupies view). │ (Not yet implemented) │
│ Forms/Modals │ Center-screen dialogs. │ Bottom-sheet drawers (Slide up from thumb │ (Patterned in │
│ │ │ zone). │ .native.tsx) │
│ Global Nav │ Static top bar. │ Optimized for mobile browser "safe areas." │ (Patterned in │
│ │ │ │ apps/mobile) │
└──────────────┴─────────────────────────────────────┴─────────────────────────────────────────────┴───────────────────────┘

---

Screen-to-Confidence Matrix

┌────────────┬─────────────────────────────────────────┬────────────────────────────────────────────────┐
│ Screen │ User Question Answered │ Confidence Increase │
├────────────┼─────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Home │ "Is the group actually doing the work?" │ High (Visibility into group progress) │
│ Activities │ "What is the consensus?" │ Peak (Consensus Labels remove doubt) │
│ Crew │ "Do I have a travel partner?" │ High (Travel Twins create social safety) │
│ Timeline │ "Is this trip physically possible?" │ Mid (Visualizes logistical feasibility) │
│ Join │ "Is this my group's trip?" │ Mid (Contextual validation) │
│ Schedules │ "When should I book my flights?" │ High (Peak Overlap identifies the core window) │
└────────────┴─────────────────────────────────────────┴────────────────────────────────────────────────┘
