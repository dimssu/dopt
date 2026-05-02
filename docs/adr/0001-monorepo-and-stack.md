# ADR-0001: Monorepo and stack

Status: Accepted
Date: 2026-05-02
Owner: architect

## Context

The platform spans a clinician web app, a tenant admin console, a TS API gateway, two Python ML services, a shared design system, and several pure-data packages (types, config, db, compliance, EHR adapters, agents). We need a topology that keeps these in lock-step and makes cross-cutting refactors cheap.

## Decision

- Turborepo + pnpm workspaces. TS apps and packages live as workspaces; Python services live as siblings under `apps/` with their own `pyproject.toml` (CI runs them in a Python matrix job).
- Stack: Next.js 15 (App Router) for both web and admin; Hono for the API; FastAPI for the Python services; Prisma + Postgres + pgvector for storage; Redis for queue and pub/sub; MinIO/S3 for audio.
- Types and Zod schemas in `@clinical-notes/types` are the contract layer for all TS code; JSON Schema is generated for the Python side.
- All LLM and ASR provider selection is centralised in `@clinical-notes/compliance` (residency) and `@clinical-notes/agents` (provider abstraction).

## Consequences

- One install, one CI graph, one build. Cross-cutting refactors are atomic.
- Python services are second-class citizens in Turbo; managed separately in CI but deployable as their own images.
- Adding a non-Anthropic LLM provider is a single-file change plus a compliance review.
