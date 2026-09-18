import pytest


def test_minimum_data_principle_scoping(client):
    headers = {"X-Dev-User-Email": "coordinator@kec.edu.in"}

    # Institution queries education data
    response = client.get(
        "/api/v1/institution/authorized-data/1?domain_type=education",
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()["data"]

    # Verify ONLY granted education fields are in returned data payload
    assert "degree" in data or "documents" in data
    # Sensitive ungranted fields (e.g. income, blood_group, pan_number) MUST NOT BE RETURNED
    assert "annual_income" not in data
    assert "pan_number" not in data
