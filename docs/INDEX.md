# Pulse — Documentation Index & Authority Map

> Entry point for humans and AI assistants (Claude + Gemini). Read this before using any doc.
> Trust is encoded in the **folder**. The path tells you how much to believe a file.

---

## 1. How to use this index

1. Read root `CLAUDE.md` / `GEMINI.md` (process + this authority contract).
2. Always load `canonical/PRODUCT.md` and `canonical/BRANDING.md`.
3. Pull the matching **reference** / **decision** doc only for the area you are working in.
4. Never load `research/` or `archive/` as truth — only when a task explicitly says to analyze them.

Every doc carries frontmatter: `tier`, `status`, `updated` (and `supersedes` / `superseded_by` where relevant).

## 2. Authority legend

| Tier | Folder | Trust | Read when |
|---|---|---|---|
| **Canonical** | `canonical/` | Source of truth | Always |
| **Reference** | `reference/` | How a subsystem works today | Working that area |
| **Decision** | `decisions/` | Why a choice was made (dated ADRs) | That area |
| **Research** | `research/` | Non-authoritative analysis | Only when told |
| **Archive** | `archive/` | Superseded / obsolete | Rarely; history only |

**Conflict order (highest wins):** root `CLAUDE.md`/`GEMINI.md` → `canonical/` → `reference/` → accepted `decisions/`. `research/` and `archive/` never override anything. A `decisions/` file with `status: proposed` is **not** current truth.

## 3. Canonical — `canonical/`

| File | Owns | Status |
|---|---|---|
| `PRODUCT.md` | Product SSOT — rating vocab, crew model, compatibility, positioning, scope, roadmap | active |
| `BRANDING.md` | Brand SSOT — voice, origin story, tagline, anti-AI narrative, palette intent | active |
| `UX_SPEC.md` | Current implemented UX — navigation, screens, flows, platform behavior | active |
| `COMPETITIVE.md` | Positioning vs TripRelay / Frienzy / Wanderlog | active |
| `ORGANIZER_MODE.md` | Forward B2B organizer-role strategy (JAB-86) | active |

## 4. Reference — `reference/`

| File | Covers |
|---|---|
| `DATA_MODEL.md` | Schema, relationships, RLS map, indexes |
| `AUTH.md` | Sign-in flows, sessions, RLS + JWT |
| `TRIP_FLOW.md` | Create / invite / join lifecycle, trip-page state machine, permissions |
| `RATING_MATRIX.md` | MUST/MAYBE/SKIP scoring + Jaccard data flow |
| `DEPLOYMENT.md` | Local dev, migrations, Vercel, hosted Supabase, cost controls |
| `TIERS.md` | Tier/billing system + roadmap |
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

## 6. Research — `research/`

Non-authoritative AI snapshots. Do not cite as truth.

| File | What | Status |
|---|---|---|
| `product_analysis.md` | Gemini domain-concept snapshot | superseded |
| `user_journey.md` | Gemini journey / confidence snapshot | superseded |

## 7. Archive — `archive/`

| File | Why archived |
|---|---|
| `screen_inventory.md` | Superseded by `canonical/UX_SPEC.md` |
| `product-alignment-review.md` | Research; evidence behind `decisions/ia-proposal.md` |

## 8. Reviews — `ui-reviews/`, `code-reviews/`

Operational logs (`ROUND_N.md`). Not authority; feed decisions.

## 9. Conflict resolution (quickref)

1. Pick the domain → consult its canonical doc first.
2. Canonical silent → consult `reference/` (mechanics) or the latest **accepted** `decisions/` ADR.
3. Same-tier conflict → newer `updated:` wins; flag the stale one.
4. A `proposed` decision vs canonical → canonical wins; surface the proposal as open.
5. Never resolve via `research/` or `archive/`. Escalate to the user.

## 10. Contribution ritual (prevents drift)

```
AI analysis ─────────► research/ (dated, frozen, non-authoritative)
        │  human selects what is true
        ▼
        ADR in decisions/ (status: proposed → accepted)
        │  human promotes
        ▼
        canonical/ or reference/ updated
```

Raw AI output is never canonical. Gemini = divergent sweeps → `research/`. Claude = convergent promotion → `canonical/` / `decisions/`.

## 11. Open decisions (pending human call)

- **Theme:** `modern` (coral+mint, per `reference/UI_DESIGN.md` + `canonical/BRANDING.md`) vs `human` (terracotta/indigo, in the obsolete `BRANDING_STRATEGY.md`). Resolve and delete the loser.
- **IA pivot:** accept or reject `decisions/ia-proposal.md`. Until then its navigation is not current truth.

## 12. Pending cleanup (not yet filed)

Still in `docs/` root, awaiting extraction-then-archive:

- `BRANDING_STRATEGY.md` — obsolete; extract its Linear backlog first, then archive.
- `summary.md` — research; mine its drift report into Linear tickets, then archive.
