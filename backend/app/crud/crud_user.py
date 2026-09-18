from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.user import User, CitizenProfile, UserRole
from backend.app.core.security import get_password_hash


def get_user(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_external_auth_id(db: Session, external_auth_id: str) -> Optional[User]:
    return db.query(User).filter(User.external_auth_id == external_auth_id).first()


def create_user(
    db: Session,
    email: str,
    password: Optional[str],
    full_name: str,
    role: UserRole = UserRole.CITIZEN,
    phone: Optional[str] = None,
    external_auth_id: Optional[str] = None
) -> User:
    hashed_pwd = get_password_hash(password) if password else None
    user = User(
        email=email,
        hashed_password=hashed_pwd,
        full_name=full_name,
        role=role,
        phone=phone,
        external_auth_id=external_auth_id,
        is_active=True
    )
    db.add(user)
    db.flush()
    return user


def get_citizen_profile(db: Session, user_id: str) -> Optional[CitizenProfile]:
    return db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()


def get_citizen_by_civic_one_id(db: Session, civic_one_id: str) -> Optional[CitizenProfile]:
    return db.query(CitizenProfile).filter(CitizenProfile.civic_one_id == civic_one_id).first()


def create_citizen_profile(
    db: Session,
    user_id: str,
    civic_one_id: str,
    full_name: str,
    date_of_birth: Optional[str] = None,
    gender: Optional[str] = "Male",
    phone: Optional[str] = None,
    email: Optional[str] = None,
    address: Optional[str] = None,
    blood_group: Optional[str] = None,
    aadhaar_last4: Optional[str] = None,
    pan_number: Optional[str] = None,
    father_name: Optional[str] = None,
    emergency_contact: Optional[str] = None,
    photo_url: Optional[str] = None,
    verification_status: str = "Level 3 - Biometric Sovereign"
) -> CitizenProfile:
    profile = CitizenProfile(
        user_id=user_id,
        civic_one_id=civic_one_id,
        full_name=full_name,
        date_of_birth=date_of_birth,
        gender=gender,
        phone=phone,
        email=email,
        address=address,
        blood_group=blood_group,
        aadhaar_last4=aadhaar_last4,
        pan_number=pan_number,
        father_name=father_name,
        emergency_contact=emergency_contact,
        photo_url=photo_url,
        verification_status=verification_status
    )
    db.add(profile)
    db.flush()
    return profile
