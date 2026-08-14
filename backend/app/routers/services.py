from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.asset import Service, DependencyEdge, Cluster, Node, Pod

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("/")
async def list_services(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    environment: Optional[str] = None,
    health: Optional[str] = None,
):
    query = select(Service).where(Service.org_id == current_user.org_id)
    if environment:
        query = query.where(Service.environment == environment)
    if health:
        query = query.where(Service.health == health)

    result = await db.execute(query.order_by(Service.name))
    services = result.scalars().all()

    return [
        {
            "id": s.id,
            "name": s.name,
            "namespace": s.namespace,
            "type": s.type,
            "version": s.version,
            "health": s.health,
            "replicas": s.replicas,
            "cpu_usage": s.cpu_usage,
            "memory_usage": s.memory_usage,
            "request_rate": s.request_rate,
            "error_rate": s.error_rate,
            "p99_latency": s.p99_latency,
            "owner_team": s.owner_team,
        }
        for s in services
    ]


@router.get("/topology")
async def get_topology(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full service topology with dependency edges for the graph visualization."""
    # Get all services
    svc_result = await db.execute(
        select(Service).where(Service.org_id == current_user.org_id)
    )
    services = svc_result.scalars().all()

    # Get all edges
    edge_result = await db.execute(select(DependencyEdge))
    edges = edge_result.scalars().all()

    # Get clusters and nodes for the full topology
    cluster_result = await db.execute(
        select(Cluster).where(Cluster.org_id == current_user.org_id)
    )
    clusters = cluster_result.scalars().all()

    nodes_result = await db.execute(select(Node))
    nodes = nodes_result.scalars().all()

    return {
        "services": [
            {
                "id": s.id,
                "name": s.name,
                "type": s.type,
                "health": s.health,
                "version": s.version,
                "namespace": s.namespace,
                "cpu_usage": s.cpu_usage,
                "memory_usage": s.memory_usage,
                "request_rate": s.request_rate,
                "error_rate": s.error_rate,
                "p99_latency": s.p99_latency,
                "replicas": s.replicas,
                "owner_team": s.owner_team,
            }
            for s in services
        ],
        "edges": [
            {
                "id": e.id,
                "source": e.source_service_id,
                "target": e.target_service_id,
                "type": e.type,
                "latency_p99": e.latency_p99,
                "request_rate": e.request_rate,
                "error_rate": e.error_rate,
            }
            for e in edges
        ],
        "clusters": [
            {
                "id": c.id,
                "name": c.name,
                "provider": c.provider,
                "region": c.region,
                "status": c.status,
                "node_count": c.node_count,
            }
            for c in clusters
        ],
        "nodes": [
            {
                "id": n.id,
                "cluster_id": n.cluster_id,
                "name": n.name,
                "ip": n.ip,
                "status": n.status,
                "cpu_usage": n.cpu_usage,
                "memory_usage": n.memory_usage,
                "disk_usage": n.disk_usage,
            }
            for n in nodes
        ],
    }


@router.get("/{service_id}")
async def get_service(
    service_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Service).where(Service.id == service_id, Service.org_id == current_user.org_id)
    )
    s = result.scalar_one_or_none()
    if not s:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Service not found")

    # Get pods
    pod_result = await db.execute(select(Pod).where(Pod.service_id == service_id))
    pods = pod_result.scalars().all()

    # Get dependencies
    dep_result = await db.execute(
        select(DependencyEdge, Service.name).join(
            Service, DependencyEdge.target_service_id == Service.id
        ).where(DependencyEdge.source_service_id == service_id)
    )
    dependencies = dep_result.all()

    return {
        "id": s.id,
        "name": s.name,
        "namespace": s.namespace,
        "type": s.type,
        "version": s.version,
        "health": s.health,
        "replicas": s.replicas,
        "cpu_usage": s.cpu_usage,
        "memory_usage": s.memory_usage,
        "request_rate": s.request_rate,
        "error_rate": s.error_rate,
        "p99_latency": s.p99_latency,
        "owner_team": s.owner_team,
        "pods": [
            {
                "id": p.id,
                "name": p.name,
                "status": p.status,
                "cpu_usage": p.cpu_usage,
                "memory_usage": p.memory_usage,
                "restarts": p.restarts,
            }
            for p in pods
        ],
        "dependencies": [
            {
                "service_name": d.name,
                "type": d.DependencyEdge.type,
                "latency_p99": d.DependencyEdge.latency_p99,
                "health": "healthy",
            }
            for d in dependencies
        ],
    }
