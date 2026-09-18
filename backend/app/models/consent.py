import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class AccessStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    requester_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    domain_id = Column(String(36), ForeignKey("data_domains.id"), nullable=False)
    purpose = Column(String(500), nullable=False)
    requested_duration = Column(String(50), default="30_DAYS")
    duration_days = Column(String(50), default="30")
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    requested_fields = Column(JSON, nullable=False)  # JSON array
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    consents = relationship("Consent", back_populates="request", cascade="all, delete-orphan")
    active_grants = relationship("ActiveAccess", back_populates="request", cascade="all, delete-orphan")

    @property
    def requested_by_user_id(self) -> str:
        return self.requester_user_id


class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    access_request_id = Column(String(36), ForeignKey("access_requests.id"), nullable=False)
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    decision = Column(String(50), nullable=False)  # APPROVED or DENIED
    decided_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    approved_fields = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    request = relationship("AccessRequest", back_populates="consents")


class ActiveAccess(Base):
    __tablename__ = "active_access"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    access_request_id = Column(String(36), ForeignKey("access_requests.id"), nullable=False)
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    domain_id = Column(String(36), ForeignKey("data_domains.id"), nullable=False)
    approved_fields = Column(JSON, nullable=False)
    purpose = Column(String(500), nullable=True)
    granted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(SQLEnum(AccessStatus), default=AccessStatus.ACTIVE, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    request = relationship("AccessRequest", back_populates="active_grants")

    @property
    def granted_fields(self) -> list:
        return self.approved_fields
