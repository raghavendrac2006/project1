import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt
from backend.app.core.config import settings
from backend.app.core.security import ALGORITHM, create_access_token, get_password_hash
from backend.app.models.user import User, UserRole, CitizenProfile
from backend.app.models.institution import Institution, InstitutionCategory, InstitutionUser
from backend.app.models.role import RoleEnum
from backend.app.models.domain import Document, DataDomain, DomainType


@pytest.fixture
def test_tokens(db_session):
    """
    Generate test JWT access tokens for seeded demo users.
    """
    raghu_token = create_access_token("raghavendra@civicone.gov.in", role="CITIZEN")
    priya_token = create_access_token("priya@civicone.gov.in", role="CITIZEN")
    bank_token = create_access_token("loan_officer@abcbank.com", role="INSTITUTION")
    kec_token = create_access_token("coordinator@kec.edu.in", role="INSTITUTION")
    admin_token = create_access_token("admin@civicone.gov.in", role="ADMIN")

    # Expired token
    expired_token = create_access_token(
        "raghavendra@civicone.gov.in",
        expires_delta=timedelta(seconds=-3600),
        role="CITIZEN"
    )

    # Inactive user setup
    inactive_user = db_session.query(User).filter(User.email == "inactive@civicone.gov.in").first()
    if not inactive_user:
        inactive_user = User(
            external_auth_id="ext_inactive_001",
            email="inactive@civicone.gov.in",
            hashed_password=get_password_hash("password123"),
            full_name="Inactive User",
            role=UserRole.CITIZEN,
            is_active=False
        )
        db_session.add(inactive_user)
        db_session.commit()
    inactive_token = create_access_token("inactive@civicone.gov.in", role="CITIZEN")

    return {
        "raghu": raghu_token,
        "priya": priya_token,
        "bank": bank_token,
        "kec": kec_token,
        "admin": admin_token,
        "expired": expired_token,
        "inactive": inactive_token
    }


# 1. Successful Login
def test_successful_login(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "raghavendra@civicone.gov.in", "password": "password123"}
    )
    assert res.status_code == 200
    json_data = res.json()
    assert "access_token" in json_data
    assert json_data["email"] == "raghavendra@civicone.gov.in"
    assert json_data["role"] == "CITIZEN"


# 2. Invalid Login Credentials
def test_invalid_login(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "raghavendra@civicone.gov.in", "password": "wrongpassword"}
    )
    assert res.status_code == 401
    assert "Incorrect" in res.json()["detail"]


# 3. Missing Token on Protected Endpoint
def test_missing_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
    assert "Not authenticated" in res.json()["detail"]


# 4. Invalid Token
def test_invalid_token(client):
    res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert res.status_code == 401
    assert "Invalid or expired" in res.json()["detail"]


# 5. Expired Token
def test_expired_token(client, test_tokens):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {test_tokens['expired']}"}
    )
    assert res.status_code == 401
    assert "Invalid or expired" in res.json()["detail"]


# 6. Current User Lookup
def test_current_user_lookup(client, test_tokens):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {test_tokens['raghu']}"}
    )
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["email"] == "raghavendra@civicone.gov.in"
    assert json_data["full_name"] == "Raghavendra"


# 7. Citizen Identity Resolution
def test_citizen_identity_resolution(client, test_tokens):
    res = client.get(
        "/api/v1/citizen/identity",
        headers={"Authorization": f"Bearer {test_tokens['raghu']}"}
    )
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["civic_one_id"] == "CIV-2026-004281"
    assert json_data["full_name"] == "Raghavendra"


# 8. Institution Identity Resolution
def test_institution_identity_resolution(client, test_tokens):
    res = client.get(
        "/api/v1/auth/institution-me",
        headers={"Authorization": f"Bearer {test_tokens['bank']}"}
    )
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["email"] == "loan_officer@abcbank.com"
    assert json_data["institution_name"] == "ABC Bank"
    assert json_data["role_id"] == "BANK_KYC_OFFICER"


# 9. Admin Identity Resolution
def test_admin_identity_resolution(client, test_tokens):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {test_tokens['admin']}"}
    )
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["email"] == "admin@civicone.gov.in"
    assert json_data["role"] == "ADMIN"


# 10 & 11. Inactive / Suspended User Rejection
def test_inactive_user_rejection(client, test_tokens):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {test_tokens['inactive']}"}
    )
    assert res.status_code == 403
    assert "Inactive or suspended" in res.json()["detail"]


# 12. Citizen A Cannot Access Citizen B Documents / Data
def test_citizen_isolation(client, db_session, test_tokens):
    # Get Raghavendra user and Document
    raghu_user = db_session.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()
    doc = db_session.query(Document).filter(Document.citizen_id == raghu_user.id).first()
    assert doc is not None

    # Priya Sharma attempts to request Raghavendra's specific document ID
    res = client.get(
        f"/api/v1/documents/{doc.id}",
        headers={"Authorization": f"Bearer {test_tokens['priya']}"}
    )
    assert res.status_code == 404
    assert "Document not found" in res.json()["detail"]


# 13. Institution A Cannot Impersonate Institution B
def test_institution_isolation(client, db_session, test_tokens):
    # Query requests using Bank Officer token
    res = client.get(
        "/api/v1/institution/access-requests",
        headers={"Authorization": f"Bearer {test_tokens['bank']}"}
    )
    assert res.status_code == 200
    requests = res.json()
    bank_inst = db_session.query(Institution).filter(Institution.name == "ABC Bank").first()
    for req in requests:
        assert req["institution_id"] == bank_inst.id


# 14 & 15. Citizen / Institution Cannot Access Admin Functions
def test_non_admin_blocked_from_admin(client, test_tokens):
    # Test helper for admin check
    from backend.app.api.deps import get_current_admin_user
    with pytest.raises(Exception) as exc_info:
        # Resolve citizen user directly via dependency
        from backend.app.api.deps import get_db
        db = next(get_db())
        user = db.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()
        get_current_admin_user(current_user=user)
    assert "Administrator privilege required" in str(exc_info.value.detail)


# 16. Frontend-supplied role cannot override database role
def test_frontend_role_override_rejected(client, test_tokens):
    # A citizen tries to issue a token claiming ADMIN role or send role=ADMIN parameter
    fake_token = create_access_token("raghavendra@civicone.gov.in", role="ADMIN")
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {fake_token}"}
    )
    assert res.status_code == 200
    # The database record must remain CITIZEN, ignoring token payload claim!
    assert res.json()["role"] == "CITIZEN"


# 17. Frontend-supplied institution ID cannot override database institution
def test_frontend_institution_override_rejected(client, test_tokens, db_session):
    kec_inst = db_session.query(Institution).filter(Institution.name == "Kuppam Engineering College").first()
    # Bank officer submits access request claiming Kuppam Engineering College institution ID in payload
    res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "EDUCATION",
            "purpose": "Attempted fake institution request",
            "duration_days": 30,
            "requested_fields": ["degree"],
            "institution_id": kec_inst.id  # Frontend attempts to override institution
        },
        headers={"Authorization": f"Bearer {test_tokens['bank']}"}
    )
    assert res.status_code == 200
    req_id = res.json()["request_id"]

    # Verify in DB that request institution_id is ABC Bank, NOT Kuppam Engineering College!
    from backend.app.models.consent import AccessRequest
    req = db_session.query(AccessRequest).filter(AccessRequest.id == req_id).first()
    bank_inst = db_session.query(Institution).filter(Institution.name == "ABC Bank").first()
    assert req.institution_id == bank_inst.id
    assert req.institution_id != kec_inst.id


# 18. Protected Endpoint Without Authentication Returns 401
def test_unauthenticated_protected_endpoint(client):
    endpoints = [
        "/api/v1/auth/me",
        "/api/v1/citizen/me",
        "/api/v1/citizen/identity",
        "/api/v1/documents",
        "/api/v1/access-requests",
        "/api/v1/active-access",
        "/api/v1/access-history",
        "/api/v1/notifications"
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 401, f"Expected 401 for {ep}, got {res.status_code}"


# 19. External Auth ID Resolution Mapping
def test_external_auth_id_resolution(client, test_tokens, db_session):
    # Generate token using external_auth_id as subject ("ext_raghavendra_001")
    ext_token = create_access_token("ext_raghavendra_001", role="CITIZEN")
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {ext_token}"}
    )
    assert res.status_code == 200
    assert res.json()["email"] == "raghavendra@civicone.gov.in"
