import datetime
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.consent import AccessRequest, ActiveAccess, RequestStatus, AccessStatus
from backend.app.models.institution import Institution
from backend.app.models.domain import DataDomain
from backend.app.models.audit import AuditLog, Notification
from backend.app.schemas import AccessRequestSchema, RequestApprovePayload

router = APIRouter()


@router.get("", response_model=List[AccessRequestSchema])
def list_access_requests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    List all data access requests for current citizen.
    """
    requests = db.query(AccessRequest).filter(
        AccessRequest.citizen_id == current_user.id
    ).order_by(AccessRequest.requested_at.desc()).all()

    # Populate joined fields for JSON response
    result = []
    for req in requests:
        inst = db.query(Institution).filter(Institution.id == req.institution_id).first()
        dom = db.query(DataDomain).filter(DataDomain.id == req.domain_id).first()
        result.append({
            "id": req.id,
            "citizen_id": req.citizen_id,
            "institution_id": req.institution_id,
            "institution_name": inst.name if inst else "Unknown Institution",
            "institution_category": inst.category.value if inst else "UNKNOWN",
            "requested_by_user_id": req.requested_by_user_id,
            "domain_id": req.domain_id,
            "domain_name": dom.name if dom else "Unknown Domain",
            "domain_type": dom.domain_type.value if dom else "UNKNOWN",
            "purpose": req.purpose,
            "duration_days": req.duration_days,
            "status": req.status.value,
            "requested_fields": req.requested_fields or [],
            "requested_at": req.requested_at,
            "updated_at": req.updated_at
        })
    return result


@router.get("/{request_id}", response_model=AccessRequestSchema)
def get_access_request(
    request_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get access request details by ID.
    """
    req = db.query(AccessRequest).filter(
        AccessRequest.id == request_id,
        AccessRequest.citizen_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    inst = db.query(Institution).filter(Institution.id == req.institution_id).first()
    dom = db.query(DataDomain).filter(DataDomain.id == req.domain_id).first()

    return {
        "id": req.id,
        "citizen_id": req.citizen_id,
        "institution_id": req.institution_id,
        "institution_name": inst.name if inst else "Unknown Institution",
        "institution_category": inst.category.value if inst else "UNKNOWN",
        "requested_by_user_id": req.requested_by_user_id,
        "domain_id": req.domain_id,
        "domain_name": dom.name if dom else "Unknown Domain",
        "domain_type": dom.domain_type.value if dom else "UNKNOWN",
        "purpose": req.purpose,
        "duration_days": req.duration_days,
        "status": req.status.value,
        "requested_fields": req.requested_fields or [],
        "requested_at": req.requested_at,
        "updated_at": req.updated_at
    }


@router.post("/{request_id}/approve")
def approve_access_request(
    request_id: int,
    payload: RequestApprovePayload = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Approve an access request, granting active access for the specified duration and scoped fields.
    """
    req = db.query(AccessRequest).filter(
        AccessRequest.id == request_id,
        AccessRequest.citizen_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    if req.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Cannot approve request with status '{req.status.value}'")

    duration_days = payload.duration_days if (payload and payload.duration_days) else req.duration_days
    granted_fields = payload.granted_fields if (payload and payload.granted_fields) else req.requested_fields

    req.status = RequestStatus.APPROVED
    req.updated_at = datetime.datetime.now(datetime.timezone.utc)

    # Calculate expiration time
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(days=duration_days)

    active_access = ActiveAccess(
        request_id=req.id,
        citizen_id=req.citizen_id,
        institution_id=req.institution_id,
        domain_id=req.domain_id,
        granted_fields=granted_fields,
        expires_at=expires_at,
        status=AccessStatus.ACTIVE
    )
    db.add(active_access)

    inst = db.query(Institution).filter(Institution.id == req.institution_id).first()
    dom = db.query(DataDomain).filter(DataDomain.id == req.domain_id).first()

    # Log Audit entry
    db.add(AuditLog(
        citizen_id=current_user.id,
        institution_id=req.institution_id,
        user_id=req.requested_by_user_id,
        domain_id=req.domain_id,
        action="GRANT_CONSENT",
        purpose=req.purpose,
        accessed_fields=granted_fields,
        outcome="SUCCESS"
    ))

    # Add Notification
    inst_name = inst.name if inst else "Institution"
    db.add(Notification(
        user_id=current_user.id,
        title="Consent Granted",
        message=f"You approved access to {inst_name} for {dom.name if dom else 'Data'} for {duration_days} days.",
        type="CONSENT_APPROVED"
    ))

    db.commit()
    return {
        "status": "success",
        "message": f"Access request #{req.id} approved successfully",
        "expires_at": expires_at.isoformat(),
        "granted_fields": granted_fields
    }


@router.post("/{request_id}/deny")
def deny_access_request(
    request_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Deny an access request.
    """
    req = db.query(AccessRequest).filter(
        AccessRequest.id == request_id,
        AccessRequest.citizen_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    if req.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Cannot deny request with status '{req.status.value}'")

    req.status = RequestStatus.DENIED
    req.updated_at = datetime.datetime.now(datetime.timezone.utc)

    # Log Audit entry
    db.add(AuditLog(
        citizen_id=current_user.id,
        institution_id=req.institution_id,
        user_id=req.requested_by_user_id,
        domain_id=req.domain_id,
        action="DENY_CONSENT",
        purpose=req.purpose,
        accessed_fields=[],
        outcome="DENIED"
    ))

    db.commit()
    return {"status": "success", "message": f"Access request #{req.id} denied."}
