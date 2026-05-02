# transcription-svc

FastAPI streaming ASR + diarization service.

- Primary: faster-whisper (`large-v3` on GPU, `base.en` for local dev) with VAD-gated chunking.
- Fallback: Deepgram, behind a per-tenant flag and constrained by data residency.
- Diarization: pyannote.audio (clinician vs. patient vs. caregiver vs. other).
- Linker: medical vocabulary boost + ICD-10 / SNOMED / RxNorm linking on final segments.

Endpoints:
- `WS /v1/stream/{encounter_id}` — binary audio in (Opus or PCM), JSON segments out.
- `POST /v1/transcribe` — short non-streaming clips.
- `GET /health`.

Owned by `ml-engineer`. PHI never leaves the configured tenant region — provider routing is gated upstream by the API.
