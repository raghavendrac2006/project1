import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class DomainType(str, enum.Enum):
    IDENTITY = "IDENTITY"
    EDUCATION = "EDUCATION"
    HEALTH = "HEALTH"
    FINANCE = "FINANCE"
    TRANSPORT = "TRANSPORT"


class DataDomain(Base):
    __tablename__ = "data_domains"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain_type = Column(SQLEnum(DomainType), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    records = relationship("Record", back_populates="domain")
    documents = relationship("Document", back_populates="domain")


class Record(Base):
    __tablename__ = "records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    domain_id = Column(String(36), ForeignKey("data_domains.id"), nullable=False)
    record_type = Column(String(100), nullable=False)
    data = Column(JSON, nullable=False)  # JSON payload
    verification_status = Column(String(50), default="VERIFIED")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    domain = relationship("DataDomain", back_populates="records")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    domain_id = Column(String(36), ForeignKey("data_domains.id"), nullable=False)
    title = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)
    issuer = Column(String(255), nullable=False)
    document_number = Column(String(100), nullable=True)
    verification_status = Column(String(50), default="VERIFIED")
    storage_key = Column(String(500), nullable=True)  # Abstract key for S3 / Blob storage
    file_url = Column(String(500), nullable=True)
    verified = Column(Boolean, default=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    domain = relationship("DataDomain", back_populates="documents")

    @property
    def user_id(self) -> str:
        return self.citizen_id
