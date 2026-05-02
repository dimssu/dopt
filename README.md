# Clinical Notes Platform

Multi-tenant clinical scribe platform: real-time capture of doctor–patient conversations, autonomous generation of structured clinical notes (SOAP, H&P, progress, discharge, referral), round-trip with EHRs over FHIR R4 and HL7v2.

## Status

Early build. See [`docs/plan.md`](docs/plan.md) for the milestone-by-milestone build sequence and [`agents/`](agents/) for the agent definitions that own each part of the system.

## Repo layout

```
clinical-notes/
├── apps/
│   ├── web/                  Next.js 15 — clinician dashboard
│   ├── api/                  Hono — REST + WebSocket gateway
│   ├── transcription-svc/    FastAPI — streaming ASR + diarization
│   ├── notes-svc/            FastAPI — note generation
│   └── admin/                Next.js — tenant admin console
├── packages/
│   ├── ui/                   Design system
│   ├── config/               Tenant config schema + specialty templates
│   ├── db/                   Prisma schema (Postgres + pgvector)
│   ├── auth/                 RBAC + audit hooks
│   ├── ehr-adapters/         FHIR R4, HL7v2, EHR connectors
│   ├── compliance/           Audit, PHI handling, BAA helpers
│   ├── agents/               Agent runtime + LLM provider abstraction
│   └── types/                Shared TS types + Zod schemas
├── agents/                   Agent definitions and handoffs
├── infra/                    Docker Compose, Helm, Terraform
└── docs/                     ADRs, architecture, compliance, integrations
```

## Quick start (target — not yet wired)

```sh
pnpm install
pnpm dev
```

This will boot the full local stack (Postgres + pgvector, Redis, MinIO, HAPI FHIR sandbox, the API, both Python services, web, and admin) and seed a demo tenant.

## Documentation

- [Build plan](docs/plan.md)
- [Architecture](docs/architecture.md) (in progress)
- [Configuration reference](docs/configuration.md) (in progress)
- [Deployment guide](docs/deployment.md) (in progress)
- [Compliance posture](docs/compliance/) (in progress)

## License

TBD.
