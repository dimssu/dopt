# Clinical Notes Platform

Multi-tenant clinical scribe platform. Capture doctor–patient conversations in real time, generate structured clinical notes (SOAP, H&P, progress, discharge, referral), round-trip with EHRs over FHIR R4 and HL7v2.

## Status

MVP — vertical slice. The core journey runs end-to-end:

- See a seeded demo tenant on the dashboard.
- Open the awaiting-review encounter to see a generated SOAP note next to its source transcript, with click-through citations.
- Or pick the scheduled encounter, "Start encounter," watch a simulated live transcript play back, end the encounter, and watch a fresh note generate from the transcript.
- Sign the note. The status flips to *Signed* and the action buttons disappear.

The rest of the build plan (real microphone capture, full admin UI, EHR push, MFA/SSO, broader specialty templates, auto-coding worker) is sequenced in [docs/plan.md](docs/plan.md). See [agents/](agents/) for the agent definitions that own each piece.

## Quick start

Requires Node 20.11+, pnpm 9, Docker (for Postgres), and optionally an Anthropic API key.

```sh
# 1. Configuration
cp .env.example .env
# Edit .env: at minimum set DATABASE_URL. Set ANTHROPIC_API_KEY to use the
# real model; leave it blank to use the deterministic offline fallback note.

# 2. Local dependencies
docker compose -f infra/compose/dev.yml up -d postgres

# 3. Install + generate Prisma client (postinstall)
pnpm install

# 4. Database
pnpm db:migrate
pnpm db:seed

# 5. Run the stack
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → the marketing landing. Click **Try the demo** to land on the clinician dashboard.

| Service | URL |
|---|---|
| Web (clinician) | http://localhost:3000 |
| API | http://localhost:3001 |
| Admin | http://localhost:3002 (skeleton) |
| HAPI FHIR sandbox | http://localhost:8080/fhir |

## Demo flow (≈ 3 minutes)

See [docs/demo-script.md](docs/demo-script.md) for the talk-track. Headline:

1. Dashboard shows two encounters: *Avery Bhatt — SOAP draft* (already generated from a seeded transcript) and *Theo Okonkwo — Scheduled*.
2. Click *Avery Bhatt* → the review screen with transcript on the left, generated SOAP on the right. Click any `[m:ss]` citation in the note → the matching transcript bubble highlights and scrolls into view. Click *Sign note* → status flips to Signed.
3. Back to dashboard, click *Start encounter* on Theo. The capture screen plays back a simulated live transcript over about 90 seconds. Click *End encounter & generate note*. A fresh SOAP note is generated and you land in review.

## Repo layout

```
clinical-notes/
├── apps/
│   ├── web/                  Next.js 15 — clinician dashboard
│   ├── api/                  Hono — REST gateway, generation, audit
│   ├── transcription-svc/    FastAPI — streaming ASR (M2)
│   ├── notes-svc/            FastAPI — generation worker (production target)
│   └── admin/                Next.js — tenant admin console (skeleton)
├── packages/
│   ├── ui/                   Design system (tokens + primitives)
│   ├── config/               Tenant config schema + specialty templates
│   ├── db/                   Prisma schema (Postgres + pgvector)
│   ├── auth/                 RBAC permission matrix
│   ├── ehr-adapters/         FHIR R4, HL7v2, EHR connector stubs
│   ├── compliance/           Audit chain, PHI redaction, residency router
│   ├── agents/               LLM provider abstraction
│   └── types/                Shared TS types + Zod schemas
├── agents/                   Agent definitions and handoffs
├── infra/                    Docker Compose, Helm, Terraform (skeleton)
└── docs/                     ADRs, architecture, compliance, integrations
```

## Testing without an API key

If `ANTHROPIC_API_KEY` is not set in `.env`, note generation uses a deterministic offline fallback hand-written against the seeded transcript. The flow is identical — just the SOAP content is fixed instead of model-generated. Useful for CI, screenshots, and demo dry-runs.

## Documentation

- [Build plan](docs/plan.md)
- [Architecture](docs/architecture.md)
- [Demo script](docs/demo-script.md)
- ADRs: [0001 monorepo + stack](docs/adr/0001-monorepo-and-stack.md), [0002 tenant isolation](docs/adr/0002-tenant-isolation.md)

## License

TBD.
