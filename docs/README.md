# Pulse — Technical Documentation

All diagrams use [Mermaid](https://mermaid.js.org/) and render natively on GitHub.

---

## Index

### Architecture & Infrastructure

| Doc | What it covers |
|---|---|
| [AUTH.md](./AUTH.md) | Sign-in flows (password · OTP · Google OAuth PKCE), session lifecycle, RLS + JWT, infrastructure topology |
| [DATA_MODEL.md](./DATA_MODEL.md) | ER diagram, table relationships, RLS policy map, indexes, known gaps |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Local dev setup, migrations workflow, Vercel config, hosted Supabase, free tier limits, pre-prod checklist |
| [MONOREPO.md](./MONOREPO.md) | Turborepo + pnpm workspaces decision, package dependency graph, portability rules |

### Product

| Doc | What it covers |
|---|---|
| [PRODUCT.md](./PRODUCT.md) | **Single source of truth** — rating vocabulary, crew model, Jaccard model, positioning, launch checklist, what NOT to build |
| [COMPETITIVE.md](./COMPETITIVE.md) | Competitive landscape detail — Partiful, TripRelay, Frienzy, Wanderlog, go-to-market wedge |
| [BRANDING.md](./BRANDING.md) | Name, origin story, tagline, voice, visual identity |

### Features

| Doc | What it covers |
|---|---|
| [TRIP_FLOW.md](./TRIP_FLOW.md) | Create trip, invite code lifecycle, join flow, duplicate join handling, tier-aware member cap, trip page state machine, permission model |
| [RATING_MATRIX.md](./RATING_MATRIX.md) | MUST/MAYBE/SKIP scoring formula, data flow, optimistic updates + rollback, CompatibilityScore type, real-time sync |
| [CREW_VIEW_DESIGN.md](./CREW_VIEW_DESIGN.md) | Find Your Crew UI — card/modal design, adaptive scaling, sub-group model, build order |
| [ITINERARY_DESIGN.md](./ITINERARY_DESIGN.md) | Four-layer itinerary model — who/where/when/conflict resolution, data model implications |
| [TIERS.md](./TIERS.md) | User tier system (free/planner/enterprise), what's built, pre-deploy gaps, billing roadmap |

### Design

| Doc | What it covers |
|---|---|
| [UI_DESIGN.md](./UI_DESIGN.md) | Theme architecture, CSS custom properties, Tailwind v4 setup, component design decisions |

### Roadmap

| Doc | What it covers |
|---|---|
| [FUTURE.md](./FUTURE.md) | Post-MVP backlog organized by feature: scheduling, itinerary, tiers, monetization, auth, platform, UI polish |

---

## Diagramming conventions

| Diagram type | Mermaid syntax | Used for |
|---|---|---|
| Sequence | `sequenceDiagram` | Auth flows, request/response chains, async operations |
| Flowchart | `flowchart TD / LR` | State machines, decision trees, data pipelines |
| Graph | `graph TB / LR` | Infrastructure topology, package dependencies |
| ER | `erDiagram` | Database schema, table relationships |
| State | `stateDiagram-v2` | UI state machines (modal states, loading states) |
