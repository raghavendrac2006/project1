from typing import Optional, List
from sqlalchemy.orm import Session
from backend.app.models.institution import Institution, InstitutionCategory, InstitutionUser
from backend.app.models.role import RoleEnum


def get_institution(db: Session, institution_id: str) -> Optional[Institution]:
    return db.query(Institution).filter(Institution.id == institution_id).first()


def get_institution_by_registration_id(db: Session, registration_id: str) -> Optional[Institution]:
    return db.query(Institution).filter(Institution.registration_id == registration_id).first()


def create_institution(
    db: Session,
    name: str,
    category: InstitutionCategory,
    registration_id: str,
    address: Optional[str] = None,
    email: Optional[str] = None,
    is_verified: bool = True
) -> Institution:
    inst = Institution(
        name=name,
        category=category,
        registration_id=registration_id,
        address=address,
        email=email,
        is_verified=is_verified
    )
    db.add(inst)
    db.flush()
    return inst


def get_institution_user(db: Session, user_id: str) -> Optional[InstitutionUser]:
    return db.query(InstitutionUser).filter(InstitutionUser.user_id == user_id).first()


def create_institution_user(
    db: Session,
    user_id: str,
    institution_id: str,
    role_id: RoleEnum = RoleEnum.ACADEMIC_VERIFIER,
    department: Optional[str] = None,
    designation: Optional[str] = None
) -> InstitutionUser:
    inst_user = InstitutionUser(
        user_id=user_id,
        institution_id=institution_id,
        role_id=role_id,
        department=department,
        designation=designation,
        status="ACTIVE"
    )
    db.add(inst_user)
    db.flush()
    return inst_user
