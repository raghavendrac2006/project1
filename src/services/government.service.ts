import { civicStorage, type GovSessionData } from './storage'
import type {
  CivicService,
  CivicApplication,
  GovernmentDepartment,
  GovernmentOfficial,
} from '@/types'

export interface VerificationDossier {
  id: string
  applicationId: string
  applicantName: string
  serviceName: string
  departmentCode: string
  submissionDate: string
  ekycStatus: 'verified' | 'pending' | 'mismatch'
  biometricMatchScore: number
  digilockerVerified: boolean
  physicalInspectionRequired: boolean
  status: 'pending' | 'cleared' | 'flagged'
}

export const governmentService = {
  async getSession(): Promise<GovSessionData | null> {
    return civicStorage.getGovSession()
  },

  async login(email: string): Promise<GovSessionData> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const officials = civicStorage.getGovOfficials()
    const official = officials.find((o) => o.email.toLowerCase() === email.toLowerCase()) || officials[0]
    const depts = civicStorage.getGovDepartments()
    const department = depts.find((d) => d.id === official.departmentId) || depts[0]

    const session: GovSessionData = { official, department }
    civicStorage.setGovSession(session)

    civicStorage.addAuditEvent({
      workspace: 'government',
      actor: official.name,
      actorId: official.id,
      role: official.role,
      action: 'GOVERNMENT_OFFICER_LOGIN',
      resource: `Department Desk (${department.name})`,
      ipAddress: '10.20.1.5',
      status: 'success',
    })

    return session
  },

  async logout(): Promise<void> {
    const session = civicStorage.getGovSession()
    if (session) {
      civicStorage.addAuditEvent({
        workspace: 'government',
        actor: session.official.name,
        actorId: session.official.id,
        role: session.official.role,
        action: 'GOVERNMENT_OFFICER_LOGOUT',
        resource: 'Session Terminated',
        ipAddress: '10.20.1.5',
        status: 'success',
      })
    }
    civicStorage.clearGovSession()
  },

  async getDepartments(): Promise<GovernmentDepartment[]> {
    return civicStorage.getGovDepartments()
  },

  async getOfficials(): Promise<GovernmentOfficial[]> {
    return civicStorage.getGovOfficials()
  },

  async getServices(): Promise<CivicService[]> {
    return civicStorage.getServices()
  },

  async gazetteService(service: CivicService): Promise<void> {
    const current = civicStorage.getServices()
    const updated = [service, ...current.filter((s) => s.id !== service.id)]
    civicStorage.saveServices(updated)
    const session = civicStorage.getGovSession()
    civicStorage.addAuditEvent({
      workspace: 'government',
      actor: session?.official.name ?? 'Senior Government Manager (All-India)',
      actorId: session?.official.id ?? 'gov_mgr_all_india',
      role: session?.official.role ?? 'COMMISSIONER',
      action: 'STATUTORY_SCHEME_GAZETTED',
      resource: `${service.title} (${service.serviceCode || service.id})`,
      ipAddress: '10.20.1.1',
      status: 'success',
      metadata: {
        ministry: service.ministry ?? 'N/A',
        jurisdiction: service.jurisdictionLevel ?? 'Central',
        stateOrUt: service.stateOrUt ?? 'All India',
        statutoryAct: service.statutoryAct ?? 'N/A',
      },
    })
  },

  async getApplications(): Promise<CivicApplication[]> {
    return civicStorage.getApplications()
  },

  async endorseApplication(id: string, officerNotes: string): Promise<void> {
    const apps = civicStorage.getApplications()
    const app = apps.find((a) => a.id === id)
    if (app) {
      app.status = 'approved'
      app.updatedAt = new Date().toISOString()
      app.timeline.unshift({
        title: 'Application Endorsed & Approved by Government Officer',
        description: `Official digital stamp applied. Notes: ${officerNotes}`,
        timestamp: new Date().toISOString(),
        status: 'completed',
      })
      civicStorage.saveApplications(apps)

      civicStorage.addAuditEvent({
        workspace: 'government',
        actor: 'Joint Commissioner Rajiv Patel',
        actorId: 'off_01',
        role: 'COMMISSIONER',
        action: 'APPLICATION_ENDORSED_AND_SEALED',
        resource: `Application #${app.applicationNumber}`,
        ipAddress: '10.20.1.5',
        status: 'success',
        metadata: { digitalSignature: 'SHA256-GOV-ENDORSE-KA' },
      })
    }
  },

  async getVerificationQueue(): Promise<VerificationDossier[]> {
    return [
      {
        id: 'ver_01',
        applicationId: 'APP-2026-0914',
        applicantName: 'Rajesh K. Sharma',
        serviceName: 'Driving License Renewal & Smart Card',
        departmentCode: 'MORTH-KA',
        submissionDate: '14 Sep 2026',
        ekycStatus: 'verified',
        biometricMatchScore: 99.4,
        digilockerVerified: true,
        physicalInspectionRequired: false,
        status: 'cleared',
      },
      {
        id: 'ver_02',
        applicationId: 'APP-2026-8821',
        applicantName: 'Rajesh K. Sharma',
        serviceName: 'Surya Ghar Rooftop Solar Subsidy',
        departmentCode: 'MNRE-KA',
        submissionDate: '10 Sep 2026',
        ekycStatus: 'verified',
        biometricMatchScore: 98.2,
        digilockerVerified: true,
        physicalInspectionRequired: true,
        status: 'pending',
      },
      {
        id: 'ver_03',
        applicationId: 'APP-2026-4402',
        applicantName: 'Anil Sengupta',
        serviceName: 'E-Khata Property Mutation & Transfer',
        departmentCode: 'REV-BLR',
        submissionDate: '02 Sep 2026',
        ekycStatus: 'mismatch',
        biometricMatchScore: 78.1,
        digilockerVerified: false,
        physicalInspectionRequired: true,
        status: 'flagged',
      },
    ]
  },

  async getReports() {
    return {
      department: 'Ministry of Road Transport & Regional Revenue',
      totalApplicationsProcessed: 1482,
      complianceRate: 97.4,
      avgResolutionDays: 4.1,
      slaBreaches: 3,
      interDepartmentReferrals: 48,
      digitalPassportsIssued: 894,
    }
  },
}
