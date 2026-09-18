from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class InstitutionCategory(str, enum.Enum):
    EDUCATION = "EDUCATION"
    FINANCE = "FINANCE"
    HEALTHCARE = "HEALTHCARE"
    GOVERNMENT = "GOVERNMENT"


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(SQLEnum(InstitutionCategory), nullable=False)
    registration_number = Column(String(100), unique=True, nullable=False)
    address = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    members = relationship("InstitutionUser", back_populates="institution")


class InstitutionUser(Base):
    __tablename__ = "institution_users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    department = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)

    user = relationship("User", back_populates="institution_membership")
    institution = relationship("Institution", back_populates="members")
