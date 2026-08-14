from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.incident import Incident, Alert

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/")
async def list_incidents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(20, le=100),
):
    query = select(Incident).where(Incident.org_id == current_user.org_id)
    if status:
        query = query.where(Incident.status == status)
    if severity:
        query = query.where(Incident.severity == severity)

    result = await db.execute(query.order_by(Incident.started_at.desc()).limit(limit))
    incidents = result.scalars().all()

    return [
        {
            "id": inc.id,
            "incident_number": inc.incident_number,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "service_name": inc.service_name,
            "environment": inc.environment,
            "started_at": inc.started_at.isoformat() if inc.started_at else None,
            "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
            "mttr_seconds": inc.mttr_seconds,
            "confidence_score": inc.confidence_score,
            "assigned_to": inc.assigned_to,
        }
        for inc in incidents
    ]


@router.get("/{incident_id}")
async def get_incident(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Incident).where(Incident.id == incident_id, Incident.org_id == current_user.org_id)
    )
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    return {
        "id": inc.id,
        "incident_number": inc.incident_number,
        "title": inc.title,
        "description": inc.description,
        "severity": inc.severity,
        "status": inc.status,
        "service_name": inc.service_name,
        "environment": inc.environment,
        "started_at": inc.started_at.isoformat() if inc.started_at else None,
        "identified_at": inc.identified_at.isoformat() if inc.identified_at else None,
        "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
        "mttr_seconds": inc.mttr_seconds,
        "ai_summary": inc.ai_summary,
        "root_cause": inc.root_cause,
        "confidence_score": inc.confidence_score,
        "contributing_factors": inc.contributing_factors,
        "affected_services": inc.affected_services,
        "assigned_to": inc.assigned_to,
    }


@router.get("/{incident_id}/timeline")
async def get_incident_timeline(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a timeline of events related to this incident."""
    result = await db.execute(
        select(Incident).where(Incident.id == incident_id, Incident.org_id == current_user.org_id)
    )
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Build a synthetic timeline from incident data
    timeline = []
    if inc.started_at:
        timeline.append({
            "timestamp": inc.started_at.isoformat(),
            "type": "alert",
            "title": "Incident Detected",
            "description": f"Anomaly detected in {inc.service_name}",
            "severity": inc.severity,
        })

    if inc.contributing_factors:
        for i, factor in enumerate(inc.contributing_factors):
            from datetime import timedelta
            ts = inc.started_at + timedelta(minutes=i * 2 + 1) if inc.started_at else None
            timeline.append({
                "timestamp": ts.isoformat() if ts else None,
                "type": "analysis",
                "title": factor.get("factor", "Factor detected"),
                "description": factor.get("detail", ""),
                "severity": factor.get("severity", "medium"),
            })

    if inc.identified_at:
        timeline.append({
            "timestamp": inc.identified_at.isoformat(),
            "type": "identification",
            "title": "Root Cause Identified",
            "description": inc.root_cause or "Root cause determined by AI analysis",
            "severity": "info",
        })

    if inc.resolved_at:
        timeline.append({
            "timestamp": inc.resolved_at.isoformat(),
            "type": "resolution",
            "title": "Incident Resolved",
            "description": f"MTTR: {inc.mttr_seconds // 60}m" if inc.mttr_seconds else "Resolved",
            "severity": "success",
        })

    return {
        "incident_id": incident_id,
        "incident_number": inc.incident_number,
        "title": inc.title,
        "timeline": timeline,
    }
