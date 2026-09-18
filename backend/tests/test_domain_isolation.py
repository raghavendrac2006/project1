import pytest
from backend.app.policies.engine import authorize_access


def test_domain_isolation_violation_denied(db_session):
    """
    Test that an Educational Institution (Kuppam Engineering College, id=1) requesting
    Financial data ('finance') is REJECTED by Domain Isolation rules.
    """
    res = authorize_access(
        db=db_session,
        institution_id=1,  # Educational institution
        citizen_id=1,
        domain_type="finance",  # Financial domain
        requested_fields=["annual_income"]
    )
    assert res["allowed"] is False
    assert "Domain Isolation Violation" in res["reason"]


def test_domain_isolation_api_403(client):
    """
    Test that calling /institution/authorized-data/1 with an isolated domain returns 403 Forbidden.
    """
    # Header authenticated as Academic Coordinator (coordinator@kec.edu.in)
    headers = {"X-Dev-User-Email": "coordinator@kec.edu.in"}
    response = client.get(
        "/api/v1/institution/authorized-data/1?domain_type=finance",
        headers=headers
    )
    assert response.status_code == 403
    assert "Domain Isolation Violation" in response.json()["detail"]
