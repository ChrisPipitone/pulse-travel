# Monorepo Architecture Decision

## Decision: Turborepo + pnpm workspaces

**Chosen over:** two separate repos (pulse-travel web + pulse-mobile).

## Why monorepo

**Primary reason:** "Shared code lives once — types, hooks, services, store never drift."

Without a monorepo, shared packages must be duplicated or published to npm. In practice they drift. The `Rating` type gets a new variant on web and the mobile app breaks at runtime three weeks later.

## Pros

- Types, hooks, services, store in `packages/` — one source of truth for both apps
- `.native.tsx` files live alongside `.tsx` — Metro auto-resolves, no publish step
- Single `git log` and PR for cross-app changes
- `pnpm install` once at root covers everything
- Turborepo caches builds — only rebuilds what changed
- Restructure cost is minimal now (done at ~7 files, not ~70)

## Cons

- `pnpm dev --filter=web` instead of just `pnpm dev` — slightly more CLI friction (Makefile smooths this)
- Vercel deployment needs `rootDirectory=apps/web` set in project settings
- If mobile never ships, monorepo overhead was wasted — accepted risk

## Structure

```
apps/
  web/        Next.js 16 + React 19
  mobile/     Expo (future)

packages/
  types/      @pulse/types    — shared TS interfaces
  ui/         @pulse/ui       — dual .tsx + .native.tsx primitives
  store/      @pulse/store    — Zustand stores
  services/   @pulse/services — Supabase service functions (client-injected)
  hooks/      @pulse/hooks    — custom hooks (portable)
```

## Key constraints enforced by this structure

- `packages/services` functions accept a `SupabaseClient` argument — no direct env var reads, fully portable
- `packages/ui` uses Tailwind class strings only — consuming app configures Tailwind/NativeWind
- `packages/hooks` has zero platform APIs — no `window`, no `document`, no `AsyncStorage` directly
- Each app creates its own Supabase client with its own env vars (`NEXT_PUBLIC_*` vs `EXPO_PUBLIC_*`)
