"""Note generation pipeline.

Inputs (resolved from the API call):
  - tenant config (specialty templates, signature block, provider routing)
  - encounter + transcript segments

Steps:
  1. Build the structured prompt: specialty template + transcript with segment ids.
  2. Call the LLM with prompt-cached system instructions per (tenant, template).
  3. Parse the structured output (one section at a time) — every sentence must
     carry at least one `transcript_span` citation. Reject and retry once if not.
  4. Run the auto-coder pass for ICD-10 / CPT suggestions with confidence.
  5. Persist the Note via apps/api callback (audit-traced).

This module enqueues a job and returns the id; the worker (BullMQ on the Node
side) actually performs the steps to keep the request hot path fast.
"""

from __future__ import annotations

import os
import uuid

import httpx


async def generate_note(
    *,
    tenant_id: str,
    encounter_id: str,
    note_format: str,
    template_id: str | None,
) -> str:
    job_id = str(uuid.uuid4())
    api_url = os.environ.get("API_URL", "http://localhost:3001")
    async with httpx.AsyncClient(timeout=5.0) as client:
        await client.post(
            f"{api_url}/internal/notes/jobs",
            headers={"x-tenant-id": tenant_id, "x-internal-token": os.environ.get("INTERNAL_TOKEN", "")},
            json={
                "jobId": job_id,
                "encounterId": encounter_id,
                "format": note_format,
                "templateId": template_id,
            },
        )
    return job_id
