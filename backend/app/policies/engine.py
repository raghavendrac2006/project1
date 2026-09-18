import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.institution import Institution, InstitutionCategory
from backend.app.models.domain import DataDomain, DomainType
from backend.app.models.consent import ActiveAccess, AccessStatus, AccessRequest


# Allowed Fields Whitelist Per Domain (Minimum Data Principle)
DOMAIN_FIELD_MAP = {
    "IDENTITY": ["full_name", "dob", "gender", "aadhaar_last4", "pan_number", "phone", "address", "blood_group"],
    "EDUCATION": ["full_name", "degree", "cgpa", "year", "college_name", "graduation_year", "documents", "certificates"],
    "HEALTHCARE": ["full_name", "blood_group", "allergies", "vaccination_status", "medical_history", "documents"],
    "FINANCE": ["full_name", "pan_number", "credit_score", "annual_income", "bank_account_masked", "documents"],
    "GOVERNMENT": ["full_name", "driving_license", "vehicle_registration", "license_valid_until", "documents"],
}

# Domain Isolation Authorization Matrix (Which institution categories can request which data domains)
INSTITUTION_DOMAIN_RULES = {
    "EDUCATION": ["EDUCATION", "IDENTITY"],
    "FINANCE": ["FINANCE", "IDENTITY"],
    "HEALTHCARE": ["HEALTHCARE", "IDENTITY"],
    "GOVERNMENT": ["GOVERNMENT", "IDENTITY"],
}


def authorize_access(
    db: Session,
    institution_id: int,
    citizen_id: int,
    domain_type: str,
    requested_fields: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Central Policy Engine Enforcement:
    Evaluates WHO + WHY + WHAT + WHEN + CONSENT
    
    Returns dict:
    {
        "allowed": bool,
        "reason": str,
        "scoped_fields": List[str],
        "purpose": str
    }
    """
    domain_upper = domain_type.upper()
    if domain_upper == "HEALTH":
        domain_upper = "HEALTHCARE"
    if domain_upper == "TRANSPORT":
        domain_upper = "GOVERNMENT"

    # 1. Look up Institution
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        return {
            "allowed": False,
            "reason": f"Access Denied: Institution ID {institution_id} not found",
            "scoped_fields": [],
            "purpose": "N/A"
        }

    inst_category = inst.category.value if hasattr(inst.category, "value") else str(inst.category)
    inst_cat_upper = inst_category.upper()
    if inst_cat_upper == "HEALTH":
        inst_cat_upper = "HEALTHCARE"
    if inst_cat_upper == "TRANSPORT":
        inst_cat_upper = "GOVERNMENT"

    # 2. Domain Isolation Matrix Check (WHO + WHY vs Data Domain)
    allowed_domains = INSTITUTION_DOMAIN_RULES.get(inst_cat_upper, [inst_cat_upper, "IDENTITY"])
    if domain_upper not in allowed_domains:
        return {
            "allowed": False,
            "reason": f"Domain Isolation Violation: Institution category '{inst_cat_upper}' is prohibited from accessing '{domain_upper}' domain data.",
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # 3. Look up Data Domain record
    try:
        domain_enum = DomainType(domain_type.lower())
        domain_obj = db.query(DataDomain).filter(DataDomain.domain_type == domain_enum).first()
        domain_id = domain_obj.id if domain_obj else None
    except ValueError:
        domain_id = None

    # 4. Check CONSENT & Active Grant in DB
    query = db.query(ActiveAccess).filter(
        ActiveAccess.citizen_id == citizen_id,
        ActiveAccess.institution_id == institution_id
    )
    if domain_id:
        query = query.filter(ActiveAccess.domain_id == domain_id)

    grant = query.order_by(ActiveAccess.granted_at.desc()).first()

    if not grant:
        return {
            "allowed": False,
            "reason": f"No active consent grant found for institution '{inst.name}' on '{domain_upper}' domain for citizen ID {citizen_id}.",
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # Check Revocation
    if grant.status == AccessStatus.REVOKED or grant.revoked_at is not None:
        return {
            "allowed": False,
            "reason": f"Access Denied: Citizen has REVOKED consent grant #{grant.id}.",
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # Check Expiry
    now = datetime.datetime.now(datetime.timezone.utc)
    grant_expires = grant.expires_at
    if grant_expires.tzinfo is None:
        grant_expires = grant_expires.replace(tzinfo=datetime.timezone.utc)

    if now >= grant_expires or grant.status == AccessStatus.EXPIRED:
        return {
            "allowed": False,
            "reason": f"Access Denied: Consent grant #{grant.id} EXPIRED at {grant.expires_at.isoformat()}.",
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # 5. WHAT / Minimum Data Principle Scoping
    granted_fields = grant.granted_fields or []
    domain_allowed_fields = DOMAIN_FIELD_MAP.get(domain_upper, [])

    if requested_fields:
        final_scoped = [f for f in requested_fields if f in granted_fields and f in domain_allowed_fields]
    else:
        final_scoped = [f for f in granted_fields if f in domain_allowed_fields]

    # If no specific requested fields match but grant has fields, fallback to grant fields
    if not final_scoped and granted_fields:
        final_scoped = [f for f in granted_fields if f in domain_allowed_fields]

    # Look up purpose from original request
    original_req = db.query(AccessRequest).filter(AccessRequest.id == grant.request_id).first()
    purpose = original_req.purpose if original_req else "Authorized institutional request"

    return {
        "allowed": True,
        "reason": f"Access Granted: Scoped {len(final_scoped)} field(s) under active consent.",
        "scoped_fields": final_scoped,
        "purpose": purpose
    }
