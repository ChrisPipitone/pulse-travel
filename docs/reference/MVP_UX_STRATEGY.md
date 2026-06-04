---
tier: reference
status: active
updated: 2026-06-04
---

# MVP UX Strategy: Cross-Platform Strengths

Pulse Travel follows a **"Mobile-First, Desktop-Enhanced"** strategy. Planning happens on the desktop; coordination happens on the phone.

## 1. Priority Matrix
| Platform | Priority | Primary Use Case | Focus |
| :--- | :--- | :--- | :--- |
| **Mobile Web** | **High** | Viral sharing, quick voting, on-the-go checking. | Immersive, app-like feel. |
| **Desktop Web** | **Medium** | Initial trip setup, deep planning, itinerary building. | Information density & precision. |
| **Native App** | **Low (Post-MVP)** | Real-time travel, offline access, notifications. | High-performance gestures. |

## 2. Philosophy: Social Coordination Confidence
We are not building a rating app or a spreadsheet. We are building **social coordination confidence**.
- **Social Alignment > Raw Ratings:** A 7.2 average doesn't tell the story. A "Split Crowd" (5 Love / 5 Hate) is different from a "Safe Consensus" (10 Mild Likes).
- **Distribution of Enthusiasm:** Our UI must prioritize showing *who* is aligned and the *shape* of that alignment, not just numeric scores.
- **Fast Interpretation:** A mobile user should understand the "vibe" of an activity in under 2 seconds.
- **60-Second Onboarding Constraint:** A non-technical user receiving a share link must reach their first rating in under 60 seconds. Every screen, modal, and interaction on the join → rate path must be evaluated against this. If it takes longer, the feature failed.

## 3. Mobile Browser (Safari/Chrome)
The goal is to simulate a native app experience to build trust and engagement.
- **Thumb Zone Design:** Keep primary actions (Rate, Build) in a sticky bottom bar.
- **Safe Area Insets:** Use `pb-[env(safe-area-inset-bottom)]` to prevent overlap with OS navigation bars on iPhone. *(Current gap — not yet applied across all sticky bottom bars and modals.)*
- **Bottom Sheets:** Use drawer-style modals (`items-end sm:items-center`) for activity details instead of full-page transitions. Already implemented.
- **Affinity Stack Cards:** Each activity card acts as an "Intelligence Card" showing consensus strength and subgroup clusters at a glance.
- **Tactile Feedback:** `navigator.vibrate` is Android Chrome only — iOS Safari does not support it. Do not design around it as a core interaction; treat it as progressive enhancement on Android only.

## 4. Desktop Web (The Command Center)
Leverage horizontal space to reduce friction for the "Trip Lead."

### MVP
- **Activity Detail Split-Pane:** On `lg:` breakpoints, clicking an activity card should open the detail/rating view in a persistent right panel instead of a modal overlay. This replaces the current `CrewModal` on desktop. The left pane shows the sorted activity list; the right pane shows crew + rating UI. Modals remain for mobile.
- **Keyboard Shortcuts:** `Esc` to close modals (already implemented via `useModalEscape`). `Cmd+K` search is a near-term addition.
- **Precision Hover:** Hover states to reveal "Who's Going" details without requiring clicks.

### Post-MVP
- **Map Split-Pane:** Persistent map alongside the itinerary list. Out of scope until itinerary builder ships.
- **Drag & Drop:** Dragging activities into stops to build the timeline visually. Requires itinerary builder.

## 5. Social Visualization Patterns
To scale from 5 to 30 people, we avoid "avatar walls" and use progressive disclosure:

### Near-term (MVP-eligible)
- **Activity Status Labels:** High-signal emotional labels derived from the rating distribution. Examples:
  - "Universal Favorite" — everyone rated MUST/MAYBE
  - "Strong Match" — majority MUST, few SKIP
  - "Split Crowd" — significant MUST and SKIP camps
  - "Niche Favorite" — 1–2 MUST, rest unrated or MAYBE
  - "No Signal" — mostly unrated
  These replace or augment the current numeric group score and give the group instant social context.
- **Enthusiasm Banding:** Grouping people by interest level (MUST/MAYBE/SKIP) rather than a raw list. Already partially implemented in `CrewModal` (Counting on it / If it works out / Skipping sections).

### Post-MVP
- **Cluster Discovery:** Visualizing similarity between users (e.g., "You align 91% with Sam") to foster social stickiness. Travel Twin view is the foundation.
- **The "Group Shape":** A top-level view showing how the entire group clusters or naturally splits into two distinct sub-groups.

## 6. Optimization Tactics for Launch
1. **The "Wait for It" Interaction:** Every button must have a visible `active` state and a loading indicator for network requests.
2. **Visual Continuity:** The "Italian Summer" aesthetic (creams, oranges, teals) must be consistent across both views via the `modern` theme.
3. **Responsive Images:** Use Next.js `Image` component so mobile users don't download desktop-resolution images.
4. **No Hover-Only Actions on Mobile:** Any feature exposed via `group-hover:opacity-100` or `title=""` tooltip must have a touch-accessible fallback. Hover-only = invisible on iPhone.
