from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class DomainType(str, enum.Enum):
    IDENTITY = "identity"
    EDUCATION = "education"
    FINANCE = "finance"
    HEALTHCARE = "healthcare"
    GOVERNMENT = "government"


class DataDomain(Base):
    __tablename__ = "data_domains"

    id = Column(Integer, primary_key=True, index=True)
    domain_type = Column(SQLEnum(DomainType), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    records = relationship("Record", back_populates="domain")
    documents = relationship("Document", back_populates="domain")


class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    domain_id = Column(Integer, ForeignKey("data_domains.id"), nullable=False)
    attributes_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    domain = relationship("DataDomain", back_populates="records")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    domain_id = Column(Integer, ForeignKey("data_domains.id"), nullable=False)
    title = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)
    issuer = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=True)
    verified = Column(Boolean, default=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    domain = relationship("DataDomain", back_populates="documents")
