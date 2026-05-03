from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.ros_relay import relay_rosbridge

router = APIRouter()


@router.websocket("/ws")
async def websocket_relay(websocket: WebSocket) -> None:
    try:
        await relay_rosbridge(websocket)
    except WebSocketDisconnect:
        return
