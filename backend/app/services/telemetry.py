"""
Real server telemetry collector.

Polls every registered server over SSH (paramiko) or Prometheus node_exporter
(HTTP + OpenMetrics text parsing), computes structured metrics, broadcasts them
over WebSockets, streams log lines, and emits `ai_trigger` events whenever an
error keyword is seen in real log output.

No fake data is generated: every number comes from a live remote command or
metrics endpoint.
"""
import asyncio
import hashlib
import io
import re
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
import paramiko
from sqlalchemy.future import select

from app.config import settings
from app.database import async_session
from app.models.server import Server
from app.routers.websockets import logs_manager, telemetry_manager
from app.services.crypto import decrypt_secret

ERROR_KEYWORDS = re.compile(
    r"\b(ERROR|CRITICAL|FATAL|FATAL EXCEPTION|EXCEPTION|PANIC|SEGFAULT|OOMKILL|OUT OF MEMORY|Traceback|No space left)\b",
    re.IGNORECASE,
)
WARN_KEYWORDS = re.compile(r"\b(WARN|WARNING|ALERT)\b", re.IGNORECASE)

# Dedup caches so we only stream / analyze *new* log lines.
_seen_logs: set = set()
_seen_triggers: set = set()
_prometheus_snapshots: Dict[str, Dict[str, float]] = {}


def _line_hash(server_id: str, line: str) -> str:
    return hashlib.sha256(f"{server_id}:{line}".encode("utf-8")).hexdigest()


def _derive_status(cpu: float = 0.0, memory: float = 0.0, disk: float = 0.0) -> str:
    """Status derived from real thresholds. CPU drives the red/yellow/green logic."""
    peak = max(cpu, memory, disk)
    if cpu >= 90 or peak >= 95:
        return "critical"
    if cpu >= 70 or peak >= 80:
        return "warning"
    return "healthy"


# ── Parsers for raw command output ─────────────────────────────────────────
def _parse_cpu_usage(raw: str) -> float:
    """Parse `top -bn1` '%Cpu(s):  x us, y sy, ..., z id' output."""
    if not raw:
        return 0.0
    idle = None
    m = re.search(r"([\d.]+)\s*id", raw)
    if m:
        idle = float(m.group(1))
    else:
        m = re.search(r"Cpu\(s\):\s*([\d.]+)%\s*us", raw)
        if m:
            return max(0.0, min(100.0, float(m.group(1))))
    if idle is None:
        return 0.0
    return max(0.0, min(100.0, 100.0 - idle))


def _parse_memory_usage(raw: str) -> float:
    """Parse `free -m` Mem row: used / total as a percentage."""
    for line in raw.splitlines():
        parts = line.split()
        if len(parts) >= 3 and parts[0].lower().rstrip(":") == "mem":
            try:
                total = float(parts[1])
                used = float(parts[2])
            except ValueError:
                continue
            if total > 0:
                return max(0.0, min(100.0, used / total * 100.0))
    return 0.0


def _parse_disk_usage(raw: str) -> float:
    """Parse `df -h /` and return the percentage used on the root mount."""
    for line in raw.splitlines():
        parts = line.split()
        if len(parts) >= 5 and parts[-1] == "/" and parts[-2].endswith("%"):
            try:
                return max(0.0, min(100.0, float(parts[-2][:-1])))
            except ValueError:
                continue
    for line in raw.splitlines():
        parts = line.split()
        if len(parts) >= 5 and parts[0].endswith("/") and parts[-1].endswith("%"):
            try:
                return max(0.0, min(100.0, float(parts[-1][:-1])))
            except ValueError:
                continue
    return 0.0


def _parse_uptime(raw: str) -> Optional[str]:
    raw = (raw or "").strip()
    return raw[:120] if raw else None


# ── SSH collection (runs in a thread executor) ─────────────────────────────
def _build_connect_kwargs(server: Server) -> dict:
    password = decrypt_secret(server.password)
    private_key = decrypt_secret(server.private_key)

    kwargs: dict = {
        "hostname": server.ip_address,
        "port": server.port or 22,
        "username": server.username,
        "timeout": settings.SSH_COMMAND_TIMEOUT,
        "look_for_keys": False,
        "allow_agent": False,
    }
    if private_key:
        key_material = io.StringIO(private_key)
        for cls in (paramiko.Ed25519Key, paramiko.RSAKey, paramiko.ECDSAKey):
            key_material.seek(0)
            try:
                kwargs["pkey"] = cls.from_private_key(key_material)
                break
            except Exception:
                continue
    elif password:
        kwargs["password"] = password
    return kwargs


def fetch_ssh_metrics(server: Server) -> dict:
    """Execute real remote commands over SSH and parse them into structured metrics."""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    started = time.monotonic()
    ssh.connect(**_build_connect_kwargs(server))
    latency_ms = round((time.monotonic() - started) * 1000)

    def run(cmd: str) -> str:
        _stdin, stdout, stderr = ssh.exec_command(cmd, timeout=settings.SSH_COMMAND_TIMEOUT)
        out = stdout.read().decode("utf-8", "replace")
        err = stderr.read().decode("utf-8", "replace")
        return out or err

    try:
        cpu_raw = run("top -bn1 | grep 'Cpu(s)' || uptime")
        mem_raw = run("free -m")
        disk_raw = run("df -h /")
        logs_raw = run(
            "journalctl -n 60 --no-pager 2>/dev/null "
            "|| tail -n 60 /var/log/syslog 2>/dev/null "
            "|| tail -n 60 /var/log/messages 2>/dev/null"
        )
        uptime_raw = run("uptime -p 2>/dev/null || uptime")

        cpu = _parse_cpu_usage(cpu_raw)
        memory = _parse_memory_usage(mem_raw)
        disk = _parse_disk_usage(disk_raw)

        return {
            "status": _derive_status(cpu, memory, disk),
            "cpu": round(cpu, 1),
            "memory": round(memory, 1),
            "disk": round(disk, 1),
            "latency_ms": latency_ms,
            "uptime": _parse_uptime(uptime_raw),
            "logs": logs_raw,
            "connection_type": "ssh",
        }
    finally:
        ssh.close()


# ── Prometheus node_exporter collection ────────────────────────────────────
async def fetch_prometheus_metrics(server: Server) -> dict:
    """GET <ip>:<port>/metrics and parse standard OpenMetrics text format."""
    url = f"http://{server.ip_address}:{server.port or 9100}/metrics"
    started = time.monotonic()
    async with httpx.AsyncClient(timeout=settings.SSH_COMMAND_TIMEOUT) as client:
        resp = await client.get(url, headers={"Accept": "text/plain; version=0.0.4"})
    latency_ms = round((time.monotonic() - started) * 1000)

    if resp.status_code != 200:
        raise RuntimeError(f"Prometheus endpoint returned HTTP {resp.status_code}")

    samples: Dict[tuple, float] = {}
    for line in resp.text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "{" in line and "} " in line:
            name = line.split("{", 1)[0].strip()
            labels, _, value = line.partition("} ")
            try:
                samples[(name, labels.strip("{}"))] = float(value)
            except ValueError:
                continue
        else:
            parts = line.split()
            if len(parts) == 2:
                try:
                    samples[(parts[0], "")] = float(parts[1])
                except ValueError:
                    continue

    def series(name: str, label_key: Optional[str] = None, label_value: Optional[str] = None):
        for (n, labels), value in samples.items():
            if n != name:
                continue
            if label_key is not None:
                if f'{label_key}="' not in labels:
                    continue
                if label_value is not None and f'{label_key}="{label_value}"' not in labels:
                    continue
            yield value

    # CPU utilization via counter deltas since boot
    cpu = 0.0
    idle_vals = list(series("node_cpu_seconds_total", "mode", "idle"))
    total_vals = list(series("node_cpu_seconds_total"))
    if idle_vals and total_vals:
        idle, total = sum(idle_vals), sum(total_vals)
        prev = _prometheus_snapshots.get(server.id)
        now = time.monotonic()
        if prev and now - prev.get("t", 0) > 0.5 and total > prev.get("total", 0):
            idle_delta = idle - prev.get("idle", idle)
            total_delta = total - prev.get("total", total)
            if total_delta > 0:
                cpu = (1.0 - max(idle_delta, 0.0) / total_delta) * 100.0
        _prometheus_snapshots[server.id] = {"idle": idle, "total": total, "t": now}

    # Memory
    mem_total = next(series("node_memory_MemTotal_bytes"), None)
    mem_avail = next(series("node_memory_MemAvailable_bytes"), None)
    memory = 0.0
    if mem_total and mem_avail:
        memory = (1.0 - mem_avail / mem_total) * 100.0

    # Disk (root filesystem)
    disk = 0.0
    disk_total = next(series("node_filesystem_size_bytes", "mountpoint", "/"), None)
    disk_avail = next(series("node_filesystem_avail_bytes", "mountpoint", "/"), None)
    if disk_total and disk_avail:
        disk = (1.0 - disk_avail / disk_total) * 100.0

    return {
        "status": _derive_status(cpu, memory, disk),
        "cpu": round(cpu, 1),
        "memory": round(memory, 1),
        "disk": round(disk, 1),
        "latency_ms": latency_ms,
        "uptime": None,
        "logs": "",
        "connection_type": "prometheus",
    }


# ── Log publishing + AI trigger detection ──────────────────────────────────
async def _publish_log(server: Server, node: dict, line: str, level: str):
    entry = {
        "type": "log",
        "server_id": server.id,
        "server_name": server.name,
        "level": level,
        "message": line,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    await logs_manager.broadcast(entry, server_id=server.id)

    if level == "ERROR":
        trigger_sig = _line_hash("trigger", line)
        if trigger_sig not in _seen_triggers:
            _seen_triggers.add(trigger_sig)
            if len(_seen_triggers) > 5000:
                _seen_triggers.clear()
            await logs_manager.broadcast(
                {
                    "type": "ai_trigger",
                    "server_id": server.id,
                    "server_name": server.name,
                    "specs": {
                        "name": server.name,
                        "ip": server.ip_address,
                        "connection_type": server.connection_type,
                        "cpu": node.get("cpu"),
                        "memory": node.get("memory"),
                        "disk": node.get("disk"),
                        "latency_ms": node.get("latency_ms"),
                        "uptime": node.get("uptime"),
                    },
                    "log_chunk": line,
                    "timestamp": entry["timestamp"],
                },
                server_id=server.id,
            )


async def _publish_log_batch(server: Server, node: dict, raw_logs: str):
    for line in raw_logs.splitlines():
        line = line.strip()
        if not line:
            continue
        sig = _line_hash(server.id, line)
        if sig in _seen_logs:
            continue
        _seen_logs.add(sig)
        if len(_seen_logs) > 20000:
            _seen_logs.clear()

        if ERROR_KEYWORDS.search(line):
            level = "ERROR"
        elif WARN_KEYWORDS.search(line):
            level = "WARN"
        else:
            level = "INFO"

        await _publish_log(server, node, line, level)


# ── Main collector loop ────────────────────────────────────────────────────
async def collect_metrics():
    while True:
        try:
            async with async_session() as db:
                result = await db.execute(select(Server))
                servers = result.scalars().all()

            telemetry_data: List[dict] = []
            for server in servers:
                node: dict = {
                    "id": server.id,
                    "name": server.name,
                    "ip": server.ip_address,
                    "connection_type": server.connection_type,
                    "status": "unknown",
                    "cpu": 0,
                    "memory": 0,
                    "disk": 0,
                    "latency_ms": None,
                    "uptime": None,
                }
                try:
                    if server.connection_type == "ssh":
                        loop = asyncio.get_running_loop()
                        result_ = await loop.run_in_executor(None, fetch_ssh_metrics, server)
                    elif server.connection_type == "prometheus":
                        result_ = await fetch_prometheus_metrics(server)
                    else:
                        raise RuntimeError(f"Unsupported connection type: {server.connection_type}")

                    node.update({k: v for k, v in result_.items() if k != "logs"})
                    await _publish_log_batch(server, node, result_.get("logs", ""))
                except Exception as e:
                    node["status"] = "critical"
                    node["latency_ms"] = None
                    await _publish_log(
                        server,
                        node,
                        f"SREAI collector connection failed for {server.name} ({server.ip_address}): {e}",
                        "CRITICAL",
                    )

                telemetry_data.append(node)

            snapshot = {"type": "telemetry", "nodes": telemetry_data}
            telemetry_manager.latest = snapshot
            await telemetry_manager.broadcast(snapshot)
        except Exception as e:
            print(f"Error in telemetry collector: {e}")

        await asyncio.sleep(settings.TELEMETRY_INTERVAL_SECONDS)
