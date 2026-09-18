import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.consent import ActiveAccess, AccessStatus


def list_active_grants(db: Session, citizen_id: str) -> List[ActiveAccess]:
    return db.query(ActiveAccess).filter(
        ActiveAccess.citizen_id == citizen_id
    ).order_by(ActiveAccess.granted_at.desc()).all()


def get_active_grant_by_id(db: Session, grant_id: str) -> Optional[ActiveAccess]:
    return db.query(ActiveAccess).filter(ActiveAccess.id == grant_id).first()


def create_active_grant(
    db: Session,
    request_id: str,
    citizen_id: str,
    institution_id: str,
    domain_id: str,
    approved_fields: List[str],
    expires_at: datetime.datetime,
    purpose: Optional[str] = None
) -> ActiveAccess:
    grant = ActiveAccess(
        access_request_id=request_id,
        citizen_id=citizen_id,
        institution_id=institution_id,
        domain_id=domain_id,
        approved_fields=approved_fields,
        purpose=purpose,
        granted_at=datetime.datetime.now(datetime.timezone.utc),
        expires_at=expires_at,
        status=AccessStatus.ACTIVE
    )
    db.add(grant)
    db.flush()
    return grant


def revoke_active_grant(db: Session, grant_id: str, citizen_id: str) -> Optional[ActiveAccess]:
    grant = db.query(ActiveAccess).filter(
        ActiveAccess.id == grant_id,
        ActiveAccess.citizen_id == citizen_id
    ).first()
    if not grant:
        return None

    grant.status = AccessStatus.REVOKED
    grant.revoked_at = datetime.datetime.now(datetime.timezone.utc)
    db.flush()
    return grant
