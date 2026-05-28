# MVP Architecture Optimization

This document outlines the architectural strategy for scaling Pulse Travel across Web (Mobile/Desktop) and Native platforms while maintaining a lean MVP codebase.

## 1. The "Mega-Component" Refactor
Current assessment identifies `FindYourCrew.tsx` (~825 lines) as a primary bottleneck. To scale, we must decompose this into smaller, focused units.

### The "Logic-Only" Hook Pattern
Extract all data transformation, filtering, and sorting logic into platform-agnostic hooks.
- **Goal:** UI components should only "render" data, not "calculate" it.
- **Example:** `useCrewLogic(tripId)` should handle rating calculations and sorting, returning a clean `sortedActivities` array.

### The "Slot" / Compound Component Pattern
Design layouts that accept "slots" rather than hardcoding children.
- Use a `CrewLayout` component that defines regions (Sidebar, Main, ActionBar).
- Pass different components into these slots based on the device's screen size or platform.

## 2. Shared UI Primitives (`packages/ui`)
Components in the shared UI package must be **Layout Agnostic**.
- **Constraint:** Avoid hardcoded widths (e.g., `w-[430px]`).
- **Standard:** Use `w-full` and rely on parent containers (like a 430px centered wrapper for mobile) to provide constraints.
- **Pattern:** Use the `.native.tsx` suffix for React Native specific overrides while keeping the same TypeScript interface.

## 3. State & Performance
- **Optimistic UI:** Implement immediate UI feedback for ratings (MUST/SKIP) using local state before the Supabase broadcast completes.
- **Parallel Fetching:** Maintain the parallel fetching pattern in `useTripData` to minimize Time-to-Interactive (TTI).
- **Zustand Persistence:** Evaluate `persist` middleware for `tripStore` to enable basic offline viewing on mobile web.

## 4. Scaling to React Native
- **Bridge-Ready Hooks:** Ensure hooks in `packages/hooks` do not use `window` or `document` directly so they can be shared with the RN app.
- **Theme Tokens:** Use CSS variables (Web) and shared constants (Native) to keep the "Modern" and "Editorial" themes synchronized.
