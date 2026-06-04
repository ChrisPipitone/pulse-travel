# Pulse — Group Vacation Planner

> App name: **Pulse** | Repo: `pulse-travel`
> **Product model + strategy:** `docs/canonical/PRODUCT.md` | **Brand/voice:** `docs/canonical/BRANDING.md` | **Design system:** `docs/reference/UI_DESIGN.md`
> **Doc authority map + read order:** `docs/INDEX.md` (read first)

## What It Is

Group vacation planner built around one question: *who should do what together?* Members rate activities MUST/MAYBE/SKIP; the app surfaces sub-groups (Find Your Crew), pairwise compatibility (Travel Twin), and a potential-to-actual crew pipeline via the itinerary. See `docs/canonical/PRODUCT.md` for the full rating model, crew model, positioning, and launch checklist.

## Current State

Not yet deployed. Core loop ships: create trip → invite → rate MUST/MAYBE/SKIP → Find Your Crew shows sub-groups → Timeline for itinerary. Auth works (email+password, OTP, Google OAuth). Trip page has 3 tabs: Activities, Find Your Crew, Timeline. 18 hooks, 63 tests across 16 files, 9 modal components, UI audit rounds 1–7 done. All open work in Linear ([Pulse MVP](***REMOVED***)).

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 16 + React 19 | Bleeding edge — be aware of lib compat issues |
| Language | TypeScript | Strict |
| Styling | Tailwind CSS v4 | Different from v3 — uses `@theme inline`, not tailwind.config.js |
| Themes | next-themes | `data-theme` attribute, CSS custom properties |
| State | Zustand 5 | Works identically in RN |
| Backend/DB | Supabase (Postgres) | Free tier, local + hosted both live |
| Auth | Supabase Auth | email+password, OTP, Google OAuth |
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

**Why not Gluestack UI v2:** requires react-native-web patch for React 19 — fragile on our stack.

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
| MUST/MAYBE/SKIP scoring, matrix | API route computes | One source of truth, consistent |
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

## Key Constraint
Non-technical users (family) must onboard in under 60 seconds. Share link → in app → rating → done. If it takes longer, it failed.

## Biggest Risk
Infrequent use cycle — 1–2 big trips/year. Retention is low by nature. ***REMOVED*** revenue mitigates this — revenue per session can be high even with low return visits.

---

## Linear Workflow

All open work tracked in Linear ([Pulse MVP](***REMOVED***), team `JAB`).

**Branches:** When work maps to a Linear issue, name the branch `jab-N-short-description`.
Example: `jab-13-restrict-profiles-select`

**Commits:** Append the ticket ID to the subject line.
Example: `fix: restrict profiles SELECT to co-trip members (JAB-13)`

When no ticket exists for the work, commit normally. If the work is substantial enough to survive the session, create the ticket first.

## Dev Setup
```bash
brew install pnpm          # if not installed
pnpm install               # at repo root — covers all workspaces
cp apps/web/.env.local.example apps/web/.env.local
# fill in Supabase URL + anon key
make dev                   # or: pnpm dev (turbo --filter=web)
```

---

## Code Standards

These rules apply in every session. Claude must enforce them without being asked.

### File size limits
- **Components**: 300 lines max. Above = split into sub-components in `components/[feature]/`.
- **Pages**: 250 lines max. Extract sidebar, skeleton, sub-views to separate files.
- **Services**: no hard limit, but > 250 lines = consider splitting by domain.
- **Hooks**: one concern per file. Never mix fetch + UI state in one hook.

### Canonical utility locations — never inline these
| Concern | File | Exported as |
|---|---|---|
| Date formatting | `apps/web/src/lib/date.ts` | `fmtDate`, `fmtDateRange` |
| App-wide constants | `apps/web/src/lib/constants.ts` | `UNDO_DURATION_MS`, `AVATAR_PREVIEW_CAP`, `PG_NOT_FOUND`, etc. |
| Rating display styles | `packages/types/src/index.ts` | `RATING_PILL`, `RATING_BUTTON` |
| Undo/timer pattern | `packages/hooks/src/useUndoAction.ts` | `useUndoAction` |

Never define `fmtDate` / `formatDateRange` inline in a component or page. Import from `lib/date.ts`.
Never hardcode `4000` / `5000` / `'PGRST116'` / `'23505'` — import from `lib/constants.ts`.
Never define `Record<Rating, string>` style lookup objects in components — import from `@pulse/types`.

### Services rules
- Always destructure `{ data, error }` from every Supabase call. Always throw on `error`.
- No `any` casts. Use explicit inline types (`as { id: string; trip_id: string }[]`) or the Supabase typed client.
- No silent null returns on write operations — `addActivity`, `upsertRating`, etc. must throw on failure.
- Dead branches (identical if/else arms) are bugs. Remove them.

### Component rules
- Helper components used only in one file and < 50 lines: OK inline.
- Helper components > 50 lines (even if only used in one file): extract to own file.
- Modals with their own state and > 100 lines: always extract to `components/FeatureModal.tsx`.
- No inline date formatting, no inline rating color maps, no inline magic numbers.

### Code review
Full code review lives in `docs/code-reviews/ROUND_N.md` (same pattern as `docs/ui-reviews/`).
Run a review round when a significant feature lands. Use `/review` skill or ask Claude directly.
Open items carry forward each round — do not re-evaluate completed ones.

---

## Documentation Authority

Docs are tiered by **folder** — trust is encoded in the path. Read `docs/INDEX.md` first for the full map.

| Tier | Folder | Trust | Read when |
|---|---|---|---|
| Canonical | `docs/canonical/` | Source of truth (PRODUCT, BRANDING, UX_SPEC, COMPETITIVE, ORGANIZER_MODE) | Always |
| Reference | `docs/reference/` | How a subsystem works today | Working that area |
| Decision | `docs/decisions/` | Why a choice was made (dated ADRs) | That area — `status: proposed` is NOT current truth |
| Research | `docs/research/`, `docs/archive/` | Non-authoritative AI analysis | Only when explicitly told |

**Conflict order (highest wins):** this `CLAUDE.md` → `canonical/` → `reference/` → accepted `decisions/`. Never cite `research/` or `archive/` as truth. `docs/decisions/ia-proposal.md` is an unaccepted proposal — do not treat its nav/IA as current.

**Drift rule (applies to Claude and Gemini):** raw analysis lands in `docs/research/`, dated and frozen. It becomes truth only after a human promotes it into `canonical/` or an accepted `decisions/` ADR. Never edit `canonical/` directly from a raw sweep.
