from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from typing import Optional

router = APIRouter(prefix="/ws", tags=["WebSockets"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
        self.latest: Optional[dict] = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[websocket] = {"server_id": None}

    def disconnect(self, websocket: WebSocket):
        self.active_connections.pop(websocket, None)

    def set_subscription(self, websocket: WebSocket, server_id: Optional[str]):
        if websocket in self.active_connections:
            self.active_connections[websocket]["server_id"] = server_id

    def client_count(self) -> int:
        return len(self.active_connections)

    async def send(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: dict, server_id: Optional[str] = None):
        """Deliver a message to connected clients.

        If `server_id` is provided (e.g. a log line), only clients that subscribed
        to that server OR to all servers (server_id=None) receive it. Telemetry
        snapshots carry no server_id and are delivered to every client.
        """
        text_data = json.dumps(message)
        dead = []
        for websocket, meta in list(self.active_connections.items()):
            subscribed = meta.get("server_id")
            if server_id is not None and subscribed is not None and subscribed != server_id:
                continue
            try:
                await websocket.send_text(text_data)
            except Exception:
                dead.append(websocket)
        for websocket in dead:
            self.disconnect(websocket)


telemetry_manager = ConnectionManager()
logs_manager = ConnectionManager()


@router.websocket("/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await telemetry_manager.connect(websocket)
    # Push the most recent snapshot immediately so a freshly-connected client
    # doesn't wait for the next poll cycle.
    if telemetry_manager.latest:
        await telemetry_manager.send(websocket, telemetry_manager.latest)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await telemetry_manager.send(websocket, {"type": "pong"})
            except Exception:
                pass
    except WebSocketDisconnect:
        telemetry_manager.disconnect(websocket)
    except Exception:
        telemetry_manager.disconnect(websocket)


@router.websocket("/logs")
async def websocket_logs_endpoint(websocket: WebSocket):
    await logs_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "subscribe":
                    # server_id None -> subscribe to all servers
                    logs_manager.set_subscription(websocket, msg.get("server_id"))
                elif msg.get("type") == "ping":
                    await logs_manager.send(websocket, {"type": "pong"})
            except Exception:
                pass
    except WebSocketDisconnect:
        logs_manager.disconnect(websocket)
    except Exception:
        logs_manager.disconnect(websocket)
