✦ Executive Summary

Problem: Pulse Travel solves the "group chat meltdown" in trip planning. It replaces fragmented, non-decisive communication with a structured
system for social coordination confidence, specifically answering "Who actually wants to do what?" and "When is everyone actually there?".

Users:

- Trip Leads: Organizers who set up the destination and propose activities.
- Trip Members: Invited friends who need to provide availability and preferences quickly.

Primary User Goals:

1.  Alignment: Reach a consensus on activities without spreadsheet fatigue.
2.  Availability: Identify the "peak overlap" window when the most people are present.
3.  Itinerary Building: Organize approved activities into a logical flow of "Stops."

---

Domain Model

┌────────────────┬────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────┐
│ Name │ Purpose │ Relationships │
├────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ User / Profile │ Represents an authenticated person and their public identity. │ Has many Memberships. │
│ Trip │ The top-level container for a specific travel event. │ Contains Members, Activities, and Stops. │
│ Member │ A User's participation in a Trip, including arrival/departure dates. │ Belongs to Trip and User. │
│ Activity │ A proposed thing to do, location, or event within a trip. │ Belongs to Trip. May be assigned to a Stop. │
│ Rating │ A Member's preference for an Activity (MUST, MAYBE, SKIP). │ Links Member to Activity. │
│ Stop │ A logical bucket (location or date range) used to organize activities. │ Belongs to Trip. Contains many Activities. │
│ Invite Code │ A unique short-string used to join a trip without manual invitation. │ Unique to a Trip. │
└────────────────┴────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────┘

---

Feature Inventory

┌──────────────────────┬────────────────────────────────────────────────────┬───────────────────────────────────┬────────────────┐
│ Feature Name │ Purpose │ User Value │ Implementation │
│ │ │ │ Status │
├──────────────────────┼────────────────────────────────────────────────────┼───────────────────────────────────┼────────────────┤
│ Social Rating │ Members vote on activities. │ Fast consensus without debate. │ Full │
│ Social Alignment │ Categorizes activities (e.g., "Split Crowd", "Safe │ Instant vibe-check of the group. │ Full │
│ Labels │ Consensus"). │ │ │
│ Availability Overlap │ Identifies the "Best Window" for the group. │ Solves the scheduling puzzle. │ Full │
│ Timeline/Stops │ Groups activities into logical sequences. │ Creates a structured itinerary. │ Full │
│ Join & Onboarding │ One-click entry + quick name setup. │ High viral conversion for invited │ Full │
│ │ │ friends. │ │
│ Progress Tracking │ Shows "X of Y rated" on the home page. │ Reduces organizer nagging. │ Full (Web) │
└──────────────────────┴────────────────────────────────────────────────────┴───────────────────────────────────┴────────────────┘

---

Screen Inventory

┌────────────────────────┬────────────┬────────────────────────────────────────────┬───────────────────────────────────────────┐
│ Name │ Route │ Purpose │ Primary Actions │
├────────────────────────┼────────────┼────────────────────────────────────────────┼───────────────────────────────────────────┤
│ Home / Command Center │ / │ Manage all active and upcoming trips. │ Create Trip, Join Trip, View Progress. │
│ Login │ /login │ Authentication entry point. │ Magic Link (OTP), Google OAuth, Password. │
│ Join / Onboarding │ /join │ Entry point for invite links. │ Join Trip, Set Display Name. │
│ Trip View (Activities) │ /trip/[id] │ The core rating and social discovery view. │ Rate Activity, Sort, Switch Tabs. │
│ Trip View (Timeline) │ /trip/[id] │ View the itinerary structure. │ Add Stop, Assign Activity to Stop. │
│ Trip View (Crew) │ /trip/[id] │ Deep dive into who is going with who. │ View Compatibility, Check Schedules. │
└────────────────────────┴────────────┴────────────────────────────────────────────┴───────────────────────────────────────────┘

---

User Flows

1. The "Invited Guest" Flow

- Starting Point: Clicks a link shared via WhatsApp/SMS.
- Steps: Login/Sign-up -> "You're Invited" landing page -> Join -> Set Display Name -> First Activity Card.
- Completion: All activities rated; moves to "Find Your Crew" view.

2. The "Trip Lead" Flow

- Starting Point: Home page "New Trip" button.
- Steps: Set Name/Destination -> Add Activities -> Create "Stops" -> Share Invite Link.
- Completion: Group members begin rating; Lead reviews "Social Labels" to finalize the plan.

---

Platform Analysis

Desktop Web

- The "Intelligence Hub": Optimized for high information density.
- Interaction: Uses a split-pane layout where the left list remains visible while the right panel handles rating and details.
- Planning Tools: Full access to Stop/Itinerary management.

Mobile Web

- The "Thumb-Zone" Experience: Optimized for one-handed coordination.
- Interaction: Uses bottom-sheet modals for details and large tap targets for MUST/MAYBE/SKIP.
- Flow: Designed for quick "burst" sessions to check ratings or add a single activity.

React Native

- The "Skeleton" Phase: apps/mobile contains a README but no full application logic yet.
- Implementation Strategy: The project uses a .native.tsx pattern in packages/ui (e.g., Button.native.tsx). Primitives are defined using
  Pressable and Text from react-native, but the full mobile app shell is post-MVP.

---

Documentation Drift Report

1.  Naming Inconsistency: Documentation and prototype files frequently refer to "Groupies" or "Groupie Modal," while the production UI and source
    code have standardized on "Crew" (e.g., FindYourCrew.tsx).
2.  Implementation vs. Docs: docs/MVP_UX_STRATEGY.md identifies a "Native App" as Low Priority/Post-MVP, yet packages/ui contains numerous
    .native.tsx implementations, suggesting a more active cross-platform effort than documented.
3.  Prototype Abandonment: The public/prototypes/ directory contains 20+ HTML files (e.g., crew-v10.html) that include "Travel Twin" cards and
    "Matrix" views which are partially implemented or visually different in the React/Next.js source.
4.  Feature Ghosting: The trip_events table exists in the Supabase schema, but there is no corresponding UI in the Next.js app to create or view
    specific "Events" separate from "Activities."
