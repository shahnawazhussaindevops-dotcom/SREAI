from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.server import Server
from app.routers.websockets import telemetry_manager
from app.services.crypto import encrypt_secret

router = APIRouter(prefix="/servers", tags=["Servers"])


class ServerCreate(BaseModel):
    name: str
    ip_address: str
    connection_type: str = "ssh"
    port: int = 22
    username: Optional[str] = None
    password: Optional[str] = None
    private_key: Optional[str] = None


class ServerResponse(BaseModel):
    id: str
    name: str
    ip_address: str
    connection_type: str
    port: int
    status: str
    cpu: Optional[float] = None
    memory: Optional[float] = None
    disk: Optional[float] = None
    latency_ms: Optional[float] = None

    class Config:
        from_attributes = True


def _latest_snapshot() -> dict:
    latest = getattr(telemetry_manager, "latest", None)
    if latest and latest.get("type") == "telemetry":
        return {node["id"]: node for node in latest["nodes"]}
    return {}


def _merge_metrics(server: Server, snapshot: dict) -> ServerResponse:
    item = ServerResponse.model_validate(server)
    live = snapshot.get(server.id)
    if live:
        item.cpu = live.get("cpu")
        item.memory = live.get("memory")
        item.disk = live.get("disk")
        item.status = live.get("status") or server.status
        item.latency_ms = live.get("latency_ms")
    return item


@router.post("/", response_model=ServerResponse)
async def add_server(server_data: ServerCreate, db: AsyncSession = Depends(get_db)):
    payload = server_data.model_dump()
    # Encrypt sensitive credentials before they hit the database.
    payload["password"] = encrypt_secret(payload.get("password"))
    payload["private_key"] = encrypt_secret(payload.get("private_key"))

    db_server = Server(**payload)
    db.add(db_server)
    await db.commit()
    await db.refresh(db_server)
    return _merge_metrics(db_server, _latest_snapshot())


@router.get("/", response_model=List[ServerResponse])
async def get_servers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Server))
    servers = result.scalars().all()
    snapshot = _latest_snapshot()
    return [_merge_metrics(server, snapshot) for server in servers]


@router.delete("/{server_id}")
async def delete_server(server_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Server).where(Server.id == server_id))
    server = result.scalars().first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    await db.delete(server)
    await db.commit()
    return {"message": "Server deleted"}
