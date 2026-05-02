"""Faster-Whisper backed transcription. Loaded lazily and shared across requests.

For local dev we default to the `base.en` model which is fast on CPU. Production
uses `large-v3` on GPU; the model is selected via the `WHISPER_MODEL` env var.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Any


@dataclass
class TranscriptionResult:
    text: str
    language: str
    duration_ms: int


@lru_cache(maxsize=1)
def _model() -> Any:
    from faster_whisper import WhisperModel  # noqa: WPS433 - lazy import

    name = os.environ.get("WHISPER_MODEL", "base.en")
    return WhisperModel(name, compute_type="auto")


async def transcribe_clip(audio_bytes: bytes, *, tenant_id: str) -> TranscriptionResult:
    import io

    segments, info = _model().transcribe(io.BytesIO(audio_bytes), beam_size=5)
    text = " ".join(seg.text.strip() for seg in segments)
    return TranscriptionResult(
        text=text,
        language=info.language,
        duration_ms=int(info.duration * 1000),
    )
