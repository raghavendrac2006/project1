import pytest
from backend.app.crud import crud_user, crud_request


def test_citizen_cross_access_boundary(db_session, client):
    """
    Test that Citizen A (Raghavendra) cannot access Citizen B's (Priya Sharma) access request.
    """
    priya_user = crud_user.get_user_by_email(db_session, "priya@civicone.gov.in")
    priya_requests = crud_request.list_citizen_requests(db_session, priya_user.id)
    priya_req_id = priya_requests[0].id

    raghu_headers = {"X-Dev-User-Email": "raghavendra@civicone.gov.in"}
    # Raghavendra attempting to access Priya's access request
    response = client.get(f"/api/v1/access-requests/{priya_req_id}", headers=raghu_headers)
    assert response.status_code == 404  # Request doesn't belong to Raghavendra
