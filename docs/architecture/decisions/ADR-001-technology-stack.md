# ADR-001: Technology Stack — Node + TypeScript + Express + Vanilla HTML/JS + In-Memory Store

**Status:** ACCEPTED

**Date:** 2024-05

**Context:**

The Time-Off Request System (TORS) is a workshop project aimed at demonstrating an AI-first SDLC approach. The product requirements are:
- Internal employee time-off request system
- Three user roles: Employee, Manager, HR
- Authentication with JWT
- In-app request submission, approval workflow, and reporting
- No external database, no Docker, no cloud services
- Full system must run locally with `npm install && npm start` (zero config)

The team must choose a technology stack that enables:
1. Rapid local development and testing
2. Simplicity (workshop context, not production)
3. Zero external dependencies (no Docker, no cloud)
4. Support for TypeScript for type safety
5. A clear separation of concerns (backend, frontend, data layer)

**Decision:**

We adopt the following technology stack:

**Backend:**
- **Runtime:** Node.js
- **Language:** TypeScript (for type safety and IDE support)
- **Framework:** Express (minimal, unopinionated)
- **HTTP Middleware:** `cors` (for cross-origin requests if needed)
- **Authentication:** `jsonwebtoken` (HS256, stateless tokens)
- **Data Store:** In-memory `Map` (reset on restart)
- **Logging:** `console.log` (acceptable for workshop; no APM)

**Frontend:**
- **HTML/JS:** Vanilla (no build step, no bundler, no framework)
- **Storage:** browser `localStorage` for JWT tokens

**Architecture:**
- **Project Layout:** Flat structure
  - `src/index.ts` — Express app entrypoint
  - `src/store.ts` — in-memory data store
  - `src/seed.ts` — hardcoded user data
  - `src/auth.ts` — JWT and password handling
  - `src/routes/` — endpoint handlers
  - `public/index.html` — frontend landing page
- **Database:** None; in-memory `Map` only
- **API Design:** RESTful, JSON responses, no pagination
- **Sessions:** Stateless (JWT-based); no session store
- **Notifications:** Polling (no WebSocket, no email)

**Rationale:**

1. **Node + TypeScript:**
   - JavaScript runs on any machine; TypeScript adds type safety
   - Familiar to most developers; quick to learn for newcomers
   - Excellent IDE support (VS Code, etc.)

2. **Express:**
   - Minimal and unopinionated; easy to extend later
   - No magic; clear request/response flow
   - Lightweight; no unnecessary features for a workshop

3. **Vanilla HTML/JS:**
   - No build step; edit HTML, refresh browser
   - Fast feedback loop for the workshop
   - No framework dependencies to manage

4. **In-Memory Store:**
   - Zero setup; no Docker, no database migrations
   - State reset on restart is acceptable (workshop context)
   - Easy to mock and test

5. **JWT (Stateless):**
   - No session store to manage
   - Clients send token with every request
   - Easier to scale horizontally (not a concern now, but good practice)

6. **Minimal Dependencies:**
   - Only `express`, `jsonwebtoken`, `cors`
   - Reduces complexity, installation time, and security surface
   - Makes the codebase easy to audit and modify

**Consequences:**

**Positive:**
- Fast local setup and iteration
- Clear, flat project structure
- Easy to understand and modify for learners
- No external services to manage
- Zero configuration needed to run the app

**Negative:**
- In-memory store is not persistent; not suitable for production
- No framework conventions; developers must establish patterns (routes, handlers, etc.)
- Vanilla JS frontend lacks modern tooling (TypeScript, JSX, component frameworks)
- Stateless JWT means no easy way to revoke tokens mid-session (logout requires blocklist)
- Polling for notifications is inefficient at scale

**Alternatives Considered:**

1. **Next.js (Fullstack):** Would add build step, more complex setup, not suitable for zero-config local run
2. **React + Node:** Added frontend complexity; not aligned with workshop simplicity goal
3. **PostgreSQL + ORM:** Violates zero-config and NF6 (local-only execution)
4. **Firebase/Supabase:** Cloud-based; violates no external services constraint
5. **Passport.js:** Overkill for simple JWT auth; adds unnecessary dependencies

**Related ADRs:**
- (None yet; future ADRs may address specific features like logout, notifications, etc.)

**References:**
- `docs/architecture.md` — Hard rules for the project
- `docs/BRD.md` — Business requirements

---

**Decision Record Status: FINAL**

This stack is locked for the duration of the workshop. Feature-specific ADRs (e.g., logout strategy, notification mechanism) may refine implementation but will not change the core stack.
