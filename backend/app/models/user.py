from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    INSTITUTION = "INSTITUTION"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False)
    institution_membership = relationship("InstitutionUser", back_populates="user", uselist=False)


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    civic_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. CIV-2026-004281
    full_name = Column(String(255), nullable=False)
    dob = Column(String(50), nullable=True)
    gender = Column(String(20), default="Male")
    phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    blood_group = Column(String(10), nullable=True)
    aadhaar_last4 = Column(String(10), nullable=True)
    pan_number = Column(String(20), nullable=True)
    father_name = Column(String(255), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="citizen_profile")
