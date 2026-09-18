import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.consent import AccessRequest, Consent, RequestStatus


def get_access_request(db: Session, request_id: str) -> Optional[AccessRequest]:
    return db.query(AccessRequest).filter(AccessRequest.id == request_id).first()


def list_citizen_requests(db: Session, citizen_id: str) -> List[AccessRequest]:
    return db.query(AccessRequest).filter(
        AccessRequest.citizen_id == citizen_id
    ).order_by(AccessRequest.created_at.desc()).all()


def list_institution_requests(db: Session, requester_user_id: str) -> List[AccessRequest]:
    return db.query(AccessRequest).filter(
        AccessRequest.requester_user_id == requester_user_id
    ).order_by(AccessRequest.created_at.desc()).all()


def create_access_request(
    db: Session,
    citizen_id: str,
    institution_id: str,
    requester_user_id: str,
    domain_id: str,
    purpose: str,
    requested_fields: List[str],
    requested_duration: str = "30_DAYS",
    duration_days: str = "30",
    expires_at: Optional[datetime.datetime] = None
) -> AccessRequest:
    req = AccessRequest(
        citizen_id=citizen_id,
        institution_id=institution_id,
        requester_user_id=requester_user_id,
        domain_id=domain_id,
        purpose=purpose,
        requested_fields=requested_fields,
        requested_duration=requested_duration,
        duration_days=duration_days,
        status=RequestStatus.PENDING,
        expires_at=expires_at
    )
    db.add(req)
    db.flush()
    return req


def create_consent_record(
    db: Session,
    access_request_id: str,
    citizen_id: str,
    decision: str,
    approved_fields: Optional[List[str]] = None,
    expires_at: Optional[datetime.datetime] = None
) -> Consent:
    consent = Consent(
        access_request_id=access_request_id,
        citizen_id=citizen_id,
        decision=decision,
        decided_at=datetime.datetime.now(datetime.timezone.utc),
        approved_fields=approved_fields or [],
        expires_at=expires_at
    )
    db.add(consent)
    db.flush()
    return consent
