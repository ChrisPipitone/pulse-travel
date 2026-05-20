# Pulse — TODO

## Pending Setup

- [x] Create Supabase project + get credentials
- [x] Wire Supabase env vars (.env.local)
- [x] Design DB schema (trips, members, activities, ratings, events)
- [ ] Set up Supabase Auth (magic link + Google OAuth)
- [x] Set up Row Level Security (RLS) policies

## Scaffolding

- [x] Next.js + TypeScript + Tailwind + ESLint + App Router (pnpm)
- [x] Install next-themes + configure theme provider
- [x] Install Zustand
- [x] Install Supabase JS client
- [x] Set up folder structure (lib/ hooks/ types/ services/ store/ components/)
- [x] Configure CSS vars for `modern` + `editorial` themes in globals.css
- [x] Tailwind consumes CSS vars via @theme inline
- [x] Root layout wired with ThemeProvider (data-theme attribute)
- [x] Core TypeScript types defined (src/types/index.ts)
- [x] Supabase client stub (src/lib/supabase.ts)
- [x] .env.local.example created

## Design

- [x] Visual themes defined (modern + editorial) → UI_DESIGN.md
- [x] Build core components: Card, Badge (MUST/WANT/MEH), Button, Input
- [ ] Build compatibility matrix visualizer
- [ ] Build date/availability picker
- [ ] Build itinerary calendar view

## Features (MVP)

- [ ] Trip creation + invite via share link
- [ ] Member onboarding (zero friction — link → in app)
- [ ] Activity list (add, view, categorize)
- [ ] Rating flow (MUST / WANT / MEH per activity)
- [ ] Compatibility matrix view
- [ ] Date/availability layer
- [ ] Itinerary builder (drag onto calendar)

## Prod Readiness

- [ ] Create hosted Supabase project (supabase.com)
- [ ] Enable RLS on every table before any data goes in
- [ ] Write RLS policies: users can only read/write their own trip data
- [ ] Set Supabase Auth redirect URLs to prod domain
- [ ] Add prod env vars to Vercel (URL + anon key — never secret key)
- [ ] Enable Supabase Spend Cap (if ever upgraded to Pro)
- [ ] Confirm no service role key in any client-side code
- [ ] Set CORS / allowed origins in Supabase dashboard
- [ ] Smoke test auth flow on prod (magic link + Google OAuth)
- [ ] Verify `.env*` never committed (gitignore check)

## Future

- [ ] PWA support
- [ ] ***REMOVED*** links (***REMOVED***, ***REMOVED***, Booking.com)
- [ ] Calendar export (Google, Apple, Proton)
- [ ] Map view
- [ ] React Native / Expo port
- [ ] Report plugin schema bug to edmund-io/edmunds-claude-code
