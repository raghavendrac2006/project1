import pytest
from backend.app.policies.engine import authorize_access
from backend.app.crud import crud_user, crud_institution


def test_policy_engine_active_grant_success(db_session):
    kec_inst = crud_institution.get_institution_by_registration_id(db_session, "KEC-EDU-001")
    raghu_user = crud_user.get_user_by_email(db_session, "raghavendra@civicone.gov.in")

    res = authorize_access(
        db=db_session,
        institution_id=kec_inst.id,
        citizen_id=raghu_user.id,
        domain_type="EDUCATION",
        requested_fields=["degree", "cgpa"]
    )
    assert res["allowed"] is True
    assert "degree" in res["scoped_fields"]
    assert "cgpa" in res["scoped_fields"]


def test_policy_engine_no_consent_denial(db_session):
    cch_inst = crud_institution.get_institution_by_registration_id(db_session, "CCH-HLT-404")
    raghu_user = crud_user.get_user_by_email(db_session, "raghavendra@civicone.gov.in")

    res = authorize_access(
        db=db_session,
        institution_id=cch_inst.id,
        citizen_id=raghu_user.id,
        domain_type="HEALTH",
        requested_fields=["blood_group"]
    )
    assert res["allowed"] is False
    assert "No active consent" in res["reason"]
