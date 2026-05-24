# Auth & Invite Flow Gaps

Audited 2026-05-23. All three user paths traced end-to-end.

---

## Paths covered

| # | Path | Status |
|---|---|---|
| 1 | Email invite → click link in email → join | Functional ✓ |
| 2 | Shared link (copy/paste or native share) → join | Functional ✓ |
| 3 | Fresh signup → home → enter invite code → join | Functional ✓ |

---

## Gaps

### G1 — Invite email has no context [HIGH — pre-launch]

**Where:** `sendInviteEmail` calls `supabase.auth.signInWithOtp` with `emailRedirectTo`. Supabase sends its default "Magic Link / Sign in" template.

**Problem:** Recipient gets a cold "click here to sign in" email with no mention of the trip name, who invited them, or Pulse. Extremely confusing for a new user. Looks like phishing.

**Fix options:**
- Supabase Pro: custom email templates (easiest, costs money)
- Transactional email service (Resend, SendGrid): send custom HTML email with invite context, include magic link or separate OTP code. More control, more infra.
- Short-term hack: add trip name to the `emailRedirectTo` URL so at least the link reads like "join Italy 2026" — but that's optics only, the email body is still generic.

**Status:** Post-MVP (requires Pro or email service). Must fix before real users.

---

### G2 — Already-authenticated user clicking a magic link gets signed out [LOW]

**Where:** `/auth/callback` calls `supabase.auth.signOut()` before `exchangeCodeForSession`.

**Problem:** If user A is logged in and clicks an email invite link (their own or otherwise), they get signed out mid-session. Functionally correct for the auth flow but jarring if they were mid-session.

**Fix:** Check if the code's email matches the current session before signing out. Server-only operation — requires an API route or Supabase Edge Function to inspect the code. Complex for the gain.

**Status:** Known limitation. Acceptable for MVP. Revisit if user reports confusion.

---

### G3 — Login page shows no context when redirected from a join link [MED] ✅ FIXED

**Where:** `login/page.tsx` — subtitle always reads "New or returning — just enter your email."

**Problem:** User clicks a shared invite link → gets redirected to `/login?returnTo=/join?code=...` → sees a generic login page with no indication they were trying to join a trip.

**Fix:** Detect `returnTo.includes('/join')` and show "Sign in to continue" instead.

**Status:** Fixed in this session.

---

### G4 — Invite code format is opaque [LOW]

**Where:** `crypto_invite_codes` migration generates 12-char hex (`a3f9c2d1e8b4`).

**Problem:** The "Join a trip" input on the home page has no format hint. Code is fine for copy-paste, unusable for verbal/visual sharing.

**Fix options:**
- Show format hint: "12-character code e.g. `a3f9c2d1e8b4`"
- Switch to human-readable codes: 3-word phrases (like Vercel preview URLs), adjective-noun-number patterns
- QR code on the invite card (ideal for in-person groups)

**Status:** Nice-to-have. Low effort fix is just adding placeholder/hint text.

---

### G5 — Fresh user with no trips has no path to get an invite code [MED]

**Where:** Home page empty state reads "Create your first trip or join one below with an invite code."

**Problem:** The empty state assumes the user already has an invite code/link. If they signed up organically (not via invite), they have no code and no guidance on how to get one. Dead end.

**Fix options:**
- Change copy: "Joining someone else's trip? Ask them to share their invite link with you."
- Add a "Don't have a code?" help section with a sample flow
- Surface a QR/share prompt for the trip owner to use

**Status:** Copy-only fix possible now. Full solution needs QR or clearer onboarding.

---

### G6 — Trip full error message is raw DB text [MED] ✅ FIXED

**Where:** `join/page.tsx` renders `joinError` verbatim. The DB trigger throws `"Trip is full: 5 member max for free tier"`.

**Problem:** Technical error message surfaces directly to the user.

**Fix:** Detect "Trip is full" in the error string and replace with user-friendly copy.

**Status:** Fixed in this session.

---

### G7 — New OTP users get auto-generated display name, no way to change it [MED] ✅ FIXED

**Where:** `on_auth_user_created` trigger sets `display_name = SPLIT_PART(email, '@', 1)`.

**Problem:** OTP users appear in trip member lists as `john.doe` etc. No post-signup name prompt. Google users are fine (trigger uses `full_name` from metadata).

**Fix:** Show a "What should we call you?" modal on first login. Check `user_metadata.onboarded`; if false and no Google `full_name`, prompt. On submit, update `profiles.display_name` + set `user_metadata.onboarded = true`.

**Status:** Fixed in this session.

---

### G8 — Invite email template (custom branding) [POST-MVP]

See G1. Tracked separately because it requires external infra decision (Supabase Pro vs. Resend vs. other).

Items needed before launch:
- [ ] Choose email provider
- [ ] Design invite email: trip name, inviter name, CTA button, Pulse branding
- [ ] Design OTP/magic link email (same provider)
- [ ] Set up domain for sending (`mail.pulse.travel` or similar)
- [ ] Configure DKIM/SPF to avoid spam filters

---

## What works — no action needed

- `returnTo` threads correctly through OTP, Google, and password sign-in paths
- `/auth/callback` handles PKCE (production) and hash/implicit (local dev) flows
- Already-a-member check in invite modal (RPC + UI state machine)
- "You're already in" screen on join page
- Trip-not-found error on join page
- ESC + backdrop close on all modals
- Native share sheet conditionally shown (Web Share API)
- OTP rate-limit errors surface (raw Supabase message, acceptable for MVP)
