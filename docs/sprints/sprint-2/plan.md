# Sprint 2 — Log in & log out

## S2-001 — Complete login endpoint contract
- **As an** employee, **I want** to sign in with my email and password, **so that** I can receive an auth token to use protected features.
- **Status:** done
- **BRD ref:** F1.1, F1.2, NF4
- **AC:**
  - `POST /login` accepts JSON `{ "email": "...", "password": "..." }`
  - Valid credentials return HTTP 200 with JSON containing a JWT token signed with HS256 and 24-hour expiry
  - JWT secret comes from `process.env.JWT_SECRET` with default `"workshop-secret"` when unset
  - Invalid credentials return HTTP 401 with JSON error response
- **Depends on:** none

## S2-002 — Enforce authenticated access on protected routes
- **As a** system administrator, **I want** all non-public endpoints to require a valid JWT, **so that** only authenticated users can access protected data.
- **Status:** done
- **BRD ref:** NF1, F1.2
- **AC:**
  - `POST /login` and `GET /health` are accessible without a token
  - Any other API endpoint returns HTTP 401 when the `Authorization: Bearer <token>` header is missing or invalid
  - A valid, non-expired JWT allows access to protected endpoints
  - Responses remain JSON for both success and auth failures
- **Depends on:** S2-001

## S2-003 — Role-based post-login home experience
- **As an** authenticated user, **I want** to land on a role-appropriate home view after login, **so that** I immediately see the workflow for my role (employee, manager, HR).
- **Status:** done
- **BRD ref:** F1.1
- **AC:**
  - Successful sign-in from `localhost:3000` routes the user to a home view based on role (`employee`, `manager`, `hr`)
  - Employee home shows employee-labeled entry point(s), manager home shows manager-labeled entry point(s), and HR home shows HR-labeled entry point(s)
  - Invalid login keeps the user on the login screen and displays an error message
  - Frontend remains vanilla HTML/JS with no build step added
- **Depends on:** S2-001

## S2-004 — Logout with token invalidation
- **As an** authenticated user, **I want** to log out and invalidate my current session token, **so that** the token cannot be reused after logout.
- **Status:** done
- **BRD ref:** F1.3, NF1
- **AC:**
  - Authenticated logout endpoint accepts the current bearer token and returns HTTP 200 JSON confirmation
  - Logout stores the token in the in-memory logout blocklist
  - Reusing the same token after logout on any protected endpoint returns HTTP 401
  - Logging out does not require external persistence (in-memory behavior reset on restart is acceptable)
- **Depends on:** S2-001, S2-002
