import pytest


def test_full_access_lifecycle(client):
    citizen_headers = {"X-Dev-User-Email": "raghavendra@civicone.gov.in"}
    bank_headers = {"X-Dev-User-Email": "loan_officer@abcbank.com"}

    # 1. Citizen views pending request (id=2 from seed)
    res_req = client.get("/api/v1/access-requests/2", headers=citizen_headers)
    assert res_req.status_code == 200
    assert res_req.json()["status"] == "PENDING"

    # 2. Citizen approves request #2
    res_approve = client.post(
        "/api/v1/access-requests/2/approve",
        json={"duration_days": 10, "granted_fields": ["annual_income", "pan_number"]},
        headers=citizen_headers
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "success"

    # 3. Bank queries authorized data for citizen #1
    res_query = client.get(
        "/api/v1/institution/authorized-data/1?domain_type=finance",
        headers=bank_headers
    )
    assert res_query.status_code == 200
    query_json = res_query.json()
    assert query_json["status"] == "authorized"
    assert "annual_income" in query_json["scoped_fields"]

    # 4. Citizen checks active grants and revokes grant
    res_active = client.get("/api/v1/active-access", headers=citizen_headers)
    active_grants = res_active.json()
    grant_to_revoke = [g for g in active_grants if g["request_id"] == 2 and g["status"] == "ACTIVE"][0]

    res_revoke = client.post(
        f"/api/v1/active-access/{grant_to_revoke['id']}/revoke",
        headers=citizen_headers
    )
    assert res_revoke.status_code == 200

    # 5. Bank tries to query data again -> Expect 403 Forbidden!
    res_query_revoked = client.get(
        "/api/v1/institution/authorized-data/1?domain_type=finance",
        headers=bank_headers
    )
    assert res_query_revoked.status_code == 403
    assert "REVOKED" in res_query_revoked.json()["detail"]
