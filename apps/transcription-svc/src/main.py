"""FastAPI entry point for the transcription service.

Exposes:
  - GET  /health
  - WS   /v1/stream/{encounter_id} — bidirectional streaming
  - POST /v1/transcribe            — non-streaming for short clips
"""

from __future__ import annotations

import logging

from fastapi import FastAPI

from .routes.health import router as health_router
from .routes.transcribe import router as transcribe_router
from .routes.stream import router as stream_router

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("transcription-svc")

app = FastAPI(title="clinical-notes-transcription-svc", version="0.0.0")
app.include_router(health_router)
app.include_router(transcribe_router, prefix="/v1")
app.include_router(stream_router, prefix="/v1")
