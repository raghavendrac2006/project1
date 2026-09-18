import pytest
from backend.app.policies.engine import authorize_access
from backend.app.crud import crud_user, crud_institution


def test_domain_isolation_violation_denied(db_session):
    """
    Test that an Educational Institution (Kuppam Engineering College) requesting
    Financial data ('FINANCE') is REJECTED by Domain Isolation rules.
    """
    kec_inst = crud_institution.get_institution_by_registration_id(db_session, "KEC-EDU-001")
    raghu_user = crud_user.get_user_by_email(db_session, "raghavendra@civicone.gov.in")

    res = authorize_access(
        db=db_session,
        institution_id=kec_inst.id,
        citizen_id=raghu_user.id,
        domain_type="FINANCE",
        requested_fields=["annual_income"]
    )
    assert res["allowed"] is False
    assert "Domain Isolation Violation" in res["reason"]


def test_domain_isolation_api_403(db_session, client):
    """
    Test that calling /institution/authorized-data/{citizen_id} with an isolated domain returns 403 Forbidden.
    """
    raghu_user = crud_user.get_user_by_email(db_session, "raghavendra@civicone.gov.in")
    headers = {"X-Dev-User-Email": "coordinator@kec.edu.in"}
    response = client.get(
        f"/api/v1/institution/authorized-data/{raghu_user.id}?domain_type=FINANCE",
        headers=headers
    )
    assert response.status_code == 403
    assert "Domain Isolation Violation" in response.json()["detail"]
