import pytest


def test_citizen_cross_access_boundary(db_session, client):
    """
    Test that Citizen A (Raghavendra, id=1) cannot access Citizen B's (Priya Sharma, id=2) access request #3.
    """
    headers = {"X-Dev-User-Email": "raghavendra@civicone.gov.in"}
    # Raghavendra attempting to access Priya's access request #3
    response = client.get("/api/v1/access-requests/3", headers=headers)
    assert response.status_code == 404  # Request 3 doesn't belong to Raghavendra
