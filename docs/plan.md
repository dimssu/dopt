# Clinical Notes Platform — Build Plan

> Single source of truth for the build sequence. The orchestrator agent maintains this file. Every other agent reads it before starting work and updates the relevant milestone on completion.

## Vision

An AI-native clinical notes platform: capture doctor–patient conversations in real time, generate structured clinical notes (SOAP, H&P, progress, discharge, referral), and round-trip with EHRs over FHIR / HL7v2. Multi-tenant, per-organisation configurable (branding, specialty templates, compliance posture, integrations), HIPAA-ready.

## Architecture summary

```
clinical-notes/
├── apps/
│   ├── web/                  Next.js 15 (App Router) — clinician dashboard + patient portal
│   ├── api/                  Hono — REST + WebSocket gateway, auth, tenant scoping, queues
│   ├── transcription-svc/    FastAPI — streaming ASR (Whisper primary, Deepgram fallback) + diarization
│   ├── notes-svc/            FastAPI — LLM-driven note generation, citations, auto-coding
│   └── admin/                Next.js — org/tenant admin console
├── packages/
│   ├── ui/                   Design system (shadcn/ui base + custom primitives, tokens)
│   ├── config/               Tenant config schema, feature flags, specialty templates
│   ├── db/                   Prisma schema, migrations, seeders (Postgres + pgvector)
│   ├── auth/                 Auth wrapper, RBAC, audit logging hooks
│   ├── ehr-adapters/         FHIR R4, HL7v2, Epic, Cerner, athenahealth, DrChrono adapters
│   ├── compliance/           Audit trail, PHI redaction, BAA helpers, retention enforcement
│   ├── agents/               Agent runtime, tool registry, LLM provider abstraction
│   └── types/                Shared TS types + Zod schemas (the contract layer)
├── agents/                   Agent markdown definitions + handoffs + state.json
├── infra/                    Docker Compose (dev), Helm charts, Terraform modules
└── docs/                     ADRs, architecture, compliance, integrations, runbooks
```

Data flow at a glance: Browser/mobile → WebSocket to API → fan-out to transcription-svc (stream) and storage. Transcript chunks → notes-svc (on session close or on demand) → structured note + citations + codes → API → DB → web/admin → optional EHR push.

## Milestones

Each milestone ends with an orchestrator-led integration pass: `pnpm build && pnpm lint && pnpm test && pnpm test:e2e:smoke`. A milestone is not closed until that pass is green.

### M0 — Foundations (this session, chunk 1)
- Agent definitions, orchestrator plan, state.json. *(this commit)*
- Turborepo + pnpm workspaces, root tsconfig, ESLint, Prettier, husky.
- App and package skeletons with READMEs and minimal entry points.
- `infra/compose/dev.yml` with Postgres+pgvector, Redis, MinIO, HAPI FHIR.
- `.github/workflows/ci.yml` (lint + typecheck + unit).

### M1 — Domain & Data
- `packages/types`: Zod schemas for Tenant, User, Patient, Encounter, Transcript, Note, AuditEvent, Webhook.
- `packages/db`: Prisma schema, migrations, seeders. Tenant scoping via Prisma middleware. pgvector on transcript chunks for retrieval-augmented prompts.
- `packages/config`: tenant config schema (Zod) + specialty templates (primary care, cardiology, psych, peds, dental).
- `packages/compliance`: audit logger (hash-chained), PHI field registry, redaction utilities, retention engine.
- `apps/api` skeleton: Hono + auth middleware + RBAC + audit hooks. CRUD for Tenant, User, Patient, Encounter behind RBAC.

### M2 — Capture & Transcription
- WebSocket gateway in `apps/api` for streaming audio + delivering partial transcripts.
- `apps/transcription-svc`: FastAPI service, faster-whisper backbone, pyannote diarization, medical-vocab boost, Deepgram fallback adapter behind a per-tenant flag.
- Offline buffering on the client (IndexedDB) with resumable upload to MinIO.
- ICD-10 / SNOMED / RxNorm linker (UMLS-backed) wired into transcript post-processing.
- `apps/web` capture surface: push-to-talk + ambient mode, live transcript with speaker labels, partial/final indicators, network resilience UX.

### M3 — Note Generation & Review
- `apps/notes-svc`: per-specialty prompt library, citation-emitting generation, auto-coding suggestions, eval harness.
- `apps/web` review surface: side-by-side transcript ↔ note with citation hover, diff view per regenerate, accept/reject per section, regenerate-section, manual edits with change history.
- `packages/agents`: provider-abstracted LLM client (Anthropic, configurable), per-tenant model routing respecting data residency.

### M4 — Tenant Config & Admin
- `apps/admin`: org settings, branding, template management, user/role management, integration setup, audit log viewer, billing stub.
- Hot-reloadable tenant config: change in admin → broadcast over Redis pub/sub → API and web pick up without restart.
- Per-clinician overrides: preferred templates, dictation shortcuts, macros.

### M5 — Integrations & Webhooks
- `packages/ehr-adapters`: FHIR R4 (canonical) round-trip with HAPI sandbox, HL7v2 ADT/ORM/ORU generators, Epic/Cerner/athena/DrChrono mapping layers behind feature flags.
- SMART-on-FHIR launch flow (standalone + EHR-launch).
- Webhook subscriptions per tenant, HMAC-signed payloads, retries, DLQ, replay.

### M6 — Compliance & Audit
- End-to-end encryption: TLS in transit, KMS-per-tenant-region for data at rest, audio object lock with retention.
- PHI leak scanner in CI.
- Audit log viewer in admin with export.
- Data residency router enforced at request edge.
- BAA-boundary diagram and SOC2 control matrix (docs).

### M7 — Polish, Docs, Demo
- UI sweeps with `design:design-critique` and `design:accessibility-review` per primary surface.
- Storybook for `packages/ui`.
- OpenAPI spec published, `docs/api.md` generated.
- `docs/deployment.md`, `docs/configuration.md`, `docs/demo-script.md`.
- Seeded demo tenant (`Riverside Family Practice`) with one clinician, three patients, one completed encounter, one in-progress encounter, one pending note for review.

## Tool substitutions for this build

The brief specified Stitch MCP and Pexels MCP; neither is connected in this environment. The UI/UX agent operates with these substitutes — the design specs flag the swap so a later pass with the real tools can re-validate:

- `magic` MCP for component-level UI generation.
- `design:*` skills for critique, a11y review, copy, and handoff.
- Pexels via the public HTTP API for marketing photography (curated, attribution recorded in `docs/designs/asset-credits.md`).

## Commit and push protocol

- Conventional commits only (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`).
- One coherent unit of work per commit. Push after each chunk lands.
- No mention of AI assistants anywhere — commit messages, code comments, PR descriptions, README, UI copy, error messages.

## Definition of done for the platform build

- `pnpm dev` boots a working seeded demo tenant on a clean checkout.
- Storybook for `packages/ui` boots.
- OpenAPI spec is published and accurate.
- Smoke E2E (`pnpm test:e2e:smoke`) covers the four critical journeys (capture, review, admin config, audit) in under two minutes.
- Deployment guide and configuration reference are complete.
- A scripted demo flow runs end-to-end without manual intervention.
