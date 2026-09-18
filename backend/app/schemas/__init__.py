from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime


# Auth & User Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None


class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool


# Citizen Schemas
class CitizenProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    civic_id: str
    full_name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    aadhaar_last4: Optional[str] = None
    pan_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    photo_url: Optional[str] = None


class CitizenProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


# Document Schemas
class DocumentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    domain_id: int
    title: str
    document_type: str
    issuer: str
    file_url: Optional[str] = None
    verified: bool
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime


# Access Request Schemas
class RequestApprovePayload(BaseModel):
    duration_days: Optional[int] = 30
    granted_fields: Optional[List[str]] = None


class AccessRequestSchema(BaseModel):
    id: int
    citizen_id: int
    institution_id: int
    institution_name: Optional[str] = "Unknown Institution"
    institution_category: Optional[str] = "UNKNOWN"
    requested_by_user_id: int
    domain_id: int
    domain_name: Optional[str] = "Unknown Domain"
    domain_type: Optional[str] = "UNKNOWN"
    purpose: str
    duration_days: int
    status: str
    requested_fields: List[str]
    requested_at: datetime
    updated_at: datetime


# Active Access Schemas
class ActiveAccessSchema(BaseModel):
    id: int
    request_id: int
    citizen_id: int
    institution_id: int
    institution_name: Optional[str] = "Unknown Institution"
    institution_category: Optional[str] = "UNKNOWN"
    domain_id: int
    domain_name: Optional[str] = "Unknown Domain"
    domain_type: Optional[str] = "UNKNOWN"
    granted_fields: List[str]
    granted_at: datetime
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    status: str


# Audit Log Schemas
class AuditLogSchema(BaseModel):
    id: int
    citizen_id: int
    institution_id: Optional[int] = None
    institution_name: Optional[str] = "System / Citizen Direct"
    user_id: Optional[int] = None
    domain_id: Optional[int] = None
    domain_name: Optional[str] = "N/A"
    action: str
    purpose: str
    accessed_fields: List[str]
    timestamp: datetime
    outcome: str


# Notification Schemas
class NotificationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime


# Institution Request Schemas
class InstitutionAccessRequestCreate(BaseModel):
    citizen_civic_id: Optional[str] = None
    citizen_id: Optional[int] = None
    domain_type: str
    purpose: str
    duration_days: int = 30
    requested_fields: List[str]
