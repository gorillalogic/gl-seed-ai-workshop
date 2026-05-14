# ADR-003: Logout Token Revocation via In-Memory JWT Blocklist

**Status:** ACCEPTED

**Date:** 2026-05-14

## Context

Sprint 2 requires logout to invalidate the current session token (F1.3), and token reuse after logout must fail with `401`. The project cannot use external persistence; all state must remain in memory and reset on restart (NF6).

## Decision

1. Implement `POST /logout` as an authenticated endpoint.
2. Revoke the current bearer token by storing it in an in-memory blocklist (`Map<string, number>`).
3. Use the JWT `exp` claim as blocklist value for lazy cleanup of expired revocations.
4. During auth middleware validation, deny access if token is present in blocklist.
5. Return `200` JSON confirmation on logout even though revocation is in-memory only.

## Rationale

- Stateless JWT alone cannot revoke issued tokens; a blocklist is required for logout semantics.
- In-memory `Map` satisfies hard architecture constraints and workshop simplicity.
- Using `exp` supports low-complexity cleanup without background jobs.

## Consequences

### Positive
- Meets logout invalidation acceptance criteria.
- No new infrastructure or dependencies.
- Predictable behavior for protected endpoints after logout.

### Trade-offs
- Revocations are lost on process restart (accepted by NF6).
- Blocklist size can grow during runtime; lazy cleanup mitigates but does not eliminate growth.

## Alternatives Considered

1. **Do nothing on logout (client-side token delete only)** — rejected; does not invalidate server-side token usage.
2. **Persist blocklist in database/file** — rejected; violates no-DB/no-files constraints.
3. **Short-lived access + refresh tokens** — rejected as out of scope and adds complexity for workshop sprint goals.

## References

- `docs/architecture.md`
- `docs/BRD.md` (F1.3, NF1, NF6)
- `docs/sprints/sprint-2/plan.md` (S2-004)
