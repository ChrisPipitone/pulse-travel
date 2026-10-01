# Pulse — Documentation Index & Authority Map

> Entry point for humans and AI assistants. Read this before using any doc.
> Trust is encoded in the **folder**. The path tells you how much to believe a file.

---

## 1. How to use this index

1. Read root `CLAUDE.md` (process + this authority contract).
2. Always load `canonical/PRODUCT.md` and `canonical/BRANDING.md`.
3. Pull the matching **reference** / **decision** doc only for the area you are working in.
4. Never load `private/research/` or `private/archive/` as truth — only when a task explicitly says to analyze them.

Every doc carries frontmatter: `tier`, `status`, `updated` (and `supersedes` / `superseded_by` where relevant).

## 2. Authority legend

| Tier | Folder | Trust | Read when |
|---|---|---|---|
| **Canonical** | `canonical/` | Source of truth | Always |
| **Reference** | `reference/` | How a subsystem works today | Working that area |
| **Decision** | `decisions/` | Why a choice was made (dated ADRs) | That area |
| **Private** | `private/` | Raw research, archive, business strategy — gitignored | Only when told |

**Conflict order (highest wins):** root `CLAUDE.md` → `canonical/` → `reference/` → accepted `decisions/`. `private/` never overrides anything. A `decisions/` file with `status: proposed` is **not** current truth.

## 3. Canonical — `canonical/`

| File | Owns | Status |
|---|---|---|
| `PRODUCT.md` | Product SSOT — rating vocab, crew model, compatibility, positioning, scope, roadmap | active |
| `BRANDING.md` | Brand SSOT — voice, origin story, tagline, anti-AI narrative, palette intent | active |
| `UX_SPEC.md` | Current implemented UX — navigation, screens, flows, platform behavior | active |
| `COMPETITIVE.md` | Positioning vs TripRelay / Frienzy / Wanderlog | active |

## 4. Reference — `reference/`

| File | Covers |
|---|---|
| `DATA_MODEL.md` | Schema, relationships, RLS map, indexes |
| `AUTH.md` | Sign-in flows, sessions, RLS + JWT |
| `TRIP_FLOW.md` | Create / invite / join lifecycle, trip-page state machine, permissions |
| `RATING_MATRIX.md` | MUST/MAYBE/SKIP scoring + Jaccard data flow |
| `DEPLOYMENT.md` | Local dev, migrations, Vercel, hosted Supabase, cost controls |
| `UI_DESIGN.md` | Theme architecture (theme source-of-record), Tailwind v4 |
| `MONOREPO.md` | Turborepo + pnpm workspaces decision |
| `MVP_ARCHITECTURE.md` | Cross-platform scaling strategy |
| `MVP_UX_STRATEGY.md` | Mobile-first / desktop-enhanced strategy |

## 5. Decision log — `decisions/`

| File | Decision | Status |
|---|---|---|
| `CREW_VIEW_DESIGN.md` | Find Your Crew sub-group model (sprint 2026-05-23) | accepted |
| `ITINERARY_DESIGN.md` | Four-layer potential→actual itinerary model (sprint 2026-05-24) | accepted |
| `NEW_USER_UX.md` | New-user friction plan + implementation log (items 1–12) | accepted |
| `ia-proposal.md` | IA pivot (3 questions + Pulse layer) — **formerly `canonical.md`** | **proposed** |

## 6. Private — `private/` (gitignored, local only)

Not in the public repo. Holds raw AI research, archived docs, internal links,
business strategy, and throwaway prototypes. Never cite as truth, and never move
its contents back into a tracked folder.

## 7. Reviews — `ui-reviews/`, `code-reviews/`

Operational logs (`ROUND_N.md`). Not authority; feed decisions.

## 8. Conflict resolution (quickref)

1. Pick the domain → consult its canonical doc first.
2. Canonical silent → consult `reference/` (mechanics) or the latest **accepted** `decisions/` ADR.
3. Same-tier conflict → newer `updated:` wins; flag the stale one.
4. A `proposed` decision vs canonical → canonical wins; surface the proposal as open.
5. Never resolve via `private/`. Escalate to the user.

## 9. Contribution ritual (prevents drift)

```
AI analysis ─────────► private/research/ (dated, frozen, non-authoritative)
        │  human selects what is true
        ▼
        ADR in decisions/ (status: proposed → accepted)
        │  human promotes
        ▼
        canonical/ or reference/ updated
```

Raw AI output is never canonical. Divergent sweeps land in `private/research/`; promotion into `canonical/` / `decisions/` is a separate, deliberate step.

## 10. Open decisions (pending human call)

- **Theme:** direction chosen = `human` (terracotta/indigo/bone). **Not yet implemented** — `reference/UI_DESIGN.md` only defines `modern` (active) + `editorial`; the `human` palette exists only as prose in the deferred `private/BRANDING_STRATEGY.md`. Implementation waits for the branding revisit; until then code stays on `modern`.
- **IA pivot:** accept or reject `decisions/ia-proposal.md`. Until then its navigation is not current truth.

## 11. Pending cleanup (not yet filed)

- `private/BRANDING_STRATEGY.md` — obsolete; mine its backlog into tickets, then drop it.
