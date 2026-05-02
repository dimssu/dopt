# @clinical-notes/config

Schema-validated tenant configuration: branding, locale, retention, feature flags, provider routing, signature blocks, and the specialty template library (primary care, cardiology, psychiatry, pediatrics, dental — extensible).

`TenantConfig` is the canonical Zod schema. Storage lives in `Tenant.config` (jsonb in Postgres). Hot reload: `apps/api` watches Redis pub/sub for `tenant:<id>:config` and broadcasts to `apps/web` via WebSocket.

Owned by `architect` (schema) and `backend-engineer` (loader).
