import { civicStorage, type AdminSessionData } from './storage'
import type { Organization, GovernmentDepartment, User, SuperAdminUser, AuditEvent } from '@/types'

export const adminService = {
  async getSession(): Promise<AdminSessionData | null> {
    return civicStorage.getAdminSession()
  },

  async login(email: string): Promise<AdminSessionData> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const user: SuperAdminUser = {
      id: 'adm_01',
      name: 'Chief Systems Administrator',
      email: email || 'admin@civiqone.gov.in',
      avatar: '',
      role: 'SUPER_ADMIN',
    }

    const session: AdminSessionData = { user }
    civicStorage.setAdminSession(session)

    civicStorage.addAuditEvent({
      workspace: 'admin',
      actor: user.name,
      actorId: user.id,
      role: 'SUPER_ADMIN',
      action: 'SUPER_ADMIN_LOGIN',
      resource: 'Sovereign Control Console',
      ipAddress: '127.0.0.1',
      status: 'success',
    })

    return session
  },

  async logout(): Promise<void> {
    const session = civicStorage.getAdminSession()
    if (session) {
      civicStorage.addAuditEvent({
        workspace: 'admin',
        actor: session.user.name,
        actorId: session.user.id,
        role: 'SUPER_ADMIN',
        action: 'SUPER_ADMIN_LOGOUT',
        resource: 'Console Locked',
        ipAddress: '127.0.0.1',
        status: 'success',
      })
    }
    civicStorage.clearAdminSession()
  },

  async getPlatformStats() {
    const orgs = civicStorage.getOrganizations()
    const depts = civicStorage.getGovDepartments()
    const services = civicStorage.getAllMarketplaceServices()
    const audits = civicStorage.getAuditEvents()

    return {
      totalCitizensRegistered: 482910,
      activeOrganizations: orgs.length,
      connectedDepartments: depts.length,
      activeServicesPublished: services.length,
      dailyTransactions: 18420,
      systemUptime: '99.98%',
      securityAuditsLogged: audits.length + 1042,
      incidentAlerts: 0,
    }
  },

  async getOrganizations(): Promise<Organization[]> {
    return civicStorage.getOrganizations()
  },

  async updateOrganizationStatus(id: string, status: Organization['verificationStatus']): Promise<void> {
    const orgs = civicStorage.getOrganizations()
    const org = orgs.find((o) => o.id === id)
    if (org) {
      org.verificationStatus = status
      civicStorage.saveOrganizations(orgs)

      civicStorage.addAuditEvent({
        workspace: 'admin',
        actor: 'Chief Systems Administrator',
        actorId: 'adm_01',
        role: 'SUPER_ADMIN',
        action: `ORGANIZATION_STATUS_${status.toUpperCase()}`,
        resource: `Organization #${org.id} (${org.name})`,
        ipAddress: '127.0.0.1',
        status: 'success',
      })
    }
  },

  async getDepartments(): Promise<GovernmentDepartment[]> {
    return civicStorage.getGovDepartments()
  },

  async getUsers(): Promise<User[]> {
    return [
      civicStorage.getUser(),
      {
        id: 'usr_civiqone_1024',
        name: 'Ananya Deshmukh',
        email: 'ananya.d@civicmail.gov.in',
        phone: '9845099882',
        avatar: '',
        nationalId: '8112-4491-0021',
        verificationLevel: 'Level 3 - Biometric Sovereign',
        state: 'Maharashtra',
        city: 'Pune',
        pincode: '411001',
        memberSince: 'January 2024',
        securityScore: 98,
      },
    ]
  },

  async getAuditStream(): Promise<AuditEvent[]> {
    return civicStorage.getAuditEvents()
  },
}

