# Pulse

**Find your group's rhythm.**

Group vacation planner built around a compatibility matrix — everyone rates activities as MUST / WANT / MEH, and Pulse shows you exactly who wants what, when everyone overlaps, and how to plan a trip where nobody gets left behind.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 — CSS custom property theming |
| State | Zustand 5 |
| Backend / DB | Supabase (Postgres + Auth) |
| Package manager | pnpm v11 |
| Monorepo | Turborepo |

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

# 5. Start the dev server
make dev
# App → http://localhost:3000
```

---

## Make Targets

| Command | What it does |
|---|---|
| `make up` | Start local Supabase (Docker) |
| `make down` | Stop local Supabase |
| `make reset` | Drop DB + replay migrations + seed |
| `make seed` | Apply seed.sql to running DB |
| `make reseed` | Full reset: drop → migrate → seed |
| `make clear` | Wipe data rows, keep schema |
| `make dev` | Start Next.js dev server |
| `make status` | Show local Supabase URLs + keys |
| `make migration name=<name>` | Create a new migration file |
| `make push` | Push migrations to hosted Supabase |
| `make types` | Generate TypeScript types from local DB schema |

---

## Auth

Two sign-in methods on `/login`:

**OTP code (email)**
1. Enter email → "Send code"
2. Check email for 6-digit code
3. Enter code → signed in

**Google OAuth**
1. Click "Continue with Google"
2. Complete Google auth
3. Redirected back and signed in

### Local dev — checking emails

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
  migrations/           # SQL migrations (applied in order)
  schema.sql            # DB schema reference
  rls.sql               # RLS policies reference
  seed.sql              # Dev seed data
  config.toml           # Local Supabase config
  .env                  # Local secrets — gitignored, never commit
```

---

## Environment Files

| File | Purpose | Committed? |
|---|---|---|
| `apps/web/.env.local` | Local dev Supabase URL + anon key | No |
| `apps/web/.env.prod` | Hosted Supabase URL + anon key | No |
| `supabase/.env` | Google OAuth credentials for local Supabase | No |

---

## Themes

Two built-in themes switchable at runtime via `data-theme` attribute:

| Theme | Feel | Fonts |
|---|---|---|
| `modern` (default) | Coral + mint, warm off-white | DM Sans |
| `editorial` | Terracotta + sand, cream | Playfair Display + Inter |

---

## React Native Portability

All business logic lives in hooks — zero rewrite when porting to RN.
UI primitives use a dual-file pattern:

- `Button.tsx` — web (HTML + Tailwind)
- `Button.native.tsx` — RN (Pressable/View/Text + NativeWind)

Same props, same class names. Metro auto-resolves `.native.tsx` in RN builds.
