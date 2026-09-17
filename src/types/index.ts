export type SupportedLanguage = 'en' | 'te' | 'ta' | 'kn' | 'ml'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  nationalId: string
  verificationLevel: 'Level 1 - Registered' | 'Level 2 - Identity Confirmed' | 'Level 3 - Biometric Sovereign'
  state: string
  city: string
  pincode: string
  memberSince: string
  securityScore: number
}

export interface LinkedService {
  id: string
  name: string
  department: string
  identifierMasked: string
  status: 'active' | 'syncing' | 'action_required'
  lastSync: string
}

export interface VerificationRecord {
  id: string
  verifier: string
  department: string
  timestamp: string
  purpose: string
  status: 'authorized' | 'flagged'
}

export interface CitizenIdentity {
  id: string
  fullName: string
  dateOfBirth: string
  gender: 'Male' | 'Female' | 'Other'
  nationalId: string
  maskedNationalId: string
  qrCodeData: string
  digitalSignature: string
  issueDate: string
  expiryDate: string
  status: 'verified' | 'pending' | 'suspended'
  address: string
  bloodGroup: string
  photoUrl: string
  linkedServices: LinkedService[]
  verificationHistory: VerificationRecord[]
}

export type DocumentCategory = 'all' | 'identity' | 'property' | 'revenue' | 'legal' | 'education' | 'health'

export interface CivicDocument {
  id: string
  title: string
  category: Exclude<DocumentCategory, 'all'>
  documentNumber: string
  issueDate: string
  expiryDate?: string
  issuer: string
  fileSize: string
  fileType: 'PDF' | 'IMAGE' | 'XML'
  verificationStatus: 'verified' | 'pending' | 'expiring_soon' | 'action_required'
  isFavorite: boolean
  tags: string[]
  owner?: 'self' | 'family_member'
  ownerId?: string
  ownerName?: string
  sharedWith?: string[]
  originalFileName?: string
  extractedMetadata?: Record<string, string>
}

// ==========================================
// Digital Credential & Verifiable Proof Types
// ==========================================

export type CredentialType =
  | 'NATIONAL_ID'
  | 'DRIVING_LICENSE'
  | 'DEGREE_CERTIFICATE'
  | 'PROPERTY_TITLE'
  | 'HEALTH_RECORD'
  | 'TAX_CLEARANCE'
  | 'CUSTOM'

export interface CivicCredential {
  id: string
  title: string
  type: CredentialType
  issuer: string
  issuerDepartment: string
  credentialNumber: string
  issuedDate: string
  expiryDate?: string
  status: 'active' | 'expiring_soon' | 'expired' | 'revoked'
  verificationMethod: 'cryptographic_zkp' | 'qr_signed' | 'government_registry'
  proofHash: string
  schemaVersion: string
  attributes: Record<string, string | number | boolean>
  lastVerifiedAt?: string
  lastUsedAt?: string
  lastSharedWith?: string
  isVerified: boolean
}

// ==========================================
// Family & Delegated Authority Types
// ==========================================

export type DelegatedPermission =
  | 'VIEW_PROFILE'
  | 'VIEW_DOCUMENTS'
  | 'MANAGE_APPLICATIONS'
  | 'SUBMIT_SERVICE'
  | 'VIEW_NOTIFICATIONS'
  | 'SHARE_AUTHORIZED_PROOF'

export interface FamilyMember {
  id: string
  fullName: string
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Dependent' | 'Other'
  dateOfBirth: string
  isMinor: boolean
  nationalIdMasked?: string
  avatar?: string
  gender: 'Male' | 'Female' | 'Other'
  isGuardianManaged: boolean
  delegationStatus: 'active' | 'pending_consent' | 'revoked' | 'not_delegated'
  delegatedPermissions: DelegatedPermission[]
  delegatedUntil?: string
  documentsCount: number
  activeApplicationsCount: number
  addedAt: string
}

// ==========================================
// Citizen Action Center Types
// ==========================================

export type ActionCategory =
  | 'consent_approval'
  | 'missing_document'
  | 'application_query'
  | 'expiring_credential'
  | 'family_task'
  | 'security_alert'
  | 'payment_due'
  | 'identity_renewal'

export interface CitizenActionItem {
  id: string
  category: ActionCategory
  title: string
  description: string
  urgency: 'critical' | 'high' | 'medium' | 'low'
  dueDate?: string
  sourceEntity: string
  actionLabel: string
  targetRoute: string
  metadata?: Record<string, string | number | boolean>
  isCompleted?: boolean
  createdAt: string
}

// ==========================================
// Device & Session Security Types
// ==========================================

export interface TrustedDevice {
  id: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  ipAddress: string
  location: string
  lastActive: string
  isCurrentDevice: boolean
  addedAt: string
}

export interface UserSession {
  id: string
  device: string
  ipAddress: string
  location: string
  loginTime: string
  lastActivityTime: string
  isCurrentSession: boolean
  status: 'active' | 'revoked'
}

export interface ConsentReceipt {
  id: string
  requestId: string
  organizationId: string
  organizationName: string
  grantedFields: ConsentField[]
  grantedDocuments: string[]
  purpose: string
  grantedAt: string
  expiresAt: string
  signatureHash: string
  revokedAt?: string
}

export interface ConsentDiff {
  previousFields: ConsentField[]
  newFields: ConsentField[]
  addedFields: ConsentField[]
  removedFields: ConsentField[]
}

export type ServiceCategory = 
  | 'all'
  | 'identity_civil'
  | 'transport_driving'
  | 'welfare_schemes'
  | 'land_property'
  | 'taxes_finance'
  | 'utilities_municipal'
  | 'education_skills'
  | 'identity'
  | 'tax'
  | 'transport'
  | 'health'
  | 'welfare'
  | 'housing'
  | 'legal'
  | 'business'
  | 'other'

export interface CivicService {
  id: string
  title: string
  slug: string
  department: string
  category: Exclude<ServiceCategory, 'all'>
  description: string
  processingTime: string
  processingTimeDays?: number
  governmentFee: number
  fees?: number
  eligibility: string[]
  requiredDocuments: string[]
  popular: boolean
  recommended: boolean
  providerType?: 'government' | 'organization'
  providerName?: string
  providerId?: string
  isPublished?: boolean
  verificationBadge?: string
  dataFieldsRequired?: string[]
  ministry?: string
  jurisdictionLevel?: 'Central' | 'State' | 'Municipal'
  stateOrUt?: string
  serviceCode?: string
  statutoryAct?: string
  portalUrl?: string
  departmentId?: string
  departmentCode?: string
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'action_required'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'in-progress'

export interface ApplicationTimelineStep {
  title: string
  description: string
  timestamp?: string
  status: 'completed' | 'current' | 'upcoming' | 'rejected' | 'action_required'
}

export interface CivicApplication {
  id: string
  applicationNumber: string
  serviceId: string
  serviceName: string
  serviceTitle?: string
  applicantName?: string
  department: string
  departmentId?: string
  departmentCode?: string
  submittedAt: string
  updatedAt: string
  estimatedCompletion?: string
  status: ApplicationStatus
  currentStep: number
  totalSteps: number
  timeline: ApplicationTimelineStep[]
  applicantNotes?: string
  actionRequiredMessage?: string
  attachedDocuments: { name: string; size: string; status: 'verified' | 'uploaded' }[]
}

export type NotificationCategory = 'application' | 'security' | 'document' | 'payment' | 'civic'

export interface CivicNotification {
  id: string
  title: string
  message: string
  category: NotificationCategory
  priority: 'high' | 'medium' | 'low'
  isRead: boolean
  createdAt: string
  actionUrl?: string
  actionLabel?: string
}

export interface CivicPayment {
  id: string
  receiptNumber: string
  title: string
  department: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue'
  paymentMethod?: string
}

export interface AssistantAction {
  label: string
  action: string
  targetUrl?: string
}

export interface AssistantMessage {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestedActions?: AssistantAction[]
  language: SupportedLanguage
}

export interface UserSettings {
  account: {
    twoFactorEnabled: boolean
    loginNotifications: boolean
    biometricUnlock: boolean
  }
  privacy: {
    dataSharingAuthorized: boolean
    auditLogsVisible: boolean
    publicDirectorySearch: boolean
  }
  notifications: {
    emailAlerts: boolean
    smsAlerts: boolean
    pushAlerts: boolean
    civicNews: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    highContrast: boolean
    reducedMotion: boolean
    fontSize: 'normal' | 'large'
  }
  language: SupportedLanguage
}

// ==========================================
// Multi-Workspace Ecosystem Types
// ==========================================

export type WorkspaceType = 'citizen' | 'organization' | 'government' | 'admin'

// Organization Roles & Granular Permissions
export type OrganizationRole =
  | 'OWNER'
  | 'ADMIN'
  | 'SERVICE_MANAGER'
  | 'VERIFICATION_OFFICER'
  | 'APPLICATION_OFFICER'
  | 'SUPPORT'
  | 'ANALYST'
  | 'READ_ONLY'

export type OrganizationPermission =
  | 'SERVICES_VIEW'
  | 'SERVICES_CREATE'
  | 'SERVICES_EDIT'
  | 'SERVICES_PUBLISH'
  | 'APPLICATIONS_VIEW'
  | 'APPLICATIONS_PROCESS'
  | 'CITIZEN_VIEW_AUTHORIZED'
  | 'CITIZEN_ACCESS_REQUEST'
  | 'DOCUMENT_VIEW_AUTHORIZED'
  | 'MEMBERS_VIEW'
  | 'MEMBERS_MANAGE'
  | 'ANALYTICS_VIEW'
  | 'AUDIT_LOG_VIEW'

// Government Roles & Permissions
export type GovernmentRole =
  | 'SECRETARY'
  | 'COMMISSIONER'
  | 'VERIFICATION_OFFICER'
  | 'CASE_WORKER'
  | 'INSPECTOR'
  | 'AUDITOR'
  | 'SYSTEM_ADMIN'

export type GovernmentPermission =
  | 'GOV_SERVICES_MANAGE'
  | 'GOV_APPLICATIONS_REVIEW'
  | 'GOV_VERIFY_IDENTITY'
  | 'GOV_ISSUE_CERTIFICATE'
  | 'GOV_REPORTS_VIEW'
  | 'GOV_AUDIT_VIEW'

// Privacy & Consent Field Whitelist
export type ConsentField =
  | 'fullName'
  | 'dateOfBirth'
  | 'gender'
  | 'phone'
  | 'email'
  | 'address'
  | 'nationalId'
  | 'panNumber'
  | 'income'
  | 'educationStatus'
  | 'drivingLicense'

export type ConsentStatus =
  | 'pending'
  | 'approved'
  | 'partially_approved'
  | 'denied'
  | 'expired'
  | 'revoked'

export interface ConsentRequest {
  id: string
  organizationId: string
  organizationName: string
  organizationLogo?: string
  serviceId?: string
  serviceName?: string
  purpose: string
  requestedFields: ConsentField[]
  approvedFields: ConsentField[]
  requestedDocuments: string[]
  approvedDocuments: string[]
  durationDays: number
  status: ConsentStatus
  requestedAt: string
  respondedAt?: string
  expiresAt?: string
  citizenId: string
  citizenName: string
}

export interface AccessGrant {
  id: string
  organizationId: string
  organizationName: string
  organizationLogo?: string
  serviceName?: string
  citizenId: string
  citizenName: string
  purpose: string
  authorizedFields: ConsentField[]
  authorizedDocuments: string[]
  grantedAt: string
  expiresAt: string
  status: 'active' | 'expiring_soon' | 'expired' | 'revoked'
}

export interface AccessHistoryItem {
  id: string
  actor: string
  actorRole: string
  organizationName: string
  action:
    | 'requested_access'
    | 'approved_access'
    | 'viewed_authorized_data'
    | 'requested_additional_data'
    | 'denied_access'
    | 'revoked_access'
  resource: string
  timestamp: string
  details: string
}

export interface AuditEvent {
  id: string
  workspace: WorkspaceType
  actor: string
  actorId: string
  role: string
  action: string
  resource: string
  timestamp: string
  ipAddress: string
  status: 'success' | 'warning' | 'denied'
  metadata?: Record<string, string>
}

// Organization Model
export interface Organization {
  id: string
  name: string
  legalName: string
  registrationNumber: string
  category: 'Healthcare' | 'Financial Services' | 'Education' | 'Transportation' | 'Social Services'
  verificationStatus: 'verified' | 'pending' | 'suspended'
  logo?: string
  website: string
  contactEmail: string
  contactPhone: string
  address: string
  joinedAt: string
  cin?: string
  type?: string
  servicesCount?: number
}

export interface OrganizationMember {
  id: string
  organizationId: string
  name: string
  email: string
  role: OrganizationRole
  avatar: string
  status: 'active' | 'inactive'
  lastActive: string
}

// Government Model
export interface GovernmentDepartment {
  id: string
  name: string
  code: string
  ministry: string
  jurisdiction: 'Central' | 'State' | 'Municipal'
  contactOfficer: string
  officerDesignation: string
  activeServicesCount: number
  pendingApplicationsCount: number
  nodalOfficer?: string
  jurisdictionScope?: string
  statutoryAct?: string
  avgSlaDays?: number
  complianceRate?: number
  description?: string
}

export interface GovernmentOfficial {
  id: string
  name: string
  badgeId: string
  departmentId: string
  departmentName: string
  designation: string
  role: GovernmentRole
  avatar: string
  email: string
}

// Super Admin
export interface SuperAdminUser {
  id: string
  name: string
  email: string
  avatar: string
  role: 'SUPER_ADMIN'
}

// Session Types
export interface OrgSessionData {
  member: OrganizationMember
  organization: Organization
}

export interface GovSessionData {
  official: GovernmentOfficial
  department: GovernmentDepartment
}

export interface AdminSessionData {
  user: SuperAdminUser
}

// ==========================================
// Organization Policy Engine Types
// ==========================================

export type PolicyPurposeCategory =
  | 'identity_verification'
  | 'credit_assessment'
  | 'insurance_underwriting'
  | 'employment_background'
  | 'healthcare_eligibility'
  | 'government_benefit'
  | 'custom'

export type PolicyStatus = 'draft' | 'active' | 'deprecated'

export interface PolicyAttributeConfig {
  field: ConsentField
  required: boolean
  purpose: string
  retentionDays: number
}

export interface PolicyTemplate {
  id: string
  name: string
  version: string
  status: PolicyStatus
  purposeCategory: PolicyPurposeCategory
  description: string
  attributes: PolicyAttributeConfig[]
  requiredDocuments: string[]
  defaultDurationDays: number
  createdAt: string
  updatedAt: string
  createdBy: string
  usageCount: number
}

// ==========================================
// Operational Intelligence Types
// ==========================================

export type AnomalySeverity = 'critical' | 'warning' | 'info'

export interface AnomalySignal {
  id: string
  title: string
  description: string
  severity: AnomalySeverity
  detectedAt: string
  affectedCitizenCount: number
  category: 'access_pattern' | 'consent_deviation' | 'sla_breach' | 'staff_activity'
  isResolved: boolean
  resolvedAt?: string
}

export interface SLAForecast {
  serviceId: string
  serviceName: string
  currentAvgDays: number
  targetDays: number
  forecastDays: number
  trend: 'improving' | 'stable' | 'degrading'
  confidence: number
}

export interface AccessFrequencyPoint {
  hour: number
  dayLabel: string
  count: number
  normalizedLevel: number // 0–4 for heatmap intensity
}

// ==========================================
// Security Events & Staff Offboarding Types
// ==========================================

export type SecurityEventSeverity = 'critical' | 'high' | 'medium' | 'low'
export type SecurityEventCategory =
  | 'unauthorized_access'
  | 'staff_offboarding'
  | 'policy_violation'
  | 'anomalous_query'
  | 'session_hijack_attempt'
  | 'privilege_escalation'

export interface OrgSecurityEvent {
  id: string
  category: SecurityEventCategory
  title: string
  description: string
  severity: SecurityEventSeverity
  actor: string
  actorRole: string
  timestamp: string
  ipAddress: string
  outcome: 'blocked' | 'allowed' | 'flagged' | 'resolved'
  metadata?: Record<string, string>
}

export interface OffboardingTask {
  id: string
  memberId: string
  memberName: string
  memberRole: string
  task: string
  status: 'pending' | 'completed' | 'overdue'
  dueDate: string
  completedAt?: string
}

// ==========================================
// Trust Center Types
// ==========================================

export interface TrustCertification {
  id: string
  name: string
  issuingBody: string
  validUntil: string
  status: 'active' | 'expiring' | 'expired'
  badgeColor: string
}

export interface DataPracticeDeclaration {
  category: string
  description: string
  isCompliant: boolean
  lastAuditDate: string
}

export interface OrgTrustProfile {
  overallScore: number // 0–100
  verificationStatus: 'verified' | 'pending' | 'suspended'
  registrationNumber: string
  regulatoryBody: string
  certifications: TrustCertification[]
  dataPractices: DataPracticeDeclaration[]
  partnerSince: string
  totalServicesDeployed: number
  totalCitizenInteractions: number
  consentHonorRate: number
}

// ── Citizen Intelligence & Journey Types ─────────────────────────────────────

export interface PrivacyHealthScore {
  overallPct: number        // 0–100
  activeGrants: number
  totalFields: number
  exposedFields: number
  expiringIn7Days: number
  lastRevocationAt: string | null
  breakdown: { label: string; count: number; color: string }[]
}

export interface ActivityFeedEvent {
  id: string
  type: 'consent_granted' | 'consent_revoked' | 'doc_verified' | 'app_updated' | 'login' | 'payment'
  title: string
  description: string
  timestamp: string
  relatedId?: string
  relatedRoute?: string
}

export interface BehavioralAnomaly {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  detectedAt: string
  isDismissed: boolean
  category: 'unusual_login' | 'rapid_consent' | 'device_change' | 'offhours_access'
}

export interface BenefitScheme {
  id: string
  name: string
  department: string
  category: 'health' | 'education' | 'housing' | 'agriculture' | 'pension' | 'finance'
  description: string
  eligibilityReason: string
  applicationDeadline: string | null
  benefitValue: string
  applyUrl: string
  isApplied: boolean
}

export interface DataFootprintField {
  field: ConsentField
  label: string
  sharedWithOrgs: number
  activeGrants: number
  lastSharedAt: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface CivicMilestone {
  id: string
  date: string
  title: string
  description: string
  type: 'identity' | 'document' | 'service' | 'consent' | 'security' | 'payment' | 'family'
  icon: string
  isHighlight: boolean
}

export interface SLACountdown {
  applicationId: string
  targetDate: string
  daysRemaining: number
  isBreached: boolean
  label: string
}

// ── Organization Advanced Modules Types ──────────────────────────────────────

export interface DiscrepancyItem {
  id?: string
  field: string
  formValue: string
  extractedValue: string
  extractedOcrValue?: string
  confidence?: number
  severity: 'high' | 'medium' | 'low'
  message: string
}

export interface AiScrutinyResult {
  confidenceScore: number // 0-100
  status: 'passed' | 'review_recommended' | 'discrepancy_detected'
  discrepancies: DiscrepancyItem[]
  suggestedAction: 'approve' | 'request_clarification' | 'reject'
  summary: string
}

// Phase 2: Zero-Knowledge Proof (ZKP)
export interface ZkpQueryTemplate {
  id: string
  name: string
  description: string
  predicate: string // e.g. "age >= 18"
  category: 'identity' | 'financial' | 'residency' | 'statutory'
  targetField: string
  zeroPiiDescription: string
}

export interface ZkpProofReceipt {
  id: string
  queryId: string
  queryName: string
  citizenId: string
  result: boolean
  proofHash: string
  verifyingKey: string
  timestamp: string
  curve: string
  publicInputs: Record<string, string | number | boolean>
}

// Phase 3: Developer Platform & Webhooks
export interface ApiKeyItem {
  id: string
  name: string
  keyPrefix: string // civ_live_...
  createdAt: string
  lastUsedAt: string | null
  status: 'active' | 'revoked'
  scopes: string[]
  environment: 'production' | 'sandbox'
}

export interface WebhookEndpoint {
  id: string
  url: string
  description: string
  events: string[]
  status: 'active' | 'failing' | 'disabled'
  secretPrefix: string
  createdAt: string
  lastDeliveryAt: string | null
}

export interface WebhookDeliveryLog {
  id: string
  endpointId: string
  endpointUrl: string
  event: string
  status: 'success' | 'failure'
  statusCode: number
  latencyMs: number
  timestamp: string
  payloadSnippet: string
  responseSnippet: string
  signatureHeader: string
}

// Phase 4: DPDP Compliance & Purge
export interface ComplianceCheckItem {
  id: string
  framework: 'DPDP_2023' | 'ISO_27701' | 'CERT_IN'
  clause: string
  title: string
  status: 'compliant' | 'warning' | 'audit_required'
  evidence: string
  lastAuditDate: string
}

export interface DataPurgePolicy {
  id: string
  name: string
  dataType: string
  retentionDays: number
  autoPurgeEnabled: boolean
  lastRunAt: string | null
  nextScheduledAt: string
  recordsPurgedTotal: number
}

export interface DestructionCertificate {
  id: string
  certificateNumber: string
  purgePolicyName: string
  recordsCount: number
  timestamp: string
  shredMethod: string // e.g., "NIST SP 800-88 Cryptographic Wipe"
  merkleRootHash: string
  officerSignature: string
}

