import datetime
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
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
    citizen_user_tuple: tuple = Depends(deps.get_current_citizen)
) -> Any:
    current_user, citizen_profile = citizen_user_tuple

    # 1. Row Lock Access Request
    req = db.query(AccessRequest).with_for_update().filter(
        AccessRequest.id == request_id
    ).first()

    if not req or req.citizen_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access request not found")

    # 2. Check Request Status (Must be PENDING; otherwise 409 Conflict)
    if req.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Access request #{request_id} is no longer pending (current status: '{req.status.value}')"
        )

    # 3. Look up Domain & Institution Requester Info
    dom = db.query(DataDomain).filter(DataDomain.id == req.domain_id).first()
    inst = db.query(Institution).filter(Institution.id == req.institution_id).first()

    # Look up requester's institution user role
    from backend.app.models.institution import InstitutionUser
    inst_user = db.query(InstitutionUser).filter(InstitutionUser.user_id == req.requester_user_id).first()
    requester_role = inst_user.role_id if inst_user else None

    # 4. Re-evaluate Policy Engine (Authoritative Check)
    from backend.app.policies.engine import authorize_access
    evaluation = authorize_access(
        db=db,
        institution_id=req.institution_id,
        citizen_id=current_user.id,
        domain_type=dom.domain_type.value if dom else "IDENTITY",
        requested_fields=req.requested_fields,
        requester_role=requester_role,
        skip_consent_check=True
    )

    if not evaluation["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Policy Engine Authorization Failure [{evaluation.get('policy_rule_id', 'POL_DENIED')}]: {evaluation['reason']}"
        )

    # Derive approved fields from Policy Engine output
    approved_fields = evaluation.get("approved_fields") or req.requested_fields or []
    days = payload.duration_days if (payload and payload.duration_days) else int(req.duration_days or "30")

    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(days=days)

    # 5. Atomic Update Transaction
    req.status = RequestStatus.APPROVED
    req.expires_at = expires_at
    req.updated_at = now

    crud_request.create_consent_record(
        db=db,
        access_request_id=req.id,
        citizen_id=current_user.id,
        decision="APPROVED",
        approved_fields=approved_fields,
        expires_at=expires_at
    )

    active_grant = crud_active_access.create_active_grant(
        db=db,
        request_id=req.id,
        citizen_id=current_user.id,
        institution_id=req.institution_id,
        domain_id=req.domain_id,
        approved_fields=approved_fields,
        expires_at=expires_at,
        purpose=req.purpose
    )

    crud_audit.create_audit_log(
        db=db,
        citizen_id=current_user.id,
        institution_id=req.institution_id,
        user_id=req.requester_user_id,
        access_request_id=req.id,
        domain_id=req.domain_id,
        action="REQUEST_APPROVED",
        purpose=req.purpose,
        accessed_fields=approved_fields,
        result="SUCCESS"
    )

    inst_name = inst.name if inst else "Institution"
    # Citizen Notification
    crud_audit.create_notification(
        db=db,
        user_id=current_user.id,
        title="Consent Granted",
        message=f"You approved access to {inst_name} for {dom.name if dom else 'Data'} for {days} days.",
        notification_type="CONSENT_APPROVED",
        related_entity_id=active_grant.id
    )

    # Institution Requester Notification
    if req.requester_user_id:
        crud_audit.create_notification(
            db=db,
            user_id=req.requester_user_id,
            title="Access Request Approved",
            message=f"Citizen {citizen_profile.full_name} approved your access request for {dom.name if dom else 'Data'}.",
            notification_type="REQUEST_APPROVED",
            related_entity_id=req.id
        )

    db.commit()
    return {
        "status": "success",
        "message": f"Access request #{req.id} approved successfully",
        "expires_at": expires_at.isoformat(),
        "granted_fields": approved_fields
    }


@router.post("/{request_id}/deny")
def deny_access_request(
    request_id: str,
    db: Session = Depends(deps.get_db),
    citizen_user_tuple: tuple = Depends(deps.get_current_citizen)
) -> Any:
    current_user, citizen_profile = citizen_user_tuple

    # 1. Row Lock Access Request
    req = db.query(AccessRequest).with_for_update().filter(
        AccessRequest.id == request_id
    ).first()

    if not req or req.citizen_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access request not found")

    # 2. Check Request Status (Must be PENDING; otherwise 409 Conflict)
    if req.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Access request #{request_id} is no longer pending (current status: '{req.status.value}')"
        )

    now = datetime.datetime.now(datetime.timezone.utc)
    req.status = RequestStatus.DENIED
    req.updated_at = now

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
        action="REQUEST_DENIED",
        purpose=req.purpose,
        accessed_fields=[],
        result="DENIED"
    )

    dom = db.query(DataDomain).filter(DataDomain.id == req.domain_id).first()
    inst = db.query(Institution).filter(Institution.id == req.institution_id).first()
    inst_name = inst.name if inst else "Institution"

    # Citizen Notification
    crud_audit.create_notification(
        db=db,
        user_id=current_user.id,
        title="Consent Denied",
        message=f"You denied access request from {inst_name} for {dom.name if dom else 'Data'}.",
        notification_type="CONSENT_DENIED",
        related_entity_id=req.id
    )

    # Institution Requester Notification
    if req.requester_user_id:
        crud_audit.create_notification(
            db=db,
            user_id=req.requester_user_id,
            title="Access Request Denied",
            message=f"Citizen {citizen_profile.full_name} denied your access request for {dom.name if dom else 'Data'}.",
            notification_type="REQUEST_DENIED",
            related_entity_id=req.id
        )

    db.commit()
    return {"status": "success", "message": f"Access request #{req.id} denied successfully."}
