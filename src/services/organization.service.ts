import { apiClient } from './apiClient'
import { civicStorage, type OrgSessionData } from './storage'
import type {
  CivicService,
  CivicApplication,
  ConsentRequest,
  OrganizationMember,
  ConsentField,
  OrganizationRole,
} from '@/types'

export interface AuthorizedFieldData {
  field: ConsentField
  label: string
  status: 'authorized' | 'not_authorized' | 'pending' | 'revoked'
  value: string | null
}

export interface CitizenAuthorizedProfile {
  citizenId: string
  fullName: string
  fields: Record<ConsentField, AuthorizedFieldData>
  documents: { name: string; status: 'authorized' | 'not_authorized' }[]
  activeGrantId?: string
  grantExpiry?: string
  grantStatus: 'active' | 'pending' | 'revoked' | 'none'
}

export const organizationService = {
  async getSession(): Promise<OrgSessionData | null> {
    return civicStorage.getOrgSession()
  },

  async login(email: string): Promise<OrgSessionData> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const members = civicStorage.getOrgMembers()
    const member = members.find((m) => m.email.toLowerCase() === email.toLowerCase()) || members[0]
    const org = civicStorage.getOrganizationById(member.organizationId) || civicStorage.getOrganizations()[0]

    const session: OrgSessionData = { member, organization: org }
    civicStorage.setOrgSession(session)

    civicStorage.addAuditEvent({
      workspace: 'organization',
      actor: member.name,
      actorId: member.id,
      role: member.role,
      action: 'ORGANIZATION_STAFF_LOGIN',
      resource: `Workspace Session (${org.name})`,
      ipAddress: '192.168.1.45',
      status: 'success',
    })

    return session
  },

  async logout(): Promise<void> {
    const session = civicStorage.getOrgSession()
    if (session) {
      civicStorage.addAuditEvent({
        workspace: 'organization',
        actor: session.member.name,
        actorId: session.member.id,
        role: session.member.role,
        action: 'ORGANIZATION_STAFF_LOGOUT',
        resource: 'Session Terminated',
        ipAddress: '192.168.1.45',
        status: 'success',
      })
    }
    civicStorage.clearOrgSession()
  },

  // Services
  async getServices(): Promise<CivicService[]> {
    return civicStorage.getOrgServices()
  },

  async createService(data: Omit<CivicService, 'id'>): Promise<CivicService> {
    const services = civicStorage.getOrgServices()
    const newService: CivicService = {
      ...data,
      id: `srv_org_${Date.now()}`,
    }
    services.unshift(newService)
    civicStorage.saveOrgServices(services)

    civicStorage.addAuditEvent({
      workspace: 'organization',
      actor: 'Service Manager',
      actorId: 'mem_03',
      role: 'SERVICE_MANAGER',
      action: 'SERVICE_CREATED',
      resource: `Service #${newService.id} (${newService.title})`,
      ipAddress: '192.168.1.45',
      status: 'success',
    })

    return newService
  },

  async togglePublish(serviceId: string): Promise<CivicService | undefined> {
    const res = civicStorage.togglePublishOrgService(serviceId)
    if (res) {
      civicStorage.addAuditEvent({
        workspace: 'organization',
        actor: 'Service Manager',
        actorId: 'mem_03',
        role: 'SERVICE_MANAGER',
        action: res.isPublished ? 'SERVICE_PUBLISHED_TO_CITIZEN_MARKETPLACE' : 'SERVICE_UNPUBLISHED',
        resource: `Service #${res.id} (${res.title})`,
        ipAddress: '192.168.1.45',
        status: 'success',
      })
    }
    return res
  },

  // Applications
  async getApplications(): Promise<CivicApplication[]> {
    return civicStorage.getApplications()
  },

  async getApplicationById(id: string): Promise<CivicApplication | undefined> {
    return civicStorage.getApplications().find((a) => a.id === id || a.applicationNumber === id)
  },

  async updateApplicationStatus(id: string, status: CivicApplication['status'], note?: string): Promise<void> {
    const apps = civicStorage.getApplications()
    const app = apps.find((a) => a.id === id)
    if (app) {
      app.status = status
      app.updatedAt = new Date().toISOString()
      if (note) {
        app.timeline.unshift({
          title: `Status updated to ${status.toUpperCase()}`,
          description: note,
          timestamp: new Date().toISOString(),
          status: 'completed',
        })
      }
      civicStorage.saveApplications(apps)

      civicStorage.addAuditEvent({
        workspace: 'organization',
        actor: 'Verification Officer',
        actorId: 'mem_01',
        role: 'VERIFICATION_OFFICER',
        action: 'APPLICATION_STATUS_UPDATED',
        resource: `Application #${app.applicationNumber} -> ${status}`,
        ipAddress: '192.168.1.45',
        status: 'success',
      })
    }
  },

  // Access Requests
  async getAccessRequests(): Promise<ConsentRequest[]> {
    return civicStorage.getConsentRequests()
  },

  async createAccessRequest(data: Omit<ConsentRequest, 'id' | 'requestedAt' | 'status' | 'approvedFields' | 'approvedDocuments'>): Promise<ConsentRequest> {
    try {
      const res = await apiClient.post<any>('/institution/access-requests', {
        citizen_civic_id: data.citizenId || 'CIV-2026-004281',
        domain_type: 'FINANCE',
        purpose: data.purpose || 'Verification',
        duration_days: data.durationDays || 30,
        requested_fields: data.requestedFields || ['full_name']
      })
      if (res && res.request_id) {
        const created: ConsentRequest = {
          id: res.request_id,
          organizationId: data.organizationId || 'inst_bank',
          organizationName: data.organizationName || 'HDFC Bank Ltd.',
          purpose: data.purpose,
          requestedFields: data.requestedFields,
          approvedFields: [],
          requestedDocuments: [],
          approvedDocuments: [],
          durationDays: data.durationDays,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          expiresAt: res.expires_at,
          citizenId: data.citizenId || 'usr_demo',
          citizenName: data.citizenName || 'Raghavendra'
        }
        civicStorage.createConsentRequest(created)
        return created
      }
    } catch {
      // Fallback if institution endpoint fails or unauthorized
    }
    return civicStorage.createConsentRequest(data)
  },

  // Citizen Profile with Field-Level Security Enforcement
  async getCitizenAuthorizedProfile(citizenId: string): Promise<CitizenAuthorizedProfile> {
    const user = civicStorage.getUser()
    const grants = civicStorage.getAccessGrants()
    const session = civicStorage.getOrgSession()
    const orgId = session?.organization.id || 'org_apex_health'

    const activeGrant = grants.find(
      (g) => g.organizationId === orgId && g.citizenId === citizenId && (g.status === 'active' || g.status === 'expiring_soon')
    )

    const revokedGrant = grants.find(
      (g) => g.organizationId === orgId && g.citizenId === citizenId && g.status === 'revoked'
    )

    const grantStatus = activeGrant ? 'active' : revokedGrant ? 'revoked' : 'none'
    const authorizedFields = activeGrant ? activeGrant.authorizedFields : []

    const fieldMap: Record<ConsentField, { label: string; realValue: string }> = {
      fullName: { label: 'Full Legal Name', realValue: user.name },
      dateOfBirth: { label: 'Date of Birth', realValue: '14 Aug 1988' },
      gender: { label: 'Gender', realValue: 'Male' },
      phone: { label: 'Contact Phone', realValue: user.phone },
      email: { label: 'Official Email', realValue: user.email },
      address: { label: 'Permanent Address', realValue: `${user.city}, ${user.state} - ${user.pincode}` },
      nationalId: { label: 'Aadhaar / National ID', realValue: user.nationalId },
      panNumber: { label: 'Permanent Account Number (PAN)', realValue: 'ABCPS8819K' },
      income: { label: 'Annual Certified Income', realValue: '₹14,50,000 / annum' },
      educationStatus: { label: 'Highest Education', realValue: 'Bachelor of Engineering (B.E. Computer Science)' },
      drivingLicense: { label: 'Driving License Number', realValue: 'KA-03-2016-00981' },
    }

    const fields: Record<ConsentField, AuthorizedFieldData> = {} as Record<ConsentField, AuthorizedFieldData>

    for (const [key, item] of Object.entries(fieldMap) as [ConsentField, { label: string; realValue: string }][]) {
      const isAuth = authorizedFields.includes(key)
      const fieldStatus: AuthorizedFieldData['status'] = isAuth
        ? 'authorized'
        : revokedGrant
        ? 'revoked'
        : 'not_authorized'

      fields[key] = {
        field: key,
        label: item.label,
        status: fieldStatus,
        value: isAuth ? item.realValue : null,
      }
    }

    return {
      citizenId,
      fullName: user.name,
      fields,
      documents: [
        {
          name: 'Identity Proof (Aadhaar)',
          status: activeGrant?.authorizedDocuments.includes('Identity Proof') ? 'authorized' : 'not_authorized',
        },
        {
          name: 'Medical History Disclosure Form',
          status: activeGrant?.authorizedDocuments.includes('Medical History Disclosure Form') ? 'authorized' : 'not_authorized',
        },
      ],
      activeGrantId: activeGrant?.id,
      grantExpiry: activeGrant?.expiresAt,
      grantStatus,
    }
  },

  // Team Members
  async getMembers(): Promise<OrganizationMember[]> {
    return civicStorage.getOrgMembers()
  },

  async updateMemberRole(memberId: string, role: OrganizationRole): Promise<void> {
    const members = civicStorage.getOrgMembers()
    const m = members.find((x) => x.id === memberId)
    if (m) {
      m.role = role
      civicStorage.saveOrgMembers(members)
    }
  },

  // Analytics
  async getAnalytics() {
    const apps = civicStorage.getApplications()
    const reqs = civicStorage.getConsentRequests()
    const grants = civicStorage.getAccessGrants()

    return {
      totalApplications: apps.length + 14,
      pendingApplications: apps.filter((a) => a.status === 'under_review' || a.status === 'action_required').length + 3,
      avgProcessingDays: 3.4,
      consentApprovalRate: 84.5,
      activeGrantsCount: grants.filter((g) => g.status === 'active').length,
      expiringGrantsCount: grants.filter((g) => g.status === 'expiring_soon').length,
      totalConsentRequests: reqs.length,
      approvedRequestsCount: reqs.filter((r) => r.status === 'approved' || r.status === 'partially_approved').length,
      deniedRequestsCount: reqs.filter((r) => r.status === 'denied').length,
    }
  },
}
