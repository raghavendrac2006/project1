import pytest
import uuid
from backend.app.crud import crud_user, crud_institution, crud_domain, crud_request, crud_active_access, crud_audit
from backend.app.models.user import UserRole
from backend.app.models.institution import InstitutionCategory
from backend.app.models.domain import DomainType
from backend.app.models.role import RoleEnum


def test_crud_user_repository(db_session):
    email = f"crud_user_{uuid.uuid4().hex[:6]}@civicone.gov.in"
    user = crud_user.create_user(
        db=db_session,
        email=email,
        password="secretpassword",
        full_name="CRUD Test User",
        role=UserRole.CITIZEN
    )
    db_session.commit()

    fetched = crud_user.get_user_by_email(db_session, email)
    assert fetched is not None
    assert fetched.id == user.id

    civic_id = f"CIV-2026-{uuid.uuid4().hex[:6].upper()}"
    profile = crud_user.create_citizen_profile(
        db=db_session,
        user_id=user.id,
        civic_one_id=civic_id,
        full_name="CRUD Test User"
    )
    db_session.commit()

    fetched_prof = crud_user.get_citizen_by_civic_one_id(db_session, civic_id)
    assert fetched_prof is not None
    assert fetched_prof.user_id == user.id


def test_transaction_rollback_on_error(db_session):
    email = f"rollback_{uuid.uuid4().hex[:6]}@civicone.gov.in"
    user = crud_user.create_user(
        db=db_session,
        email=email,
        password="password",
        full_name="Rollback Test User"
    )
    db_session.commit()

    try:
        # Intentionally cause duplicate email violation
        crud_user.create_user(db=db_session, email=email, password="password", full_name="Dup User")
        db_session.commit()
    except Exception:
        db_session.rollback()

    # Original user should still exist, session stays clean
    fetched = crud_user.get_user_by_email(db_session, email)
    assert fetched is not None
