from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.asset import Service, Cluster
from app.models.incident import Incident, Alert, CostItem, SecurityFinding

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview")
async def get_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = current_user.org_id

    # System health - calculate from services
    svc_result = await db.execute(select(Service).where(Service.org_id == org_id))
    services = svc_result.scalars().all()
    total_services = len(services)
    healthy_services = sum(1 for s in services if s.health == "healthy")
    health_pct = round((healthy_services / total_services * 100), 1) if total_services > 0 else 100.0

    # Active incidents
    inc_result = await db.execute(
        select(func.count(Incident.id)).where(
            Incident.org_id == org_id,
            Incident.status.in_(["investigating", "identified", "monitoring"])
        )
    )
    active_incidents = inc_result.scalar() or 0

    # Total cost
    cost_result = await db.execute(
        select(func.sum(CostItem.monthly_cost)).where(CostItem.org_id == org_id)
    )
    total_cost = round(cost_result.scalar() or 0, 0)

    # Potential savings
    savings_result = await db.execute(
        select(func.sum(CostItem.potential_savings)).where(
            CostItem.org_id == org_id, CostItem.potential_savings > 0
        )
    )
    potential_savings = round(savings_result.scalar() or 0, 0)

    # MTTR - avg from resolved incidents
    mttr_result = await db.execute(
        select(func.avg(Incident.mttr_seconds)).where(
            Incident.org_id == org_id,
            Incident.mttr_seconds.isnot(None)
        )
    )
    avg_mttr = mttr_result.scalar()
    mttr_minutes = round(avg_mttr / 60, 0) if avg_mttr else 38

    # Active alerts
    alerts_result = await db.execute(
        select(func.count(Alert.id)).where(
            Alert.org_id == org_id, Alert.status == "firing"
        )
    )
    active_alerts = alerts_result.scalar() or 0

    # Security score
    sec_result = await db.execute(
        select(func.count(SecurityFinding.id)).where(
            SecurityFinding.org_id == org_id, SecurityFinding.status == "open"
        )
    )
    open_findings = sec_result.scalar() or 0
    security_score = max(0, 100 - (open_findings * 1.5))

    # Clusters
    cluster_result = await db.execute(select(Cluster).where(Cluster.org_id == org_id))
    clusters = cluster_result.scalars().all()

    return {
        "system_health": health_pct,
        "active_incidents": active_incidents,
        "total_services": total_services,
        "total_cost": total_cost,
        "potential_savings": potential_savings,
        "mttr_minutes": mttr_minutes,
        "active_alerts": active_alerts,
        "security_score": round(security_score, 0),
        "clusters": [
            {
                "id": c.id,
                "name": c.name,
                "provider": c.provider,
                "region": c.region,
                "status": c.status,
                "node_count": c.node_count,
                "cpu_usage": c.cpu_usage,
                "memory_usage": c.memory_usage,
            }
            for c in clusters
        ],
    }


@router.get("/recent-alerts")
async def get_recent_alerts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Alert)
        .where(Alert.org_id == current_user.org_id)
        .order_by(Alert.fired_at.desc())
        .limit(10)
    )
    alerts = result.scalars().all()

    return [
        {
            "id": a.id,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "service_name": a.service_name,
            "status": a.status,
            "source": a.source,
            "fired_at": a.fired_at.isoformat() if a.fired_at else None,
        }
        for a in alerts
    ]


@router.get("/recent-deployments")
async def get_recent_deployments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.asset import Deployment, Service

    result = await db.execute(
        select(Deployment, Service.name)
        .join(Service, Deployment.service_id == Service.id)
        .order_by(Deployment.deployed_at.desc())
        .limit(10)
    )
    deployments = result.all()

    return [
        {
            "id": d.Deployment.id,
            "service_name": d.name,
            "version": d.Deployment.version,
            "status": d.Deployment.status,
            "environment": d.Deployment.environment,
            "deployed_by": d.Deployment.deployed_by,
            "deployed_at": d.Deployment.deployed_at.isoformat() if d.Deployment.deployed_at else None,
        }
        for d in deployments
    ]
