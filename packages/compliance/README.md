# @clinical-notes/compliance

Helpers for the regulatory boundary of the platform.

- **`PHI_FIELDS`** — canonical registry of PHI-bearing fields, source-of-truth for the PHI scanner in CI.
- **`redact`, `redactObject`** — pattern-based redaction for log lines and analytics events.
- **`hashEvent`, `verifyChain`** — hash-chained audit log primitives. Verification is a periodic compliance task.
- **`assertAllowed`, `allowedProviders`** — data residency router. Enforces per-region provider allow-lists for storage, LLM, and ASR.

Owned by `compliance-officer`. Any new external service requires a BAA-coverage review before being added to a region's allow-list.
