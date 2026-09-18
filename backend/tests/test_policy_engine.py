import pytest
from backend.app.policies.engine import authorize_access
from backend.app.models.institution import Institution, InstitutionCategory
from backend.app.models.user import User


def test_policy_engine_active_grant_success(db_session):
    # Raghavendra (id=1) has an active grant for Kuppam Engineering College (id=1, EDUCATION)
    res = authorize_access(
        db=db_session,
        institution_id=1,
        citizen_id=1,
        domain_type="education",
        requested_fields=["degree", "cgpa"]
    )
    assert res["allowed"] is True
    assert "degree" in res["scoped_fields"]
    assert "cgpa" in res["scoped_fields"]


def test_policy_engine_no_consent_denial(db_session):
    # Raghavendra has NO active grant for CityCare Hospital (id=3, HEALTHCARE)
    res = authorize_access(
        db=db_session,
        institution_id=3,
        citizen_id=1,
        domain_type="healthcare",
        requested_fields=["blood_group"]
    )
    assert res["allowed"] is False
    assert "No active consent" in res["reason"]
