import pytest
from backend.app.crud import crud_user


def test_minimum_data_principle_scoping(db_session, client):
    headers = {"X-Dev-User-Email": "coordinator@kec.edu.in"}
    raghu_user = crud_user.get_user_by_email(db_session, "raghavendra@civicone.gov.in")

    # Institution queries education data
    response = client.get(
        f"/api/v1/institution/authorized-data/{raghu_user.id}?domain_type=EDUCATION",
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()["data"]

    # Verify ONLY granted education fields are in returned data payload
    assert "degree" in data or "documents" in data
    # Sensitive ungranted fields (e.g. income, blood_group, pan_number) MUST NOT BE RETURNED
    assert "annual_income" not in data
    assert "pan_number" not in data
