import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from './AuthGuard'
import { GuestGuard } from './GuestGuard'
import { OrganizationGuard } from './OrganizationGuard'
import { GovernmentGuard } from './GovernmentGuard'
import { AdminGuard } from './AdminGuard'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

// Shells for Multi-Workspaces
import { OrganizationShell } from '@/components/layout/organization/OrganizationShell'
import { GovernmentShell } from '@/components/layout/government/GovernmentShell'
import { AdminShell } from '@/components/layout/admin/AdminShell'

// Citizen Auth Pages
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { VerifyOtpPage } from '@/features/auth/VerifyOtpPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'

// Citizen Feature Pages
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ActionCenterPage } from '@/features/actions/ActionCenterPage'
import { IdentityPage } from '@/features/identity/IdentityPage'
import { DocumentVaultPage } from '@/features/documents/DocumentVaultPage'
import { DocumentDetailPage } from '@/features/documents/DocumentDetailPage'
import { ExpiringDocumentsPage } from '@/features/documents/ExpiringDocumentsPage'
import { FamilyDashboardPage } from '@/features/family/FamilyDashboardPage'
import { FamilyMemberDetailPage } from '@/features/family/FamilyMemberDetailPage'
import { FamilyDelegationPage } from '@/features/family/FamilyDelegationPage'
import { ServicesPage } from '@/features/services/ServicesPage'
import { ApplicationsPage } from '@/features/applications/ApplicationsPage'
import { ApplicationDetailPage } from '@/features/applications/ApplicationDetailPage'
import { PaymentsPage } from '@/features/payments/PaymentsPage'
import { AssistantPage } from '@/features/assistant/AssistantPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { PrivacyConsentCenterPage } from '@/features/privacy/PrivacyConsentCenterPage'
import { SecurityCenterPage } from '@/features/security/SecurityCenterPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { LandingPage } from '@/pages/LandingPage'

// Organization Pages
import { OrganizationLoginPage } from '@/features/organization/pages/OrganizationLoginPage'
import { OrganizationDashboardPage } from '@/features/organization/pages/OrganizationDashboardPage'
import { OrganizationServicesPage } from '@/features/organization/pages/OrganizationServicesPage'
import { OrganizationApplicationsPage } from '@/features/organization/pages/OrganizationApplicationsPage'
import { OrganizationApplicationDetailPage } from '@/features/organization/pages/OrganizationApplicationDetailPage'
import { OrganizationCitizensPage } from '@/features/organization/pages/OrganizationCitizensPage'
import { OrganizationCitizenDetailPage } from '@/features/organization/pages/OrganizationCitizenDetailPage'
import { OrganizationAccessRequestsPage } from '@/features/organization/pages/OrganizationAccessRequestsPage'
import { OrganizationMembersPage } from '@/features/organization/pages/OrganizationMembersPage'
import { OrganizationRolesPage } from '@/features/organization/pages/OrganizationRolesPage'
import { OrganizationAnalyticsPage } from '@/features/organization/pages/OrganizationAnalyticsPage'
import { OrganizationAuditLogPage } from '@/features/organization/pages/OrganizationAuditLogPage'
import { OrganizationProfilePage } from '@/features/organization/pages/OrganizationProfilePage'
import { OrganizationSettingsPage } from '@/features/organization/pages/OrganizationSettingsPage'
// Organization Advanced Modules
import { OrganizationTrustCenterPage } from '@/features/organization/pages/OrganizationTrustCenterPage'
import { OrganizationPolicyEnginePage } from '@/features/organization/pages/OrganizationPolicyEnginePage'
import { OrganizationConsentReceiptsPage } from '@/features/organization/pages/OrganizationConsentReceiptsPage'
import { OrganizationIntelligencePage } from '@/features/organization/pages/OrganizationIntelligencePage'
import { OrganizationSecurityEventsPage } from '@/features/organization/pages/OrganizationSecurityEventsPage'

// Government Pages
import { GovernmentLoginPage } from '@/features/government/pages/GovernmentLoginPage'
import { GovernmentDashboardPage } from '@/features/government/pages/GovernmentDashboardPage'
import { GovernmentServicesPage } from '@/features/government/pages/GovernmentServicesPage'
import { GovernmentApplicationsPage } from '@/features/government/pages/GovernmentApplicationsPage'
import { GovernmentApplicationDetailPage } from '@/features/government/pages/GovernmentApplicationDetailPage'
import { GovernmentVerificationPage } from '@/features/government/pages/GovernmentVerificationPage'
import { GovernmentCitizensPage } from '@/features/government/pages/GovernmentCitizensPage'
import { GovernmentReportsPage } from '@/features/government/pages/GovernmentReportsPage'
import { GovernmentAuditLogPage } from '@/features/government/pages/GovernmentAuditLogPage'
import { GovernmentSettingsPage } from '@/features/government/pages/GovernmentSettingsPage'

// Super Admin Pages
import { AdminLoginPage } from '@/features/admin/pages/AdminLoginPage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminOrganizationsPage } from '@/features/admin/pages/AdminOrganizationsPage'
import { AdminGovernmentPage } from '@/features/admin/pages/AdminGovernmentPage'
import { AdminServicesPage } from '@/features/admin/pages/AdminServicesPage'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'
import { AdminAuditPage } from '@/features/admin/pages/AdminAuditPage'
import { AdminSettingsPage } from '@/features/admin/pages/AdminSettingsPage'

// System Pages
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { ROUTES } from '@/constants/routes'

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <LandingPage />,
  },

  // ==================== CITIZEN AUTH ====================
  {
    path: ROUTES.AUTH.LOGIN,
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.AUTH.VERIFY_OTP,
    element: (
      <GuestGuard>
        <VerifyOtpPage />
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: (
      <GuestGuard>
        <ForgotPasswordPage />
      </GuestGuard>
    ),
  },

  // ==================== CITIZEN PORTAL ====================
  {
    path: ROUTES.APP.ROOT,
    element: (
      <AuthGuard>
        <ErrorBoundary>
          <AppShell />
        </ErrorBoundary>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.APP.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'actions',
        element: <ActionCenterPage />,
      },
      {
        path: 'identity',
        element: <IdentityPage />,
      },
      {
        path: 'documents',
        element: <DocumentVaultPage />,
      },
      {
        path: 'documents/expiring',
        element: <ExpiringDocumentsPage />,
      },
      {
        path: 'documents/:documentId',
        element: <DocumentDetailPage />,
      },
      {
        path: 'family',
        element: <FamilyDashboardPage />,
      },
      {
        path: 'family/delegation',
        element: <FamilyDelegationPage />,
      },
      {
        path: 'family/:memberId',
        element: <FamilyMemberDetailPage />,
      },
      {
        path: 'services',
        element: <ServicesPage />,
      },
      {
        path: 'applications',
        element: <ApplicationsPage />,
      },
      {
        path: 'applications/:applicationId',
        element: <ApplicationDetailPage />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      {
        path: 'assistant',
        element: <AssistantPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyConsentCenterPage />,
      },
      {
        path: 'security',
        element: <SecurityCenterPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // ==================== ORGANIZATION WORKSPACE ====================
  {
    path: ROUTES.ORGANIZATION.LOGIN,
    element: <OrganizationLoginPage />,
  },
  {
    path: ROUTES.ORGANIZATION.ROOT,
    element: (
      <OrganizationGuard>
        <ErrorBoundary>
          <OrganizationShell />
        </ErrorBoundary>
      </OrganizationGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.ORGANIZATION.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <OrganizationDashboardPage />,
      },
      {
        path: 'services',
        element: <OrganizationServicesPage />,
      },
      {
        path: 'applications',
        element: <OrganizationApplicationsPage />,
      },
      {
        path: 'applications/:applicationId',
        element: <OrganizationApplicationDetailPage />,
      },
      {
        path: 'citizens',
        element: <OrganizationCitizensPage />,
      },
      {
        path: 'citizens/:citizenId',
        element: <OrganizationCitizenDetailPage />,
      },
      {
        path: 'requests',
        element: <OrganizationAccessRequestsPage />,
      },
      {
        path: 'access-requests',
        element: <OrganizationAccessRequestsPage />,
      },
      {
        path: 'documents',
        element: <OrganizationServicesPage />,
      },
      {
        path: 'members',
        element: <OrganizationMembersPage />,
      },
      {
        path: 'roles',
        element: <OrganizationRolesPage />,
      },
      {
        path: 'analytics',
        element: <OrganizationAnalyticsPage />,
      },
      {
        path: 'audit',
        element: <OrganizationAuditLogPage />,
      },
      {
        path: 'audit-log',
        element: <OrganizationAuditLogPage />,
      },
      {
        path: 'profile',
        element: <OrganizationProfilePage />,
      },
      {
        path: 'settings',
        element: <OrganizationSettingsPage />,
      },
      // ── Advanced Intelligence & Governance Modules ──
      {
        path: 'trust',
        element: <OrganizationTrustCenterPage />,
      },
      {
        path: 'policies',
        element: <OrganizationPolicyEnginePage />,
      },
      {
        path: 'receipts',
        element: <OrganizationConsentReceiptsPage />,
      },
      {
        path: 'intelligence',
        element: <OrganizationIntelligencePage />,
      },
      {
        path: 'security-events',
        element: <OrganizationSecurityEventsPage />,
      },
    ],
  },

  // ==================== GOVERNMENT WORKSPACE ====================
  {
    path: ROUTES.GOVERNMENT.LOGIN,
    element: <GovernmentLoginPage />,
  },
  {
    path: ROUTES.GOVERNMENT.ROOT,
    element: (
      <GovernmentGuard>
        <ErrorBoundary>
          <GovernmentShell />
        </ErrorBoundary>
      </GovernmentGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.GOVERNMENT.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <GovernmentDashboardPage />,
      },
      {
        path: 'services',
        element: <GovernmentServicesPage />,
      },
      {
        path: 'applications',
        element: <GovernmentApplicationsPage />,
      },
      {
        path: 'applications/:applicationId',
        element: <GovernmentApplicationDetailPage />,
      },
      {
        path: 'verification',
        element: <GovernmentVerificationPage />,
      },
      {
        path: 'citizens',
        element: <GovernmentCitizensPage />,
      },
      {
        path: 'documents',
        element: <GovernmentServicesPage />,
      },
      {
        path: 'notifications',
        element: <GovernmentDashboardPage />,
      },
      {
        path: 'reports',
        element: <GovernmentReportsPage />,
      },
      {
        path: 'audit',
        element: <GovernmentAuditLogPage />,
      },
      {
        path: 'audit-log',
        element: <GovernmentAuditLogPage />,
      },
      {
        path: 'settings',
        element: <GovernmentSettingsPage />,
      },
    ],
  },

  // ==================== SUPER ADMIN WORKSPACE ====================
  {
    path: ROUTES.ADMIN.LOGIN,
    element: <AdminLoginPage />,
  },
  {
    path: ROUTES.ADMIN.ROOT,
    element: (
      <AdminGuard>
        <ErrorBoundary>
          <AdminShell />
        </ErrorBoundary>
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'organizations',
        element: <AdminOrganizationsPage />,
      },
      {
        path: 'government',
        element: <AdminGovernmentPage />,
      },
      {
        path: 'services',
        element: <AdminServicesPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'audit',
        element: <AdminAuditPage />,
      },
      {
        path: 'settings',
        element: <AdminSettingsPage />,
      },
    ],
  },

  // ==================== SYSTEM ROUTES ====================
  {
    path: ROUTES.SYSTEM.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: ROUTES.SYSTEM.NOT_FOUND,
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
