# Sprint 2 QA Report (Tech Lead)

## Scope reviewed
- Stories in `testing`: S2-001, S2-002, S2-003, S2-004
- Files limited to Sprint 2 design scope (`src/auth.ts`, `src/index.ts`, `src/store.ts`, `src/seed.ts`, `src/routes/auth.ts`, `src/routes/protected.ts`, `public/index.html`, `public/home.html`, and related tests)
- Enforced against `docs/architecture.md`, ADR-001/002/003, and BRD F1/NF requirements

## Failure modes considered
- Missing/invalid auth header on protected endpoints
- Invalid/expired/revoked JWT replay behavior
- Login contract shape and invalid-credential handling
- Role-based post-login UX and invalid-login UX
- Logout token invalidation and reuse denial
- Hard-rule architecture drift (dependency allowlist and stack constraints)

## Inline fixes applied
1. Removed disallowed dependencies from `package.json`/lockfile:
   - Removed `bcrypt`
   - Removed `@types/bcrypt`
   - Reason: violates hard dependency rule (only `express`, `jsonwebtoken`, `cors`)
2. Corrected test runner command in `package.json`:
   - `test` now uses `node --import 'tsx' --test src/**/*.test.ts`
   - Reason: existing command failed to execute TypeScript tests in this ESM setup

## Bugs filed
- None

## Story outcomes
- S2-001: **done**
- S2-002: **done**
- S2-003: **done**
- S2-004: **done**

## Validation
- Executed: `npm test`
- Result: pass (31/31)
