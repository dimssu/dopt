from __future__ import annotations

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..pipeline.streaming import StreamingPipeline

router = APIRouter()
log = logging.getLogger(__name__)


@router.websocket("/stream/{encounter_id}")
async def stream(websocket: WebSocket, encounter_id: str) -> None:
    await websocket.accept()
    pipeline = StreamingPipeline(encounter_id=encounter_id)
    try:
        async for message in pipeline.run(websocket):
            await websocket.send_text(json.dumps(message))
    except WebSocketDisconnect:
        log.info("client disconnected from %s", encounter_id)
    finally:
        await pipeline.close()
