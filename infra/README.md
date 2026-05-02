# Infrastructure

- `compose/dev.yml` — local dev stack (Postgres+pgvector, Redis, MinIO, HAPI FHIR sandbox, Mailpit). Bring up with `pnpm compose:up`.
- `k8s/` — Helm chart per service (TBD).
- `terraform/` — VPC, RDS, ElastiCache, S3 (object lock), KMS-per-region (TBD).

Owned by `devops`.
