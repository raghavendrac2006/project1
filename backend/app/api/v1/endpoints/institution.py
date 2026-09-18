from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User, CitizenProfile
from backend.app.models.institution import Institution, InstitutionUser
from backend.app.models.domain import DataDomain, DomainType, Document, Record
from backend.app.models.consent import AccessRequest, RequestStatus
from backend.app.crud import crud_user, crud_request, crud_audit
from backend.app.policies.engine import authorize_access
from backend.app.schemas import InstitutionAccessRequestCreate, AccessRequestSchema

router = APIRouter()


@router.post("/access-requests")
def create_institution_access_request(
    payload: InstitutionAccessRequestCreate,
    db: Session = Depends(deps.get_db),
    user_inst_tuple: tuple = Depends(deps.get_current_institution_user)
) -> Any:
    current_user, inst_user, institution = user_inst_tuple
    citizen_profile = None
    if payload.citizen_civic_id:
        citizen_profile = crud_user.get_citizen_by_civic_one_id(db, payload.citizen_civic_id)
    elif payload.citizen_id:
        citizen_profile = crud_user.get_citizen_profile(db, payload.citizen_id)

    if not citizen_profile:
        raise HTTPException(status_code=404, detail="Citizen profile not found")

    institution_id = inst_user.institution_id

    norm_type = payload.domain_type.upper()
    if norm_type == "HEALTHCARE":
        norm_type = "HEALTH"
    elif norm_type == "GOVERNMENT":
        norm_type = "TRANSPORT"

    domain_enum = DomainType[norm_type]
    domain = db.query(DataDomain).filter(DataDomain.domain_type == domain_enum).first()
    if not domain:
        raise HTTPException(status_code=400, detail=f"Invalid domain '{payload.domain_type}'")

    req = crud_request.create_access_request(
        db=db,
        citizen_id=citizen_profile.user_id,
        institution_id=institution_id,
        requester_user_id=current_user.id,
        domain_id=domain.id,
        purpose=payload.purpose,
        requested_fields=payload.requested_fields,
        duration_days=str(payload.duration_days)
    )

    crud_audit.create_notification(
        db=db,
        user_id=citizen_profile.user_id,
        title="New Access Request",
        message=f"{institution.name} requested access to your {domain.name} records.",
        notification_type="ACCESS_REQUEST",
        related_entity_id=req.id
    )

    db.commit()
    return {
        "status": "success",
        "message": "Access request submitted successfully",
        "request_id": req.id
    }


@router.get("/access-requests", response_model=List[AccessRequestSchema])
def list_institution_access_requests(
    db: Session = Depends(deps.get_db),
    user_inst_tuple: tuple = Depends(deps.get_current_institution_user)
) -> Any:
    current_user, inst_user, institution = user_inst_tuple
    requests = db.query(AccessRequest).filter(
        AccessRequest.institution_id == institution.id
    ).order_by(AccessRequest.created_at.desc()).all()

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


@router.get("/authorized-data/{citizen_id}")
def query_authorized_citizen_data(
    citizen_id: str,
    domain_type: str = Query(..., description="Domain type e.g. IDENTITY, EDUCATION, HEALTH, FINANCE, TRANSPORT"),
    requested_fields: Optional[str] = Query(None, description="Comma-separated requested fields"),
    db: Session = Depends(deps.get_db),
    user_inst_tuple: tuple = Depends(deps.get_current_institution_user)
) -> Any:
    current_user, inst_user, institution = user_inst_tuple

    # Resolve target user ID if passed civic_one_id
    if citizen_id.startswith("CIV-"):
        c_prof = crud_user.get_citizen_by_civic_one_id(db, citizen_id)
        if not c_prof:
            raise HTTPException(status_code=404, detail="Citizen profile not found")
        target_user_id = c_prof.user_id
    else:
        target_user_id = citizen_id

    institution_id = institution.id

    field_list = [f.strip() for f in requested_fields.split(",")] if requested_fields else None

    evaluation = authorize_access(
        db=db,
        institution_id=institution_id,
        citizen_id=target_user_id,
        domain_type=domain_type,
        requested_fields=field_list,
        requester_role=inst_user.role_id
    )

    norm_type = domain_type.upper()
    if norm_type == "HEALTHCARE":
        norm_type = "HEALTH"
    elif norm_type == "GOVERNMENT":
        norm_type = "TRANSPORT"

    domain_obj = db.query(DataDomain).filter(DataDomain.domain_type == DomainType[norm_type]).first()
    domain_id = domain_obj.id if domain_obj else None

    if not evaluation["allowed"]:
        crud_audit.create_audit_log(
            db=db,
            citizen_id=target_user_id,
            institution_id=institution_id,
            user_id=current_user.id,
            domain_id=domain_id,
            action="QUERY_DATA",
            purpose=f"Attempted query for domain {domain_type}",
            accessed_fields=[],
            result="DENIED"
        )
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied by Policy Engine [{evaluation.get('policy_rule_id', 'POL_DENIED')}]: {evaluation['reason']}"
        )

    citizen_profile = crud_user.get_citizen_profile(db, target_user_id)
    records = db.query(Record).filter(
        Record.citizen_id == target_user_id,
        Record.domain_id == domain_id
    ).all()
    documents = db.query(Document).filter(
        Document.citizen_id == target_user_id,
        Document.domain_id == domain_id
    ).all()

    raw_data = {}
    if citizen_profile:
        raw_data["full_name"] = citizen_profile.full_name
        raw_data["date_of_birth"] = citizen_profile.date_of_birth
        raw_data["dob"] = citizen_profile.date_of_birth
        raw_data["gender"] = citizen_profile.gender
        raw_data["phone"] = citizen_profile.phone
        raw_data["email"] = citizen_profile.email
        raw_data["address"] = citizen_profile.address
        raw_data["blood_group"] = citizen_profile.blood_group
        raw_data["aadhaar_last4"] = citizen_profile.aadhaar_last4
        raw_data["pan_number"] = citizen_profile.pan_number

    for rec in records:
        if rec.data and isinstance(rec.data, dict):
            raw_data.update(rec.data)

    doc_payloads = []
    for doc in documents:
        doc_payloads.append({
            "title": doc.title,
            "document_type": doc.document_type,
            "issuer": doc.issuer,
            "document_number": doc.document_number,
            "verified": doc.verified
        })
        if doc.metadata_json and isinstance(doc.metadata_json, dict):
            raw_data.update(doc.metadata_json)

    scoped_fields = evaluation.get("scoped_fields") or evaluation.get("approved_fields") or []
    scoped_data = {}
    for f in scoped_fields:
        if f in raw_data:
            scoped_data[f] = raw_data[f]

    if doc_payloads and ("documents" in scoped_fields or "certificates" in scoped_fields or not scoped_fields):
        scoped_data["documents"] = doc_payloads

    crud_audit.create_audit_log(
        db=db,
        citizen_id=target_user_id,
        institution_id=institution_id,
        user_id=current_user.id,
        domain_id=domain_id,
        action="QUERY_DATA",
        purpose=evaluation.get("purpose", "Data query under active consent"),
        accessed_fields=list(scoped_data.keys()),
        result="SUCCESS"
    )
    db.commit()

    return {
        "decision": evaluation.get("decision", "ALLOW"),
        "status": "authorized",
        "policy_rule_id": evaluation.get("policy_rule_id", "POL_OK_001_AUTHORIZED"),
        "citizen_id": target_user_id,
        "domain": domain_type.upper(),
        "purpose": evaluation.get("purpose"),
        "approved_fields": evaluation.get("approved_fields", list(scoped_data.keys())),
        "denied_fields": evaluation.get("denied_fields", []),
        "scoped_fields": list(scoped_data.keys()),
        "data": scoped_data
    }
