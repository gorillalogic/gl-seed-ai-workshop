# Sprint 2 Design — Log in & log out

**Theme:** "Log in & log out — sign in with email + password, land on a role-appropriate home (employee / manager / HR), and log out (session invalidated)"

## Overview

Sprint 2 formalizes authentication boundaries for all protected API behavior, introduces logout token invalidation, and updates the vanilla frontend to route users to role-specific home content after successful login. The design keeps workshop constraints intact: local run only, in-memory state, no external services, and no frontend build step.

## Architecture

### Components

1. **Auth Route Handlers** (`src/routes/auth.ts`)
   - `POST /login` validates credentials and returns JWT + user profile payload.
   - `POST /logout` requires bearer token, revokes current token in in-memory blocklist, returns JSON confirmation.

2. **Auth Middleware + Token Utilities** (`src/auth.ts`)
   - `generateToken()` signs HS256 token with 24h expiry and configured default secret.
   - `verifyToken()` validates signature and expiration.
   - `requireAuth()` middleware enforces bearer auth on protected API routes.
   - Middleware attaches authenticated principal (`sub`, `role`, `token`) to request context for downstream handlers.

3. **In-Memory Auth State** (`src/store.ts`)
   - Existing user map remains source of credentials and role.
   - New in-memory revoked-token map/blocklist tracks logged-out tokens until expiry.
   - Helper functions for revoke/check/cleanup of revoked tokens.

4. **App Entry + Routing Composition** (`src/index.ts`)
   - Registers public endpoints (`GET /health`, `POST /login`, frontend static assets).
   - Applies auth middleware to protected API routes.
   - Registers protected endpoints (including `POST /logout` and role-aware home data endpoint if used by frontend).

5. **Frontend Login + Role Home UI** (`public/index.html`, optional `public/home.html`)
   - Successful login stores token/user and navigates to role-specific home view.
   - Invalid login remains on login form with error message.
   - Role-based labels/entry points rendered for `employee`, `manager`, `hr`.
   - Logout action clears local auth state and calls API logout.

## Data Model

### User (in-memory)
```ts
interface User {
  id: string;
  email: string;
  password: string; // workshop plain-text seed password (dependency constraints)
  role: "employee" | "manager" | "hr";
  name: string;
}
```

### JWT Payload
```ts
interface JWTPayload {
  sub: string; // user id/email
  role: "employee" | "manager" | "hr";
  iat?: number;
  exp?: number;
}
```

### Revoked Token Store (in-memory)
```ts
type RevokedTokenStore = Map<string, number>;
// key   = raw JWT string
// value = token exp (unix seconds) used for lazy cleanup
```

## API Surface

### `POST /login` (public)
- **Request JSON:** `{ "email": string, "password": string }`
- **Success:** `200` with `{ token, user: { id, email, role, name } }`
- **Failure:** `401` with JSON error for invalid credentials
- **Notes:** JWT signed HS256, expiry = 24h, secret from `process.env.JWT_SECRET || "workshop-secret"`.

### `GET /health` (public)
- **Response:** `200` with `{ "status": "ok" }`

### Protected API policy
- Any protected endpoint without valid `Authorization: Bearer <token>` returns `401` JSON.
- Invalid, expired, malformed, or revoked tokens all return `401` JSON (single unauthorized contract).

### `POST /logout` (protected)
- **Auth:** bearer token required.
- **Behavior:** current token added to revoked-token map.
- **Success:** `200` with JSON confirmation.
- **Post-condition:** same token is rejected with `401` on all protected endpoints.

## Edge Cases & Handling

1. **Missing/malformed auth header**
   - Return `401` JSON; do not leak parsing detail.

2. **Expired token**
   - Return `401`; if token appears in revoked store and is expired, it can be lazily removed.

3. **Replay after logout**
   - Revoked token remains denied until expiry or process restart (restart reset is acceptable per NF6).

4. **User feedback on login failure**
   - Frontend remains on login form and shows inline error text.

5. **Role mismatch / unknown role**
   - Treat as unauthorized for protected API usage and route user back to login-safe state on frontend.

## Files per Story

### S2-001 — Complete login endpoint contract
**ADD:**
- `src/routes/auth.ts` — route handler module for login/logout endpoints (if extracted from `index.ts`).
- `src/login-route.test.ts` — unit tests for login contract and JWT behavior.

**MODIFY:**
- `src/index.ts` — wire login handler as public route.
- `src/auth.ts` — ensure HS256/24h token signing + token verification helpers.
- `src/store.ts` — user shape/lookup helpers used by login.
- `src/seed.ts` — align seed credentials with dependency constraints and login verification strategy.
- `src/auth.test.ts` — adjust token utility tests to dependency and contract rules.
- `src/store.test.ts` — align store tests with plain-text seed credential shape.
- `src/health.test.ts` — align seed assertions with updated user credential shape.

**DELETE:**
- (none)

### S2-002 — Enforce authenticated access on protected routes
**ADD:**
- `src/routes/protected.ts` — protected route group placeholder for authenticated endpoints.
- `src/auth-middleware.test.ts` — unit tests for protected route auth enforcement.
- `src/types/cors.d.ts` — local ambient type declaration for `cors` to satisfy strict TypeScript build without adding dependencies.

**MODIFY:**
- `src/index.ts` — apply auth middleware to protected API routing.
- `src/auth.ts` — add bearer parsing + `requireAuth()` middleware + typed auth context.

**DELETE:**
- (none)

### S2-003 — Role-based post-login home experience
**ADD:**
- `public/home.html` (optional) — role home container if split from login page.

**MODIFY:**
- `public/index.html` — login success navigation and role-specific UI labels/entry points.
- `src/index.ts` — serve role-home static route if separate page is introduced.
- `src/frontend-home.test.ts` — unit tests validating role-home page delivery and login-page behavior.

**DELETE:**
- (none)

### S2-004 — Logout with token invalidation
**ADD:**
- (none; implemented in existing auth/store modules)

**MODIFY:**
- `src/routes/auth.ts` — add protected `POST /logout` handler.
- `src/store.ts` — add revoked token map + helper functions.
- `src/auth.ts` — check blocklist during auth validation.
- `public/index.html` and/or `public/home.html` — add logout action invoking API and clearing local state.
- `src/logout.test.ts` — unit tests for token invalidation and replay denial.

**DELETE:**
- (none)

## Sprint 2 ADRs Introduced

- ADR-002 — JWT authentication boundary and middleware enforcement
- ADR-003 — Logout token revocation via in-memory JWT blocklist

## Assumptions

1. **NF1 applies to API endpoints, not static frontend assets**, so login page and static files remain publicly reachable.
2. **Workshop dependency rule prevails over bcrypt usage**, so credential verification is implemented without introducing non-approved runtime dependencies.
3. **Revocation is process-local and in-memory only**; restart clears blocklist by design.

## Compliance Checklist

- ✅ Stack stays Node + TypeScript + Express (BE), vanilla HTML/JS (FE)
- ✅ Store remains in-memory `Map` only
- ✅ JWT HS256 with default `"workshop-secret"` remains unchanged
- ✅ Logout invalidation uses in-memory blocklist only (no DB/files)
- ✅ No build-step frontend framework introduced
