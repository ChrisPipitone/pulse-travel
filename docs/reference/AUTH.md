---
tier: reference
status: active
updated: 2026-06-04
---

# Authentication

Pulse uses [Supabase Auth (GoTrue)](https://supabase.com/docs/guides/auth) for all authentication. Three sign-in methods are supported. After sign-in, all data access is enforced by Postgres RLS — the auth server is not involved in subsequent requests.

---

## Stack

| Component          | Role                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| GoTrue             | Auth server — issues JWTs, manages sessions, sends OTP emails, handles OAuth       |
| Supabase JS client | Browser-side — calls GoTrue, stores session in `localStorage`, auto-refreshes JWTs |
| `auth.users`       | GoTrue-managed table — stores encrypted passwords, tokens, provider metadata       |
| `auth.identities`  | One row per provider per user — used to look up user by email + provider           |
| `public.profiles`  | App-managed table — display name, avatar; joined to `auth.users` via matching `id` |
| Postgres RLS       | Row-level security — enforces data access using `auth.uid()` from the JWT          |

---

## Sign-in Methods

### 1 — Email + Password

```mermaid
sequenceDiagram
    participant B as Browser
    participant GT as GoTrue
    participant PG as Postgres

    B->>GT: POST /auth/v1/token {email, password}
    GT->>PG: SELECT from auth.users WHERE email = ?
    PG-->>GT: row + bcrypt hash
    GT->>GT: verify password (bcrypt) · sign JWT
    GT-->>B: {access_token, refresh_token, user}
    B->>B: store in localStorage
```

**Key points:**

- Password hashed with bcrypt (`pgcrypto.crypt`) — stored in `auth.users.encrypted_password`
- `auth.identities` must have a row with `provider = 'email'` — GoTrue looks up user by provider, not just email column
- GoTrue scans `email_change` as a non-nullable string — seed data must include `email_change = ''` and `email_change_token_new = ''` or login returns 500

---

### 2 — OTP (email code)

```mermaid
sequenceDiagram
    participant B as Browser
    participant GT as GoTrue
    participant E as Email (Mailpit local / inbox prod)

    B->>GT: POST /auth/v1/otp {email}
    GT->>GT: generate 6-digit code · store hash
    GT->>E: send email with code
    GT-->>B: {message: "check your email"}

    B->>GT: POST /auth/v1/verify {email, token, type: "email"}
    GT->>GT: verify code · sign JWT
    GT-->>B: {access_token, refresh_token, user}
    B->>B: store in localStorage
```

**Key points:**

- Passwordless — user only needs email access
- Local dev: GoTrue intercepts all outbound email → Mailpit at `http://127.0.0.1:54324`
- OTP type is `'email'` (not `'magiclink'`) — returns a 6-digit code, not a clickable link
- Rate limit: `max_frequency = "1s"` in `supabase/config.toml` — increase to `"60s"` before prod

---

### 3 — Google OAuth (PKCE)

```mermaid
sequenceDiagram
    participant B as Browser
    participant CB as /auth/callback (Next.js)
    participant GT as GoTrue
    participant G as Google OAuth

    B->>GT: GET /auth/v1/authorize?provider=google
    GT->>GT: generate code_verifier + code_challenge
    GT-->>B: redirect to Google with code_challenge
    B->>G: user approves scopes
    G-->>GT: redirect with authorization code
    GT-->>B: redirect to /auth/callback?code=<supabase_code>
    B->>CB: page loads
    CB->>GT: POST /auth/v1/token?grant_type=pkce {code, code_verifier}
    GT->>GT: verify code_verifier matches challenge · sign JWT
    GT-->>CB: {access_token, refresh_token, user}
    CB->>B: store in localStorage · redirect to /
```

**PKCE explained:** The browser generates a random `code_verifier` and sends only its SHA-256 hash (`code_challenge`) to Google. The auth code in the redirect URL is useless without the original verifier — an intercepted URL cannot be exchanged. The verifier is held in memory and sent only in the final token request.

**Local dev difference:** Local Supabase returns tokens in the URL hash (`#access_token=...`) — the implicit flow. The callback page detects which path: `?code=` present → PKCE exchange; absent → listen for `onAuthStateChange('SIGNED_IN')`.

---

## Session Management

```mermaid
flowchart TD
    LS["localStorage\naccess_token · JWT · 1h expiry\nrefresh_token · rotates on use"]
    RC[Supabase JS client\nauto-refresh before expiry]
    GT[GoTrue]
    V{valid?}
    NR["new access_token\n+ refresh_token\nold token invalidated"]
    F[TOKEN_REFRESH_FAILED]
    SO[useSession clears state\nuser signed out]

    LS -->|JWT near expiry| RC
    RC -->|POST /auth/v1/token\ngrant_type=refresh_token| GT
    GT --> V
    V -->|yes| NR
    NR --> LS
    V -->|no — revoked or expired| F
    F --> SO
```

| Setting                         | Value      | Effect                                                                       |
| ------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| `jwt_expiry`                    | 3600s (1h) | Access token lifetime                                                        |
| `enable_refresh_token_rotation` | true       | Old refresh token invalidated on each use                                    |
| `refresh_token_reuse_interval`  | 10s        | Grace window — prevents false invalidation when two requests race to refresh |

---

## How RLS Consumes the JWT

Every Postgres query from an authenticated client carries the JWT in the `Authorization` header. PostgREST extracts `auth.uid()` from the token and sets it as a session variable — no network call to GoTrue per query.

```mermaid
sequenceDiagram
    participant B as Browser
    participant PR as PostgREST
    participant PG as Postgres

    B->>PR: GET /rest/v1/trips · Authorization: Bearer JWT
    PR->>PG: SET request.jwt.claims · run as authenticated role
    PG->>PG: auth.uid() = sub claim from JWT
    PG->>PG: RLS policy calls is_trip_member(trip_id)
    Note over PG: SECURITY DEFINER — bypasses RLS<br/>on trip_members to avoid recursion
    PG->>PG: SELECT from trip_members WHERE user_id = auth.uid()
    PG-->>PR: rows where policy passes
    PR-->>B: filtered JSON response
```

`is_trip_member(uuid)` runs as the function owner (`postgres` role), not the caller. Without this, `trips` SELECT policy would query `trip_members`, which would trigger `trip_members` SELECT policy, which would query `trips` — infinite recursion.

---

## Infrastructure

### Local Dev

```mermaid
graph TB
    subgraph next["Next.js dev server · localhost:3000"]
        App["App\nNEXT_PUBLIC_SUPABASE_URL=127.0.0.1:54321"]
    end

    subgraph docker["Docker — managed by Supabase CLI"]
        Kong["Kong API Gateway · :54321\n/auth/v1 → GoTrue\n/rest/v1 → PostgREST"]
        GT["GoTrue\nauth server"]
        PR["PostgREST\nREST API"]
        MP["Mailpit\n:54324 — intercepts all outbound email"]
        PG["Postgres 17 · :54322\nauth schema · public schema"]
    end

    App -->|HTTP| Kong
    Kong --> GT
    Kong --> PR
    GT -->|queries| PG
    PR -->|queries| PG
    GT -->|email| MP
```

### Production

```mermaid
graph LR
    subgraph vercel["Vercel"]
        App["Next.js\nedge / serverless"]
    end

    subgraph supabase["Supabase Cloud · West US Oregon"]
        Kong["Kong · *.supabase.co"]
        GT["GoTrue · /auth/v1"]
        PR["PostgREST · /rest/v1"]
        PG["Postgres · managed"]
    end

    Google["Google OAuth\nCloud Console project"]

    App -->|HTTPS| Kong
    Kong --> GT
    Kong --> PR
    GT --> PG
    PR --> PG
    App <-->|OAuth redirect| Google
```

---

## Pre-Production Checklist

| Item                   | Location                                      | Action                                                        |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| Email confirmation     | `supabase/config.toml [auth.email]`           | `enable_confirmations = true`                                 |
| OTP rate limit         | `supabase/config.toml [auth.email]`           | `max_frequency = "60s"`                                       |
| Profile creation       | New migration                                 | Trigger on `auth.users` INSERT → insert `public.profiles` row |
| Session storage        | `apps/web/src/lib/supabase.ts`                | `@supabase/ssr` + httpOnly cookies if XSS hardening needed    |
| Google redirect URIs   | Google Cloud Console                          | Add production domain                                         |
| Supabase redirect URLs | Hosted Supabase dashboard → Auth → URL config | Add production domain                                         |
