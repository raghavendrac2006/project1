import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.institution import Institution, InstitutionCategory
from backend.app.models.domain import DataDomain, DomainType
from backend.app.models.consent import ActiveAccess, AccessStatus, AccessRequest
from backend.app.models.role import RoleEnum


# Allowed Fields Whitelist Per Domain (Minimum Data Principle)
DOMAIN_FIELD_MAP = {
    "IDENTITY": ["full_name", "date_of_birth", "dob", "gender", "aadhaar_last4", "pan_number", "phone", "email", "address", "blood_group"],
    "EDUCATION": ["full_name", "degree", "cgpa", "year", "college_name", "graduation_year", "documents", "certificates"],
    "HEALTH": ["full_name", "blood_group", "allergies", "vaccination_status", "medical_history", "documents"],
    "HEALTHCARE": ["full_name", "blood_group", "allergies", "vaccination_status", "medical_history", "documents"],
    "FINANCE": ["full_name", "pan_number", "credit_score", "annual_income", "bank_account_masked", "documents"],
    "TRANSPORT": ["full_name", "driving_license", "vehicle_registration", "license_valid_until", "documents"],
    "GOVERNMENT": ["full_name", "driving_license", "vehicle_registration", "license_valid_until", "documents"],
}

# Domain Isolation Authorization Matrix (Which institution categories can request which data domains)
INSTITUTION_DOMAIN_RULES = {
    "EDUCATION": ["EDUCATION", "IDENTITY"],
    "FINANCE": ["FINANCE", "IDENTITY"],
    "HEALTH": ["HEALTH", "HEALTHCARE", "IDENTITY"],
    "HEALTHCARE": ["HEALTH", "HEALTHCARE", "IDENTITY"],
    "TRANSPORT": ["TRANSPORT", "GOVERNMENT", "IDENTITY"],
    "GOVERNMENT": ["TRANSPORT", "GOVERNMENT", "IDENTITY"],
}

# Role-Level Permission Matrix (Specific roles allowed domains)
ROLE_DOMAIN_RULES = {
    "ACADEMIC_VERIFIER": ["EDUCATION", "IDENTITY"],
    "BANK_KYC_OFFICER": ["FINANCE", "IDENTITY"],
    "HOSPITAL_VERIFIER": ["HEALTH", "HEALTHCARE", "IDENTITY"],
    "GOVERNMENT_OFFICER": ["TRANSPORT", "GOVERNMENT", "IDENTITY"],
    "ADMIN": ["EDUCATION", "FINANCE", "HEALTH", "HEALTHCARE", "TRANSPORT", "GOVERNMENT", "IDENTITY"],
    "CITIZEN": ["IDENTITY"]
}


def authorize_access(
    db: Session,
    institution_id: str,
    citizen_id: str,
    domain_type: str,
    requested_fields: Optional[List[str]] = None,
    requester_role: Optional[str] = None
) -> Dict[str, Any]:
    """
    Central Policy Engine Enforcement:
    Evaluates WHO (requester, role, institution) + WHY (purpose) + WHAT (domain, fields) + WHEN (expiry) + CONSENT (active grant)
    
    Returns structured dictionary:
    {
        "decision": "ALLOW" | "DENY",
        "allowed": bool,
        "policy_rule_id": str,
        "reason": str,
        "approved_fields": List[str],
        "denied_fields": List[str],
        "scoped_fields": List[str],
        "purpose": str
    }
    """
    domain_upper = domain_type.upper()

    # 1. Look up Institution (WHO)
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        return {
            "decision": "DENY",
            "allowed": False,
            "policy_rule_id": "POL_ERR_001_INSTITUTION_NOT_FOUND",
            "reason": f"Access Denied: Institution ID '{institution_id}' not found in registry",
            "approved_fields": [],
            "denied_fields": requested_fields or [],
            "scoped_fields": [],
            "purpose": "N/A"
        }

    inst_category = inst.category.value if hasattr(inst.category, "value") else str(inst.category)
    inst_cat_upper = inst_category.upper()

    # 2. Institution Category Domain Isolation Matrix Check (WHO vs WHAT)
    allowed_inst_domains = INSTITUTION_DOMAIN_RULES.get(inst_cat_upper, [inst_cat_upper, "IDENTITY"])
    if domain_upper not in allowed_inst_domains:
        return {
            "decision": "DENY",
            "allowed": False,
            "policy_rule_id": "POL_ERR_002_DOMAIN_ISOLATION_VIOLATION",
            "reason": f"Domain Isolation Violation: Institution category '{inst_cat_upper}' is prohibited from accessing '{domain_upper}' domain data.",
            "approved_fields": [],
            "denied_fields": requested_fields or [],
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # 3. Role-Level Permission Matrix Check (WHO Role vs WHAT Domain)
    if requester_role:
        role_str = requester_role.value if hasattr(requester_role, "value") else str(requester_role).upper()
        allowed_role_domains = ROLE_DOMAIN_RULES.get(role_str, [])
        if allowed_role_domains and domain_upper not in allowed_role_domains:
            return {
                "decision": "DENY",
                "allowed": False,
                "policy_rule_id": "POL_ERR_003_ROLE_UNAUTHORIZED",
                "reason": f"Role Authorization Failure: Requester role '{role_str}' is not authorized to access '{domain_upper}' domain data.",
                "approved_fields": [],
                "denied_fields": requested_fields or [],
                "scoped_fields": [],
                "purpose": "N/A"
            }

    # 4. Look up Data Domain record (WHAT)
    domain_id = None
    try:
        norm_type = domain_type.upper()
        if norm_type == "HEALTHCARE":
            norm_type = "HEALTH"
        elif norm_type == "GOVERNMENT":
            norm_type = "TRANSPORT"

        domain_enum = DomainType[norm_type]
        domain_obj = db.query(DataDomain).filter(DataDomain.domain_type == domain_enum).first()
        domain_id = domain_obj.id if domain_obj else None
    except (KeyError, ValueError):
        domain_id = None

    # 5. Check CONSENT & Active Grant in DB (CONSENT + WHEN)
    query = db.query(ActiveAccess).filter(
        ActiveAccess.citizen_id == citizen_id,
        ActiveAccess.institution_id == institution_id
    )
    if domain_id:
        query = query.filter(ActiveAccess.domain_id == domain_id)

    grant = query.order_by(ActiveAccess.granted_at.desc()).first()

    if not grant:
        return {
            "decision": "DENY",
            "allowed": False,
            "policy_rule_id": "POL_ERR_004_NO_CONSENT_GRANT",
            "reason": f"Consent Denial: No active consent grant found for institution '{inst.name}' on '{domain_upper}' domain for citizen '{citizen_id}'.",
            "approved_fields": [],
            "denied_fields": requested_fields or [],
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # Check Revocation
    if grant.status == AccessStatus.REVOKED or grant.revoked_at is not None:
        return {
            "decision": "DENY",
            "allowed": False,
            "policy_rule_id": "POL_ERR_005_GRANT_REVOKED",
            "reason": f"Access Denied: Citizen has REVOKED consent grant #{grant.id}.",
            "approved_fields": [],
            "denied_fields": requested_fields or [],
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # Check Expiry (WHEN)
    now = datetime.datetime.now(datetime.timezone.utc)
    grant_expires = grant.expires_at
    if grant_expires.tzinfo is None:
        grant_expires = grant_expires.replace(tzinfo=datetime.timezone.utc)

    if now >= grant_expires or grant.status == AccessStatus.EXPIRED:
        return {
            "decision": "DENY",
            "allowed": False,
            "policy_rule_id": "POL_ERR_006_GRANT_EXPIRED",
            "reason": f"Access Denied: Consent grant #{grant.id} EXPIRED at {grant.expires_at.isoformat()}.",
            "approved_fields": [],
            "denied_fields": requested_fields or [],
            "scoped_fields": [],
            "purpose": "N/A"
        }

    # 6. WHAT / Minimum Data Principle Scoping & Approved / Denied Fields Computation
    granted_fields = grant.approved_fields or []
    domain_allowed_fields = DOMAIN_FIELD_MAP.get(domain_upper, [])

    if requested_fields:
        approved_fields = [f for f in requested_fields if f in granted_fields and f in domain_allowed_fields]
        denied_fields = [f for f in requested_fields if f not in approved_fields]
    else:
        approved_fields = [f for f in granted_fields if f in domain_allowed_fields]
        denied_fields = []

    if not approved_fields and granted_fields:
        approved_fields = [f for f in granted_fields if f in domain_allowed_fields]

    original_req = db.query(AccessRequest).filter(AccessRequest.id == grant.access_request_id).first()
    purpose = original_req.purpose if original_req else (grant.purpose or "Authorized institutional request")

    return {
        "decision": "ALLOW",
        "allowed": True,
        "policy_rule_id": "POL_OK_001_AUTHORIZED",
        "reason": f"Access Granted: Scoped {len(approved_fields)} approved field(s) under active consent.",
        "approved_fields": approved_fields,
        "denied_fields": denied_fields,
        "scoped_fields": approved_fields,
        "purpose": purpose
    }


def authorize_citizen_access(requester_user_id: str, target_citizen_id: str) -> Dict[str, Any]:
    """
    Evaluates citizen self-access boundary isolation.
    Citizen A must only access Citizen A's data.
    """
    if requester_user_id == target_citizen_id:
        return {
            "decision": "ALLOW",
            "allowed": True,
            "policy_rule_id": "POL_OK_002_CITIZEN_SELF_ACCESS",
            "reason": "Citizen self-access authorized"
        }
    return {
        "decision": "DENY",
        "allowed": False,
        "policy_rule_id": "POL_ERR_007_CITIZEN_BOUNDARY_VIOLATION",
        "reason": f"Access Denied: Citizen '{requester_user_id}' cannot access records belonging to citizen '{target_citizen_id}'"
    }
