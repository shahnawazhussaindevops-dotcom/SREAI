from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.incident import Runbook, RemediationAction

router = APIRouter(prefix="/automation", tags=["Automation"])


@router.get("/runbooks")
async def list_runbooks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Runbook).where(Runbook.org_id == current_user.org_id).order_by(Runbook.name)
    )
    runbooks = result.scalars().all()

    return [
        {
            "id": rb.id,
            "name": rb.name,
            "description": rb.description,
            "script": rb.script,
            "trigger": rb.trigger,
            "category": rb.category,
            "is_active": rb.is_active,
            "requires_approval": rb.requires_approval,
            "execution_count": rb.execution_count,
            "last_executed": rb.last_executed.isoformat() if rb.last_executed else None,
        }
        for rb in runbooks
    ]


@router.get("/actions")
async def list_actions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RemediationAction).order_by(RemediationAction.created_at.desc()).limit(50)
    )
    actions = result.scalars().all()

    return [
        {
            "id": a.id,
            "incident_id": a.incident_id,
            "action_type": a.action_type,
            "description": a.description,
            "status": a.status,
            "executed_by": a.executed_by,
            "approved_by": a.approved_by,
            "output": a.output,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in actions
    ]
