# Technical Review: Pulse

## 1. The Good: Architectural Portability
The project structure is exceptionally clean for a monorepo.
- **Hook-First Logic:** Moving all business logic into `@pulse/hooks` and data fetching into `@pulse/services` is a senior-level move. It keeps the UI layer "dumb" and ensures that the eventual React Native port will be a matter of writing UI, not re-solving the same problems.
- **Dual-file UI Pattern:** The `*.native.tsx` strategy in `@pulse/ui` is implemented well. You've matched props and Tailwind class names (via NativeWind) across platforms, which is the "holy grail" of cross-platform React development.
- **Parallel Fetching:** In `useTripData.ts`, you use `Promise.all` to fetch trips, members, and activities in parallel. This significantly reduces initial load time compared to sequential `await` calls.

## 2. The Great: Sync & Real-time
Your real-time strategy is pragmatic and robust.
- **Re-fetch vs. Patch:** Instead of trying to surgically patch the Zustand store on every tiny Postgres change (which often leads to state desync), you simply re-fetch the relevant chunk of data. This is much easier to debug and ensures the UI always reflects the database source of truth.
- **Zustand Usage:** The store is simple and focused. Using a single `useTripStore` for the current active trip view prevents the complexity of passing deep props down through the activity list.

## 3. The "Interesting": Database Resilience
- **Invite Code Retries:** I noticed the `createTrip` service has a 5-attempt loop to handle `invite_code` collisions. While 8-char hex collisions are rare, having the retry logic shows a high attention to detail for production edge cases.
- **Security Definers:** Using `SECURITY DEFINER` for `get_trip_by_invite_code` is the correct (and only) way to allow non-members to "peek" at a trip before joining without breaking RLS.

## 4. Areas for Improvement (The "Bad")
### Component Bloat
The main trip page (`apps/web/src/app/trip/[id]/page.tsx`) is a **963-line monolith**. 
- **The Issue:** It’s managing the state for about 8 different modals (Add, Edit, Dates, Invite, etc.) and handling complex delete-with-undo logic.
- **Recommendation:** 
    - Extract the "Sidebar" and "Main Content" into their own components.
    - Use a **Modal Manager** pattern. Instead of `const [showDatesModal, setShowDatesModal] = useState(false)`, use a single `activeModal` state in the store or a local reducer to avoid the "state explosion" at the top of the file.

### Logic Leaks in `CompatibilityMatrix.tsx`
This file is **43KB**. It’s not just a UI component; it’s performing heavy data transformations (scoring, sorting, grouping) inside the component file.
- **Recommendation:** Move the "Matrix Math" (scoring MUST/WANT/MEH) into a dedicated utility file in `@pulse/services` or `@pulse/logic`. This makes it testable in isolation without mounting a React component.

### CSS Variable Risks on Native
In `Button.native.tsx`, you use `rounded-[var(--radius-btn)]`. 
- **Concern:** NativeWind v4 supports CSS variables, but it's often fragile depending on how the styles are injected. Ensure you have a "Default" fallback in your `tailwind.config` or a theme provider that handles these for the native build to avoid all buttons suddenly becoming square if the var fails to resolve.

## 5. Technical Questions & Suggestions
- **Why no `is_member` FK?** In `DATA_MODEL.md`, you mention that `trip_members.user_id -> profiles.id` is a "soft FK." Is there a reason you aren't using a hard Foreign Key constraint here? It would prevent orphan members if a profile is ever deleted.
- **Optimistic UI:** You have `useRateActivity` which uses optimistic updates. Have you considered adding "Skeleton" states for the activity cards during the re-fetch phase to prevent the "layout flicker" when real-time updates kick in?
- **Performance at Scale:** If a trip grows to 50 members and 100 activities, the `getRatings` query (which fetches *all* ratings for a trip) will become a bottleneck. You might want to consider paginating the activity list or fetching ratings lazily as the user scrolls.

---

### Final Verdict
**Score: 8.5/10.** This is professional-grade code. The monorepo setup is better than most "pro" startups. If you can break down that `TripPage` monolith and move the matrix math out of the UI, you'll have a codebase that is ready for a team of 10 to jump into.

---
*Review by Gemini CLI — May 24, 2026*
