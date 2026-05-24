# Pulse — Group Vacation Planner

> App name: **Pulse** | Repo: `pulse-travel` | Dir: `activity-matrix` (rename pending)
> See `docs/BRANDING.md` for full brand strategy, `docs/UI_DESIGN.md` for design system.

## The Problem

Group vacations are hard to coordinate. Different arrival/departure dates, overlapping and conflicting interests, shared fixed events (e.g. a wedding). No tool exists to visualize group compatibility and optimize logistics.

## Use Case (Origin)

Italy trip — family + friends. Some attend a wedding for a subset of days. Everyone has activities they want to do. Need to see who wants what, find overlap, figure out where/how long to stay where.

## Core Features (MVP)

### Activity List
- Anyone in group can add activities
- Visible to all members
- Fields: name, location/region, estimated duration, category

### Rating System
- **MUST** — non-negotiable, definite crew member for this activity
- **WANT** — conditional crew; in unless timing/logistics conflict
- **MAYBE** — flexible / indifferent; joins if it works out, no loss if not
- **SKIP** — not interested; excluded from crew entirely

### Compatibility Matrix
The core differentiator. **Not** just a rating grid — the goal is to answer "who should do what together?"

#### Compatibility Model
- **Excited set** per member = activities they rated MUST or WANT
- **MAYBE = flexible**, not a conflict. Means "I'll go or skip — doesn't define my trip." Excluded from compatibility calculations entirely.
- **Jaccard similarity** between two members = `|shared excited activities| / |union of excited activities|`
  - Example: Sara excited about 5, Marco about 5, share 3 → `3/7 = 43%`
- Multi-person Jaccard: `|intersection of all excited sets| / |union of all excited sets|`
- Unrated activities are excluded (not enough signal)

#### Key Product Insight — Potential Crew vs Actual Crew
> **The crew shown in Find Your Crew is the *potential* crew — everyone who'd go under ideal conditions. The itinerary is where the *actual* crew per scheduled instance gets resolved.**

Find Your Crew does not need to solve timing. It shows who *would* go. Timing conflicts are an itinerary problem, not a crew problem. A group of 4 who all MUST an activity may split into 2+2 at scheduling time if other MUSTs conflict — that is expected and correct behaviour.

MUST = definite crew. WANT = conditional crew (in unless timing knocks them out). This distinction must be visually preserved in the Find Your Crew card — two tiers, not one flat group.

#### Five Matrix Views
All five views are always available. Multiple views exist because different people parse data differently — more views = more likely someone finds their ideal read.

| View | Key question answered | Description shown in UI |
|---|---|---|
| **By activity** | What did everyone rate each activity? | "See each activity's ratings across the whole group. Sorted by group enthusiasm score." |
| **By member** | What did this person rate across all activities? | "See each member's ratings side by side. Spot who has the most opinions and where they align." |
| **Who's in** | For each activity, which rating bucket did each member land in? | "See exactly who's excited, neutral, or unresponsive for every activity at a glance." |
| **Find your crew** | For each activity, who's excited enough to do it together? | "Activities sorted by excitement breadth. See your natural sub-group for each experience — who to invite." |
| **Travel twin** | Which members have the most overlapping excitement across all activities? | "Pairwise compatibility scores based on shared excitement (MUST + WANT overlap). Higher = more similar vacation style." |

#### Group Score (existing, unchanged)
- Per-activity group score: MUST×3 + WANT×1, MEH=0
- Used for sort order in "By activity" and "Find your crew" views

### Date / Availability Layer
- Each member sets arrival + departure dates
- Fixed shared events (e.g. wedding June 10–12) block those days for tagged members
- Activities filtered/sorted by who is present

### Itinerary Builder
See `docs/ITINERARY_DESIGN.md` for full design. Summary:

- **Layer 1 — Who:** MUST+WANT crew per activity (resolved in Find Your Crew)
- **Layer 2 — Where:** Activity `region` field clusters activities to the same days by proximity (Rome activities on Rome days, etc.)
- **Layer 3 — When:** Manual day assignment for MVP; member drags/assigns activities to calendar days constrained by arrival/departure dates and logical region grouping
- **Layer 4 — Conflict resolution:** If Person A has two MUSTs that can't share a day, they do both at different times than other crew members — the crew splits per scheduled instance. This is expected and correct.

Non-crew members can always be added to any scheduled instance at any time — the crew is a default invite list, not a locked roster.

**Future consideration:** Same activity, different date windows (e.g. "Rome Mar 21–23 vs Rome Mar 23–25") — allows sub-groups to schedule the same activity independently. Post-MVP scope.

## Out of Scope (MVP)
- No booking integration, no payments, no maps, no real-time chat

## Future Expansion
- ***REMOVED*** links (***REMOVED***, ***REMOVED***, Booking.com) — primary passive revenue path
- Budget tracking per person
- Map view with region clustering
- AI itinerary suggestions
- Calendar export (Google, Apple, Proton)
- Travel agency white-label
- React Native / Expo port

## Monetization (Ranked by effort/return)
1. *****REMOVED*** links** — zero friction, natural fit, commission on clicks/bookings
2. **Freemium** — free: 1 trip, 5 members. Paid: unlimited, export, advanced views
3. **One-time trip purchase** — ~$5–15 per trip, no subscription fatigue
4. **Subscription** — better for travel agencies than consumers
5. **Ads** — avoid unless massive traffic

## Competitive Landscape
- **Wanderlog** — itinerary focused, no group compatibility
- **TripIt** — individual only, no group voting
- **Google Trips** — dead
- **Notion/Sheets DIY** — what people actually use; our real competition
- **Differentiator**: MUST/WANT/MAYBE/SKIP matrix + potential-crew-to-actual-crew resolution via itinerary is genuinely novel

## Viability
- Pain point: real, universal, underserved in group niche
- Technical complexity: medium-low MVP, medium with real-time collab
- Revenue ceiling: modest standalone; strong with ***REMOVED*** + freemium
- Verdict: solid side project / passive income vehicle

---

## UI/UX Design Philosophy

> **Eyes-only information density** — every key fact should be readable at a glance. No clicking around, no deduction, no hovering to reveal hidden state.

Principles:
- Names are always visible, not just on hover. If a face/avatar appears, its name label appears with it.
- Color encodes meaning consistently — the same member has the same color across all views; the same rating has the same color in every context.
- Empty/unrated state is visible and explicit, not just the absence of something. Show "unrated" as a column or cell so gaps are obvious.
- Pagination is a last resort — prefer showing more with scrolling. When pagination is unavoidable, label both axes clearly.
- Multiple views of the same data are additive — each view should surface something the others don't. No view should exist purely as a layout variant.
- Progressive disclosure only for actions (edit, delete), not for information.

Applied examples:
- **By activity / By member**: colored cells + score bars give rank and distribution simultaneously — no hover needed to see who's excited vs indifferent.
- **Who's in**: member avatars with name labels always visible in rating-column cells. Consistent avatar colors let you track a person across activity rows without searching.
- **Find your crew**: activities sorted by excited-member count. The sub-group is immediately visible — no inference needed. MUST avatars distinguished from WANT avatars so commitment level is clear.
- **Travel twin**: N×N member grid with compatibility % in each cell, color-coded from low to high. You can read "Marco and Sara are 85% compatible" in one glance without clicking into anything.
- **Activity list**: per-member rating chips visible on the list row itself — no click required to see who rated what.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 16 + React 19 | Bleeding edge — be aware of lib compat issues |
| Language | TypeScript | Strict |
| Styling | Tailwind CSS v4 | Different from v3 — uses `@theme inline`, not tailwind.config.js |
| Themes | next-themes | `data-theme` attribute, CSS custom properties |
| State | Zustand 5 | Works identically in RN |
| Backend/DB | Supabase (Postgres) | Free tier, not set up yet |
| Auth | Supabase Auth | Magic link + Google OAuth, not set up yet |
| Deployment | Vercel | Free hobby tier, zero-config |
| Package mgr | **pnpm** | v11 via brew |

### Supabase Cost Controls
- Free tier: no credit card, no auto-upgrade, no autoscaling
- Free limits: 500MB DB, 5GB bandwidth, 50k MAU, 2 projects
- Gotcha: free projects **pause after 7 days inactivity** (manual resume)
- If upgraded to Pro: enable **Spend Cap** immediately

### Tailwind v4 Notes
- No `tailwind.config.js` — config lives in CSS via `@theme inline`
- CSS vars defined in `:root` and `[data-theme]` selectors in `globals.css`
- Tailwind tokens map to CSS vars: `--color-accent: var(--accent)` etc.

---

## Mobile Strategy
MVP = Next.js web (mobile-responsive) + PWA. Future = Expo/React Native.
Port must require **zero business logic rewrite** — only UI layer rewrite.

**Why not Gluestack UI v2:** requires react-native-web patch for React 19 — fragile on our stack. Decided against it.

### Architecture Rules (enforce from day one)
- All logic in custom hooks — zero business logic inside components
- No inline Supabase calls in components — always via service function or hook
- No `window`/`document`/`localStorage` — abstract behind hooks
- Zustand for state (works identically in RN)
- Tailwind + NativeWind — same class names, cross-platform

### Logic Placement: Hybrid Model

| Logic type | Lives in | Why |
|---|---|---|
| Raw activity list, member profiles | Hook fetches raw | Safe, fast local sort/filter |
| MUST/WANT/MEH scoring, matrix | API route computes | One source of truth, consistent |
| Itinerary suggestions | API route | Complex, expensive |
| UI filtering, sorting, search | Hook (client) | Snappy, no round-trip |
| Auth, permissions, billing | API route always | Never trust client |

### Dual-File Component Pattern
Every primitive in `src/components/ui/` ships as two files:
- `Button.tsx` — web (HTML primitives + Tailwind)
- `Button.native.tsx` — RN (View/Text/Pressable + NativeWind)

Same props interface. Same class names. Metro auto-resolves `.native.tsx` in RN.

### Monorepo Structure (Turborepo + pnpm workspaces)
```
apps/
  web/              # Next.js 16 + React 19 (App Router)
  mobile/           # Expo (future)

packages/
  types/            # @pulse/types — shared TS interfaces
  ui/               # @pulse/ui — dual .tsx + .native.tsx primitives
  store/            # @pulse/store — Zustand stores (portable)
  services/         # @pulse/services — Supabase fns (client-injected, portable)
  hooks/            # @pulse/hooks — custom hooks (portable, no platform APIs)
```

Key constraints:
- `packages/services` accepts a `SupabaseClient` arg — no env var reads directly
- `packages/ui` Tailwind class strings only — consuming app configures Tailwind/NativeWind
- `packages/hooks` zero platform APIs — no `window`, `document`, `AsyncStorage`
- Each app creates its own Supabase client (NEXT_PUBLIC_* vs EXPO_PUBLIC_*)

Vercel deployment: set `rootDirectory=apps/web` in project settings.

---

## Current State (session handoff)
- [x] Monorepo: Turborepo + pnpm workspaces (`apps/web`, `packages/*`)
- [x] Next.js 16 + React 19 + TypeScript + Tailwind v4 + ESLint in `apps/web/`
- [x] pnpm v11 (brew), `.npmrc` `ignore-scripts=true`, `pnpm-workspace.yaml` `allowBuilds` set
- [x] ThemeProvider wired in `apps/web/src/app/layout.tsx` (`data-theme` attribute)
- [x] Both themes (modern + editorial) in `apps/web/src/app/globals.css` as CSS vars
- [x] Core TypeScript types in `packages/types/src/index.ts`
- [x] Supabase client in `apps/web/src/lib/supabase.ts` (placeholder fallback for build safety)
- [x] `.env.local` → local Supabase, `.env.prod` → hosted Supabase (gitignored)
- [x] UI primitives (web only): Badge, Button, Card, Input in `packages/ui/src/`
- [x] `.native.tsx` files created (Badge, Button, Card, Input)
- [x] Zustand store: `packages/store/src/tripStore.ts`
- [x] Service functions: `packages/services/src/trips.ts`
- [x] Local Supabase: `supabase/config.toml` (pg17) + `supabase/seed.sql`
- [x] DB schema: `supabase/schema.sql` — 8 tables, enum type, indexes, seeded categories
- [x] RLS policies: `supabase/rls.sql` — 27 policies, no security definer, inline subqueries only
- [x] Migrations: `supabase/migrations/` — init_schema + init_rls + revoke_anon_select, applied local + hosted
- [x] Hosted Supabase: project `qphuglkhzdwqamslekyc` (West US Oregon), linked, migrations pushed
- [x] SupabaseProvider wired into `apps/web/src/app/layout.tsx` via `Providers.tsx`
- [x] Auth flow: email+password, OTP, Google OAuth (`/login`), protected routes, sign out
- [x] Seed: 10 users, 3 trips (Italy/Barcelona/Tokyo), activities, ratings — password login works
- [x] RLS: is_trip_member() SECURITY DEFINER fixes trips↔trip_members recursion (migration 0000)
- [x] RLS: trips SELECT policy allows created_by = auth.uid() so INSERT→SELECT works before membership (migration 0005)
- [x] Trip page `/trip/[id]` — activity list, per-member rating chips (capped at 5+N), real-time
- [x] Activity CRUD — add/edit/delete with modal, RLS enforced (adder or trip owner)
- [x] Activity detail modal — MUST/WANT/MEH chip rating, group ratings, optimistic update + rollback
- [x] Toggle-to-unrate — tapping active rating removes it; optimistic remove + rollback; deleteRating service + removeRating store action
- [x] 11 hooks, 52 tests passing
- [x] Trip member limit — tier-aware BEFORE INSERT trigger (free=5, planner=25, enterprise=unlimited) replacing old 50-member hard cap
- [x] Invite code lookup — SECURITY DEFINER RPC (non-member safe)
- [x] Home page — trip list with member count, create trip modal, join via invite code
- [x] Trip create flow — insert trip + add creator as first member
- [x] Join flow — `/join?code=<code>` page, trip preview, redirect on success
- [x] Technical docs — AUTH.md, DATA_MODEL.md, TRIP_FLOW.md, RATING_MATRIX.md, DEPLOYMENT.md (all Mermaid)
- [x] Profile creation trigger — on_auth_user_created fires AFTER INSERT on auth.users, display_name from meta or email prefix
- [x] Auth config — enable_confirmations = true, max_frequency = "60s" (config.toml + supabase restart)
- [x] Input validation — all forms: trim, maxLength, URL format, date order, email regex; DB CHECK constraints on all tables (migration 0006)
- [x] Hosted Supabase — all migrations (0000–0006) applied and in sync with local
- [x] Compatibility matrix UI — 5 views: Rundown (card layout), Travel twin (Jaccard heatmap), By activity, By member, Who's in. Jaccard model (MUST+WANT excited set, MEH excluded). Per-view descriptions. Pagination.
- [x] Global AppNav — sticky header, route-aware (Pulse wordmark on home, ← Trips on trip pages), sign out button; wired in Providers.tsx above {children}
- [x] Home page layout — trip card grid (sm:2col, lg:3col), MemberDots overlap avatars, empty state, skeleton loading, join section card
- [x] Trip page layout — two-column (sidebar + main) at lg:, sticky sidebar with trip info / schedule / invite cards; tab bar for Activities / Find your crew
- [x] Mobile: all 5 matrix views have mobile card layouts at sm: breakpoint; no horizontal overflow
- [x] Cross-browser overflow fix — removed `flex flex-col` from body (caused Firefox width calc divergence); `overflow-x-clip` on each page's `<main>` instead
- [x] ESC key closes all 4 modals (CreateTripModal, ActivityFormModal, ActivityDetailModal, MemberDatesModal)
- [x] UI audit rounds 1 + 2 complete — see `docs/ui-reviews/`; RN3 open (needs simulator)
- [x] User tiers — `user_tier` enum (free/planner/enterprise) on profiles; tier-aware member limit; see `docs/TIERS.md`
- [x] Stress-test seed — 200 bulk users, 9 trips at 10/15/20/50/75/100/125/150/200 members with random ratings
- [ ] Deploy to Vercel + wire hosted Supabase env vars + auth redirect URLs
- [ ] **PRE-DEPLOY: tiers enforcement** — DB trigger only; needs server-side guard + billing before real users see tiers (see `docs/TIERS.md`)

## Dev Setup
```bash
brew install pnpm          # if not installed
pnpm install               # at repo root — covers all workspaces
cp apps/web/.env.local.example apps/web/.env.local
# fill in Supabase URL + anon key
make dev                   # or: pnpm dev (turbo --filter=web)
```

## Key Constraint
Non-technical users (family) must onboard in under 60 seconds. Share link → in app → rating → done. If it takes longer, it failed.

## Biggest Risk
Infrequent use cycle — 1–2 big trips/year. Retention is low by nature. ***REMOVED*** revenue mitigates this — revenue per session can be high even with low return visits.
