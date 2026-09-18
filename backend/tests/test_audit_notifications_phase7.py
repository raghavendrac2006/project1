import datetime
import pytest
from backend.app.models.consent import ActiveAccess, AccessStatus
from backend.app.core.security import create_access_token


@pytest.fixture
def auth_tokens():
    bank_token = create_access_token("loan_officer@abcbank.com", role="INSTITUTION")
    raghu_token = create_access_token("raghavendra@civicone.gov.in", role="CITIZEN")
    return {
        "bank": bank_token,
        "raghu": raghu_token
    }


def test_audit_trail_full_lifecycle_reconstruction(client, auth_tokens):
    """Verifies that audit trail records all lifecycle steps in order."""
    # 1. Institution creates request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Full Audit Lifecycle Loan Test",
            "duration_days": 10,
            "requested_fields": ["annual_income", "pan_number"]
        },
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert create_res.status_code == 200
    req_id = create_res.json()["request_id"]

    # 2. Citizen approves request
    app_res = client.post(
        f"/api/v1/access-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert app_res.status_code == 200

    # 3. Institution queries data
    query_res = client.get(
        "/api/v1/institution/authorized-data/CIV-2026-004281?domain_type=FINANCE&requested_fields=annual_income",
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )
    assert query_res.status_code == 200

    # 4. Get active grant ID and revoke
    list_active = client.get(
        "/api/v1/active-access",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    grant_id = [g for g in list_active.json() if g["access_request_id"] == req_id][0]["id"]

    revoke_res = client.post(
        f"/api/v1/active-access/{grant_id}/revoke",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert revoke_res.status_code == 200

    # 5. Citizen inspects audit history
    hist_res = client.get(
        "/api/v1/access-history",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert hist_res.status_code == 200
    logs = hist_res.json()

    actions = [l["action"] for l in logs]
    assert "REQUEST_CREATED" in actions
    assert "REQUEST_APPROVED" in actions
    assert "QUERY_DATA" in actions
    assert "REVOKE_CONSENT" in actions


def test_audit_history_filtering(client, auth_tokens):
    """Verifies filtering audit history by action type and domain."""
    # Filter by action=REQUEST_CREATED
    res_created = client.get(
        "/api/v1/access-history?action=REQUEST_CREATED",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert res_created.status_code == 200
    for l in res_created.json():
        assert l["action"] == "REQUEST_CREATED"

    # Filter by domain_type=FINANCE
    res_fin = client.get(
        "/api/v1/access-history?domain_type=FINANCE",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert res_fin.status_code == 200
    for l in res_fin.json():
        assert l["domain_name"] in ["Finance", "FINANCE"] or l["domain_id"] is not None


def test_access_expired_audit_log_emission(client, db_session, auth_tokens):
    """Verifies that ACCESS_EXPIRED audit log entry is generated when grant expires."""
    # Create and approve request
    create_res = client.post(
        "/api/v1/institution/access-requests",
        json={
            "citizen_civic_id": "CIV-2026-004281",
            "domain_type": "FINANCE",
            "purpose": "Expired Audit Log Test",
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

    # Expire grant manually in DB
    grant = db_session.query(ActiveAccess).filter(ActiveAccess.access_request_id == req_id).first()
    grant.expires_at = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)
    db_session.commit()

    # Query data to trigger Policy Engine expiry detection
    client.get(
        "/api/v1/institution/authorized-data/CIV-2026-004281?domain_type=FINANCE&requested_fields=annual_income",
        headers={"Authorization": f"Bearer {auth_tokens['bank']}"}
    )

    # Verify ACCESS_EXPIRED log exists in history
    hist_res = client.get(
        "/api/v1/access-history?action=ACCESS_EXPIRED",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert hist_res.status_code == 200
    expired_logs = hist_res.json()
    assert len(expired_logs) >= 1
    assert expired_logs[0]["action"] == "ACCESS_EXPIRED"


def test_notifications_unread_count_and_mark_all_read(client, auth_tokens):
    """Verifies listing notifications, checking unread count, and marking all read."""
    # 1. Get initial unread count
    count_res = client.get(
        "/api/v1/notifications/unread-count",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert count_res.status_code == 200
    initial_unread = count_res.json()["unread_count"]
    assert initial_unread >= 0

    # 2. List notifications
    notif_res = client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert isinstance(notifs, list)

    # 3. Mark single notification read if any exist
    if notifs:
        n_id = notifs[0]["id"]
        mark_res = client.patch(
            f"/api/v1/notifications/{n_id}/read",
            headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
        )
        assert mark_res.status_code == 200
        assert mark_res.json()["status"] == "success"

    # 4. Mark all notifications as read
    mark_all_res = client.post(
        "/api/v1/notifications/mark-all-read",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert mark_all_res.status_code == 200
    assert mark_all_res.json()["status"] == "success"

    # 5. Verify unread count is now 0
    final_count_res = client.get(
        "/api/v1/notifications/unread-count",
        headers={"Authorization": f"Bearer {auth_tokens['raghu']}"}
    )
    assert final_count_res.status_code == 200
    assert final_count_res.json()["unread_count"] == 0
