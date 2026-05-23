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

### Features

| Doc | What it covers |
|---|---|
| [TRIP_FLOW.md](./TRIP_FLOW.md) | Create trip, invite code lifecycle, join flow, duplicate join handling, tier-aware member cap, trip page state machine, permission model |
| [RATING_MATRIX.md](./RATING_MATRIX.md) | MUST/WANT/MEH scoring formula, data flow, optimistic updates + rollback, CompatibilityScore type, real-time sync |
| [TIERS.md](./TIERS.md) | User tier system (free/planner/enterprise), what's built, pre-deploy gaps, billing roadmap |

### Design

| Doc | What it covers |
|---|---|
| [UI_DESIGN.md](./UI_DESIGN.md) | Theme architecture, CSS custom properties, Tailwind v4 setup, component design decisions |
| [BRANDING.md](./BRANDING.md) | Name, positioning, voice, visual identity |

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
