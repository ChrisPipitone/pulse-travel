# Pulse: Outsider Review & Strategic Analysis

## 1. Executive Summary
**Pulse** (formerly Activity Matrix) is a high-utility group travel planning application that solves the "infinite group chat" problem. By focusing on **sub-group formation** (who wants to do what) rather than just a linear itinerary, it addresses a genuine pain point in group logistics.

The technical foundation is solid (Next.js + Supabase), and the design philosophy ("Find your group's rhythm") is emotionally resonant.

---

## 2. Gaps & Unaddressed Areas
### Technical Gaps
- **Billing Integration:** Missing Stripe or equivalent. This is the biggest hurdle to monetization.
- **Server-side Tier Enforcement:** The database trigger is a good start, but RLS or middleware needs to block API-level bypasses before real money is involved.
- **Profile Onboarding:** Users can sign up but might not have a profile row immediately (trigger missing in some paths).
- **Mobile Polish:** The `.native.tsx` files are drifting from the web implementation and need a dedicated sync/test cycle.

### UX Gaps
- **The "Empty Trip" Problem:** A new owner creates a trip and sees an empty activity list. There's a high "effort to value" gap here.
- **Social Momentum:** When rating, users don't see "live" feedback of who else is rating *right now*, which could drive engagement.
- **Offline Access:** Crucial for travel. PWA support or the mobile app is a "Must" for the actual trip phase.

---

## 3. Market Landscape: Is it worth pursuing?
**YES.** Most travel apps (Wanderlog, TripIt, Travefy) focus on the *what* and *when*. Pulse focuses on the **who**.

### Competitors:
- **Wanderlog:** Great for discovery and mapping, but group collaboration often feels like a shared document where one person does the work.
- **Travefy:** Excellent for professional travel agents, but too complex/expensive for a group of friends.
- **Splitwise:** Not a travel app, but Pulse could eventually eat its lunch by integrating budget/cost sharing into activities.

**The Pulse Edge:** The "MUST/WANT/MEH" matrix is a psychological masterstroke. It removes the "politeness barrier" where people say "I'm fine with whatever" while secretly being unhappy.

---

## 4. Income Avenues
- **Tiered Subscriptions (SaaS):** 
    - *Free:* 5 members (perfect for small families/couples).
    - *Planner ($9–15/trip or $49/year):* 25 members + Itinerary exports + Custom regions.
    - *Enterprise (B2B):* Travel agencies / Wedding planners. White-labeled version.
- *****REMOVED*** Integration (High Potential):**
    - Automatically link MUST/WANT activities to *****REMOVED*****, *****REMOVED*****, or **Booking.com**. 
    - *Revenue:* 5–10% commission on every booking made through the app.
- **One-time "Trip Unlock":** Some users hate subscriptions. A $10 "Premium Trip" unlock is a low-friction alternative.

---

## 5. MVP Analysis
### What’s missing from MVP?
- **Manual Itinerary Builder:** Users need to move from "We want to do this" to "We are doing this on Tuesday." Without this, they still need a spreadsheet.
- **Basic Billing:** Even if it's just a manual "Pro" toggle for beta testers.

### What can be deferred (Post-MVP)?
- **Smart Scheduling:** The "auto-bin-packing" algorithm is cool but not necessary for the first 100 users.
- **Map View:** While nice, it's a "level 2" feature. The Matrix is the core value.
- **Budget Tracking:** Don't build a second Splitwise yet. Focus on the crew.

---

## 6. The Main Draw (The "Why")
The reason users will put money into Pulse is **Harmony**. 
Group trips are stressful. Pulse promises that "Nobody gets left behind" and "Nobody is forced to do something they hate." 

**The Hook:** The moment a user sees a "Crew" of 4 people for a specific activity they also love, the app has provided value. They feel validated and excited.

---

## 7. Distribution & Growth
- **The Viral Loop:** Every trip created requires 5–20 other people to join. Each "Joiner" is a potential "Owner" for their next trip. This is a built-in K-factor.
- **Micro-Influencers:** Target "Group Trip Organizers" on TikTok/Instagram. They are the ones suffering the most.
- **Partnerships:** Boutique hotels or Airbnbs could send a Pulse invite link in their welcome email ("Plan your stay with your group!").

---

## 8. Recommendations for Change
- **Activity Templates:** To solve the "Empty Trip" problem, give users "Starter Packs" (e.g., "3 Days in Rome", "Best of Tokyo").
- **Double Down on Mobile:** Travel happens on phones. The Web App needs to feel like a Native App (PWA) immediately.
- **Simplify the Invite:** A QR code on a "Trip Card" that can be scanned in person would be huge for the "60-second goal."

---

## 9. Strategic Decisions & Analysis

### 9.1 Target Persona
- **Status:** MVP target is **"The Spreadsheet Friend"** (the internal group planner).
- **Post-MVP:** Expand features to support **"The Wedding Planner / Pro"** (B2B/Power users).
- **Strategy:** Focus UI on reducing the friction of data entry and organization for the planner, while keeping the "Joiner" experience ultra-light.

### 9.2 The 60-Second Goal
- **Status:** Untested. 
- **Action:** Before launch, perform a "Coffee Shop Test"—hand the phone to someone unfamiliar with the app and see if they can join a trip and rate 3 activities in under 60 seconds without guidance.

### 9.3 Data Privacy: Invite Code Analysis
The current **8-character hex** invite code (`substr(md5(random()), 1, 8)`) offers approximately **4.3 billion combinations** ($16^8$).

**Is it enough?**
- **For Social Trips:** Yes. It's "security through obscurity." It's unlikely someone will guess a specific trip code by accident.
- **For "Family" Trips (Private):** It depends on your risk tolerance. An 8-char hex code is vulnerable to "enumeration attacks" (someone running a script to find *any* valid trip).

**Recommendations for Production:**
1. **Increase Entropy:** Move to a 12-char hex or a 10-char Alphanumeric (Base62) code. 
2. **"Locked" Trips:** Add a "Locked" toggle for the Owner. Once everyone has joined, the invite code is deactivated.
3. **Regenerate Codes:** Allow the owner to "Reset Invite Code" if it's leaked.
4. **Member Approval:** For high-privacy trips, the owner must "Approve" new joiners from a pending queue.

---

## 10. Data Security & Privacy Audit
The current implementation relies heavily on Supabase Row Level Security (RLS). While the foundation is solid, several privacy gaps exist that could be problematic for a production launch.

### 10.1 Core Strengths
- **RLS Enabled on All Tables:** No data is accessible without a valid JWT, and the `anon` role is fully revoked.
- **Cascade Deletes:** Deleting a trip or user correctly wipes all associated activities and ratings, supporting "Right to be Forgotten."
- **Membership-Based Access:** Activities and ratings are strictly gated behind the `trip_members` junction table.

### 10.2 Vulnerabilities (Privacy Gaps)
- **Profile Scraping:** The `profiles: read any` policy allows any authenticated user to read the display name and avatar of *any* other user. 
    - *Risk:* A malicious user could scrape your entire user base.
    - *Fix:* Restrict `profiles` select to users who share a trip with the viewer.
- **Invite Code Entropy (Enumeration):** As noted in 9.3, 8-char hex codes are susceptible to bot scanning.
- **PII Leakage in Fallbacks:** The `handle_new_user` trigger falls back to the email prefix for `display_name`. 
    - *Risk:* Users might inadvertently leak their identity (e.g., `john.doe@` becomes `john.doe`) to anyone in a shared trip.
- **Raw DB Exceptions:** DB triggers (like member limits) throw raw Postgres errors. 
    - *Risk:* Exposes internal schema names and logic to the frontend/client.

### 10.3 Infrastructure & Auth
- **Google OAuth Scopes:** Ensure you are only requesting `email` and `profile`. Avoid over-permissioning.
- **OTP Rate Limiting:** Ensure Supabase OTP limits are configured to prevent SMS/Email fatigue attacks.
- **Session Duration:** For a travel app, sessions should be relatively long (users don't want to log in mid-flight), but sensitive actions (like deleting a trip) should require a recent "fresh" login.

### 10.4 The "Family" Privacy Roadmap
To win the trust of private groups (families, weddings), implement:
1. **Hidden Profiles:** Option for users to hide their profile from non-friends.
2. **Invite Expiry:** Codes that expire after 24 hours or after X joins.
3. **Trip Locking:** As suggested in 9.3, a "hard lock" that prevents any new joins regardless of the code.

---

## 11. Maximum Security & Privacy: Final Pass
A deep-dive audit of the database functions and RLS policies revealed a few high-priority "leakage" points that should be plugged before a production release.

### 11.1 Information Leakage in SQL Functions
- **`get_trip_by_invite_code`:** Currently returns `SELECT *`. 
    - *Risk:* Returns internal fields like `created_by` (Owner UUID) to anyone with the link.
    - *Fix:* Explicitly select only `name`, `destination`, `start_date`, and `end_date`.
- **`is_trip_member_by_email`:** Allows "fishing" for trip attendance.
    - *Risk:* A user can verify if a specific email address is part of a trip. While UUIDs are masked, the "Yes/No" response is a privacy leak.
    - *Fix:* Ensure this is only usable by the Trip Owner or restrict its usage to the invite flow logic.

### 11.2 Subscription Privacy
- **Leaking Tiers:** The `profiles: read any` policy exposes the `tier` (subscription status) of every user.
    - *Risk:* Competitors or malicious users can see who is a "Planner" or "Enterprise" user, which is sensitive business data and personal financial signal.
    - *Fix:* Moving `tier` to a separate `user_settings` table with strict `id = auth.uid()` RLS, or excluding it from the general `profiles` select.

### 11.3 Data Integrity & "Right to be Forgotten"
- **User Deletion Blocks:** Currently, a user cannot delete their account if they have added activities, because of Foreign Key constraints without `ON DELETE CASCADE`.
    - *Fix:* Use `ON DELETE SET NULL` for `activities.added_by` or `CASCADE` if you want the data removed entirely. For a travel app, "Anonymize on Delete" (setting the name to "Deleted User") is usually the best balance.

### 11.4 Security Definer Risks
- **Search Path Protection:** Most functions correctly set `search_path = public`, which is excellent. Ensure *all* new functions follow this to prevent search-path hijacking attacks.
- **Trigger Exceptions:** Ensure that "Trip is full" exceptions don't leak the owner's tier in a way that allows a user to "guess" the owner's plan if they aren't supposed to know.

### 11.5 Maximum Privacy Mode (The "Gold Standard")
To offer the highest level of privacy:
1. **Invite-Only Profiles:** By default, your profile is only visible to people you share a trip with.
2. **Encrypted Invite Codes:** The current hex codes are random, but moving to signed/encrypted tokens would prevent any form of enumeration.
3. **Activity Masking:** Allow users to mark specific activities as "Private" (e.g., "Surprise Proposal at Trevi Fountain") so only specific sub-group members see them.

---

## 12. Competitive "Steal" List
To win against established players like Wanderlog and TripIt, Pulse should "borrow" their best patterns while keeping the unique "Crew" focus.

- **From Wanderlog (Collaborative Map):** The "Quick Add from Map" feature. Let users browse a map of their destination and tap MUST/WANT directly on points of interest.
- **From TripIt (Email Parsing):** The "Forward to Plan" feature. Let users forward flight/hotel confirmation emails to `plans@pulse.travel` to auto-populate the itinerary skeleton.
- **From Linear (Workflow):** The "Keyboard First" philosophy. Travel planning is tedious; being able to rate activities with `1`, `2`, `3` keys without touching a mouse would make the "Planner" friend addicted.
- **From Splitwise (Debt Settlement):** Simple "Who paid for what" tracking *inside* the activity card. "Marco paid for the Vatican tour" → auto-splits among the MUST/WANT crew for that slot.

---

## 13. Project-Wide Recommendations & Observations
### The "AI-First" Workflow (The MD-Hell Exit)
You are currently in "Markdown Hell." To fix this, migrate to **Linear + MCP**.
- **The Concept:** Treat the AI (Claude/Gemini) as your "Project Manager."
- **The Setup:** Use the Linear Free Tier + Linear Agent API.
- **The Result:** You stop editing `.md` files. You tell the AI "We need to fix the RLS leak," and the AI creates the Linear issue, tracks the sub-tasks, and updates the status when the PR is merged. This keeps your head in the code and the "management" in the background.

### Final Observations
- **Visual Cohesion:** The "Editorial" vs "Modern" theme toggle is a unique selling point. It makes the app feel like a lifestyle choice, not just a utility.
- **Architectural Scalability:** The choice of Next.js 16 + Supabase is perfect for this. You have very little "boilerplate" debt.
- **The "Grandma" Test:** Your biggest risk is complexity. The "Crew" view is brilliant but requires a mental shift. Keep the labels simple: "I'm In," "I'd Go," "Not for me."

---

*Final Strategic Review & Competitive Analysis — May 24, 2026*
