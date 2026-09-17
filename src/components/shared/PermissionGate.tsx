import React from 'react'
import type { OrganizationPermission, OrganizationRole, GovernmentPermission, GovernmentRole } from '@/types'

const ORG_ROLE_PERMISSIONS: Record<OrganizationRole, OrganizationPermission[]> = {
  OWNER: [
    'SERVICES_VIEW',
    'SERVICES_CREATE',
    'SERVICES_EDIT',
    'SERVICES_PUBLISH',
    'APPLICATIONS_VIEW',
    'APPLICATIONS_PROCESS',
    'CITIZEN_VIEW_AUTHORIZED',
    'CITIZEN_ACCESS_REQUEST',
    'DOCUMENT_VIEW_AUTHORIZED',
    'MEMBERS_VIEW',
    'MEMBERS_MANAGE',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW',
  ],
  ADMIN: [
    'SERVICES_VIEW',
    'SERVICES_CREATE',
    'SERVICES_EDIT',
    'SERVICES_PUBLISH',
    'APPLICATIONS_VIEW',
    'APPLICATIONS_PROCESS',
    'CITIZEN_VIEW_AUTHORIZED',
    'CITIZEN_ACCESS_REQUEST',
    'DOCUMENT_VIEW_AUTHORIZED',
    'MEMBERS_VIEW',
    'MEMBERS_MANAGE',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW',
  ],
  SERVICE_MANAGER: [
    'SERVICES_VIEW',
    'SERVICES_CREATE',
    'SERVICES_EDIT',
    'SERVICES_PUBLISH',
    'APPLICATIONS_VIEW',
    'ANALYTICS_VIEW',
  ],
  VERIFICATION_OFFICER: [
    'APPLICATIONS_VIEW',
    'APPLICATIONS_PROCESS',
    'CITIZEN_VIEW_AUTHORIZED',
    'CITIZEN_ACCESS_REQUEST',
    'DOCUMENT_VIEW_AUTHORIZED',
    'AUDIT_LOG_VIEW',
  ],
  APPLICATION_OFFICER: [
    'APPLICATIONS_VIEW',
    'APPLICATIONS_PROCESS',
    'CITIZEN_VIEW_AUTHORIZED',
    'DOCUMENT_VIEW_AUTHORIZED',
  ],
  SUPPORT: [
    'APPLICATIONS_VIEW',
    'CITIZEN_VIEW_AUTHORIZED',
  ],
  ANALYST: [
    'SERVICES_VIEW',
    'APPLICATIONS_VIEW',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW',
  ],
  READ_ONLY: [
    'SERVICES_VIEW',
    'APPLICATIONS_VIEW',
    'MEMBERS_VIEW',
  ],
}

const GOV_ROLE_PERMISSIONS: Record<GovernmentRole, GovernmentPermission[]> = {
  COMMISSIONER: [
    'GOV_SERVICES_MANAGE',
    'GOV_APPLICATIONS_REVIEW',
    'GOV_VERIFY_IDENTITY',
    'GOV_ISSUE_CERTIFICATE',
    'GOV_REPORTS_VIEW',
    'GOV_AUDIT_VIEW',
  ],
  SECRETARY: [
    'GOV_SERVICES_MANAGE',
    'GOV_APPLICATIONS_REVIEW',
    'GOV_VERIFY_IDENTITY',
    'GOV_ISSUE_CERTIFICATE',
    'GOV_REPORTS_VIEW',
    'GOV_AUDIT_VIEW',
  ],
  SYSTEM_ADMIN: [
    'GOV_SERVICES_MANAGE',
    'GOV_APPLICATIONS_REVIEW',
    'GOV_VERIFY_IDENTITY',
    'GOV_ISSUE_CERTIFICATE',
    'GOV_REPORTS_VIEW',
    'GOV_AUDIT_VIEW',
  ],
  VERIFICATION_OFFICER: [
    'GOV_APPLICATIONS_REVIEW',
    'GOV_VERIFY_IDENTITY',
    'GOV_REPORTS_VIEW',
    'GOV_AUDIT_VIEW',
  ],
  CASE_WORKER: [
    'GOV_APPLICATIONS_REVIEW',
  ],
  INSPECTOR: [
    'GOV_APPLICATIONS_REVIEW',
    'GOV_VERIFY_IDENTITY',
  ],
  AUDITOR: [
    'GOV_REPORTS_VIEW',
    'GOV_AUDIT_VIEW',
  ],
}

interface PermissionGateProps {
  permission?: OrganizationPermission | GovernmentPermission
  role?: OrganizationRole | GovernmentRole
  userRole?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  role,
  userRole,
  fallback = null,
  children,
}: PermissionGateProps) {
  if (!userRole) {
    return <>{children}</>
  }

  // Check specific role requirement
  if (role && userRole !== role) {
    return <>{fallback}</>
  }

  // Check organization permission
  if (permission && (userRole in ORG_ROLE_PERMISSIONS)) {
    const orgPerms = ORG_ROLE_PERMISSIONS[userRole as OrganizationRole] || []
    if (!orgPerms.includes(permission as OrganizationPermission)) {
      return <>{fallback}</>
    }
  }

  // Check government permission
  if (permission && (userRole in GOV_ROLE_PERMISSIONS)) {
    const govPerms = GOV_ROLE_PERMISSIONS[userRole as GovernmentRole] || []
    if (!govPerms.includes(permission as GovernmentPermission)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
