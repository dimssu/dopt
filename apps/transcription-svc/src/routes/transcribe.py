from __future__ import annotations

from fastapi import APIRouter, UploadFile, File, Header
from pydantic import BaseModel

from ..pipeline.whisper import transcribe_clip

router = APIRouter()


class TranscribeResponse(BaseModel):
    encounter_id: str
    text: str
    language: str
    duration_ms: int


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    encounter_id: str = Header(..., alias="x-encounter-id"),
    tenant_id: str = Header(..., alias="x-tenant-id"),
) -> TranscribeResponse:
    audio_bytes = await file.read()
    result = await transcribe_clip(audio_bytes, tenant_id=tenant_id)
    return TranscribeResponse(
        encounter_id=encounter_id,
        text=result.text,
        language=result.language,
        duration_ms=result.duration_ms,
    )
