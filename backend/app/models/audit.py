import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean
from backend.app.db.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)  # Actor ID
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=True)
    access_request_id = Column(String(36), ForeignKey("access_requests.id"), nullable=True)
    domain_id = Column(String(36), ForeignKey("data_domains.id"), nullable=True)
    action = Column(String(100), nullable=False)  # GRANT_CONSENT, DENY_CONSENT, REVOKE_CONSENT, QUERY_DATA
    purpose = Column(String(500), nullable=False)
    accessed_fields = Column(JSON, nullable=True)
    result = Column(String(50), default="SUCCESS")
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    @property
    def outcome(self) -> str:
        return self.result


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), default="INFO")
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    related_entity_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
