# Pulse

**Find your group's rhythm.**

Group vacation planner built around a compatibility matrix — everyone rates activities as MUST / WANT / MEH, and Pulse shows you exactly who wants what, when everyone overlaps, and how to plan a trip where nobody gets left behind.

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
# Creates 10 test users, 3 trips (Italy/Barcelona/Tokyo), activities, ratings

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

**When do you need a migration?**

Any time you change the database schema — add/drop a table or column, add an index, create a function, change an RLS policy, add a trigger. Never alter the schema by running raw SQL in Studio and forgetting to write a migration file; the change will be lost on the next `make reseed` and won't reach production.

**Typical migration workflow:**

```bash
# 1. Create the file
make migration name=add_budget_to_trips

# 2. Write your SQL in the generated file
#    supabase/migrations/<timestamp>_add_budget_to_trips.sql

# 3. Apply it locally without losing data
make migrate

# 4. Test. When ready for production:
make push
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

Three sign-in methods on `/login`:

**Email + password**

- Works for seeded users locally (`password123`) and any user who registered with a password.

**OTP code (email)**

1. Enter email → "Send code"
2. Enter 6-digit code from email

**Google OAuth**

1. Click "Continue with Google"
2. Complete Google auth → redirected back

### Local dev — seed users

10 test users are created by `seed.sql`. All use password `password123`.

| Email             | Name  | Role in seed data     |
| ----------------- | ----- | --------------------- |
| marco@example.com | Marco | Italy trip owner      |
| sara@example.com  | Sara  | Italy + Barcelona     |
| lena@example.com  | Lena  | Italy + Barcelona     |
| chris@example.com | Chris | Italy + Barcelona     |
| alex@example.com  | Alex  | Barcelona owner       |
| priya@example.com | Priya | Barcelona + Tokyo     |
| kai@example.com   | Kai   | Barcelona + Tokyo     |
| yuki@example.com  | Yuki  | Tokyo owner           |
| nadia@example.com | Nadia | No trips (unassigned) |
| tom@example.com   | Tom   | No trips (unassigned) |

### Local dev — checking OTP emails

Local Supabase intercepts all outbound email. OTP codes land in **Mailpit** (not your real inbox):

```
http://127.0.0.1:54324
```

### Google OAuth — local setup

Credentials live in `supabase/.env` (gitignored). The Makefile auto-loads this file before starting Supabase — no manual `export` needed.

Required Google Cloud Console config:

- Authorized JavaScript origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- Authorized redirect URIs: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`, `http://127.0.0.1:54321/auth/v1/callback`

---

## Testing

```bash
# Run all hook tests
pnpm --filter @pulse/hooks test

# Watch mode
pnpm --filter @pulse/hooks test:watch

# Type check (web app)
pnpm --filter pulse-web exec tsc --noEmit
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

## Themes

Two built-in themes switchable at runtime via `data-theme` attribute:

| Theme              | Feel                         | Fonts                    |
| ------------------ | ---------------------------- | ------------------------ |
| `modern` (default) | Coral + mint, warm off-white | DM Sans                  |
| `editorial`        | Terracotta + sand, cream     | Playfair Display + Inter |

---

## React Native Portability

All business logic lives in hooks — zero rewrite when porting to RN.
UI primitives use a dual-file pattern:

- `Button.tsx` — web (HTML + Tailwind)
- `Button.native.tsx` — RN (Pressable/View/Text + NativeWind)

Same props, same class names. Metro auto-resolves `.native.tsx` in RN builds.
