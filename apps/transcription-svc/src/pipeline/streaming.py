"""Streaming pipeline: audio chunks in → partial + final transcripts out.

Architecture:
  client (browser) ─ binary frames (Opus) ─▶ StreamingPipeline
                                              ├─ ring buffer (5s)
                                              ├─ VAD (silero)
                                              ├─ on speech end → faster-whisper.transcribe
                                              ├─ diarization (pyannote, every 30s)
                                              └─ medical-vocab boost + ICD/SNOMED/RxNorm linker
                                            ▲
  client (browser) ◀ JSON {segment, isFinal, speakerLabel, codes} ┘

This file contains the orchestrator only — pluggable VAD/diarization/linker
implementations live alongside in src/pipeline/. Real implementation TBD; this
scaffolding establishes the contract apps/web speaks to.
"""

from __future__ import annotations

import asyncio
import logging
from typing import AsyncIterator

from fastapi import WebSocket

log = logging.getLogger(__name__)


class StreamingPipeline:
    def __init__(self, encounter_id: str) -> None:
        self.encounter_id = encounter_id
        self._closed = False

    async def run(self, websocket: WebSocket) -> AsyncIterator[dict]:
        """Yield segments as they finalise. Skeleton: echoes a ready signal then
        consumes audio frames silently. Replaced by real ASR + diarization in M2.
        """
        yield {"type": "ready", "encounter_id": self.encounter_id}
        while not self._closed:
            try:
                msg = await websocket.receive()
            except Exception:
                break
            if msg.get("type") == "websocket.disconnect":
                break
            await asyncio.sleep(0)

    async def close(self) -> None:
        self._closed = True
