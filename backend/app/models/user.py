import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    INSTITUTION = "INSTITUTION"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_auth_id = Column(String(255), unique=True, index=True, nullable=True)  # Firebase/Cognito auth sub
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    institution_membership = relationship("InstitutionUser", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @property
    def user_type(self) -> str:
        return self.role.value if hasattr(self.role, "value") else str(self.role)


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    civic_one_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., CIV-2026-004281
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), default="Male")
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    verification_status = Column(String(100), default="Level 3 - Biometric Sovereign")
    blood_group = Column(String(10), nullable=True)
    aadhaar_last4 = Column(String(10), nullable=True)
    pan_number = Column(String(20), nullable=True)
    father_name = Column(String(255), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="citizen_profile")

    @property
    def civic_id(self) -> str:
        return self.civic_one_id

    @property
    def dob(self) -> str:
        return self.date_of_birth
