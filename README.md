# Pulse

**Find your group's rhythm.**

Group vacation planner built around one question: *who should do what together?* Everyone rates activities MUST / MAYBE / SKIP, and Pulse surfaces sub-groups, compatibility scores, and an itinerary pipeline — so the trip is planned around real enthusiasm, not assumed consensus.

---

## Stack

| Layer           | Choice                                        |
| --------------- | --------------------------------------------- |
| Frontend        | Next.js 16 + React 19 + TypeScript            |
| Styling         | Tailwind CSS v4 — CSS custom property theming |
| State           | Zustand 5                                     |
| Backend / DB    | Supabase (Postgres + Auth)                    |
| Package manager | pnpm v11                                      |
| Monorepo        | Turborepo                                     |

---

## Prerequisites

- [pnpm](https://pnpm.io) v11+ — `brew install pnpm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — required for local Supabase
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase`

---

## Local Dev Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up env vars
cp apps/web/.env.local.example apps/web/.env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# (values from `make up` output — see below)

# 3. Set up Google OAuth credentials for local Supabase
# Create supabase/.env (gitignored):
echo "SUPABASE_AUTH_GOOGLE_CLIENT_ID=your-client-id" >> supabase/.env
echo "SUPABASE_AUTH_GOOGLE_SECRET=your-client-secret" >> supabase/.env

# 4. Start local Supabase (Docker)
make up
# Outputs: Project URL, anon key — copy into apps/web/.env.local

# 5. Load seed data
make reseed
# Creates test users, trips, activities, ratings

# 6. Start the dev server
make dev
# App → http://localhost:3000
```

---

## Make Targets

### Local Supabase

| Command       | When to use                                                                           |
| ------------- | ------------------------------------------------------------------------------------- |
| `make up`     | Start local Supabase (Docker). Run once per session or after `make down`.             |
| `make down`   | Stop local Supabase. Safe to run anytime — no data lost (Docker volume persists).     |
| `make status` | Print local Supabase URLs and anon key. Useful if you lost the output from `make up`. |

### Database — reset and seed

| Command       | When to use                                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make reseed` | **Full reset.** Drops the DB, replays all migrations in order, runs `seed.sql`. Use when you want a clean known state or after pulling migrations written by someone else. Destroys all local data. |
| `make reset`  | Alias for `make reseed` — same behaviour.                                                                                                                                                           |
| `make seed`   | Re-runs `seed.sql` against the running DB without touching the schema. Use when you want to reload seed data but the schema is already correct. Truncates all data rows first.                      |
| `make clear`  | Wipes all data rows but keeps the schema and `activity_categories` intact. Useful for manual testing with a clean slate.                                                                            |

### Migrations

Migrations live in `supabase/migrations/` and are applied in filename order. The filename prefix is a timestamp — never rename or reorder them.

| Command                      | When to use                                                                                                                                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make migrate`               | Apply any pending migrations to the running local DB **without resetting data.** Use this when you write a new migration and want to apply it without losing your current rows. If the migration fails, check the error and fix the file before re-running. |
| `make migration name=<name>` | Create a new timestamped migration file in `supabase/migrations/`. Always use this instead of creating the file manually — it ensures the timestamp prefix is correct. Example: `make migration name=add_budget_column`                                     |
| `make push`                  | Push all migrations to the **hosted** Supabase project. Only run this when you are ready to apply schema changes to production. Requires the project to be linked (`make link ref=<project-ref>`).                                                          |

**Typical migration workflow:**

```bash
make migration name=add_budget_to_trips
# Write SQL in the generated file
make migrate          # apply locally without losing data
make push             # when ready for production
```

**After `make migrate`, if PostgREST shows "Database error querying schema":**

```bash
supabase stop && supabase start
```

PostgREST caches the schema at startup — a restart forces a reload.

### Remote (hosted Supabase)

| Command                       | When to use                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `make link ref=<project-ref>` | Link the CLI to a hosted Supabase project. Run once after creating a new hosted project. The ref is in your Supabase dashboard URL. |
| `make push`                   | Push pending migrations to the hosted project. Does not push seed data — never run `make seed` against production.                  |

### Development

| Command      | When to use                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make dev`   | Start the Next.js dev server at `http://localhost:3000`.                                                                                                |
| `make types` | Regenerate TypeScript types from the local DB schema into `packages/types/src/supabase.gen.ts`. Run after any migration that changes tables or columns. |

---

## Auth

Three sign-in methods on `/login`: email+password, OTP code, Google OAuth.

**Seed users (local dev)** — all use password `password123`:

| Email             | Name  |
| ----------------- | ----- |
| marco@example.com | Marco |
| sara@example.com  | Sara  |
| lena@example.com  | Lena  |
| chris@example.com | Chris |
| alex@example.com  | Alex  |
| priya@example.com | Priya |
| kai@example.com   | Kai   |
| yuki@example.com  | Yuki  |

**OTP emails (local)** — intercepted by Mailpit at `http://127.0.0.1:54324`

---

## Testing

```bash
pnpm --filter @pulse/hooks test          # run all hook tests
pnpm --filter @pulse/hooks test:watch    # watch mode
pnpm --filter pulse-web exec tsc --noEmit  # type check
```

Tests live in `packages/hooks/src/__tests__/`. Stack: Vitest + @testing-library/react + happy-dom.

---

## Monorepo Structure

```
apps/
  web/                  # Next.js 16 — App Router

packages/
  types/                # @pulse/types — shared TypeScript interfaces
  ui/                   # @pulse/ui — UI primitives (web + .native.tsx for RN)
  store/                # @pulse/store — Zustand stores
  services/             # @pulse/services — Supabase query functions
  hooks/                # @pulse/hooks — custom hooks + tests

supabase/
  migrations/           # SQL migrations (applied in order by filename timestamp)
  schema.sql            # DB schema reference (keep in sync with migrations)
  rls.sql               # RLS policies reference (keep in sync with migrations)
  seed.sql              # Dev seed data — local only, never push to production
  config.toml           # Local Supabase config
  .env                  # Local secrets — gitignored, never commit
```

---

## Environment Files

| File                  | Purpose                                     | Committed? |
| --------------------- | ------------------------------------------- | ---------- |
| `apps/web/.env.local` | Local dev Supabase URL + anon key           | No         |
| `apps/web/.env.prod`  | Hosted Supabase URL + anon key              | No         |
| `supabase/.env`       | Google OAuth credentials for local Supabase | No         |

---

## Docs & Workflow

All product and technical documentation lives in `docs/`. The index is at [`docs/README.md`](docs/README.md).

**Key files:**

| File | Purpose |
| ---- | ------- |
| `CLAUDE.md` | AI context: stack, architecture rules, code standards, Linear workflow |
| `docs/PRODUCT.md` | **Single source of truth** for rating vocabulary, crew model, positioning, and launch checklist |
| `docs/RATING_MATRIX.md` | Scoring formula, data flow, CompatibilityScore type |
| `docs/CREW_VIEW_DESIGN.md` | Find Your Crew UI — card/modal design, sub-group model |
| `docs/BRANDING.md` | Origin story, positioning, voice |

**Doc update rule:** Any `feat:` or `refactor:` commit that changes product-facing behaviour or vocabulary should be accompanied by a doc update in the same session. A post-commit hook will prompt you if you forget. `docs/PRODUCT.md` is the canonical source — update it first when vocabulary or the product model changes, then update feature docs that reference it.

**Task tracking:** All open work lives in [Linear (Pulse MVP)](***REMOVED***). Not in `.md` files.
