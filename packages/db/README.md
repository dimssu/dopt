# @clinical-notes/db

Prisma schema, migrations, seeders, and the tenant-scoped client wrapper.

## Public surface

- `forTenant(ctx)` — returns a Prisma client extended with two middlewares:
  - **tenancy** — auto-injects `tenantId` on every query against tenant-scoped models. Cross-tenant access is impossible through this client.
  - **audit** — emits a hash-chained `AuditEvent` on every read and mutation of a PHI-bearing model.

App code MUST go through `forTenant`; importing `@prisma/client` directly is a CI failure (lint rule TBD).

## Schema

See `prisma/schema.prisma`. Models: `Tenant`, `User`, `Patient`, `Encounter`, `TranscriptSegment` (with pgvector), `Note`, `NoteTemplate`, `Integration`, `WebhookSubscription`, `AuditEvent`.

Owned by `backend-engineer`. Schema changes require `architect` + `compliance-officer` review.
