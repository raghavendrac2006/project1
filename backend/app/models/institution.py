import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.db.session import Base
from backend.app.models.role import RoleEnum


class InstitutionCategory(str, enum.Enum):
    EDUCATION = "EDUCATION"
    FINANCE = "FINANCE"
    HEALTHCARE = "HEALTHCARE"
    GOVERNMENT = "GOVERNMENT"


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    category = Column(SQLEnum(InstitutionCategory), nullable=False)
    registration_id = Column(String(100), unique=True, index=True, nullable=False)
    address = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    members = relationship("InstitutionUser", back_populates="institution", cascade="all, delete-orphan")

    @property
    def institution_type(self) -> str:
        return self.category.value if hasattr(self.category, "value") else str(self.category)

    @property
    def registration_number(self) -> str:
        return self.registration_id


class InstitutionUser(Base):
    __tablename__ = "institution_users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    role_id = Column(SQLEnum(RoleEnum), default=RoleEnum.ACADEMIC_VERIFIER, nullable=False)
    department = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="institution_membership")
    institution = relationship("Institution", back_populates="members")
