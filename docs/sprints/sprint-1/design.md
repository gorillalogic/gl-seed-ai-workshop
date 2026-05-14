# Sprint 1 Design — App Runs Locally

**Theme:** "App runs locally — `npm install && npm start` boots the app on `localhost:3000`; the browser shows a 'Time-Off' landing page with a login form; `GET /health` returns `{ status: "ok" }`"

## Overview

Sprint 1 establishes the foundation: a local Express server, an in-memory store, three hardcoded users, and a login endpoint. The frontend is a single vanilla HTML/JS landing page with a login form. All code runs with zero external dependencies (no Docker, no env files).

## Architecture

### Components

1. **Backend Server** (`src/index.ts`)
   - Express app running on `localhost:3000`
   - No external middleware beyond `express` and `cors`
   - Exposes `GET /health` and `POST /login`

2. **In-Memory Store** (`src/store.ts`)
   - `Map<string, User>` indexed by user ID or email
   - Single global instance, reset on server restart
   - Users added by `src/seed.ts` on startup

3. **Authentication** (`src/auth.ts`)
   - JWT signing (HS256) with secret from `process.env.JWT_SECRET` (default: `"workshop-secret"`)
   - Password hashing/verification (bcrypt or simple hash for now)
   - Token generation for 24-hour validity

4. **Seed Data** (`src/seed.ts`)
   - Creates three hardcoded users on app startup: Employee, Manager, HR
   - Stores users in the in-memory store
   - Called from `src/index.ts` on startup

5. **Frontend** (`public/index.html`)
   - Single HTML file served at `GET /`
   - Vanilla HTML/JS (no build step, no bundler)
   - Login form: email, password inputs + "Sign In" button
   - Form POSTs to `/login`, receives JWT, stores in `localStorage`

### Data Model

#### User (stored in-memory Map)
```typescript
interface User {
  id: string;           // unique identifier (email for now)
  email: string;        // email address
  passwordHash: string; // bcrypt or simple hash
  role: "employee" | "manager" | "hr";
  name: string;         // display name
}
```

#### JWT Payload (HS256, 24-hour expiry)
```typescript
interface JWTPayload {
  sub: string;        // user ID (email)
  role: string;       // user role
  iat: number;        // issued at
  exp: number;        // expiry (24 hours from iat)
}
```

### API Surface

#### `GET /health`
- **Response:** `200 OK` with `{ status: "ok" }`
- **No auth required**
- **Purpose:** Health check

#### `POST /login`
- **Request body:** `{ email: string, password: string }`
- **Response on success:** `200 OK` with `{ token: string, user: { id, email, role, name } }`
- **Response on failure:** `401 Unauthorized` with error message
- **No auth required**
- **Purpose:** Authenticate and return JWT

#### `GET /` (root)
- **Response:** `200 OK` serving `public/index.html`
- **No auth required**
- **Purpose:** Serve login landing page

### Edge Cases & Constraints

1. **Secret Management**
   - `JWT_SECRET` defaults to `"workshop-secret"` so the app works with zero config
   - Workshop context: hardcoding is acceptable; not for production

2. **In-Memory Reset**
   - State resets on server restart; this is acceptable per BRD NF6
   - Concurrent tests must not rely on persistent state

3. **Password Storage**
   - Use bcrypt for hashing (dependency already mentioned as acceptable in architecture.md)
   - Simple hash also acceptable if bcrypt unavailable

4. **CORS**
   - Enable CORS for `localhost:3000` so frontend can POST to same origin
   - Or configure as needed for testing

5. **No Session Store**
   - Tokens are stateless; no logout implemented yet (deferred to Sprint 2)
   - Clients manage token lifecycle in `localStorage`

## Files per Story

### S1-001 — Express server bootstrap with health endpoint
**ADD:**
- `src/index.ts` — Express app setup, server startup, `GET /health` endpoint
- `package.json` — `express` + `cors` dependencies, `npm start` script
- `public/index.html` — placeholder landing page (basic HTML)

**MODIFY:**
- (none)

**DELETE:**
- (none)

### S1-002 — Seed hardcoded users into in-memory store
**ADD:**
- `src/store.ts` — in-memory `Map` for users, export functions (`getUser()`, `setUser()`)
- `src/seed.ts` — create three users (Employee, Manager, HR) with hardcoded emails/passwords, call `store.setUser()` for each

**MODIFY:**
- `src/index.ts` — import and call `seed()` on app startup

**DELETE:**
- (none)

### S1-003 — Login form on landing page
**ADD:**
- (none; HTML already added in S1-001)

**MODIFY:**
- `public/index.html` — add email input, password input, "Sign In" button, vanilla JS to POST to `/login`, store JWT in `localStorage`

**DELETE:**
- (none)

### S1-004 — POST /login endpoint (JWT generation)
**ADD:**
- `src/auth.ts` — JWT signing function, password verification function, token generation with 24-hour expiry
- Add `jsonwebtoken` dependency to `package.json` (and optionally `bcrypt` for password hashing)

**MODIFY:**
- `src/index.ts` — add `POST /login` route, call auth functions, return token or 401
- `src/store.ts` — add `getUserByEmail()` function if not already present

**DELETE:**
- (none)

## Design Assumptions

1. **Bcrypt for password hashing** — if `bcrypt` is not available, use a simple hash for MVP
2. **No logout yet** — token invalidation deferred to Sprint 2
3. **No client-side form validation** — per AC, server returns 401 on bad credentials
4. **Vanilla JS only** — no framework, no build step
5. **CORS enabled** — frontend and backend on same origin for now

## Compliance Checklist

- ✅ Stack: Node + TypeScript + Express (BE), Vanilla HTML/JS (FE)
- ✅ Store: in-memory `Map`, no DB
- ✅ Users: hardcoded in `src/seed.ts`
- ✅ Auth: `jsonwebtoken` HS256, secret defaults to `"workshop-secret"`
- ✅ Deps: `express`, `jsonwebtoken`, `cors` only (bcrypt optional)
- ✅ Run: `npm install && npm start`, no Docker, no env files
- ✅ Layout: flat `src/{index,store,seed,auth}.ts`
- ✅ NF6: Full system runs locally with zero external dependencies
