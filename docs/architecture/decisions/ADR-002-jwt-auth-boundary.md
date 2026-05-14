# ADR-002: JWT Authentication Boundary and Middleware Enforcement

**Status:** ACCEPTED

**Date:** 2026-05-14

## Context

Sprint 2 requires that all non-public API endpoints enforce authentication (NF1), while preserving public access for `POST /login` and `GET /health`. The system must remain simple, local-first, and aligned to workshop hard rules (Express + JSON responses + in-memory state).

## Decision

1. Introduce a centralized auth middleware (`requireAuth`) in `src/auth.ts`.
2. Treat `POST /login` and `GET /health` as public endpoints.
3. Require `Authorization: Bearer <token>` for all protected API endpoints.
4. On missing, invalid, expired, malformed, or revoked token, return a uniform `401` JSON response.
5. On success, attach authenticated principal (`sub`, `role`, raw token) to request context for protected handlers.

## Rationale

- Centralized middleware prevents inconsistent per-route auth checks.
- Uniform `401` contract keeps API behavior predictable and frontend handling simple.
- Attaching auth context enables future role checks without introducing service/controller layers.
- Keeps code within flat workshop architecture and dependency constraints.

## Consequences

### Positive
- Clear public/protected boundary.
- Reduced duplicate auth logic across endpoints.
- Easy to extend to new protected routes in future sprints.

### Trade-offs
- Middleware ordering in `index.ts` becomes critical.
- Uniform `401` hides exact auth failure reason by design.

## Alternatives Considered

1. **Per-route manual token verification** — rejected due to duplication and drift risk.
2. **Session-based auth store** — rejected; conflicts with JWT stateless requirement.
3. **Third-party auth framework** — rejected; violates minimal dependency rule.

## References

- `docs/architecture.md`
- `docs/BRD.md` (F1.2, NF1)
- `docs/sprints/sprint-2/plan.md` (S2-002)
