"""phase2_database_schema

Revision ID: 001_phase2_schema
Revises: 
Create Date: 2026-09-18 16:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '001_phase2_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('external_auth_id', sa.String(255), unique=True, index=True, nullable=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='CITIZEN'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 2. Citizen Profiles table
    op.create_table(
        'citizen_profiles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('civic_one_id', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('date_of_birth', sa.String(50), nullable=True),
        sa.Column('gender', sa.String(20), nullable=True, server_default='Male'),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('verification_status', sa.String(100), nullable=True, server_default='Level 3 - Biometric Sovereign'),
        sa.Column('blood_group', sa.String(10), nullable=True),
        sa.Column('aadhaar_last4', sa.String(10), nullable=True),
        sa.Column('pan_number', sa.String(20), nullable=True),
        sa.Column('father_name', sa.String(255), nullable=True),
        sa.Column('emergency_contact', sa.String(50), nullable=True),
        sa.Column('photo_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 3. Institutions table
    op.create_table(
        'institutions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False, index=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('registration_id', sa.String(100), unique=True, index=True, nullable=False),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 4. Institution Users table
    op.create_table(
        'institution_users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('institution_id', sa.String(36), sa.ForeignKey('institutions.id'), nullable=False),
        sa.Column('role_id', sa.String(50), nullable=False, server_default='ACADEMIC_VERIFIER'),
        sa.Column('department', sa.String(255), nullable=True),
        sa.Column('designation', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 5. Data Domains table
    op.create_table(
        'data_domains',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('domain_type', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True)
    )

    # 6. Records table
    op.create_table(
        'records',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('citizen_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('domain_id', sa.String(36), sa.ForeignKey('data_domains.id'), nullable=False),
        sa.Column('record_type', sa.String(100), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('verification_status', sa.String(50), nullable=False, server_default='VERIFIED'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 7. Documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('citizen_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('domain_id', sa.String(36), sa.ForeignKey('data_domains.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('document_type', sa.String(100), nullable=False),
        sa.Column('issuer', sa.String(255), nullable=False),
        sa.Column('document_number', sa.String(100), nullable=True),
        sa.Column('verification_status', sa.String(50), nullable=False, server_default='VERIFIED'),
        sa.Column('storage_key', sa.String(500), nullable=True),
        sa.Column('file_url', sa.String(500), nullable=True),
        sa.Column('verified', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 8. Access Requests table
    op.create_table(
        'access_requests',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('citizen_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('institution_id', sa.String(36), sa.ForeignKey('institutions.id'), nullable=False, index=True),
        sa.Column('requester_user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('domain_id', sa.String(36), sa.ForeignKey('data_domains.id'), nullable=False),
        sa.Column('purpose', sa.String(500), nullable=False),
        sa.Column('requested_duration', sa.String(50), nullable=True, server_default='30_DAYS'),
        sa.Column('duration_days', sa.String(50), nullable=True, server_default='30'),
        sa.Column('status', sa.String(50), nullable=False, index=True, server_default='PENDING'),
        sa.Column('requested_fields', sa.JSON(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 9. Consents table
    op.create_table(
        'consents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('access_request_id', sa.String(36), sa.ForeignKey('access_requests.id'), nullable=False),
        sa.Column('citizen_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('decision', sa.String(50), nullable=False),
        sa.Column('decided_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_fields', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 10. Active Access table
    op.create_table(
        'active_access',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('access_request_id', sa.String(36), sa.ForeignKey('access_requests.id'), nullable=False),
        sa.Column('citizen_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('institution_id', sa.String(36), sa.ForeignKey('institutions.id'), nullable=False, index=True),
        sa.Column('domain_id', sa.String(36), sa.ForeignKey('data_domains.id'), nullable=False),
        sa.Column('approved_fields', sa.JSON(), nullable=False),
        sa.Column('purpose', sa.String(500), nullable=True),
        sa.Column('granted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, index=True, server_default='ACTIVE'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # 11. Audit Logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('citizen_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('institution_id', sa.String(36), sa.ForeignKey('institutions.id'), nullable=True),
        sa.Column('access_request_id', sa.String(36), sa.ForeignKey('access_requests.id'), nullable=True),
        sa.Column('domain_id', sa.String(36), sa.ForeignKey('data_domains.id'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('purpose', sa.String(500), nullable=False),
        sa.Column('accessed_fields', sa.JSON(), nullable=True),
        sa.Column('result', sa.String(50), nullable=False, server_default='SUCCESS'),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False, index=True)
    )

    # 12. Notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('type', sa.String(50), nullable=False, server_default='INFO'),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, index=True, server_default='0'),
        sa.Column('related_entity_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('audit_logs')
    op.drop_table('active_access')
    op.drop_table('consents')
    op.drop_table('access_requests')
    op.drop_table('documents')
    op.drop_table('records')
    op.drop_table('data_domains')
    op.drop_table('institution_users')
    op.drop_table('institutions')
    op.drop_table('citizen_profiles')
    op.drop_table('users')
