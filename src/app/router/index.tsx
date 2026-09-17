import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from './AuthGuard'
import { GuestGuard } from './GuestGuard'
import { OrganizationGuard } from './OrganizationGuard'
import { GovernmentGuard } from './GovernmentGuard'
import { AdminGuard } from './AdminGuard'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { PageLoader } from '@/components/feedback/PageLoader'

// Shells for Multi-Workspaces
import { OrganizationShell } from '@/components/layout/organization/OrganizationShell'
import { GovernmentShell } from '@/components/layout/government/GovernmentShell'
import { AdminShell } from '@/components/layout/admin/AdminShell'

// Helper for top-level non-shell route suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

// Landing
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })))

// Citizen Auth Pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const VerifyOtpPage = lazy(() => import('@/features/auth/VerifyOtpPage').then((m) => ({ default: m.VerifyOtpPage })))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))

// Citizen Feature Pages
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ActionCenterPage = lazy(() => import('@/features/actions/ActionCenterPage').then((m) => ({ default: m.ActionCenterPage })))
const IdentityPage = lazy(() => import('@/features/identity/IdentityPage').then((m) => ({ default: m.IdentityPage })))
const DocumentVaultPage = lazy(() => import('@/features/documents/DocumentVaultPage').then((m) => ({ default: m.DocumentVaultPage })))
const DocumentDetailPage = lazy(() => import('@/features/documents/DocumentDetailPage').then((m) => ({ default: m.DocumentDetailPage })))
const ExpiringDocumentsPage = lazy(() => import('@/features/documents/ExpiringDocumentsPage').then((m) => ({ default: m.ExpiringDocumentsPage })))
const FamilyDashboardPage = lazy(() => import('@/features/family/FamilyDashboardPage').then((m) => ({ default: m.FamilyDashboardPage })))
const FamilyMemberDetailPage = lazy(() => import('@/features/family/FamilyMemberDetailPage').then((m) => ({ default: m.FamilyMemberDetailPage })))
const FamilyDelegationPage = lazy(() => import('@/features/family/FamilyDelegationPage').then((m) => ({ default: m.FamilyDelegationPage })))
const ServicesPage = lazy(() => import('@/features/services/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const ApplicationsPage = lazy(() => import('@/features/applications/ApplicationsPage').then((m) => ({ default: m.ApplicationsPage })))
const ApplicationDetailPage = lazy(() => import('@/features/applications/ApplicationDetailPage').then((m) => ({ default: m.ApplicationDetailPage })))
const PaymentsPage = lazy(() => import('@/features/payments/PaymentsPage').then((m) => ({ default: m.PaymentsPage })))
const AssistantPage = lazy(() => import('@/features/assistant/AssistantPage').then((m) => ({ default: m.AssistantPage })))
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const PrivacyConsentCenterPage = lazy(() => import('@/features/privacy/PrivacyConsentCenterPage').then((m) => ({ default: m.PrivacyConsentCenterPage })))
const SecurityCenterPage = lazy(() => import('@/features/security/SecurityCenterPage').then((m) => ({ default: m.SecurityCenterPage })))
const BenefitsEligibilityPage = lazy(() => import('@/features/benefits/BenefitsEligibilityPage').then((m) => ({ default: m.BenefitsEligibilityPage })))
const DataDashboardPage = lazy(() => import('@/features/data/DataDashboardPage').then((m) => ({ default: m.DataDashboardPage })))
const CivicJourneyPage = lazy(() => import('@/features/journey/CivicJourneyPage').then((m) => ({ default: m.CivicJourneyPage })))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))

// Organization Pages
const OrganizationLoginPage = lazy(() => import('@/features/organization/pages/OrganizationLoginPage').then((m) => ({ default: m.OrganizationLoginPage })))
const OrganizationDashboardPage = lazy(() => import('@/features/organization/pages/OrganizationDashboardPage').then((m) => ({ default: m.OrganizationDashboardPage })))
const OrganizationServicesPage = lazy(() => import('@/features/organization/pages/OrganizationServicesPage').then((m) => ({ default: m.OrganizationServicesPage })))
const OrganizationApplicationsPage = lazy(() => import('@/features/organization/pages/OrganizationApplicationsPage').then((m) => ({ default: m.OrganizationApplicationsPage })))
const OrganizationApplicationDetailPage = lazy(() => import('@/features/organization/pages/OrganizationApplicationDetailPage').then((m) => ({ default: m.OrganizationApplicationDetailPage })))
const OrganizationCitizensPage = lazy(() => import('@/features/organization/pages/OrganizationCitizensPage').then((m) => ({ default: m.OrganizationCitizensPage })))
const OrganizationCitizenDetailPage = lazy(() => import('@/features/organization/pages/OrganizationCitizenDetailPage').then((m) => ({ default: m.OrganizationCitizenDetailPage })))
const OrganizationAccessRequestsPage = lazy(() => import('@/features/organization/pages/OrganizationAccessRequestsPage').then((m) => ({ default: m.OrganizationAccessRequestsPage })))
const OrganizationMembersPage = lazy(() => import('@/features/organization/pages/OrganizationMembersPage').then((m) => ({ default: m.OrganizationMembersPage })))
const OrganizationRolesPage = lazy(() => import('@/features/organization/pages/OrganizationRolesPage').then((m) => ({ default: m.OrganizationRolesPage })))
const OrganizationAnalyticsPage = lazy(() => import('@/features/organization/pages/OrganizationAnalyticsPage').then((m) => ({ default: m.OrganizationAnalyticsPage })))
const OrganizationAuditLogPage = lazy(() => import('@/features/organization/pages/OrganizationAuditLogPage').then((m) => ({ default: m.OrganizationAuditLogPage })))
const OrganizationProfilePage = lazy(() => import('@/features/organization/pages/OrganizationProfilePage').then((m) => ({ default: m.OrganizationProfilePage })))
const OrganizationSettingsPage = lazy(() => import('@/features/organization/pages/OrganizationSettingsPage').then((m) => ({ default: m.OrganizationSettingsPage })))
const OrganizationTrustCenterPage = lazy(() => import('@/features/organization/pages/OrganizationTrustCenterPage').then((m) => ({ default: m.OrganizationTrustCenterPage })))
const OrganizationPolicyEnginePage = lazy(() => import('@/features/organization/pages/OrganizationPolicyEnginePage').then((m) => ({ default: m.OrganizationPolicyEnginePage })))
const OrganizationConsentReceiptsPage = lazy(() => import('@/features/organization/pages/OrganizationConsentReceiptsPage').then((m) => ({ default: m.OrganizationConsentReceiptsPage })))
const OrganizationIntelligencePage = lazy(() => import('@/features/organization/pages/OrganizationIntelligencePage').then((m) => ({ default: m.OrganizationIntelligencePage })))
const OrganizationSecurityEventsPage = lazy(() => import('@/features/organization/pages/OrganizationSecurityEventsPage').then((m) => ({ default: m.OrganizationSecurityEventsPage })))
const OrganizationZkpStudioPage = lazy(() => import('@/features/organization/pages/OrganizationZkpStudioPage').then((m) => ({ default: m.OrganizationZkpStudioPage })))
const OrganizationDeveloperPortalPage = lazy(() => import('@/features/organization/pages/OrganizationDeveloperPortalPage').then((m) => ({ default: m.OrganizationDeveloperPortalPage })))
const OrganizationCompliancePage = lazy(() => import('@/features/organization/pages/OrganizationCompliancePage').then((m) => ({ default: m.OrganizationCompliancePage })))

// Government Pages
const GovernmentLoginPage = lazy(() => import('@/features/government/pages/GovernmentLoginPage').then((m) => ({ default: m.GovernmentLoginPage })))
const GovernmentDashboardPage = lazy(() => import('@/features/government/pages/GovernmentDashboardPage').then((m) => ({ default: m.GovernmentDashboardPage })))
const GovernmentServicesPage = lazy(() => import('@/features/government/pages/GovernmentServicesPage').then((m) => ({ default: m.GovernmentServicesPage })))
const GovernmentApplicationsPage = lazy(() => import('@/features/government/pages/GovernmentApplicationsPage').then((m) => ({ default: m.GovernmentApplicationsPage })))
const GovernmentApplicationDetailPage = lazy(() => import('@/features/government/pages/GovernmentApplicationDetailPage').then((m) => ({ default: m.GovernmentApplicationDetailPage })))
const GovernmentVerificationPage = lazy(() => import('@/features/government/pages/GovernmentVerificationPage').then((m) => ({ default: m.GovernmentVerificationPage })))
const GovernmentCitizensPage = lazy(() => import('@/features/government/pages/GovernmentCitizensPage').then((m) => ({ default: m.GovernmentCitizensPage })))
const GovernmentReportsPage = lazy(() => import('@/features/government/pages/GovernmentReportsPage').then((m) => ({ default: m.GovernmentReportsPage })))
const GovernmentAuditLogPage = lazy(() => import('@/features/government/pages/GovernmentAuditLogPage').then((m) => ({ default: m.GovernmentAuditLogPage })))
const GovernmentSettingsPage = lazy(() => import('@/features/government/pages/GovernmentSettingsPage').then((m) => ({ default: m.GovernmentSettingsPage })))

// Super Admin Pages
const AdminLoginPage = lazy(() => import('@/features/admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminOrganizationsPage = lazy(() => import('@/features/admin/pages/AdminOrganizationsPage').then((m) => ({ default: m.AdminOrganizationsPage })))
const AdminGovernmentPage = lazy(() => import('@/features/admin/pages/AdminGovernmentPage').then((m) => ({ default: m.AdminGovernmentPage })))
const AdminServicesPage = lazy(() => import('@/features/admin/pages/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })))
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminAuditPage = lazy(() => import('@/features/admin/pages/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })))
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))

// System Pages
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })))

import { ROUTES } from '@/constants/routes'

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: withSuspense(LandingPage),
  },

  // ==================== CITIZEN AUTH ====================
  {
    path: ROUTES.AUTH.LOGIN,
    element: (
      <GuestGuard>
        {withSuspense(LoginPage)}
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: (
      <GuestGuard>
        {withSuspense(RegisterPage)}
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.AUTH.VERIFY_OTP,
    element: (
      <GuestGuard>
        {withSuspense(VerifyOtpPage)}
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: (
      <GuestGuard>
        {withSuspense(ForgotPasswordPage)}
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
        path: 'benefits',
        element: <BenefitsEligibilityPage />,
      },
      {
        path: 'data',
        element: <DataDashboardPage />,
      },
      {
        path: 'journey',
        element: <CivicJourneyPage />,
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
    element: withSuspense(OrganizationLoginPage),
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
      // Advanced Modules
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
      {
        path: 'zkp',
        element: <OrganizationZkpStudioPage />,
      },
      {
        path: 'developers',
        element: <OrganizationDeveloperPortalPage />,
      },
      {
        path: 'compliance',
        element: <OrganizationCompliancePage />,
      },
    ],
  },

  // ==================== GOVERNMENT WORKSPACE ====================
  {
    path: ROUTES.GOVERNMENT.LOGIN,
    element: withSuspense(GovernmentLoginPage),
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
    element: withSuspense(AdminLoginPage),
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
    element: withSuspense(UnauthorizedPage),
  },
  {
    path: ROUTES.SYSTEM.NOT_FOUND,
    element: withSuspense(NotFoundPage),
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
])
