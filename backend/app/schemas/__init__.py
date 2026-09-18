from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime


# Auth & User Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    email: Optional[str] = None
    identifier: Optional[str] = None
    password: Optional[str] = None


class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    external_auth_id: Optional[str] = None
    email: str
    phone: Optional[str] = None
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


# Citizen Schemas
class CitizenProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    civic_one_id: str
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    verification_status: Optional[str] = "Level 3 - Biometric Sovereign"
    blood_group: Optional[str] = None
    aadhaar_last4: Optional[str] = None
    pan_number: Optional[str] = None
    father_name: Optional[str] = None
    emergency_contact: Optional[str] = None
    photo_url: Optional[str] = None

    @property
    def civic_id(self) -> str:
        return self.civic_one_id

    @property
    def dob(self) -> str:
        return self.date_of_birth or ""


class CitizenProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


# Document Schemas
class DocumentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    citizen_id: str
    domain_id: str
    title: str
    document_type: str
    issuer: str
    document_number: Optional[str] = None
    storage_key: Optional[str] = None
    file_url: Optional[str] = None
    verified: bool
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime


# Record Schema
class RecordSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    citizen_id: str
    domain_id: str
    record_type: str
    data: Dict[str, Any]
    verification_status: str
    created_at: datetime


# Access Request Schemas
class RequestApprovePayload(BaseModel):
    duration_days: Optional[int] = 30
    granted_fields: Optional[List[str]] = None


class AccessRequestSchema(BaseModel):
    id: str
    citizen_id: str
    institution_id: str
    institution_name: Optional[str] = "Unknown Institution"
    institution_category: Optional[str] = "UNKNOWN"
    requester_user_id: str
    domain_id: str
    domain_name: Optional[str] = "Unknown Domain"
    domain_type: Optional[str] = "UNKNOWN"
    purpose: str
    requested_duration: Optional[str] = "30_DAYS"
    duration_days: Optional[str] = "30"
    status: str
    requested_fields: List[str]
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# Active Access Schemas
class ActiveAccessSchema(BaseModel):
    id: str
    access_request_id: str
    citizen_id: str
    institution_id: str
    institution_name: Optional[str] = "Unknown Institution"
    institution_category: Optional[str] = "UNKNOWN"
    domain_id: str
    domain_name: Optional[str] = "Unknown Domain"
    domain_type: Optional[str] = "UNKNOWN"
    approved_fields: List[str]
    purpose: Optional[str] = None
    granted_at: datetime
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    status: str


# Audit Log Schemas
class AuditLogSchema(BaseModel):
    id: str
    citizen_id: str
    institution_id: Optional[str] = None
    institution_name: Optional[str] = "System / Citizen Direct"
    user_id: Optional[str] = None
    access_request_id: Optional[str] = None
    domain_id: Optional[str] = None
    domain_name: Optional[str] = "N/A"
    action: str
    purpose: str
    accessed_fields: Optional[List[str]] = None
    result: str
    metadata_json: Optional[Dict[str, Any]] = None
    timestamp: datetime


# Notification Schemas
class NotificationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    related_entity_id: Optional[str] = None
    created_at: datetime


# Institution Request Schemas
class InstitutionAccessRequestCreate(BaseModel):
    citizen_civic_id: Optional[str] = None
    citizen_id: Optional[str] = None
    domain_type: str
    purpose: str
    duration_days: int = 30
    requested_fields: List[str]
