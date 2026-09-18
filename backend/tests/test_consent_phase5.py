import pytest
from datetime import datetime, timedelta, timezone
from backend.app.core.security import create_access_token
from backend.app.models.user import User, CitizenProfile
from backend.app.models.institution import Institution
from backend.app.models.consent import AccessRequest, Consent, ActiveAccess, RequestStatus, AccessStatus
from backend.app.models.audit import Notification, AuditLog
from backend.app.models.domain import DataDomain, DomainType


@pytest.fixture
def auth_tokens(db_session):
    raghu_token = create_access_token("raghavendra@civicone.gov.in", role="CITIZEN")
    priya_token = create_access_token("priya@civicone.gov.in", role="CITIZEN")
    bank_token = create_access_token("loan_officer@abcbank.com", role="INSTITUTION")
    kec_token = create_access_token("coordinator@kec.edu.in", role="INSTITUTION")
    return {
        "raghu": raghu_token,
        "priya": priya_token,
        "bank": bank_token,
        "kec": kec_token
    }


# 1. Valid Request Creation by Institution User
def test_create_valid_access_request(client, db_session, auth_tokens):
    res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Home Loan Processing & Income Verification",
            "duration_days": 30,
            "requested_fields": ["annual_income", "pan_number"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["status"] == "success"
    assert "request_id" in json_data


# 2. Invalid Purpose Rejection (< 3 chars)
def test_create_request_invalid_purpose(client, auth_tokens):
    res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "  ",
            "duration_days": 30,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert res.status_code == 400
    assert "Purpose is required" in res.json()["detail"]


# 3. Invalid Duration Rejection (0, negative, > 365)
def test_create_request_invalid_duration(client, auth_tokens):
    # Zero duration
    res_zero = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Loan verification",
            "duration_days": 0,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert res_zero.status_code == 400

    # > 365 days
    res_high = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Loan verification",
            "duration_days": 999,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert res_high.status_code == 400


# 4. Invalid Domain Fields Rejection
def test_create_request_invalid_domain_fields(client, auth_tokens):
    res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Loan verification",
            "duration_days": 15,
            "requested_fields": ["annual_income", "invalid_medical_history_field"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert res.status_code == 400
    assert "invalid_medical_history_field" in res.json()["detail"]


# 5. Citizen Pending Requests Retrieval
def test_citizen_pending_requests_retrieval(client, auth_tokens):
    res = client.get(
        "/api/v1/access-requests",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert res.status_code == 200
    requests = res.json()
    assert isinstance(requests, list)
    for req in requests:
        assert req["citizen_id"] is not None


# 6. Successful Approval by Citizen with Policy Engine Scoping
def test_citizen_approve_request(client, db_session, auth_tokens):
    # 1. Create request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Personal Loan Verification #LN-2026-88",
            "duration_days": 20,
            "requested_fields": ["annual_income", "pan_number"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]

    # 2. Citizen approves request
    app_res = client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        json={"duration_days": 20},
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert app_res.status_code == 200
    json_data = app_res.json()
    assert json_data["status"] == "success"
    assert "annual_income" in json_data["granted_fields"]

    # Verify ActiveAccess created in DB
    grant = db_session.query(ActiveAccess).filter(ActiveAccess.access_request_id == req_id).first()
    assert grant is not None
    assert grant.status == AccessStatus.ACTIVE


# 7 & 8. 409 Conflict on Duplicate Decisions (Re-approve or Re-deny)
def test_duplicate_decision_conflict(client, auth_tokens):
    # Create request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Duplicate test loan verification",
            "duration_days": 10,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]

    # First approval
    app1 = client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert app1.status_code == 200

    # Second approval -> 409 Conflict!
    app2 = client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert app2.status_code == 409
    assert "no longer pending" in app2.json()["detail"]

    # Attempt deny on already approved request -> 409 Conflict!
    deny_res = client.post(
        f"/api/v1/access-requests/{req_id}/deny",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert deny_res.status_code == 409


# 9. Denial Workflow
def test_citizen_deny_request(client, db_session, auth_tokens):
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Unwanted Credit Marketing Verification",
            "duration_days": 10,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]

    deny_res = client.post(
        f"/api/v1/access-requests/{req_id}/deny",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert deny_res.status_code == 200

    # Check request status DENIED
    req = db_session.query(AccessRequest).filter(AccessRequest.id == req_id).first()
    assert req.status == RequestStatus.DENIED

    # Check Consent record DENIED
    consent = db_session.query(Consent).filter(Consent.access_request_id == req_id).first()
    assert consent.decision == "DENIED"

    # Verify NO ActiveAccess grant created
    grant = db_session.query(ActiveAccess).filter(ActiveAccess.access_request_id == req_id).first()
    assert grant is None


# 10. Citizen A Attempting to Approve Citizen B's Request
def test_citizen_cross_approval_blocked(client, auth_tokens):
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-009876",  # Priya Sharma
            "domain_type": "FINANCE",
            "purpose": "Priya's Loan Application",
            "duration_days": 10,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]

    # Raghavendra attempts to approve Priya's request -> 404 / 403
    cross_app = client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert cross_app.status_code in [403, 404]
