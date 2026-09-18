import datetime
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.consent import AccessRequest, ActiveAccess, RequestStatus, AccessStatus, Consent
from backend.app.models.institution import Institution
from backend.app.models.domain import DataDomain
from backend.app.crud import crud_request, crud_active_access, crud_audit
from backend.app.schemas import AccessRequestSchema, RequestApprovePayload

router = APIRouter()


@router.get("", response_model=List[AccessRequestSchema])
def list_access_requests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    requests = crud_request.list_citizen_requests(db, current_user.id)

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
            "requester_user_id": req.requester_user_id,
            "domain_id": req.domain_id,
            "domain_name": dom.name if dom else "Unknown Domain",
            "domain_type": dom.domain_type.value if dom else "UNKNOWN",
            "purpose": req.purpose,
            "requested_duration": req.requested_duration,
            "duration_days": req.duration_days,
            "status": req.status.value,
            "requested_fields": req.requested_fields or [],
            "expires_at": req.expires_at,
            "created_at": req.created_at,
            "updated_at": req.updated_at
        })
    return result


@router.get("/{request_id}", response_model=AccessRequestSchema)
def get_access_request(
    request_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
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
        "requester_user_id": req.requester_user_id,
        "domain_id": req.domain_id,
        "domain_name": dom.name if dom else "Unknown Domain",
        "domain_type": dom.domain_type.value if dom else "UNKNOWN",
        "purpose": req.purpose,
        "requested_duration": req.requested_duration,
        "duration_days": req.duration_days,
        "status": req.status.value,
        "requested_fields": req.requested_fields or [],
        "expires_at": req.expires_at,
        "created_at": req.created_at,
        "updated_at": req.updated_at
    }


@router.post("/{request_id}/approve")
def approve_access_request(
    request_id: str,
    payload: RequestApprovePayload = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    req = db.query(AccessRequest).filter(
        AccessRequest.id == request_id,
        AccessRequest.citizen_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    if req.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Cannot approve request with status '{req.status.value}'")

    days = payload.duration_days if (payload and payload.duration_days) else int(req.duration_days or "30")
    granted_fields = payload.granted_fields if (payload and payload.granted_fields) else req.requested_fields

    req.status = RequestStatus.APPROVED
    req.updated_at = datetime.datetime.now(datetime.timezone.utc)

    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(days=days)

    crud_request.create_consent_record(
        db=db,
        access_request_id=req.id,
        citizen_id=current_user.id,
        decision="APPROVED",
        approved_fields=granted_fields,
        expires_at=expires_at
    )

    active_grant = crud_active_access.create_active_grant(
        db=db,
        request_id=req.id,
        citizen_id=current_user.id,
        institution_id=req.institution_id,
        domain_id=req.domain_id,
        approved_fields=granted_fields,
        expires_at=expires_at,
        purpose=req.purpose
    )

    inst = db.query(Institution).filter(Institution.id == req.institution_id).first()
    dom = db.query(DataDomain).filter(DataDomain.id == req.domain_id).first()

    crud_audit.create_audit_log(
        db=db,
        citizen_id=current_user.id,
        institution_id=req.institution_id,
        user_id=req.requester_user_id,
        access_request_id=req.id,
        domain_id=req.domain_id,
        action="GRANT_CONSENT",
        purpose=req.purpose,
        accessed_fields=granted_fields,
        result="SUCCESS"
    )

    inst_name = inst.name if inst else "Institution"
    crud_audit.create_notification(
        db=db,
        user_id=current_user.id,
        title="Consent Granted",
        message=f"You approved access to {inst_name} for {dom.name if dom else 'Data'} for {days} days.",
        notification_type="CONSENT_APPROVED",
        related_entity_id=active_grant.id
    )

    db.commit()
    return {
        "status": "success",
        "message": f"Access request #{req.id} approved successfully",
        "expires_at": expires_at.isoformat(),
        "granted_fields": granted_fields
    }


@router.post("/{request_id}/deny")
def deny_access_request(
    request_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
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

    crud_request.create_consent_record(
        db=db,
        access_request_id=req.id,
        citizen_id=current_user.id,
        decision="DENIED",
        approved_fields=[]
    )

    crud_audit.create_audit_log(
        db=db,
        citizen_id=current_user.id,
        institution_id=req.institution_id,
        user_id=req.requester_user_id,
        access_request_id=req.id,
        domain_id=req.domain_id,
        action="DENY_CONSENT",
        purpose=req.purpose,
        accessed_fields=[],
        result="DENIED"
    )

    db.commit()
    return {"status": "success", "message": f"Access request #{req.id} denied."}
