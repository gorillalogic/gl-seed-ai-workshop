# Sprint 1 — App runs locally

## S1-001 — Express server bootstrap with health endpoint
- **As a** DevOps engineer, **I want** the app to bootstrap on `npm start` and expose a health check endpoint, **so that** I can verify the server is running and ready to receive requests.
- **Status:** done
- **BRD ref:** NF2, NF3, NF6
- **AC:**
  - Running `npm install && npm start` starts the Express server without errors
  - Server listens on `localhost:3000`
  - `GET /health` returns HTTP 200 with JSON body `{ status: "ok" }`
  - No external dependencies required (no Docker, no env files, no cloud services)
- **Depends on:** none

## S1-002 — Seed hardcoded users into in-memory store
- **As a** developer, **I want** the app to load three hardcoded users (one per role: employee, manager, HR) into an in-memory store on startup, **so that** authentication can be tested without an external database.
- **Status:** done
- **BRD ref:** F1.1, NF4, NF6
- **AC:**
  - On startup, `src/seed.ts` creates three users: one Employee, one Manager, one HR role
  - Users are stored in the in-memory `Map` in `src/store.ts`
  - Each user has email and hashed password
  - Users persist in memory until app restart (state reset on restart is acceptable)
- **Depends on:** none

## S1-003 — Login form on landing page
- **As an** employee, **I want** to see a "Time-Off" landing page with an email and password login form, **so that** I can authenticate and access the app.
- **Status:** done
- **BRD ref:** F1.1, F1.2
- **AC:**
  - Browser loads `localhost:3000` and shows a "Time-Off" landing page with visible branding
  - Landing page displays an email input field and password input field
  - Landing page displays a "Sign In" button
  - Form is ready to accept POST requests to `/login` (no client-side validation required for MVP)
  - Page does not require a build step (vanilla HTML/JS)
- **Depends on:** S1-001

## S1-004 — POST /login endpoint (JWT generation)
- **As an** application, **I want** to authenticate users via `POST /login` and return a JWT on success, **so that** users can access authenticated endpoints.
- **Status:** done
- **BRD ref:** F1.1, F1.2, NF4
- **AC:**
  - `POST /login` accepts JSON body with `email` and `password`
  - On valid credentials, endpoint returns HTTP 200 with JSON body containing a `token` field (HS256 JWT valid for 24 hours)
  - JWT secret is read from `process.env.JWT_SECRET` (defaults to `"workshop-secret"`)
  - On invalid credentials, endpoint returns HTTP 401 with error message
  - Token is not stored in a session store; clients send it in subsequent requests
- **Depends on:** S1-002
