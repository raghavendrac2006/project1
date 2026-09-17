import { realtimeBus } from './eventBus'
import {
  INITIAL_USER,
  INITIAL_IDENTITY,
  INITIAL_DOCUMENTS,
  INITIAL_SERVICES,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_SETTINGS,
  INITIAL_ORGANIZATIONS,
  INITIAL_ORG_MEMBERS,
  INITIAL_ORG_SERVICES,
  INITIAL_CONSENT_REQUESTS,
  INITIAL_ACCESS_GRANTS,
  INITIAL_ACCESS_HISTORY,
  INITIAL_AUDIT_EVENTS,
  INITIAL_GOV_DEPARTMENTS,
  INITIAL_GOV_OFFICIALS,
  INITIAL_ADMIN_USER,
  INITIAL_CREDENTIALS,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_CITIZEN_ACTIONS,
  INITIAL_TRUSTED_DEVICES,
  INITIAL_USER_SESSIONS,
  INITIAL_CONSENT_RECEIPTS,
} from '@/mocks/civicData'
import type {
  User,
  CitizenIdentity,
  CivicDocument,
  CivicService,
  CivicApplication,
  CivicNotification,
  CivicPayment,
  UserSettings,
  AssistantMessage,
  Organization,
  OrganizationMember,
  GovernmentDepartment,
  GovernmentOfficial,
  SuperAdminUser,
  ConsentRequest,
  AccessGrant,
  AccessHistoryItem,
  AuditEvent,
  ConsentField,
  CivicCredential,
  FamilyMember,
  DelegatedPermission,
  CitizenActionItem,
  TrustedDevice,
  UserSession,
  ConsentReceipt,
} from '@/types'

const STORAGE_KEYS = {
  USER: 'civiqone_user_v1',
  IDENTITY: 'civiqone_identity_v1',
  DOCUMENTS: 'civiqone_documents_v1',
  SERVICES: 'civiqone_services_v2',
  APPLICATIONS: 'civiqone_applications_v1',
  NOTIFICATIONS: 'civiqone_notifications_v1',
  PAYMENTS: 'civiqone_payments_v1',
  SETTINGS: 'civiqone_settings_v1',
  ASSISTANT: 'civiqone_assistant_v1',
  AUTH_TOKEN: 'civiqone_auth_token_v1',
  ORGANIZATIONS: 'civiqone_organizations_v1',
  ORG_MEMBERS: 'civiqone_org_members_v1',
  ORG_SERVICES: 'civiqone_org_services_v1',
  CONSENT_REQUESTS: 'civiqone_consent_requests_v1',
  ACCESS_GRANTS: 'civiqone_access_grants_v1',
  ACCESS_HISTORY: 'civiqone_access_history_v1',
  AUDIT_EVENTS: 'civiqone_audit_events_v1',
  GOV_DEPARTMENTS: 'civiqone_gov_departments_v2',
  GOV_OFFICIALS: 'civiqone_gov_officials_v2',
  ORG_SESSION: 'civiqone_org_session_v1',
  GOV_SESSION: 'civiqone_gov_session_v1',
  ADMIN_SESSION: 'civiqone_admin_session_v1',
  CREDENTIALS: 'civiqone_credentials_v1',
  FAMILY_MEMBERS: 'civiqone_family_members_v1',
  ACTIONS: 'civiqone_actions_v1',
  TRUSTED_DEVICES: 'civiqone_trusted_devices_v1',
  USER_SESSIONS: 'civiqone_user_sessions_v1',
  CONSENT_RECEIPTS: 'civiqone_consent_receipts_v1',
} as const

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? (JSON.parse(data) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err)
  }
}

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

export const civicStorage = {
  // Citizen core
  getUser: (): User => getFromStorage(STORAGE_KEYS.USER, INITIAL_USER),
  saveUser: (user: User): void => saveToStorage(STORAGE_KEYS.USER, user),

  getIdentity: (): CitizenIdentity => getFromStorage(STORAGE_KEYS.IDENTITY, INITIAL_IDENTITY),
  saveIdentity: (identity: CitizenIdentity): void => saveToStorage(STORAGE_KEYS.IDENTITY, identity),

  getDocuments: (): CivicDocument[] => getFromStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  saveDocuments: (docs: CivicDocument[]): void => saveToStorage(STORAGE_KEYS.DOCUMENTS, docs),

  getServices: (): CivicService[] => getFromStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
  saveServices: (services: CivicService[]): void => saveToStorage(STORAGE_KEYS.SERVICES, services),

  getApplications: (): CivicApplication[] => getFromStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS),
  saveApplications: (apps: CivicApplication[]): void => {
    saveToStorage(STORAGE_KEYS.APPLICATIONS, apps)
    realtimeBus.emit('APPLICATION_STATUS_UPDATED', apps)
  },

  getNotifications: (): CivicNotification[] => getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  saveNotifications: (notifs: CivicNotification[]): void => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs),

  getPayments: (): CivicPayment[] => getFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (payments: CivicPayment[]): void => saveToStorage(STORAGE_KEYS.PAYMENTS, payments),

  getSettings: (): UserSettings => getFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings: UserSettings): void => saveToStorage(STORAGE_KEYS.SETTINGS, settings),

  getAssistantMessages: (): AssistantMessage[] => getFromStorage(STORAGE_KEYS.ASSISTANT, []),
  saveAssistantMessages: (msgs: AssistantMessage[]): void => saveToStorage(STORAGE_KEYS.ASSISTANT, msgs),

  getAuthToken: (): string | null => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  setAuthToken: (token: string): void => localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
  clearAuthToken: (): void => localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),

  // Organizations
  getOrganizations: (): Organization[] => getFromStorage(STORAGE_KEYS.ORGANIZATIONS, INITIAL_ORGANIZATIONS),
  saveOrganizations: (orgs: Organization[]): void => saveToStorage(STORAGE_KEYS.ORGANIZATIONS, orgs),
  getOrganizationById: (id: string): Organization | undefined => {
    return civicStorage.getOrganizations().find((o) => o.id === id)
  },

  // Organization Members
  getOrgMembers: (): OrganizationMember[] => getFromStorage(STORAGE_KEYS.ORG_MEMBERS, INITIAL_ORG_MEMBERS),
  saveOrgMembers: (members: OrganizationMember[]): void => saveToStorage(STORAGE_KEYS.ORG_MEMBERS, members),

  // Organization Services
  getOrgServices: (): CivicService[] => getFromStorage(STORAGE_KEYS.ORG_SERVICES, INITIAL_ORG_SERVICES),
  saveOrgServices: (services: CivicService[]): void => {
    saveToStorage(STORAGE_KEYS.ORG_SERVICES, services)
    realtimeBus.emit('SERVICE_PUBLISHED_CHANGED', services)
  },
  togglePublishOrgService: (serviceId: string): CivicService | undefined => {
    const services = civicStorage.getOrgServices()
    const target = services.find((s) => s.id === serviceId)
    if (target) {
      target.isPublished = !target.isPublished
      civicStorage.saveOrgServices(services)
    }
    return target
  },

  // Combined Marketplace (Government + Published Organization Services)
  getAllMarketplaceServices: (): CivicService[] => {
    const govServices = civicStorage.getServices().map((s) => ({
      ...s,
      providerType: (s.providerType || 'government') as 'government' | 'organization',
      providerName: s.providerName || s.department,
      isPublished: true,
      verificationBadge: 'Verified Government Provider',
    }))
    const orgServices = civicStorage.getOrgServices().filter((s) => s.isPublished)
    return [...govServices, ...orgServices]
  },

  // Privacy & Consent Requests
  getConsentRequests: (): ConsentRequest[] => getFromStorage(STORAGE_KEYS.CONSENT_REQUESTS, INITIAL_CONSENT_REQUESTS),
  saveConsentRequests: (reqs: ConsentRequest[]): void => saveToStorage(STORAGE_KEYS.CONSENT_REQUESTS, reqs),

  createConsentRequest: (data: Omit<ConsentRequest, 'id' | 'requestedAt' | 'status' | 'approvedFields' | 'approvedDocuments'>): ConsentRequest => {
    const reqs = civicStorage.getConsentRequests()
    const newReq: ConsentRequest = {
      ...data,
      id: `req_${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      approvedFields: [],
      approvedDocuments: [],
    }
    reqs.unshift(newReq)
    civicStorage.saveConsentRequests(reqs)

    // Log audit event
    civicStorage.addAuditEvent({
      workspace: 'organization',
      actor: 'Organization Staff',
      actorId: data.organizationId,
      role: 'VERIFICATION_OFFICER',
      action: 'CITIZEN_ACCESS_REQUEST',
      resource: `ConsentRequest #${newReq.id} for ${data.citizenName}`,
      ipAddress: '192.168.1.100',
      status: 'success',
      metadata: { purpose: data.purpose },
    })

    return newReq
  },

  approveConsentRequest: (requestId: string, approvedFields: ConsentField[], approvedDocuments: string[]): ConsentRequest | undefined => {
    const reqs = civicStorage.getConsentRequests()
    const target = reqs.find((r) => r.id === requestId)
    if (!target) return undefined

    const isPartial = approvedFields.length < target.requestedFields.length
    target.status = isPartial ? 'partially_approved' : 'approved'
    target.approvedFields = approvedFields
    target.approvedDocuments = approvedDocuments
    target.respondedAt = new Date().toISOString()
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + (target.durationDays || 30))
    target.expiresAt = expiry.toISOString()

    civicStorage.saveConsentRequests(reqs)

    // Create or update active grant
    const grants = civicStorage.getAccessGrants()
    const newGrant: AccessGrant = {
      id: `grant_${Date.now()}`,
      organizationId: target.organizationId,
      organizationName: target.organizationName,
      serviceName: target.serviceName,
      citizenId: target.citizenId,
      citizenName: target.citizenName,
      purpose: target.purpose,
      authorizedFields: approvedFields,
      authorizedDocuments: approvedDocuments,
      grantedAt: target.respondedAt,
      expiresAt: target.expiresAt,
      status: 'active',
    }
    grants.unshift(newGrant)
    civicStorage.saveAccessGrants(grants)

    // Add access history item
    civicStorage.addAccessHistoryItem({
      actor: target.citizenName,
      actorRole: 'Citizen (Self)',
      organizationName: target.organizationName,
      action: 'approved_access',
      resource: `Granted fields: ${approvedFields.join(', ')}`,
      timestamp: new Date().toISOString(),
      details: `Citizen authorized data access for ${target.durationDays} days.`,
    })

    // Log audit event
    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: target.citizenName,
      actorId: target.citizenId,
      role: 'CITIZEN',
      action: 'CONSENT_GRANTED',
      resource: `AccessGrant #${newGrant.id} (${target.organizationName})`,
      ipAddress: '127.0.0.1',
      status: 'success',
      metadata: { authorizedFields: approvedFields.join(',') },
    })

    realtimeBus.emit('CONSENT_GRANTED', { grant: newGrant, request: target })
    return target
  },

  denyConsentRequest: (requestId: string): ConsentRequest | undefined => {
    const reqs = civicStorage.getConsentRequests()
    const target = reqs.find((r) => r.id === requestId)
    if (!target) return undefined

    target.status = 'denied'
    target.respondedAt = new Date().toISOString()
    civicStorage.saveConsentRequests(reqs)

    civicStorage.addAccessHistoryItem({
      actor: target.citizenName,
      actorRole: 'Citizen (Self)',
      organizationName: target.organizationName,
      action: 'denied_access',
      resource: `Denied request for ${target.purpose}`,
      timestamp: new Date().toISOString(),
      details: 'Citizen rejected data authorization request.',
    })

    return target
  },

  // Access Grants
  getAccessGrants: (): AccessGrant[] => getFromStorage(STORAGE_KEYS.ACCESS_GRANTS, INITIAL_ACCESS_GRANTS),
  saveAccessGrants: (grants: AccessGrant[]): void => saveToStorage(STORAGE_KEYS.ACCESS_GRANTS, grants),

  revokeAccessGrant: (grantId: string): AccessGrant | undefined => {
    const grants = civicStorage.getAccessGrants()
    const target = grants.find((g) => g.id === grantId)
    if (!target) return undefined

    target.status = 'revoked'
    civicStorage.saveAccessGrants(grants)

    // Also mark consent request as revoked
    const reqs = civicStorage.getConsentRequests()
    const req = reqs.find((r) => r.organizationId === target.organizationId && r.citizenId === target.citizenId)
    if (req) {
      req.status = 'revoked'
      civicStorage.saveConsentRequests(reqs)
    }

    // Add access history item
    civicStorage.addAccessHistoryItem({
      actor: target.citizenName,
      actorRole: 'Citizen (Self)',
      organizationName: target.organizationName,
      action: 'revoked_access',
      resource: `Terminated authorization for ${target.organizationName}`,
      timestamp: new Date().toISOString(),
      details: 'Citizen explicitly revoked access permissions.',
    })

    // Log audit event
    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: target.citizenName,
      actorId: target.citizenId,
      role: 'CITIZEN',
      action: 'CONSENT_REVOKED',
      resource: `AccessGrant #${grantId} revoked`,
      ipAddress: '127.0.0.1',
      status: 'warning',
      metadata: { org: target.organizationName },
    })

    realtimeBus.emit('CONSENT_REVOKED', { grantId, organizationId: target.organizationId })
    return target
  },

  // Emergency 1-Click Privacy Lockdown
  privacyLockdown: (): number => {
    const grants = civicStorage.getAccessGrants()
    let count = 0
    grants.forEach((g) => {
      if (g.status === 'active') {
        g.status = 'revoked'
        count++
      }
    })
    civicStorage.saveAccessGrants(grants)

    const reqs = civicStorage.getConsentRequests()
    reqs.forEach((r) => {
      if (r.status === 'approved' || r.status === 'partially_approved' || r.status === 'pending') {
        r.status = 'revoked'
      }
    })
    civicStorage.saveConsentRequests(reqs)

    civicStorage.addAccessHistoryItem({
      actor: 'Rajesh K. Sharma',
      actorRole: 'Citizen (Self)',
      organizationName: 'ALL_PARTNERS',
      action: 'revoked_access',
      resource: 'EMERGENCY_PRIVACY_LOCKDOWN',
      timestamp: new Date().toISOString(),
      details: 'Citizen activated emergency privacy lockdown. All active access tokens frozen and revoked.',
    })

    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: 'Rajesh K. Sharma',
      actorId: 'usr_civiq_1024',
      role: 'CITIZEN',
      action: 'PRIVACY_LOCKDOWN_ACTIVATED',
      resource: `Revoked all active third-party access (${count} organizations)`,
      ipAddress: '127.0.0.1',
      status: 'warning',
    })

    realtimeBus.emit('PRIVACY_LOCKDOWN', { count })
    realtimeBus.emit('CONSENT_REVOKED', { lockdown: true })
    return count
  },

  // Access History
  getAccessHistory: (): AccessHistoryItem[] => getFromStorage(STORAGE_KEYS.ACCESS_HISTORY, INITIAL_ACCESS_HISTORY),
  addAccessHistoryItem: (item: Omit<AccessHistoryItem, 'id'>): void => {
    const history = civicStorage.getAccessHistory()
    history.unshift({
      ...item,
      id: `hist_${Date.now()}`,
    })
    saveToStorage(STORAGE_KEYS.ACCESS_HISTORY, history)
  },

  // Audit Events
  getAuditEvents: (): AuditEvent[] => getFromStorage(STORAGE_KEYS.AUDIT_EVENTS, INITIAL_AUDIT_EVENTS),
  addAuditEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'> & { timestamp?: string }): void => {
    const events = civicStorage.getAuditEvents()
    events.unshift({
      timestamp: new Date().toISOString(),
      ...event,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    })
    saveToStorage(STORAGE_KEYS.AUDIT_EVENTS, events)
  },

  // Government Departments & Officials
  getGovDepartments: (): GovernmentDepartment[] => getFromStorage(STORAGE_KEYS.GOV_DEPARTMENTS, INITIAL_GOV_DEPARTMENTS),
  saveGovDepartments: (depts: GovernmentDepartment[]): void => saveToStorage(STORAGE_KEYS.GOV_DEPARTMENTS, depts),

  getGovOfficials: (): GovernmentOfficial[] => getFromStorage(STORAGE_KEYS.GOV_OFFICIALS, INITIAL_GOV_OFFICIALS),
  saveGovOfficials: (officials: GovernmentOfficial[]): void => saveToStorage(STORAGE_KEYS.GOV_OFFICIALS, officials),

  // Multi-workspace session management
  getOrgSession: (): OrgSessionData | null => {
    return getFromStorage<OrgSessionData | null>(STORAGE_KEYS.ORG_SESSION, {
      member: INITIAL_ORG_MEMBERS[0],
      organization: INITIAL_ORGANIZATIONS[0],
    })
  },
  setOrgSession: (session: OrgSessionData): void => saveToStorage(STORAGE_KEYS.ORG_SESSION, session),
  clearOrgSession: (): void => localStorage.removeItem(STORAGE_KEYS.ORG_SESSION),

  getGovSession: (): GovSessionData | null => {
    return getFromStorage<GovSessionData | null>(STORAGE_KEYS.GOV_SESSION, {
      official: INITIAL_GOV_OFFICIALS[0],
      department: INITIAL_GOV_DEPARTMENTS[0],
    })
  },
  setGovSession: (session: GovSessionData): void => saveToStorage(STORAGE_KEYS.GOV_SESSION, session),
  clearGovSession: (): void => localStorage.removeItem(STORAGE_KEYS.GOV_SESSION),

  getAdminSession: (): AdminSessionData | null => {
    return getFromStorage<AdminSessionData | null>(STORAGE_KEYS.ADMIN_SESSION, {
      user: INITIAL_ADMIN_USER,
    })
  },
  setAdminSession: (session: AdminSessionData): void => saveToStorage(STORAGE_KEYS.ADMIN_SESSION, session),
  clearAdminSession: (): void => localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION),

  // Digital Credentials
  getCredentials: (): CivicCredential[] => getFromStorage(STORAGE_KEYS.CREDENTIALS, INITIAL_CREDENTIALS),
  saveCredentials: (creds: CivicCredential[]): void => saveToStorage(STORAGE_KEYS.CREDENTIALS, creds),
  addCredential: (cred: CivicCredential): void => {
    const creds = civicStorage.getCredentials()
    creds.unshift(cred)
    civicStorage.saveCredentials(creds)
  },

  // Family Members & Delegated Authority
  getFamilyMembers: (): FamilyMember[] => getFromStorage(STORAGE_KEYS.FAMILY_MEMBERS, INITIAL_FAMILY_MEMBERS),
  saveFamilyMembers: (members: FamilyMember[]): void => saveToStorage(STORAGE_KEYS.FAMILY_MEMBERS, members),
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'addedAt'>): FamilyMember => {
    const members = civicStorage.getFamilyMembers()
    const newMember: FamilyMember = {
      ...member,
      id: `fam_${Date.now()}`,
      addedAt: new Date().toISOString().split('T')[0],
    }
    members.push(newMember)
    civicStorage.saveFamilyMembers(members)
    return newMember
  },
  updateFamilyMemberDelegation: (
    id: string,
    permissions: DelegatedPermission[],
    status: FamilyMember['delegationStatus']
  ): void => {
    const members = civicStorage.getFamilyMembers()
    const updated = members.map((m) =>
      m.id === id ? { ...m, delegatedPermissions: permissions, delegationStatus: status } : m
    )
    civicStorage.saveFamilyMembers(updated)
  },

  // Citizen Actions
  getActions: (): CitizenActionItem[] => getFromStorage(STORAGE_KEYS.ACTIONS, INITIAL_CITIZEN_ACTIONS),
  saveActions: (actions: CitizenActionItem[]): void => saveToStorage(STORAGE_KEYS.ACTIONS, actions),
  completeAction: (id: string): void => {
    const actions = civicStorage.getActions()
    const updated = actions.map((a) => (a.id === id ? { ...a, isCompleted: true } : a))
    civicStorage.saveActions(updated)
  },
  addAction: (action: Omit<CitizenActionItem, 'id' | 'createdAt'>): void => {
    const actions = civicStorage.getActions()
    actions.unshift({
      ...action,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString(),
    })
    civicStorage.saveActions(actions)
  },

  // Trusted Devices & Active Sessions
  getTrustedDevices: (): TrustedDevice[] => getFromStorage(STORAGE_KEYS.TRUSTED_DEVICES, INITIAL_TRUSTED_DEVICES),
  removeTrustedDevice: (id: string): void => {
    const devices = civicStorage.getTrustedDevices().filter((d) => d.id !== id)
    saveToStorage(STORAGE_KEYS.TRUSTED_DEVICES, devices)
  },
  getUserSessions: (): UserSession[] => getFromStorage(STORAGE_KEYS.USER_SESSIONS, INITIAL_USER_SESSIONS),
  revokeUserSession: (id: string): void => {
    const sessions = civicStorage.getUserSessions().map((s) =>
      s.id === id ? { ...s, status: 'revoked' as const } : s
    )
    saveToStorage(STORAGE_KEYS.USER_SESSIONS, sessions)
  },

  // Consent Receipts
  getConsentReceipts: (): ConsentReceipt[] => getFromStorage(STORAGE_KEYS.CONSENT_RECEIPTS, INITIAL_CONSENT_RECEIPTS),
  addConsentReceipt: (receipt: ConsentReceipt): void => {
    const receipts = civicStorage.getConsentReceipts()
    receipts.unshift(receipt)
    saveToStorage(STORAGE_KEYS.CONSENT_RECEIPTS, receipts)
  },

  // Reset helper
  resetAllToDefault: (): void => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  },
}
