# Pulse — Future Features & Post-MVP Backlog

Consolidated from: CLAUDE.md, TODO.md, TIERS.md, UI review rounds 1–2, and in-session design discussions.
Items marked **PRE-DEPLOY** must be resolved before any real users see the feature.

---

## Scheduling & Availability

| Item                       | Notes                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mini Gantt chart           | Each member = horizontal bar on shared timeline. Shows overlap visually. The right answer for large groups. ~2–3 days.                                                    |
| Availability heatmap       | Calendar grid, each cell colored by member-present count. Answers "best days for group activities." Natural fit with itinerary builder.                                   |
| Dedicated Members tab      | Full tab next to Activities / Find your crew. Members list with dates, searchable, sortable. Right move when trip management features grow (remove member, role changes). |
| Schedules modal (adaptive) | **IN PROGRESS** — ≤8 members: inline list. >8: summary + modal. Replaces current toggle.                                                                                  |

---

## Itinerary Builder

| Item                          | Notes                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------- |
| Drag activities onto calendar | Core feature. Auto-suggest groupings by member overlap.                         |
| Sub-group splitting           | Surface MUST/WANT items for partial-attendance days (e.g. wedding-day subsets). |
| Date/availability picker      | Per-member visual date picker tied to arrival/departure.                        |
| Calendar export               | Google, Apple, Proton.                                                          |
| AI itinerary suggestions      | Post-itinerary-builder. Depends on activity + availability data being mature.   |

---

## Compatibility Matrix

| Item                                | Notes                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| API route for matrix computation    | One source of truth. Currently all client-side. Required before matrix becomes complex enough to diverge. See `memory/project_matrix_design.md`.    |
| "Find your crew" large-group review | Explicitly deferred: review this tab after stress-test trips load. Avatar overflow, score readability, pagination all need revisit at 100+ members. |

---

## Tiers & Billing

See `docs/TIERS.md` for full detail. Summary:

| Item                         | Priority             | Notes                                                                                 |
| ---------------------------- | -------------------- | ------------------------------------------------------------------------------------- |
| Server-side tier enforcement | **PRE-DEPLOY**       | DB trigger only — direct API calls bypass it. Needs middleware or RLS policy.         |
| Expose tier to client        | **PRE-DEPLOY**       | `profiles.tier` not fetched anywhere. No upgrade prompt possible without it.          |
| Upgrade CTA + flow           | Required for billing | Show when owner hits/approaches tier cap.                                             |
| Stripe integration           | Post-MVP             | Checkout session creation + subscription management.                                  |
| Webhook handler              | Post-Stripe          | `customer.subscription.updated/deleted` → `profiles.tier`.                            |
| Soft limit warnings          | High value           | Warn at 80% of tier cap (e.g. 4/5 or 20/25 members).                                  |
| Enterprise cap decision      | Before launch        | Currently unlimited. Decide: keep unlimited or 125. Affects trigger + marketing copy. |
| Admin tooling                | Operational          | No way to manually change tier without direct DB. Needed before beta onboarding.      |
| Trial period                 | Post-billing         | 14-day planner trial on signup to drive conversion.                                   |
| Agency / white-label tier    | Long-term            | Custom caps, co-branded.                                                              |

---

## Monetization

| Item                   | Notes                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ***REMOVED*** links        | ***REMOVED***, ***REMOVED***, Booking.com. Zero friction, natural fit, commission on clicks/bookings. Highest effort/return ratio. |
| Freemium gating in UI  | Free tier enforced in UI (not just DB) for upgrade prompts.                                                                |
| One-time trip purchase | ~$5–15 per trip. No subscription fatigue.                                                                                  |
| Subscription model     | Better for travel agencies than consumers.                                                                                 |
| Ads                    | Avoid unless massive traffic.                                                                                              |

---

## Auth

| Item                            | Notes                                                                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Magic link revisit              | OTP-only chosen for MVP. Revisit magic link before prod. See `memory/project_auth_otp_revisit.md`.                                                                                                                      |
| Emails to users                 | Professionally style all emails to users. current is too utilitirian.                                                                                                                                                   |
| Google OAuth prod redirect URLs | Set in Supabase dashboard before deploy. Prod URL not yet configured.                                                                                                                                                   |
| Auth confirmation flow          | `enable_confirmations = true` in config.toml. Verify email confirmation UX is smooth for non-technical users.                                                                                                           |
| Phone number sign-in (SMS OTP)  | Supabase supports `signInWithOtp({ phone })` + Twilio/Vonage. Mobile-native flow: enter phone → SMS 6-digit code → signed in. No email required. Great for the "60 seconds" goal. Requires Supabase Pro + Twilio setup. |
| SMS invite                      | Trip owner enters a phone number → system sends SMS with invite link. Same flow as email invite but via Twilio. Bypasses email entirely — more likely to reach people immediately.                                      |
| Phone-number-only sign-up       | Let users skip email on sign-up entirely if on mobile. Phone becomes their identity. Requires phone OTP above.                                                                                                          |
| WhatsApp / iMessage share       | After invite modal, offer native share sheet (Web Share API) to send the join link via any messaging app. Zero SMS cost, works on any platform. Very low lift once invite link exists (already does).                   |

---

## Platform / Infrastructure

| Item                           | Notes                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Deploy to Vercel               | Wire hosted Supabase env vars + auth redirect URLs.                                  |
| PWA support                    | Service worker, manifest, offline-capable shell.                                     |
| React Native / Expo port       | UI layer rewrite only — zero business logic rewrite required by design.              |
| RN3: NativeWind CSS var radius | `rounded-[var(--radius-*)]` may silently fall back to 0 in RN. Needs simulator test. |

---

## Data / DB

| Item                                   | Notes                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| FK: trip_members.user_id → profiles.id | Currently soft FK — profiles fetched in two queries joined in app code. Add once FK confirmed stable. |
| Profile photo upload                   | Supabase Storage bucket + signed upload URL + profile edit UI. Noted in UI Round 1 as post-MVP.       |
| invite_code collision retry            | 8-char hex. Collision extremely unlikely but no retry logic. Add retry loop if approaching scale.     |
| Invite code expiry / revoke            | Currently permanent. No revoke without deleting trip. Post-MVP: expiry window or regenerate code.     |

---

## UI/UX — Animations (Round 1.5, all open)

| ID  | Item                                                                                 |
| --- | ------------------------------------------------------------------------------------ |
| AN1 | Modal enter/exit: slide-up mobile, fade+scale desktop. 200ms ease-out. All 4 modals. |
| AN2 | Toast slide-in/out: slide up from below + fade enter; fade + slide down exit.        |
| AN3 | Score bars animated width on mount: 0 → actual% over 500ms, staggered 50ms/row.      |
| AN4 | Matrix view switch: 150ms opacity crossfade between the 5 views.                     |
| AN5 | Rating chip tap feedback: `scale-95 → scale-100` on click.                           |
| AN6 | "Copy link" → "Copied!": fade-swap the label text. 150ms.                            |
| AN7 | Tab switch Activities ↔ Matrix: 150ms opacity fade.                                  |

---

## UI/UX — Polish (Round 1.5, all open)

| ID  | Item                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------ |
| S1  | Activity card left accent stripe: `border-l-[3px]` in own rating color. High impact.                   |
| S2  | Edit/delete icons: hide by default on desktop, show on `group-hover`. Touch keeps them visible.        |
| S3  | Avatar color consistency: sidebar + activity row chips → same PALETTE colors as matrix.                |
| S4  | Sidebar card hierarchy: trip identity card should feel like parent. Slightly heavier visual treatment. |
| S5  | "Rate" ghost badge → `bg-accent/8 border-accent/20 text-accent` (invitation, not placeholder).         |
| S6  | Travel twin heatmap: wider perceived color range. `cell-empty` → `want` → `must` at 100%.              |
| S7  | Score bar height: `h-1.5` → `h-2`.                                                                     |
| S8  | Trip card "Owner" badge → `bg-accent/10 text-accent`.                                                  |
| S9  | Invite code: `tracking-widest uppercase` on `<code>` element.                                          |
| S10 | AppNav mobile: compress to `h-12` at sm:. Subtle `hover:scale-105` on logo icon only.                  |
| S11 | Activity card hover: `hover:border-accent/25 hover:shadow-sm` (not border-lighter).                    |
| S12 | Empty state icons: standardize to SVG, no emojis.                                                      |
| C1  | Avatar color: one canonical `memberColor(id, colorMap)` helper drives all locations.                   |
| C2  | Border radius audit: all card-shaped divs → `var(--radius-card)`. Modal inner divs consistent.         |
| C3  | Trip page loading: skeleton layout matching 2-col sidebar+main structure.                              |
| UX1 | Activity card action buttons: `p-2.5` touch target on mobile (currently `p-1.5`).                      |
| UX2 | Schedules "Full trip" state: add contextual note "Set your dates to help the group plan."              |
| UX3 | Toast stack: cap at 3, dismiss oldest silently on 4th arrival.                                         |
| RN3 | NativeWind CSS var radius: verify at runtime in simulator.                                             |

---

## Features (Originally Out of Scope / Long-term)

| Item                       | Notes                                                                      |
| -------------------------- | -------------------------------------------------------------------------- |
| Map view                   | Region clustering, activity pins.                                          |
| Budget tracking per person | Per-activity cost estimates, split calculation.                            |
| React Native / Expo port   | Mobile app. Architecture already designed for zero business logic rewrite. |
| Report plugin schema bug   | `edmund-io/edmunds-claude-code` — noted from TODO.                         |
