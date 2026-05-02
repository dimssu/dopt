"""FastAPI entry point for the note generation service."""

from __future__ import annotations

import logging

from fastapi import FastAPI

from .routes.health import router as health_router
from .routes.generate import router as generate_router

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("notes-svc")

app = FastAPI(title="clinical-notes-notes-svc", version="0.0.0")
app.include_router(health_router)
app.include_router(generate_router)
