from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User, UserRole, CitizenProfile
from backend.app.models.institution import Institution, InstitutionUser
from backend.app.models.domain import DataDomain, DomainType, Document
from backend.app.models.consent import AccessRequest, RequestStatus
from backend.app.models.audit import AuditLog, Notification
from backend.app.policies.engine import authorize_access
from backend.app.schemas import InstitutionAccessRequestCreate

router = APIRouter()


@router.post("/access-requests")
def create_institution_access_request(
    payload: InstitutionAccessRequestCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Submit a new data access request to a citizen.
    """
    # Verify citizen exists (by civic_id or user_id)
    citizen_profile = None
    if payload.citizen_civic_id:
        citizen_profile = db.query(CitizenProfile).filter(CitizenProfile.civic_id == payload.citizen_civic_id).first()
    elif payload.citizen_id:
        citizen_profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == payload.citizen_id).first()

    if not citizen_profile:
        raise HTTPException(status_code=404, detail="Citizen profile not found")

    # Get institution of current user
    inst_user = db.query(InstitutionUser).filter(InstitutionUser.user_id == current_user.id).first()
    institution_id = inst_user.institution_id if inst_user else 1 # Fallback to registered inst for testing

    # Find domain
    domain_enum = DomainType(payload.domain_type.lower())
    domain = db.query(DataDomain).filter(DataDomain.domain_type == domain_enum).first()
    if not domain:
        raise HTTPException(status_code=400, detail=f"Invalid domain '{payload.domain_type}'")

    req = AccessRequest(
        citizen_id=citizen_profile.user_id,
        institution_id=institution_id,
        requested_by_user_id=current_user.id,
        domain_id=domain.id,
        purpose=payload.purpose,
        duration_days=payload.duration_days,
        status=RequestStatus.PENDING,
        requested_fields=payload.requested_fields
    )
    db.add(req)

    # Send Notification to Citizen
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    db.add(Notification(
        user_id=citizen_profile.user_id,
        title="New Access Request",
        message=f"{inst.name if inst else 'An institution'} requested access to your {domain.name} records.",
        type="ACCESS_REQUEST"
    ))

    db.commit()
    db.refresh(req)
    return {
        "status": "success",
        "message": "Access request submitted successfully",
        "request_id": req.id
    }


@router.get("/access-requests")
def list_institution_access_requests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    List access requests submitted by current institution user.
    """
    requests = db.query(AccessRequest).filter(
        AccessRequest.requested_by_user_id == current_user.id
    ).order_by(AccessRequest.requested_at.desc()).all()
    return requests


@router.get("/authorized-data/{citizen_id}")
def query_authorized_citizen_data(
    citizen_id: int,
    domain_type: str = Query(..., description="Domain type e.g. education, finance, healthcare, identity, government"),
    requested_fields: Optional[str] = Query(None, description="Comma-separated requested fields"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Data Gateway: Institution queries citizen data.
    Enforces WHO + WHY + WHAT + WHEN + CONSENT and returns Minimum Data Principle scoped payload.
    """
    # 1. Determine institution ID
    inst_user = db.query(InstitutionUser).filter(InstitutionUser.user_id == current_user.id).first()
    institution_id = inst_user.institution_id if inst_user else 1

    field_list = [f.strip() for f in requested_fields.split(",")] if requested_fields else None

    # 2. Evaluate Policy Engine
    evaluation = authorize_access(
        db=db,
        institution_id=institution_id,
        citizen_id=citizen_id,
        domain_type=domain_type,
        requested_fields=field_list
    )

    domain_enum = DomainType(domain_type.lower())
    domain_obj = db.query(DataDomain).filter(DataDomain.domain_type == domain_enum).first()
    domain_id = domain_obj.id if domain_obj else None

    # 3. Handle Unauthorized
    if not evaluation["allowed"]:
        # Log Audit failure
        db.add(AuditLog(
            citizen_id=citizen_id,
            institution_id=institution_id,
            user_id=current_user.id,
            domain_id=domain_id,
            action="QUERY_DATA",
            purpose=f"Attempted query for domain {domain_type}",
            accessed_fields=[],
            outcome="DENIED"
        ))
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied by Policy Engine: {evaluation['reason']}"
        )

    # 4. Handle Authorized: Gather citizen data & scope fields (Minimum Data Principle)
    citizen_profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == citizen_id).first()
    documents = db.query(Document).filter(
        Document.user_id == citizen_id,
        Document.domain_id == domain_id
    ).all()

    # Raw combined data dictionary
    raw_data = {}
    if citizen_profile:
        raw_data["full_name"] = citizen_profile.full_name
        raw_data["dob"] = citizen_profile.dob
        raw_data["gender"] = citizen_profile.gender
        raw_data["phone"] = citizen_profile.phone
        raw_data["address"] = citizen_profile.address
        raw_data["blood_group"] = citizen_profile.blood_group
        raw_data["aadhaar_last4"] = citizen_profile.aadhaar_last4
        raw_data["pan_number"] = citizen_profile.pan_number

    # Add metadata from matching documents
    doc_payloads = []
    for doc in documents:
        doc_payloads.append({
            "title": doc.title,
            "document_type": doc.document_type,
            "issuer": doc.issuer,
            "verified": doc.verified
        })
        if doc.metadata_json and isinstance(doc.metadata_json, dict):
            raw_data.update(doc.metadata_json)

    # Apply Scoped Field Filter (Minimum Data Principle)
    scoped_fields = evaluation["scoped_fields"]
    scoped_data = {}
    for f in scoped_fields:
        if f in raw_data:
            scoped_data[f] = raw_data[f]

    if doc_payloads and ("documents" in scoped_fields or "certificates" in scoped_fields or not scoped_fields):
        scoped_data["documents"] = doc_payloads

    # Log Audit success
    db.add(AuditLog(
        citizen_id=citizen_id,
        institution_id=institution_id,
        user_id=current_user.id,
        domain_id=domain_id,
        action="QUERY_DATA",
        purpose=evaluation.get("purpose", "Data query under active consent"),
        accessed_fields=list(scoped_data.keys()),
        outcome="SUCCESS"
    ))
    db.commit()

    return {
        "status": "authorized",
        "citizen_id": citizen_id,
        "domain": domain_type.upper(),
        "purpose": evaluation.get("purpose"),
        "scoped_fields": list(scoped_data.keys()),
        "data": scoped_data
    }
