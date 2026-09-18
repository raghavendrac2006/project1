import datetime
import pytest
from backend.app.models.consent import ActiveAccess, AccessStatus, RequestStatus, AccessRequest
from backend.app.core.security import create_access_token


@pytest.fixture
def auth_tokens():
    bank_token = create_access_token("loan_officer@abcbank.com", role="INSTITUTION")
    raghu_token = create_access_token("raghavendra@civicone.gov.in", role="CITIZEN")
    priya_token = create_access_token("priya@civicone.gov.in", role="CITIZEN")
    return {
        "bank": bank_token,
        "raghu": raghu_token,
        "priya": priya_token
    }


def test_list_active_grants(client, auth_tokens):
    """Citizen retrieves list of active grants."""
    res = client.get(
        "/api/v1/active-access",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert res.status_code == 200
    grants = res.json()
    assert isinstance(grants, list)


def test_data_query_authorized_under_active_grant(client, auth_tokens):
    """Institution queries data while ActiveAccess grant is ACTIVE."""
    # 1. Create request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Home Loan Verification Phase6",
            "duration_days": 30,
            "requested_fields": ["annual_income", "pan_number"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert create_res.status_code == 200
    req_id = create_res.json()["request_id"]

    # 2. Citizen approves request
    app_res = client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        json={"duration_days": 30},
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert app_res.status_code == 200

    # 3. Institution queries data
    query_res = client.get(
        "/api/v1/institution/authorized-data/CIV-2026-004281?domain_type=FINANCE&requested_fields=annual_income,pan_number",
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert query_res.status_code == 200
    data_payload = query_res.json()
    assert data_payload["status"] == "authorized"
    assert "annual_income" in data_payload["data"] or "pan_number" in data_payload["data"]


def test_citizen_revoke_active_access(client, auth_tokens):
    """Citizen revokes an active grant successfully."""
    # 1. Create and approve request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Auto Loan Verification",
            "duration_days": 15,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]
    client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )

    # 2. List grants to get access_id
    list_res = client.get(
        "/api/v1/active-access",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    grants = list_res.json()
    active_g = [g for g in grants if g["access_request_id"] == req_id][0]
    access_id = active_g["id"]

    # 3. Revoke grant
    revoke_res = client.post(
        f"/api/v1/active-access/{access_id}/revoke",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert revoke_res.status_code == 200
    assert revoke_res.json()["status"] == "success"


def test_data_query_blocked_immediately_after_revocation(client, auth_tokens):
    """Institution data query is immediately blocked with HTTP 403 post-revocation."""
    # 1. Create and approve request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Credit Card Application Verification",
            "duration_days": 10,
            "requested_fields": ["annual_income", "credit_score"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]
    client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )

    # 2. Retrieve active grant ID
    list_res = client.get(
        "/api/v1/active-access",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    grant_id = [g for g in list_res.json() if g["access_request_id"] == req_id][0]["id"]

    # 3. Revoke grant
    client.post(
        f"/api/v1/active-access/{grant_id}/revoke",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )

    # 4. Attempt data query -> Must fail with 403 POL_ERR_005_GRANT_REVOKED
    query_res = client.get(
        "/api/v1/institution/authorized-data/CIV-2026-004281?domain_type=FINANCE&requested_fields=annual_income",
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert query_res.status_code == 403
    assert "REVOKED" in query_res.json()["detail"] or "POL_ERR_005" in query_res.json()["detail"]


def test_duplicate_revocation_rejected(client, auth_tokens):
    """Revoking an already revoked grant returns HTTP 400 Bad Request."""
    # Create & approve
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Duplicate Revoke Test",
            "duration_days": 5,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]
    client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )

    list_res = client.get(
        "/api/v1/active-access",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    grant_id = [g for g in list_res.json() if g["access_request_id"] == req_id][0]["id"]

    # First revocation -> 200
    rev1 = client.post(
        f"/api/v1/active-access/{grant_id}/revoke",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert rev1.status_code == 200

    # Second revocation -> 400
    rev2 = client.post(
        f"/api/v1/active-access/{grant_id}/revoke",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert rev2.status_code == 400
    assert "Grant is not active" in rev2.json()["detail"]


def test_expiry_enforcement_and_status_persistence(client, db_session, auth_tokens):
    """Expired grant blocks data access and persists EXPIRED status in DB."""
    # 1. Create and approve request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Expiry Test Loan",
            "duration_days": 1,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]
    client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )

    # 2. Manually mutate expires_at to the past in DB
    grant = db_session.query(ActiveAccess).filter(ActiveAccess.access_request_id == req_id).first()
    past_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)
    grant.expires_at = past_time
    db_session.commit()

    # 3. Attempt data query -> Must fail with 403 POL_ERR_006_GRANT_EXPIRED
    query_res = client.get(
        "/api/v1/institution/authorized-data/CIV-2026-004281?domain_type=FINANCE&requested_fields=annual_income",
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert query_res.status_code == 403
    assert "EXPIRED" in query_res.json()["detail"] or "POL_ERR_006" in query_res.json()["detail"]

    # 4. Verify DB status was updated to EXPIRED
    db_session.refresh(grant)
    assert grant.status == AccessStatus.EXPIRED


def test_cross_user_revocation_blocked(client, auth_tokens):
    """Citizen A cannot revoke Citizen B's active grant."""
    # Create request for Raghavendra
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Cross Revoke Test",
            "duration_days": 10,
            "requested_fields": ["annual_income"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    req_id = create_res.json()["request_id"]
    client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )

    list_res = client.get(
        "/api/v1/active-access",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    grant_id = [g for g in list_res.json() if g["access_request_id"] == req_id][0]["id"]

    # Priya attempts to revoke Raghavendra's grant -> 404
    cross_rev = client.post(
        f"/api/v1/active-access/{grant_id}/revoke",
        headers={"Authorization": f"Bearer {auth_tokens['priya']}"}
    )
    assert cross_rev.status_code == 404
