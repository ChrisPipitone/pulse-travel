# Pulse Travel Project Instructions

All development and architectural decisions must align with the strategies defined in the `docs/` folder.

## Foundational Mandates

### 1. UI/UX Strategy
- **Reference:** `docs/MVP_UX_STRATEGY.md`
- **Philosophy:** Mobile-First, Desktop-Enhanced.
- **Requirement:** Every new UI component must be evaluated for both mobile thumb-zone interaction and desktop precision/density.

### 2. Architectural Strategy
- **Reference:** `docs/MVP_ARCHITECTURE.md`
- **Philosophy:** Logic-Only Hooks & Layout-Agnostic UI.
- **Requirement:** Avoid "Mega-Components." Decompose complex views into shared hooks (`packages/hooks`) and layout-agnostic primitives (`packages/ui`).

## Technical Standards
- **Monorepo:** Adhere to the pnpm workspace structure.
- **Cross-Platform:** Use the `.native.tsx` suffix pattern in `packages/ui` for React Native overrides.
- **Styles:** Use TailwindCSS with the CSS variable themes defined in `apps/web/src/app/globals.css`.
