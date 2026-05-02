from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Header
from pydantic import BaseModel, Field

from ..pipeline.generate import generate_note

router = APIRouter()


class GenerateRequest(BaseModel):
    encounter_id: str
    format: Literal["soap", "hp", "progress", "discharge", "referral", "custom"] = "soap"
    template_id: str | None = None


class GenerateAccepted(BaseModel):
    job_id: str = Field(..., description="Queue job id; the result lands on the encounter as a Note")
    encounter_id: str
    status: Literal["queued"] = "queued"


@router.post("/generate", response_model=GenerateAccepted)
async def generate(
    body: GenerateRequest,
    tenant_id: str = Header(..., alias="x-tenant-id"),
) -> GenerateAccepted:
    job_id = await generate_note(
        tenant_id=tenant_id,
        encounter_id=body.encounter_id,
        note_format=body.format,
        template_id=body.template_id,
    )
    return GenerateAccepted(job_id=job_id, encounter_id=body.encounter_id, status="queued")
