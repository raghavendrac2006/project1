from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.audit import AuditLog
from backend.app.models.institution import Institution
from backend.app.models.domain import DataDomain
from backend.app.schemas import AuditLogSchema

router = APIRouter()


@router.get("", response_model=List[AuditLogSchema])
def list_access_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    List immutable audit log history for current citizen.
    """
    logs = db.query(AuditLog).filter(
        AuditLog.citizen_id == current_user.id
    ).order_by(AuditLog.timestamp.desc()).all()

    result = []
    for log in logs:
        inst = db.query(Institution).filter(Institution.id == log.institution_id).first() if log.institution_id else None
        dom = db.query(DataDomain).filter(DataDomain.id == log.domain_id).first() if log.domain_id else None

        result.append({
            "id": log.id,
            "citizen_id": log.citizen_id,
            "institution_id": log.institution_id,
            "institution_name": inst.name if inst else "System / Citizen Direct",
            "user_id": log.user_id,
            "domain_id": log.domain_id,
            "domain_name": dom.name if dom else "N/A",
            "action": log.action,
            "purpose": log.purpose,
            "accessed_fields": log.accessed_fields or [],
            "timestamp": log.timestamp,
            "outcome": log.outcome
        })
    return result
