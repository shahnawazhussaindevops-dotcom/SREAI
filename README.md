# SREAI

AI-assisted incident response and live infrastructure monitoring for on-call engineers. One dashboard that polls real hosts over SSH and Prometheus, streams their logs over WebSocket, and turns an error line into a root-cause explanation plus a bash script you can actually run against the box.

![SREAI dashboard](ChatGPT%20Image%20Aug%209%2C%202026%2C%2010_39_17%20PM.png)

## What it does

- **Live telemetry, no fake data.** The collector runs `top -bn1`, `free -m`, and `df -h /` over SSH, or reads OpenMetrics from a Prometheus `node_exporter`, and broadcasts a snapshot every 3 seconds over WebSocket (`/ws/telemetry`). Every number on the dashboard comes from a real remote command.
- **Live logs.** `journalctl -n 60` (with syslog fallbacks) streamed line-by-line over `/ws/logs`, deduplicated by hash, tagged ERROR/WARN/INFO. An error keyword fires an `ai_trigger` event to the connected clients.
- **AI root-cause analysis.** When an error lands, the backend sends the server's real specs and the log chunk to GPT-4o or Claude-3.5-Sonnet and asks for strict JSON: a plain-English explanation plus one ready-to-run bash script. No provider key configured? It drops to a rule-based analyzer that recognizes OOM, ENOSPC, connection refused, 502/503, and generic failures.
- **One-click remediation.** Approve the generated script and it executes over SSH against the host — SSH-only servers, Prometheus endpoints stay read-only. Exit code, stdout, and stderr come back into the UI.
- **Incident triage.** Severity, status, MTTR, AI summary, root cause, confidence score, contributing factors, affected services.
- **3D topology + inventory.** A Three.js view of the fleet next to a live terminal; per-node CPU/MEM/DISK cards below.
- **Backend-first platform.** Multi-tenant orgs with admin/engineer/viewer roles, JWT auth, runbooks, cost waste detection, security findings, and chaos simulation scenarios are all modeled, seeded, and served by the API.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4, framer-motion, three.js (via @react-three/fiber), react-virtuoso, lucide-react |
| Backend | FastAPI, SQLAlchemy (async), SQLite / aiosqlite, uvicorn |
| Transport | WebSocket (telemetry + logs), REST under `/api` |
| AI | OpenAI GPT-4o / Anthropic Claude with a mock rule-based fallback |
| Ops integration | SSH (paramiko), Prometheus node_exporter, optional Redis |

Server credentials are encrypted at rest (Fernet) before they hit the database; auth is JWT with access + refresh tokens. The product brief is [PRODUCT.md](PRODUCT.md) and the visual system (colors, typography, components) is [DESIGN.md](DESIGN.md).

## Layout

```
frontend/          Next.js 16 app (Tailwind, three.js, framer-motion)
backend/           FastAPI + SQLAlchemy
  ├─ app/routers/   auth, servers, dashboard, incidents, cost,
  │                 security, simulations, automation, ai, websockets
  ├─ app/services/  telemetry.py (SSH + Prometheus collectors),
  │                 crypto.py (Fernet credential encryption)
  ├─ app/models/    user, server, asset, incident, integration
  └─ app/seed.py    demo org, users, clusters, incidents, runbooks, costs
vercel.json         multi-service: Next.js frontend + FastAPI backend
```

The collector loop in `backend/app/services/telemetry.py` polls every registered server on an interval, merges live metrics with the stored record, and pushes snapshots to all connected clients. Log lines are deduplicated by hash so the same line is never re-analyzed twice.

## Getting started

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows — macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

On startup it creates `sreai.db` and seeds a demo "Acme Corp" org. Log in with:

```
admin@acme.com    / admin123
engineer@acme.com / engineer123
viewer@acme.com   / viewer123
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. The UI expects the API at `http://localhost:8000/api` — override with `NEXT_PUBLIC_API_URL` if yours differs. Hit "Add server" and register either an SSH host or a Prometheus `node_exporter` endpoint (`http://host:9100/metrics`). With nothing registered the inventory strip shows an empty state and the dashboard stays green.

Optional AI providers, set in the backend `.env` (or environment):

```
OPENAI_API_KEY=sk-...           # enables GPT-4o for RCA
ANTHROPIC_API_KEY=sk-ant-...    # or Claude
AI_MODEL=mock                   # default; auto-upgrades when a key is set
```

## API surface

REST lives under `/api` — auth, servers, incidents, cost, security, simulations, automation, and AI diagnostics. The two WebSocket endpoints:

- `/ws/telemetry` — 3-second snapshots of every monitored host
- `/ws/logs` — `subscribe {server_id}` to pin one server, or omit to get all; also delivers `ai_trigger` events

`GET /api/health` returns service name and version.

## Deployment

`vercel.json` runs the app as two services: the Next.js app (root `frontend`) and the FastAPI backend (`main:app`). `/api/backend/*` rewrites to the backend service; everything else hits the frontend.

## Honest status

The monitoring core — SSH + Prometheus collection, log streaming, AI RCA, remediation execution, incident triage, 3D topology — works end-to-end. What's not wired up yet:

- Cost, security, simulations, and runbooks are fully seeded and served by the API but have no frontend screens; the Automation and Settings tabs are placeholders.
- Redis is optional and unused unless you point `REDIS_URL` at something.
- Rate limiting on auth is a TODO.
