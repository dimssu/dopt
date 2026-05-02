# ADR-0002: Tenant isolation at the data layer

Status: Accepted
Date: 2026-05-02
Owner: architect

## Context

Multi-tenant clinical SaaS cannot rely on app-layer tenant scoping; one missed `where: { tenantId }` is a HIPAA breach. We need to make the safe path the only path.

## Decision

- A Prisma client extension (`tenancy` in `@clinical-notes/db`) injects `tenantId` into every query against tenant-scoped models. Apps cannot import `@prisma/client` directly — they import `forTenant(ctx)` and get a client where the scoping is impossible to forget.
- A second extension (`audit`) emits a hash-chained `AuditEvent` for every read and mutation of PHI-bearing models. This is a side effect of going through `forTenant`; bypassing it requires the raw client and a logged superuser action.
- Cross-tenant access (used by the retention engine and superuser ops) is gated behind a separate code path with mandatory audit annotation.

## Consequences

- The compiler and runtime cannot be tricked into a cross-tenant read.
- Audit volume is non-trivial; the emitter writes via Redis pub/sub to a worker, not inline.
- Adding a new tenant-scoped model requires registering it in `TENANT_SCOPED_MODELS` and `AUDITED_MODELS` in `@clinical-notes/db`. Architecture review enforces.
