import pytest
from datetime import datetime, timedelta, timezone
from backend.app.policies.engine import (
    authorize_access,
    authorize_citizen_access,
    DOMAIN_FIELD_MAP,
    INSTITUTION_DOMAIN_RULES,
    ROLE_DOMAIN_RULES
)
from backend.app.core.security import create_access_token
from backend.app.models.institution import Institution, InstitutionCategory
from backend.app.models.user import User, UserRole, CitizenProfile
from backend.app.models.role import RoleEnum
from backend.app.models.consent import AccessRequest, ActiveAccess, AccessStatus, RequestStatus
from backend.app.models.domain import DataDomain, DomainType


# 1. Determinism Test
def test_policy_engine_determinism(db_session):
    # Retrieve Bank Institution and Raghavendra User
    bank_inst = db_session.query(Institution).filter(Institution.name == "ABC Bank").first()
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()

    eval1 = authorize_access(
        db=db_session,
        institution_id=bank_inst.id,
        citizen_id=raghu_user.id,
        domain_type="FINANCE",
        requested_fields=["annual_income", "pan_number"],
        requester_role=RoleEnum.BANK_KYC_OFFICER
    )

    eval2 = authorize_access(
        db=db_session,
        institution_id=bank_inst.id,
        citizen_id=raghu_user.id,
        domain_type="FINANCE",
        requested_fields=["annual_income", "pan_number"],
        requester_role=RoleEnum.BANK_KYC_OFFICER
    )

    assert eval1 == eval2
    assert "decision" in eval1
    assert "policy_rule_id" in eval1


# 2. Institution Category Domain Isolation Matrix Test
def test_institution_category_domain_isolation(db_session):
    kec_inst = db_session.query(Institution).filter(Institution.name == "Kuppam Engineering College").first()
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()

    # Kuppam Engineering College (EDUCATION category) attempts to access HEALTH domain
    eval_res = authorize_access(
        db=db_session,
        institution_id=kec_inst.id,
        citizen_id=raghu_user.id,
        domain_type="HEALTH",
        requested_fields=["blood_group"],
        requester_role=RoleEnum.ACADEMIC_VERIFIER
    )

    assert eval_res["decision"] == "DENY"
    assert eval_res["allowed"] is False
    assert eval_res["policy_rule_id"] == "POL_ERR_002_DOMAIN_ISOLATION_VIOLATION"
    assert "Domain Isolation Violation" in eval_res["reason"]


# 3. Role-Level Permission Matrix Test
def test_role_level_domain_unauthorized(db_session):
    bank_inst = db_session.query(Institution).filter(Institution.name == "ABC Bank").first()
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()

    # Bank officer with ACADEMIC_VERIFIER role attempts to access FINANCE domain
    eval_res = authorize_access(
        db=db_session,
        institution_id=bank_inst.id,
        citizen_id=raghu_user.id,
        domain_type="FINANCE",
        requested_fields=["annual_income"],
        requester_role=RoleEnum.ACADEMIC_VERIFIER
    )

    assert eval_res["decision"] == "DENY"
    assert eval_res["allowed"] is False
    assert eval_res["policy_rule_id"] == "POL_ERR_003_ROLE_UNAUTHORIZED"
    assert "Role Authorization Failure" in eval_res["reason"]


# 4. Missing Consent Grant Test
def test_missing_consent_grant(db_session):
    kec_inst = db_session.query(Institution).filter(Institution.name == "Kuppam Engineering College").first()
    priya_user = db_session.query(User).filter(User.email == "priya@civicone.gov.in").first()

    # Priya has no consent grant for Kuppam Engineering College
    eval_res = authorize_access(
        db=db_session,
        institution_id=kec_inst.id,
        citizen_id=priya_user.id,
        domain_type="EDUCATION",
        requested_fields=["degree"],
        requester_role=RoleEnum.ACADEMIC_VERIFIER
    )

    assert eval_res["decision"] == "DENY"
    assert eval_res["allowed"] is False
    assert eval_res["policy_rule_id"] == "POL_ERR_004_NO_CONSENT_GRANT"


# 5. Revoked Grant Test
def test_revoked_consent_grant(db_session):
    kec_inst = db_session.query(Institution).filter(Institution.name == "Kuppam Engineering College").first()
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()

    # Find active grant for Raghavendra and revoke it
    grant = db_session.query(ActiveAccess).filter(
        ActiveAccess.citizen_id == raghu_user.id,
        ActiveAccess.institution_id == kec_inst.id
    ).first()
    assert grant is not None
    grant.status = AccessStatus.REVOKED
    grant.revoked_at = datetime.now(timezone.utc)
    db_session.commit()

    eval_res = authorize_access(
        db=db_session,
        institution_id=kec_inst.id,
        citizen_id=raghu_user.id,
        domain_type="EDUCATION",
        requested_fields=["degree"],
        requester_role=RoleEnum.ACADEMIC_VERIFIER
    )

    assert eval_res["decision"] == "DENY"
    assert eval_res["allowed"] is False
    assert eval_res["policy_rule_id"] == "POL_ERR_005_GRANT_REVOKED"


# 6. Expired Grant Test
def test_expired_consent_grant(db_session):
    bank_inst = db_session.query(Institution).filter(Institution.name == "ABC Bank").first()
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()
    fin_dom = db_session.query(DataDomain).filter(DataDomain.domain_type == DomainType.FINANCE).first()

    # Clear previous grants for this test isolation
    db_session.query(ActiveAccess).filter(
        ActiveAccess.citizen_id == raghu_user.id,
        ActiveAccess.institution_id == bank_inst.id
    ).delete()
    db_session.commit()

    # Add an expired grant for Raghavendra
    expired_grant = ActiveAccess(
        access_request_id="req_test_expired_101",
        citizen_id=raghu_user.id,
        institution_id=bank_inst.id,
        domain_id=fin_dom.id,
        approved_fields=["annual_income"],
        purpose="Test expired grant",
        granted_at=datetime.now(timezone.utc) - timedelta(days=40),
        expires_at=datetime.now(timezone.utc) - timedelta(days=10),
        status=AccessStatus.EXPIRED
    )
    db_session.add(expired_grant)
    db_session.commit()

    eval_res = authorize_access(
        db=db_session,
        institution_id=bank_inst.id,
        citizen_id=raghu_user.id,
        domain_type="FINANCE",
        requested_fields=["annual_income"],
        requester_role=RoleEnum.BANK_KYC_OFFICER
    )

    assert eval_res["decision"] == "DENY"
    assert eval_res["allowed"] is False
    assert eval_res["policy_rule_id"] == "POL_ERR_006_GRANT_EXPIRED"


# 7 & 8. Approved vs Denied Fields Scoping & Whitelist Enforcement
def test_field_scoping_and_denied_fields(db_session):
    bank_inst = db_session.query(Institution).filter(Institution.name == "ABC Bank").first()
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()
    fin_dom = db_session.query(DataDomain).filter(DataDomain.domain_type == DomainType.FINANCE).first()

    # Create active grant with approved fields ["annual_income", "pan_number"]
    active_grant = ActiveAccess(
        access_request_id="req_test_scoping_202",
        citizen_id=raghu_user.id,
        institution_id=bank_inst.id,
        domain_id=fin_dom.id,
        approved_fields=["annual_income", "pan_number"],
        purpose="Scoping test",
        granted_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        status=AccessStatus.ACTIVE
    )
    db_session.add(active_grant)
    db_session.commit()

    # Requester asks for ["annual_income", "pan_number", "credit_score", "unauthorized_secret_field"]
    eval_res = authorize_access(
        db=db_session,
        institution_id=bank_inst.id,
        citizen_id=raghu_user.id,
        domain_type="FINANCE",
        requested_fields=["annual_income", "pan_number", "credit_score", "unauthorized_secret_field"],
        requester_role=RoleEnum.BANK_KYC_OFFICER
    )

    assert eval_res["decision"] == "ALLOW"
    assert eval_res["allowed"] is True
    assert "annual_income" in eval_res["approved_fields"]
    assert "pan_number" in eval_res["approved_fields"]
    assert "credit_score" in eval_res["denied_fields"]
    assert "unauthorized_secret_field" in eval_res["denied_fields"]


# 9. Citizen Self-Access Boundary Isolation
def test_citizen_self_access_policy():
    res_self = authorize_citizen_access("usr_raghu_001", "usr_raghu_001")
    assert res_self["decision"] == "ALLOW"
    assert res_self["policy_rule_id"] == "POL_OK_002_CITIZEN_SELF_ACCESS"

    res_cross = authorize_citizen_access("usr_raghu_001", "usr_priya_002")
    assert res_cross["decision"] == "DENY"
    assert res_cross["policy_rule_id"] == "POL_ERR_007_CITIZEN_BOUNDARY_VIOLATION"


# 10. End-to-End API Policy Evaluation via TestClient
def test_e2e_authorized_data_api_policy(client, db_session):
    bank_token = create_access_token("loan_officer@abcbank.com", role="INSTITUTION")
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()
    fin_dom = db_session.query(DataDomain).filter(DataDomain.domain_type == DomainType.FINANCE).first()
    bank_inst = db_session.query(Institution).filter(Institution.name == "ABC Bank").first()

    active_grant = ActiveAccess(
        access_request_id="req_e2e_policy_303",
        citizen_id=raghu_user.id,
        institution_id=bank_inst.id,
        domain_id=fin_dom.id,
        approved_fields=["annual_income", "pan_number"],
        purpose="E2E test query",
        granted_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=15),
        status=AccessStatus.ACTIVE
    )
    db_session.add(active_grant)
    db_session.commit()

    res = client.get(
        f"/api/v1/institution/authorized-data/{raghu_user.id}?domain_type=FINANCE&requested_fields=annual_income,pan_number,credit_score",
        headers={"Authorization": f"Bearer {bank_token}"}
    )
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["decision"] == "ALLOW"
    assert json_data["policy_rule_id"] == "POL_OK_001_AUTHORIZED"
    assert "annual_income" in json_data["approved_fields"]
    assert "credit_score" in json_data["denied_fields"]
