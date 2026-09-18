import datetime
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.consent import ActiveAccess, AccessStatus, AccessRequest, RequestStatus
from backend.app.models.institution import Institution
from backend.app.models.domain import DataDomain
from backend.app.crud import crud_active_access, crud_audit
from backend.app.schemas import ActiveAccessSchema

router = APIRouter()


@router.get("", response_model=List[ActiveAccessSchema])
def list_active_access(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    grants = crud_active_access.list_active_grants(db, current_user.id)

    now = datetime.datetime.now(datetime.timezone.utc)
    result = []
    has_updates = False

    for g in grants:
        inst = db.query(Institution).filter(Institution.id == g.institution_id).first()
        dom = db.query(DataDomain).filter(DataDomain.id == g.domain_id).first()

        current_status = g.status.value
        expires_at = g.expires_at
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)

        if g.status == AccessStatus.ACTIVE and expires_at and expires_at < now:
            g.status = AccessStatus.EXPIRED
            current_status = AccessStatus.EXPIRED.value
            has_updates = True

        result.append({
            "id": g.id,
            "access_request_id": g.access_request_id,
            "citizen_id": g.citizen_id,
            "institution_id": g.institution_id,
            "institution_name": inst.name if inst else "Unknown Institution",
            "institution_category": inst.category.value if inst else "UNKNOWN",
            "domain_id": g.domain_id,
            "domain_name": dom.name if dom else "Unknown Domain",
            "domain_type": dom.domain_type.value if dom else "UNKNOWN",
            "approved_fields": g.approved_fields or [],
            "purpose": g.purpose,
            "granted_at": g.granted_at,
            "expires_at": g.expires_at,
            "revoked_at": g.revoked_at,
            "status": current_status
        })

    if has_updates:
        db.commit()

    return result


@router.post("/{access_id}/revoke")
def revoke_active_access(
    access_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # 1. Atomic Row Lock Grant
    grant = db.query(ActiveAccess).with_for_update().filter(
        ActiveAccess.id == access_id
    ).first()

    if not grant or grant.citizen_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active access grant not found")

    if grant.status != AccessStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Grant is not active (current status: '{grant.status.value}')"
        )

    now = datetime.datetime.now(datetime.timezone.utc)
    grant.status = AccessStatus.REVOKED
    grant.revoked_at = now

    # Also sync associated AccessRequest if present
    req = None
    if grant.access_request_id:
        req = db.query(AccessRequest).filter(AccessRequest.id == grant.access_request_id).first()
        if req:
            req.status = RequestStatus.REVOKED
            req.updated_at = now

    inst = db.query(Institution).filter(Institution.id == grant.institution_id).first()
    dom = db.query(DataDomain).filter(DataDomain.id == grant.domain_id).first()

    # Audit Log Entry
    crud_audit.create_audit_log(
        db=db,
        citizen_id=current_user.id,
        institution_id=grant.institution_id,
        user_id=current_user.id,
        access_request_id=grant.access_request_id,
        domain_id=grant.domain_id,
        action="REVOKE_CONSENT",
        purpose=f"Citizen revoked active access grant #{grant.id}",
        accessed_fields=grant.approved_fields,
        result="REVOKED"
    )

    inst_name = inst.name if inst else "Institution"
    # Citizen Notification
    crud_audit.create_notification(
        db=db,
        user_id=current_user.id,
        title="Consent Revoked",
        message=f"You revoked access permission from {inst_name} for {dom.name if dom else 'Data'}.",
        notification_type="CONSENT_REVOKED",
        related_entity_id=grant.id
    )

    # Institution Requester Notification
    if req and req.requester_user_id:
        crud_audit.create_notification(
            db=db,
            user_id=req.requester_user_id,
            title="Consent Revoked by Citizen",
            message=f"Citizen has revoked consent for access request #{req.id} ({dom.name if dom else 'Data'}).",
            notification_type="CONSENT_REVOKED",
            related_entity_id=grant.id
        )

    db.commit()
    return {
        "status": "success",
        "message": f"Active access grant #{grant.id} revoked successfully.",
        "revoked_at": grant.revoked_at.isoformat()
    }

