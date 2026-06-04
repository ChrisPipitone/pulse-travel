# Pulse Travel Project Instructions

All development and architectural decisions must align with the strategies defined in the `docs/` folder. Pulse is a **Human-Led Group Coordination Engine**, not a generic travel planner.

## Documentation Authority — read this first

Docs are tiered by **folder**; trust is encoded in the path. Full map + read order: **`docs/INDEX.md`** (read before using any doc).

| Tier | Folder | Trust | Read when |
|---|---|---|---|
| Canonical | `docs/canonical/` | Source of truth (PRODUCT, BRANDING, UX_SPEC, COMPETITIVE, ORGANIZER_MODE) | Always |
| Reference | `docs/reference/` | How a subsystem works today | Working that area |
| Decision | `docs/decisions/` | Why a choice was made (dated ADRs) | That area — `status: proposed` is NOT current truth |
| Research | `docs/research/`, `docs/archive/` | Non-authoritative analysis | Only when explicitly told |

**Conflict order (highest wins):** this file → `canonical/` → `reference/` → accepted `decisions/`. Never cite `research/` or `archive/` as truth. `docs/decisions/ia-proposal.md` is an unaccepted IA proposal — do not treat its navigation as current.

**Drift rule:** any analysis you generate lands in `docs/research/`, dated and frozen — never written straight into `canonical/`. It becomes truth only after a human promotes it into `canonical/` or an accepted `decisions/` ADR. The current implemented UX is owned by `docs/canonical/UX_SPEC.md`.

## Foundational Mandates

### 1. Product Philosophy: "Human-Led"
- **Positioning:** "AI doesn't go on vacation, your friends do." We are the **Human Validation Layer**.
- **The Wedge:** We solve the "group chat meltdown" by visualizing where enthusiasm overlaps.
- **Core Vocabulary:** 
  - **MUST:** Non-negotiable. You're in the crew. (Weight: 3)
  - **MAYBE:** Flexible. Available capacity, not driving. (Weight: 1)
  - **SKIP:** Not interested. You're out. (Weight: 0)
- **Social Signal Labels:** Use labels like "Universal Favorite," "Strong Match," "Split Crowd," and "Niche Pick" to summarize group enthusiasm.
- **Crew Model:** The "Crew" for an activity is defined by everyone who rated it **MUST**.
- **User Tiers:** Enforce member caps based on the trip owner's tier: **Free (5)**, **Planner (25)**, **Enterprise (Unlimited)**.

### 2. UI/UX Strategy
- **Reference:** `docs/reference/MVP_UX_STRATEGY.md`
- **Philosophy:** Mobile-First, Desktop-Enhanced.
- **Onboarding:** "60-Second Constraint" — A new user must reach their first rating in < 60s.
- **Visuals:** Use the `modern` theme (Coral/Mint) by default. Avoid "AI Purple" or generic SaaS gradients.
- **Requirement:** Every UI component must be evaluated for both mobile thumb-zone interaction and desktop precision/density.

### 3. Architectural Strategy
- **Reference:** `docs/reference/MVP_ARCHITECTURE.md`, `docs/reference/MONOREPO.md`
- **Philosophy:** Logic-Only Hooks & Layout-Agnostic UI.
- **Requirement:** Decompose complex views into shared hooks (`packages/hooks`) and layout-agnostic primitives (`packages/ui`).
- **Monorepo:** Shared code (types, hooks, services, store) lives in `packages/`.
- **Cross-Platform:** Use the `.native.tsx` suffix pattern in `packages/ui` for React Native overrides.

## Technical Standards

### 1. Frontend & Styling
- **Styles:** Use TailwindCSS with CSS variable themes defined in `apps/web/src/app/globals.css`.
- **Theming:** Use CSS variables (e.g., `var(--accent)`) instead of hardcoded hex values to support theme switching.
- **Components:** Components must be 300 lines max. Pages 250 lines max. Extract sub-components early.

### 2. Data & Security
- **RLS (Row Level Security):** RLS is the primary security layer. All policies require `authenticated` role. `anon` has no write grants.
- **Recursion:** Use `SECURITY DEFINER` functions to break RLS recursion (e.g., `is_trip_member`).
- **Services:** Functions in `packages/services` must accept a `SupabaseClient` instance and throw explicit errors (no silent null returns).

### 3. Coding Patterns
- **Dates:** Always use `apps/web/src/lib/date.ts` (`fmtDate`, `fmtDateRange`). Never inline date formatting.
- **Constants:** Centralize magic numbers (timeouts, caps) in `apps/web/src/lib/constants.ts`.
- **Undo Logic:** Use the `useUndoAction` hook. Never inline `setTimeout` for destructive actions.
- **Type Safety:** No `any` in services. Use explicit interfaces or Supabase-generated types.

## Navigation & IA
- **Destinations:** Home (Triage) -> Trip Pulse (Landing) -> Agreement (Rate) -> People & Presence (Who & When) -> Plan (Itinerary).
- **Transitions:** Use the established modal system (`items-end sm:items-center`) with sheet-in animations on mobile.
