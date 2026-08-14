from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.incident import SecurityFinding

router = APIRouter(prefix="/security", tags=["Security Intelligence"])


@router.get("/overview")
async def get_security_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SecurityFinding).where(SecurityFinding.org_id == current_user.org_id)
    )
    findings = result.scalars().all()

    total = len(findings)
    open_findings = [f for f in findings if f.status == "open"]
    mitigated = [f for f in findings if f.status == "mitigated"]

    # Calculate score
    severity_weights = {"critical": 10, "high": 5, "medium": 2, "low": 1}
    risk_points = sum(severity_weights.get(f.severity, 1) for f in open_findings)
    score = max(0, min(100, 100 - risk_points))

    # Count by severity
    by_severity = {}
    for f in open_findings:
        by_severity[f.severity] = by_severity.get(f.severity, 0) + 1

    # Count by category
    by_category = {}
    for f in open_findings:
        by_category[f.category] = by_category.get(f.category, 0) + 1

    # Top issues
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    sorted_findings = sorted(open_findings, key=lambda f: severity_order.get(f.severity, 4))

    return {
        "score": score,
        "total_findings": total,
        "open_findings": len(open_findings),
        "mitigated_findings": len(mitigated),
        "vulnerabilities": sum(1 for f in open_findings if f.category == "vulnerable_image"),
        "exposed_assets": sum(1 for f in open_findings if f.category == "exposed_port"),
        "compliant_resources": round((1 - len(open_findings) / max(total, 1)) * 100, 1),
        "by_severity": by_severity,
        "by_category": by_category,
        "top_findings": [
            {
                "id": f.id,
                "severity": f.severity,
                "category": f.category,
                "resource": f.resource,
                "description": f.description,
                "remediation": f.remediation,
                "status": f.status,
                "cve_id": f.cve_id,
            }
            for f in sorted_findings[:10]
        ],
        "all_findings": [
            {
                "id": f.id,
                "severity": f.severity,
                "category": f.category,
                "resource": f.resource,
                "description": f.description,
                "remediation": f.remediation,
                "status": f.status,
            }
            for f in findings
        ],
    }
