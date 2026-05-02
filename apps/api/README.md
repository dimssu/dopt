# @clinical-notes/api

Hono REST + WebSocket gateway. Auth + tenant scoping middleware → routes for patients, encounters, transcripts, notes, audit, config.

Note generation is delegated to `apps/notes-svc`; this service is the contract layer and the audit boundary. PHI never leaves the configured tenant region — provider routing is checked in `@clinical-notes/agents`.

Owned by `backend-engineer`.
