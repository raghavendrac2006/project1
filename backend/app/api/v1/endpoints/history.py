from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.institution import Institution
from backend.app.models.domain import DataDomain, DomainType
from backend.app.crud import crud_audit
from backend.app.schemas import AuditLogSchema

router = APIRouter()


@router.get("", response_model=List[AuditLogSchema])
def list_access_history(
    action: Optional[str] = Query(None, description="Filter by action type (e.g., REQUEST_CREATED, ACCESS_GRANTED, QUERY_DATA, REVOKE_CONSENT)"),
    domain_type: Optional[str] = Query(None, description="Filter by domain type (e.g., IDENTITY, FINANCE, EDUCATION)"),
    limit: Optional[int] = Query(100, ge=1, le=500, description="Max logs to return"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    logs = crud_audit.list_citizen_history(db, current_user.id)

    target_domain_id = None
    if domain_type:
        norm_type = domain_type.upper()
        if norm_type == "HEALTHCARE":
            norm_type = "HEALTH"
        elif norm_type == "GOVERNMENT":
            norm_type = "TRANSPORT"
        dom_obj = db.query(DataDomain).filter(DataDomain.domain_type == DomainType[norm_type]).first()
        if dom_obj:
            target_domain_id = dom_obj.id

    result = []
    for log in logs:
        if action and log.action.upper() != action.upper():
            continue
        if target_domain_id and log.domain_id != target_domain_id:
            continue

        inst = db.query(Institution).filter(Institution.id == log.institution_id).first() if log.institution_id else None
        dom = db.query(DataDomain).filter(DataDomain.id == log.domain_id).first() if log.domain_id else None

        result.append({
            "id": log.id,
            "citizen_id": log.citizen_id,
            "institution_id": log.institution_id,
            "institution_name": inst.name if inst else "System / Citizen Direct",
            "user_id": log.user_id,
            "access_request_id": log.access_request_id,
            "domain_id": log.domain_id,
            "domain_name": dom.name if dom else "N/A",
            "action": log.action,
            "purpose": log.purpose,
            "accessed_fields": log.accessed_fields or [],
            "result": log.result,
            "metadata_json": log.metadata_json,
            "timestamp": log.timestamp
        })
        if limit and len(result) >= limit:
            break

    return result

