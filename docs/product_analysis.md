✦ Core Product Analysis

The Pulse Travel architecture reveals a product that is fundamentally about reducing the high social cognitive load of group decision-making.

- Actual Value Created: Transformation of noisy individual preferences into actionable group signals. The value is not "storing a list of things
  to do," but "visualizing where the group's enthusiasm overlaps."
- Essential Concepts: If all UI disappeared, the product's identity would remain in its Pairwise Jaccard similarity scores (Travel Twins) and
  Consensus Labels (Universal Favorite vs. Split Crowd).
- Essential to Existence: The Rating is the primary unit of data; the Consensus is the primary unit of value.

---

Domain Classification

Core Domain Concept (The "Heart")

- Trip: The primary namespace. Without a Trip, there is no shared context.
- Member: The source of data. Without individual agents, there is no coordination.
- Activity: The object of coordination. The system exists to evaluate these.
- Rating (MUST, MAYBE, SKIP): The atomic unit of truth. This is the product's primary input.
- Consensus / Social Signal: The derived emotional state of a group regarding an activity (e.g., "Split Crowd"). This is the product's primary
  output.

Supporting Domain Concept (Replaceable/Supporting)

- Activity Category: A taxonomy aid. Helpful for sorting but doesn't change the coordination engine.
- Invite Code: A security/access mechanism. Essential for UX but not the core "travel coordination" logic.
- User Profile: Supporting identity. The system cares about "Member A," not necessarily the global "User" identity beyond authentication.

UI / Workflow Construct (The Interface)

- Stop: An organizational aid. It helps the "Trip Lead" build a schedule, but the coordination (Rating) can happen entirely without them.
- Member Dates / Schedules: Supporting mechanisms for the "Availability Engine." While useful, the core product is about activities, with
  schedules acting as a filter for feasibility.
- Progress Banner: A workflow motivator ("X of Y rated"). Exists primarily to drive user behavior toward the success state.

---

Social Alignment Analysis
Primary Product Engine: Confirmed.
The system is not a travel booker; it is a Group Alignment Engine.

- Ratings are the fuel.
- Consensus Labels are the dashboard.
- Crowd Segmentation (Find Your Crew) is the navigation.
  The application logic focuses heavily on computeTopTwins (Jaccard similarity) and activityStatusLabel. This proves that the product's value is
  derived from calculating the "Social Shape" of the group.

---

Stop Analysis
Classification: Planning Aid / UI Abstraction.

- Stops exist to transition the product from "Social Coordination" (Discovery Phase) to "Logistical Execution" (Itinerary Phase).
- Without Stops: The product would still function as a highly effective "Group Mood Board" or "Activity Ranker." It would solve "What should we
  do?" but would fail to solve "How do we get there?".
- In-Code Role: Currently acts as a stop_id foreign key on activities, used primarily for sorting in the by-stop view.

---

User Success Analysis
A user considers the product successful when:

1.  Decision Finality: The "Split Crowd" items are removed, and "Universal Favorites" are identified.
2.  Coordination Confidence: The Trip Lead no longer feels they are "guessing" what people want.
3.  Maximum Overlap: The trip dates are set to the window where the peakOverlap count is highest.
4.  Social Stickiness: Users discover their "Travel Twin," creating social validation for their choices.

---

Product Thesis

"This product exists to help groups reach social coordination confidence without the friction of manual debate."

Candidate Alternative:
"This product exists to help groups visualize the hidden shape of their collective enthusiasm."
