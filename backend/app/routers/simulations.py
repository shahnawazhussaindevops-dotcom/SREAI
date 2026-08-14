from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.incident import SimulationScenario
import uuid
from datetime import datetime

router = APIRouter(prefix="/simulations", tags=["Simulation Lab"])


class RunSimulationRequest(BaseModel):
    scenario_type: str
    target_resource: str
    parameters: Optional[dict] = {}


@router.get("/")
async def list_simulations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SimulationScenario)
        .where(SimulationScenario.org_id == current_user.org_id)
        .order_by(SimulationScenario.created_at.desc())
    )
    sims = result.scalars().all()

    return [
        {
            "id": s.id,
            "scenario_type": s.scenario_type,
            "target_resource": s.target_resource,
            "risk_score": s.risk_score,
            "blast_radius": s.blast_radius,
            "status": s.status,
            "created_by": s.created_by,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "result": s.result_json,
        }
        for s in sims
    ]


@router.post("/run")
async def run_simulation(
    req: RunSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run a simulated failure scenario and return predicted impact."""
    # Generate mock simulation results based on scenario type
    risk_map = {
        "Pod Failure": {"risk": 12, "blast": "Low Risk", "error_increase": "0.12%", "response_impact": "45ms", "users": "~2", "availability": "99.98%"},
        "Node Failure": {"risk": 45, "blast": "Medium Risk", "error_increase": "2.5%", "response_impact": "350ms", "users": "~150", "availability": "99.2%"},
        "Traffic Spike": {"risk": 78, "blast": "High Risk", "error_increase": "15%", "response_impact": "2500ms", "users": "~5000", "availability": "94.5%"},
        "Region Outage": {"risk": 92, "blast": "Critical Risk", "error_increase": "45%", "response_impact": "N/A", "users": "~25000", "availability": "72.0%"},
        "Database Bottleneck": {"risk": 55, "blast": "Medium Risk", "error_increase": "5%", "response_impact": "800ms", "users": "~500", "availability": "98.5%"},
        "Memory Leak": {"risk": 35, "blast": "Low Risk", "error_increase": "1%", "response_impact": "150ms", "users": "~50", "availability": "99.5%"},
        "Config Error": {"risk": 60, "blast": "Medium Risk", "error_increase": "8%", "response_impact": "1200ms", "users": "~800", "availability": "97.8%"},
        "Bad Deployment": {"risk": 65, "blast": "Medium Risk", "error_increase": "10%", "response_impact": "1500ms", "users": "~1200", "availability": "96.5%"},
    }

    scenario = risk_map.get(req.scenario_type, risk_map["Pod Failure"])

    result_json = {
        "blast_radius": f"{scenario['blast']} — {req.target_resource}",
        "error_rate_increase": scenario["error_increase"],
        "response_time_impact": scenario["response_impact"],
        "affected_users": scenario["users"],
        "availability_impact": scenario["availability"],
        "recommendation": f"Simulation completed for {req.scenario_type} on {req.target_resource}.",
    }

    sim = SimulationScenario(
        id=str(uuid.uuid4()),
        org_id=current_user.org_id,
        scenario_type=req.scenario_type,
        target_resource=req.target_resource,
        parameters_json=req.parameters,
        result_json=result_json,
        risk_score=scenario["risk"],
        blast_radius=scenario["blast"],
        status="completed",
        created_by=current_user.name,
    )
    db.add(sim)
    await db.commit()

    return {
        "id": sim.id,
        "scenario_type": sim.scenario_type,
        "target_resource": sim.target_resource,
        "risk_score": sim.risk_score,
        "blast_radius": sim.blast_radius,
        "status": "completed",
        "result": result_json,
    }


@router.get("/{simulation_id}")
async def get_simulation(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SimulationScenario).where(
            SimulationScenario.id == simulation_id,
            SimulationScenario.org_id == current_user.org_id,
        )
    )
    sim = result.scalar_one_or_none()
    if not sim:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Simulation not found")

    return {
        "id": sim.id,
        "scenario_type": sim.scenario_type,
        "target_resource": sim.target_resource,
        "parameters": sim.parameters_json,
        "result": sim.result_json,
        "risk_score": sim.risk_score,
        "blast_radius": sim.blast_radius,
        "status": sim.status,
        "created_by": sim.created_by,
        "created_at": sim.created_at.isoformat() if sim.created_at else None,
    }
