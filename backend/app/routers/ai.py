import io
import json
from typing import Any, Dict, Optional

import paramiko
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.database import get_db
from app.models.server import Server
from app.services.crypto import decrypt_secret

# NOTE: mounted under /api in main.py, so the prefix here is /ai -> /api/ai/...
router = APIRouter(prefix="/ai", tags=["AI Diagnostics"])


class LogAnalysisRequest(BaseModel):
    server_id: str
    log_chunk: str
    server_name: Optional[str] = None
    specs: Dict[str, Any] = {}


class LogAnalysisResponse(BaseModel):
    server_id: str
    server_name: str
    explanation: str
    remediation_script: str
    model: str


class RemediationRequest(BaseModel):
    server_id: str
    script: str


# ── Fallback rule-based analysis (used only when no LLM provider is configured) ──
def _mock_analysis(log_chunk: str, specs: dict) -> dict:
    lower = (log_chunk or "").lower()
    if any(k in lower for k in ("oom", "out of memory", "killed", "cannot allocate memory")):
        explanation = (
            "The process was terminated by the Linux OOM killer because the host ran out of "
            "memory (or the container exceeded its cgroup memory limit). This usually indicates "
            "a memory leak or an undersized memory limit for the workload."
        )
        script = (
            "#!/bin/bash\n"
            "# 1) Confirm the OOM kill\n"
            "dmesg -T | tail -n 30 | grep -i -B2 -A4 'oom\\|out of memory' || true\n\n"
            "# 2) Show memory pressure\n"
            "free -m\n\n"
            "# 3) Restart the affected service (adjust to the real unit name)\n"
            "systemctl restart <service-name> 2>/dev/null || true\n\n"
            "# 4) Free page cache if the host is memory-starved\n"
            "sync && echo 3 > /proc/sys/vm/drop_caches\n\n"
            "echo 'OOM remediation applied'"
        )
    elif any(k in lower for k in ("no space", "disk", "enospc", "space left")):
        explanation = (
            "The disk is full or nearly full, so the application cannot write logs, temp files, "
            "or database WAL segments. Services typically fail with 'No space left on device'."
        )
        script = (
            "#!/bin/bash\n"
            "# 1) Inspect disk usage\n"
            "df -h\n\n"
            "# 2) Find the largest folders\n"
            "du -sh /* 2>/dev/null | sort -hr | head -20\n\n"
            "# 3) Rotate/delete old logs\n"
            "find /var/log -name '*.log' -mtime +7 -delete 2>/dev/null || true\n\n"
            "# 4) Vacuum the systemd journal older than 7 days\n"
            "journalctl --vacuum-time=7d 2>/dev/null || true\n\n"
            "echo 'Disk cleanup completed'"
        )
    elif any(k in lower for k in ("connection refused", "connection timed out", "network", "getaddrinfo", "econnreset")):
        explanation = (
            "A network connection to a dependency (database, API, message broker, or peer) was "
            "refused or timed out. Verify the dependency is up, listening on its port, and that "
            "firewall/security-group rules allow the traffic."
        )
        script = (
            "#!/bin/bash\n"
            "# 1) Show listening ports\n"
            "ss -tlnp | head -40 || true\n\n"
            "# 2) Check DNS resolution\n"
            "getent hosts $(hostname) || true\n\n"
            "# 3) Restart the local service that depends on the remote endpoint\n"
            "systemctl restart <service-name> 2>/dev/null || true\n\n"
            "echo 'Network remediation applied'"
        )
    elif any(k in lower for k in ("nginx", "apache", "httpd", "502", "503", "worker")):
        explanation = (
            "The web server (or its upstream/backend) is returning an error status, often because "
            "a backend process crashed, a worker pool is exhausted, or a socket file disappeared."
        )
        script = (
            "#!/bin/bash\n"
            "# 1) Restart the web server\n"
            "systemctl restart nginx 2>/dev/null || systemctl restart apache2 2>/dev/null || systemctl restart httpd 2>/dev/null || true\n\n"
            "# 2) Verify it came back up\n"
            "systemctl status nginx --no-pager 2>/dev/null | head -20 || true\n\n"
            "echo 'Web server restarted'"
        )
    else:
        explanation = (
            "An error-level message was detected in the live log stream. First inspect surrounding "
            "log context, then restart the affected service if it has entered an unhealthy state."
        )
        script = (
            "#!/bin/bash\n"
            "# 1) Show failed units\n"
            "systemctl --failed --no-pager 2>/dev/null || true\n\n"
            "# 2) Restart the affected service\n"
            "systemctl restart <service-name> 2>/dev/null || true\n\n"
            "echo 'Restart attempted - verify service health'"
        )
    return {"explanation": explanation, "remediation_script": script}


# ── LLM providers ──────────────────────────────────────────────────────────
async def _llm_analysis(log_chunk: str, specs: dict) -> dict:
    provider = (settings.AI_MODEL or "mock").lower()
    if provider == "mock":
        if settings.OPENAI_API_KEY:
            provider = "openai"
        elif settings.ANTHROPIC_API_KEY:
            provider = "anthropic"
    elif provider == "openai" and not settings.OPENAI_API_KEY:
        provider = "mock"
    elif provider == "anthropic" and not settings.ANTHROPIC_API_KEY:
        provider = "mock"

    system_prompt = (
        "You are a Principal Site Reliability Engineer at a large infrastructure company. "
        "You are given real-time telemetry for a monitored server plus a chunk of its real logs. "
        "Produce a root-cause analysis. Respond with STRICT JSON containing exactly two keys: "
        '"explanation" (a concise, plain-English explanation of what failed and why, grounded in '
        "the provided logs and metrics) and \"remediation_script\" (exactly one ready-to-run bash "
        "script that safely fixes the issue, guarded with 'set -e' where destructive, and "
        "commands such as systemctl restart, journalctl vacuum, df, etc.). "
        "No markdown, no code fences, JSON only."
    )
    user_prompt = json.dumps({"server": specs, "log_chunk": log_chunk}, indent=2)

    if provider == "openai":
        import openai

        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content
        if not content:
            raise RuntimeError("OpenAI returned an empty response")
        return json.loads(content)

    if provider == "anthropic":
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = await client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        content = response.content[0].text
        return json.loads(content)

    return _mock_analysis(log_chunk, specs)


# ── Endpoints ──────────────────────────────────────────────────────────────
@router.post("/analyze-log", response_model=LogAnalysisResponse)
async def analyze_log(req: LogAnalysisRequest, db: AsyncSession = Depends(get_db)):
    server: Optional[Server] = None
    if req.server_id:
        result = await db.execute(select(Server).where(Server.id == req.server_id))
        server = result.scalars().first()

    specs: dict = dict(req.specs or {})
    if server:
        specs.setdefault("name", server.name)
        specs.setdefault("ip", server.ip_address)
        specs.setdefault("connection_type", server.connection_type)
        specs.setdefault("port", server.port)
        specs["server_id"] = server.id
    specs.setdefault("server_name", req.server_name or specs.get("name") or req.server_id)
    specs.setdefault("log_chunk_excerpt", (req.log_chunk or "")[:2000])

    try:
        analysis = await _llm_analysis(req.log_chunk or "", specs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM analysis failed: {e}")

    return LogAnalysisResponse(
        server_id=req.server_id,
        server_name=str(specs.get("server_name") or req.server_id),
        explanation=str(analysis.get("explanation") or "No explanation returned."),
        remediation_script=str(analysis.get("remediation_script") or "echo 'No remediation script returned.'"),
        model=(settings.AI_MODEL or "mock"),
    )


def _run_remote_script(server: Server, script: str) -> dict:
    """Execute an approved remediation script on the real target server over SSH."""
    password = decrypt_secret(server.password)
    private_key = decrypt_secret(server.private_key)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    connect_kwargs: dict = {
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
                connect_kwargs["pkey"] = cls.from_private_key(key_material)
                break
            except Exception:
                continue
    elif password:
        connect_kwargs["password"] = password

    ssh.connect(**connect_kwargs)
    try:
        stdin, stdout, stderr = ssh.exec_command("/bin/bash -s", timeout=120)
        stdin.write(script)
        stdin.channel.shutdown_write()
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode("utf-8", "replace")
        err = stderr.read().decode("utf-8", "replace")
        return {
            "exit_code": exit_status,
            "stdout": out[-8000:],
            "stderr": err[-4000:],
        }
    finally:
        ssh.close()


@router.post("/execute-remediation")
async def execute_remediation(req: RemediationRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Server).where(Server.id == req.server_id))
    server = result.scalars().first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    if server.connection_type != "ssh":
        raise HTTPException(
            status_code=400,
            detail="Remediation requires an SSH-connected server (Prometheus nodes are read-only metrics endpoints).",
        )

    try:
        output = _run_remote_script(server, req.script)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Remediation failed on remote server: {e}")

    return {
        "status": "success" if output["exit_code"] == 0 else "failure",
        "server_id": server.id,
        "server_name": server.name,
        **output,
    }
