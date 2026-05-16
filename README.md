# Pulse

**Find your group's rhythm.**

Group vacation planner built around a compatibility matrix — everyone rates activities as MUST / WANT / MEH, and Pulse shows you exactly who wants what, when everyone overlaps, and how to plan a trip where nobody gets left behind.

---

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** — CSS custom property theming
- **Supabase** — Postgres + Auth (magic link + Google OAuth)
- **Zustand** — state management
- **next-themes** — runtime theme switching (modern / editorial)
- **pnpm** — package manager

## Getting Started

```bash
brew install pnpm        # if not installed
pnpm install
cp .env.local.example .env.local
# add your Supabase URL + anon key
pnpm dev
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Project Structure

```
src/
  app/              # Next.js App Router pages + layouts
  components/
    ui/             # Primitive components (dual web + RN files)
    features/       # Feature-level components
  hooks/            # Custom hooks — all data/logic lives here
  services/         # Supabase queries + API calls
  store/            # Zustand stores
  types/            # TypeScript interfaces
  lib/              # Supabase client, utilities
docs/
  UI_DESIGN.md      # Design system, theme tokens, component rules
  BRANDING.md       # Brand strategy, voice, name rationale
```

## Themes

Two built-in themes switchable at runtime:

| Theme | Feel | Fonts |
|---|---|---|
| `modern` (default) | Coral + mint, warm off-white | DM Sans |
| `editorial` | Terracotta + sand, cream | Playfair Display + Inter |

## React Native Portability

All business logic lives in hooks — zero rewrite when porting.
UI components use a dual-file pattern:
- `Button.tsx` — web (HTML + Tailwind)
- `Button.native.tsx` — RN (Pressable/View/Text + NativeWind)

Same props, same class names. Only HTML primitives differ.
