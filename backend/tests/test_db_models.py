import pytest
import uuid
from sqlalchemy.exc import IntegrityError
from backend.app.models.user import User, CitizenProfile, UserRole
from backend.app.models.institution import Institution, InstitutionCategory, InstitutionUser
from backend.app.models.domain import DataDomain, DomainType, Record, Document
from backend.app.models.role import RoleEnum


def test_user_and_profile_creation(db_session):
    user = User(
        email="test_model_user@civicone.gov.in",
        full_name="Test Model User",
        role=UserRole.CITIZEN,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    assert user.id is not None
    assert len(user.id) == 36  # UUID v4 string length

    profile = CitizenProfile(
        user_id=user.id,
        civic_one_id=f"CIV-2026-TEST-{uuid.uuid4().hex[:6].upper()}",
        full_name="Test Model User",
        date_of_birth="1995-01-01",
        phone="+91 99999 88888",
        email="test_model_user@civicone.gov.in"
    )
    db_session.add(profile)
    db_session.commit()

    assert profile.user_id == user.id
    assert user.citizen_profile.id == profile.id


def test_unique_civic_one_id_constraint(db_session):
    u1 = User(email="unique1@civicone.gov.in", full_name="U1", role=UserRole.CITIZEN)
    u2 = User(email="unique2@civicone.gov.in", full_name="U2", role=UserRole.CITIZEN)
    db_session.add_all([u1, u2])
    db_session.commit()

    same_civic_id = "CIV-2026-DUPLICATE-KEY"
    p1 = CitizenProfile(user_id=u1.id, civic_one_id=same_civic_id, full_name="U1")
    p2 = CitizenProfile(user_id=u2.id, civic_one_id=same_civic_id, full_name="U2")
    
    db_session.add(p1)
    db_session.commit()

    db_session.add(p2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_institution_and_member_relationship(db_session):
    inst = Institution(
        name="Test Verification Institute",
        category=InstitutionCategory.EDUCATION,
        registration_id=f"TEST-REG-{uuid.uuid4().hex[:6]}",
        email="info@testinst.edu"
    )
    db_session.add(inst)
    db_session.commit()

    i_user = User(email="member@testinst.edu", full_name="Inst Officer", role=UserRole.INSTITUTION)
    db_session.add(i_user)
    db_session.commit()

    member = InstitutionUser(
        user_id=i_user.id,
        institution_id=inst.id,
        role_id=RoleEnum.ACADEMIC_VERIFIER,
        department="Verification Cell",
        designation="Verification Agent"
    )
    db_session.add(member)
    db_session.commit()

    assert len(inst.members) >= 1
    assert i_user.institution_membership.institution_id == inst.id
