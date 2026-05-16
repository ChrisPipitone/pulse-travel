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
- **MUST** — non-negotiable
- **WANT** — would love to do
- **MEH** — indifferent / skip

### Compatibility Matrix
- Visual matrix: people × activities, colored by rating
- Group score per activity (weighted: MUST=3, WANT=1, MEH=0)
- Cluster view: who should do what together
- Conflict view: activities where people diverge

### Date / Availability Layer
- Each member sets arrival + departure dates
- Fixed shared events (e.g. wedding June 10–12) block those days for tagged members
- Activities filtered/sorted by who is present

### Itinerary Builder
- Drag activities onto calendar
- Auto-suggest: group activities on days when most interested members overlap
- Sub-group splitting: surface MUST/WANT items for partial-attendance days

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
- **Differentiator**: MUST/WANT/MEH matrix + date-aware group splitting is genuinely novel

## Viability
- Pain point: real, universal, underserved in group niche
- Technical complexity: medium-low MVP, medium with real-time collab
- Revenue ceiling: modest standalone; strong with ***REMOVED*** + freemium
- Verdict: solid side project / passive income vehicle

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

### Folder Structure
```
src/
  lib/              # supabase client, utils — portable
  hooks/            # all custom hooks — portable
  types/            # TS interfaces — portable
  services/         # supabase queries, API calls — portable
  store/            # zustand stores — portable
  components/
    ui/             # primitives — dual web+RN files
    features/       # feature components — web, rewrite for RN
  app/              # Next.js App Router — replace with Expo Router for RN
```

---

## Current State (session handoff)
- [x] Scaffolded: Next.js 16 + React 19 + TypeScript + Tailwind v4 + ESLint
- [x] pnpm installed (brew), `.npmrc` has `ignore-scripts=true`
- [x] ThemeProvider wired in root layout (`data-theme` attribute)
- [x] Both themes (modern + editorial) defined in `globals.css` as CSS vars
- [x] Core TypeScript types in `src/types/index.ts`
- [x] Supabase client stub in `src/lib/supabase.ts` (needs env vars)
- [x] `.env.local.example` created
- [x] Clean build verified (`pnpm build` passes)
- [ ] Git repo not yet created — name: `pulse-travel` (private)
- [ ] Supabase project not yet created
- [ ] First components not yet built (Badge, Button, Card — dual web+RN)

## Desktop / New Session Setup
```bash
brew install pnpm          # if not installed
git clone <repo-url>
cd pulse-travel            # or whatever dir
pnpm install               # .npmrc handles ignore-scripts
cp .env.local.example .env.local
# fill in Supabase URL + anon key once project is created
pnpm dev
```

## Key Constraint
Non-technical users (family) must onboard in under 60 seconds. Share link → in app → rating → done. If it takes longer, it failed.

## Biggest Risk
Infrequent use cycle — 1–2 big trips/year. Retention is low by nature. ***REMOVED*** revenue mitigates this — revenue per session can be high even with low return visits.
