from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.incident import CostItem

router = APIRouter(prefix="/cost", tags=["Cost Intelligence"])


@router.get("/overview")
async def get_cost_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CostItem).where(CostItem.org_id == current_user.org_id)
    )
    items = result.scalars().all()

    total_cost = sum(i.monthly_cost for i in items)
    potential_savings = sum(i.potential_savings for i in items if i.potential_savings)
    waste_detected = sum(i.monthly_cost for i in items if i.waste_type)

    # Group by resource type
    breakdown = {}
    for item in items:
        rt = item.resource_type
        if rt not in breakdown:
            breakdown[rt] = {"type": rt, "cost": 0, "percentage": 0}
        breakdown[rt]["cost"] += item.monthly_cost

    for rt in breakdown:
        breakdown[rt]["percentage"] = round(breakdown[rt]["cost"] / total_cost * 100, 1) if total_cost > 0 else 0

    # Top cost leaks (items with waste)
    leaks = sorted(
        [i for i in items if i.waste_type],
        key=lambda x: x.potential_savings,
        reverse=True,
    )

    return {
        "total_cost": round(total_cost, 0),
        "potential_savings": round(potential_savings, 0),
        "waste_detected": round(waste_detected, 0),
        "top_category": max(breakdown.values(), key=lambda x: x["cost"])["type"] if breakdown else "N/A",
        "breakdown": list(breakdown.values()),
        "leaks": [
            {
                "id": i.id,
                "resource_name": i.resource_name,
                "resource_type": i.resource_type,
                "monthly_cost": i.monthly_cost,
                "potential_savings": i.potential_savings,
                "waste_type": i.waste_type,
                "region": i.region,
                "details": i.details,
            }
            for i in leaks
        ],
        "all_items": [
            {
                "id": i.id,
                "resource_name": i.resource_name,
                "resource_type": i.resource_type,
                "monthly_cost": i.monthly_cost,
                "potential_savings": i.potential_savings,
                "waste_type": i.waste_type,
                "region": i.region,
            }
            for i in items
        ],
    }
