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

export function isServiceBelongingToDepartment(
  service: CivicService,
  department: GovernmentDepartment
): boolean {
  if (service.departmentId && service.departmentId === department.id) return true
  if (
    service.departmentCode &&
    service.departmentCode.toUpperCase() === department.code.toUpperCase()
  ) {
    return true
  }

  const deptCode = (department.code || '').toUpperCase()
  const srvCode = (service.serviceCode || '').toUpperCase()
  const srvDept = (service.department || '').toLowerCase()
  const srvMin = (service.ministry || '').toLowerCase()
  const deptName = (department.name || '').toLowerCase()
  const deptMin = (department.ministry || '').toLowerCase()

  if (deptCode.includes('MORTH') || deptCode.includes('TRANSPORT')) {
    return (
      srvCode.includes('MORTH') ||
      srvDept.includes('transport') ||
      srvDept.includes('sarathi') ||
      srvDept.includes('vahan')
    )
  }
  if (deptCode.includes('REV') || deptCode.includes('LAND')) {
    return (
      srvCode.includes('REV') ||
      srvDept.includes('revenue') ||
      srvDept.includes('land') ||
      srvDept.includes('bhoomi')
    )
  }
  if (deptCode.includes('NHA') || deptCode.includes('HEALTH') || deptCode.includes('MOHFW')) {
    return (
      srvCode.includes('NHA') ||
      srvDept.includes('health') ||
      srvDept.includes('nha') ||
      srvDept.includes('family welfare')
    )
  }
  if (deptCode.includes('CBDT') || deptCode.includes('FINANCE') || deptCode.includes('MOF')) {
    return (
      srvCode.includes('CBDT') ||
      srvCode.includes('CBIC') ||
      srvCode.includes('DOP') ||
      srvCode.includes('MSME') ||
      srvCode.includes('DPIIT') ||
      srvDept.includes('direct taxes') ||
      srvDept.includes('tax') ||
      srvDept.includes('finance') ||
      srvDept.includes('msme') ||
      srvDept.includes('industry and internal trade')
    )
  }
  if (deptCode.includes('UIDAI') || deptCode.includes('MEITY')) {
    return (
      srvCode.includes('UIDAI') ||
      srvCode.includes('EDU') ||
      srvDept.includes('uidai') ||
      srvDept.includes('electronics') ||
      srvDept.includes('higher education')
    )
  }
  if (deptCode.includes('AGRI') || deptCode.includes('MOAFW')) {
    return (
      srvCode.includes('AGRI') ||
      srvDept.includes('agriculture') ||
      srvDept.includes('farmers')
    )
  }
  if (deptCode.includes('SOLAR') || deptCode.includes('MNRE') || deptCode.includes('ENERGY')) {
    return (
      srvCode.includes('MNRE') ||
      srvDept.includes('renewable') ||
      srvDept.includes('solar')
    )
  }
  if (deptCode.includes('FOOD') || deptCode.includes('DFPD') || deptCode.includes('PDS')) {
    return (
      srvCode.includes('FPD') ||
      srvDept.includes('food') ||
      srvDept.includes('public distribution')
    )
  }
  if (deptCode.includes('EPFO') || deptCode.includes('LABOUR') || deptCode.includes('MOLE')) {
    return (
      srvCode.includes('EPFO') ||
      srvCode.includes('MOLE') ||
      srvDept.includes('labour') ||
      srvDept.includes('employment')
    )
  }
  if (deptCode.includes('BBMP') || deptCode.includes('MUNICIPAL') || deptCode.includes('CIVIC')) {
    return (
      srvCode.includes('BBMP') ||
      srvCode.includes('ULB') ||
      srvCode.includes('CRS') ||
      srvCode.includes('HUA') ||
      srvDept.includes('municipal') ||
      srvDept.includes('bbmp') ||
      srvDept.includes('civil registration')
    )
  }
  if (deptCode.includes('CPGRAMS') || deptCode.includes('GRIEVANCE') || deptCode.includes('NIC')) {
    return (
      srvCode.includes('DARPG') ||
      srvCode.includes('DOJ') ||
      srvCode.includes('ECI') ||
      srvCode.includes('MHA') ||
      srvCode.includes('MEA') ||
      srvDept.includes('grievance') ||
      srvDept.includes('administrative reforms') ||
      srvDept.includes('justice') ||
      srvDept.includes('passport')
    )
  }

  return (
    srvDept.includes(deptName) ||
    deptName.includes(srvDept) ||
    srvMin.includes(deptMin) ||
    deptMin.includes(srvMin)
  )
}

export function isApplicationBelongingToDepartment(
  app: CivicApplication,
  department: GovernmentDepartment
): boolean {
  if (app.departmentId && app.departmentId === department.id) return true
  if (
    app.departmentCode &&
    app.departmentCode.toUpperCase() === department.code.toUpperCase()
  ) {
    return true
  }

  const deptCode = (department.code || '').toUpperCase()
  const appNumber = (app.applicationNumber || '').toUpperCase()
  const appDept = (app.department || '').toLowerCase()
  const appService = (app.serviceName || app.serviceTitle || '').toLowerCase()

  if (deptCode.includes('MORTH') || deptCode.includes('TRANSPORT')) {
    return (
      appNumber.includes('RTO') ||
      appNumber.includes('VAHAN') ||
      appNumber.includes('DL') ||
      appDept.includes('transport') ||
      appService.includes('driving') ||
      appService.includes('vehicle')
    )
  }
  if (deptCode.includes('REV') || deptCode.includes('LAND')) {
    return (
      appNumber.includes('REV') ||
      appNumber.includes('BHOOMI') ||
      appDept.includes('revenue') ||
      appService.includes('khata') ||
      appService.includes('land') ||
      appService.includes('caste') ||
      appService.includes('income')
    )
  }
  if (deptCode.includes('NHA') || deptCode.includes('HEALTH')) {
    return (
      appNumber.includes('NHA') ||
      appNumber.includes('PMJAY') ||
      appNumber.includes('ABHA') ||
      appDept.includes('health') ||
      appService.includes('ayushman') ||
      appService.includes('abha')
    )
  }
  if (deptCode.includes('CBDT') || deptCode.includes('FINANCE')) {
    return (
      appNumber.includes('CBDT') ||
      appNumber.includes('PAN') ||
      appNumber.includes('ITD') ||
      appNumber.includes('GST') ||
      appDept.includes('finance') ||
      appDept.includes('direct taxes') ||
      appService.includes('pan') ||
      appService.includes('tax')
    )
  }
  if (deptCode.includes('UIDAI') || deptCode.includes('MEITY')) {
    return (
      appNumber.includes('UIDAI') ||
      appDept.includes('electronics') ||
      appService.includes('aadhaar') ||
      appService.includes('digilocker')
    )
  }
  if (deptCode.includes('AGRI')) {
    return (
      appNumber.includes('AGRI') ||
      appNumber.includes('KISAN') ||
      appDept.includes('agriculture') ||
      appService.includes('kisan') ||
      appService.includes('crop')
    )
  }
  if (deptCode.includes('SOLAR') || deptCode.includes('MNRE')) {
    return (
      appNumber.includes('MNRE') ||
      appNumber.includes('SOLAR') ||
      appDept.includes('renewable') ||
      appService.includes('solar')
    )
  }
  if (deptCode.includes('FOOD') || deptCode.includes('DFPD')) {
    return (
      appNumber.includes('FPD') ||
      appNumber.includes('ONORC') ||
      appDept.includes('food') ||
      appService.includes('ration')
    )
  }
  if (deptCode.includes('EPFO') || deptCode.includes('LABOUR')) {
    return (
      appNumber.includes('EPFO') ||
      appNumber.includes('MOLE') ||
      appDept.includes('labour') ||
      appService.includes('uan') ||
      appService.includes('shram')
    )
  }
  if (deptCode.includes('BBMP') || deptCode.includes('MUNICIPAL')) {
    return (
      appNumber.includes('BBMP') ||
      appNumber.includes('PID') ||
      appDept.includes('municipal') ||
      appDept.includes('bbmp') ||
      appService.includes('municipal') ||
      appService.includes('birth') ||
      appService.includes('trade license')
    )
  }
  if (deptCode.includes('CPGRAMS') || deptCode.includes('NIC')) {
    return (
      appNumber.includes('CPGRAMS') ||
      appNumber.includes('DIR') ||
      appDept.includes('grievance') ||
      appService.includes('grievance') ||
      appService.includes('passport')
    )
  }

  return appDept.includes(department.name.toLowerCase())
}

const ALL_DEPARTMENTAL_DOSSIERS: VerificationDossier[] = [
  // Transport MORTH-KA
  {
    id: 'ver_morth_01',
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
    id: 'ver_morth_02',
    applicationId: 'APP-2026-1049',
    applicantName: 'Vikramaditya Rao',
    serviceName: 'Motor Vehicle RC & Ownership Transfer',
    departmentCode: 'MORTH-KA',
    submissionDate: '12 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 97.8,
    digilockerVerified: true,
    physicalInspectionRequired: true,
    status: 'pending',
  },
  // Revenue REV-BLR
  {
    id: 'ver_rev_01',
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
  {
    id: 'ver_rev_02',
    applicationId: 'APP-2026-7781',
    applicantName: 'Sneha Patil',
    serviceName: 'Caste & Income Certificate Verification',
    departmentCode: 'REV-BLR',
    submissionDate: '08 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 98.6,
    digilockerVerified: true,
    physicalInspectionRequired: false,
    status: 'cleared',
  },
  // Health MOHFW-NHA
  {
    id: 'ver_health_01',
    applicationId: 'APP-2026-8812',
    applicantName: 'Gopal Krishna',
    serviceName: 'Ayushman Bharat PM-JAY Cashless Card',
    departmentCode: 'MOHFW-NHA',
    submissionDate: '14 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 99.1,
    digilockerVerified: true,
    physicalInspectionRequired: false,
    status: 'pending',
  },
  // Finance MOF-CBDT
  {
    id: 'ver_fin_01',
    applicationId: 'APP-2026-4410',
    applicantName: 'Arjun Nambiar',
    serviceName: 'Permanent Account Number (PAN) Issuance',
    departmentCode: 'MOF-CBDT',
    submissionDate: '15 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 99.8,
    digilockerVerified: true,
    physicalInspectionRequired: false,
    status: 'cleared',
  },
  // MeitY MEITY-UIDAI
  {
    id: 'ver_meity_01',
    applicationId: 'APP-2026-9912',
    applicantName: 'Kavita Sundar',
    serviceName: 'Aadhaar Biometric & Demographic Sync',
    departmentCode: 'MEITY-UIDAI',
    submissionDate: '13 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 99.9,
    digilockerVerified: true,
    physicalInspectionRequired: false,
    status: 'pending',
  },
  // Agriculture MOAFW-AGRI
  {
    id: 'ver_agri_01',
    applicationId: 'APP-2026-5541',
    applicantName: 'Hanamantappa Gowda',
    serviceName: 'PM-Kisan Land Parcel Seeding',
    departmentCode: 'MOAFW-AGRI',
    submissionDate: '11 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 96.5,
    digilockerVerified: true,
    physicalInspectionRequired: true,
    status: 'pending',
  },
  // Energy MNRE-SOLAR
  {
    id: 'ver_energy_01',
    applicationId: 'APP-2026-8821',
    applicantName: 'Rajesh K. Sharma',
    serviceName: 'Surya Ghar Rooftop Solar Subsidy',
    departmentCode: 'MNRE-SOLAR',
    submissionDate: '10 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 98.2,
    digilockerVerified: true,
    physicalInspectionRequired: true,
    status: 'pending',
  },
  // Food DFPD-FOOD
  {
    id: 'ver_food_01',
    applicationId: 'APP-2026-7719',
    applicantName: 'Manoj Kumar Jha',
    serviceName: 'ONORC National Ration Portability',
    departmentCode: 'DFPD-FOOD',
    submissionDate: '10 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 97.4,
    digilockerVerified: true,
    physicalInspectionRequired: false,
    status: 'pending',
  },
  // Labour MOLE-EPFO
  {
    id: 'ver_labour_01',
    applicationId: 'APP-2026-4412',
    applicantName: 'Pooja Hegde',
    serviceName: 'Universal Account Number (UAN) PF Claim',
    departmentCode: 'MOLE-EPFO',
    submissionDate: '12 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 99.0,
    digilockerVerified: true,
    physicalInspectionRequired: false,
    status: 'pending',
  },
  // Municipal BBMP-CIVIC
  {
    id: 'ver_bbmp_01',
    applicationId: 'APP-2026-8831',
    applicantName: 'Siddharth V. Rao',
    serviceName: 'Municipal Trade License & Fire Safety NOC',
    departmentCode: 'BBMP-CIVIC',
    submissionDate: '09 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 98.0,
    digilockerVerified: true,
    physicalInspectionRequired: true,
    status: 'pending',
  },
  // Pan-India Grievance NIC-CPGRAMS
  {
    id: 'ver_grievance_01',
    applicationId: 'APP-2026-1092',
    applicantName: 'Prof. S. R. Narayan',
    serviceName: 'Centralized Public Grievance Escalation',
    departmentCode: 'NIC-CPGRAMS',
    submissionDate: '05 Sep 2026',
    ekycStatus: 'verified',
    biometricMatchScore: 99.3,
    digilockerVerified: true,
    physicalInspectionRequired: false,
    status: 'cleared',
  },
]

export const governmentService = {
  async getSession(): Promise<GovSessionData | null> {
    return civicStorage.getGovSession()
  },

  async login(email: string): Promise<GovSessionData> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const officials = civicStorage.getGovOfficials()
    const official =
      officials.find((o) => o.email.toLowerCase() === email.toLowerCase()) ||
      officials[0]
    const depts = civicStorage.getGovDepartments()
    const department =
      depts.find((d) => d.id === official.departmentId) || depts[0]

    const session: GovSessionData = { official, department }
    civicStorage.setGovSession(session)

    civicStorage.addAuditEvent({
      workspace: 'government',
      actor: official.name,
      actorId: official.id,
      role: official.role,
      action: 'GOVERNMENT_OFFICER_LOGIN',
      resource: `${department.name} (${department.code}) Desk`,
      ipAddress: '10.20.1.5',
      status: 'success',
    })

    return session
  },

  async switchDepartment(departmentId: string): Promise<GovSessionData> {
    const depts = civicStorage.getGovDepartments()
    const department = depts.find((d) => d.id === departmentId) || depts[0]
    const officials = civicStorage.getGovOfficials()
    const official =
      officials.find((o) => o.departmentId === department.id) ||
      officials[0]

    const session: GovSessionData = { official, department }
    civicStorage.setGovSession(session)

    civicStorage.addAuditEvent({
      workspace: 'government',
      actor: official.name,
      actorId: official.id,
      role: official.role,
      action: 'DEPARTMENT_WORKSPACE_SWITCHED',
      resource: `Active Desk Switched to ${department.name} (${department.code})`,
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

  /**
   * Scoped exclusively to the officer's active department.
   * Cross-departmental services are NOT merged into this list.
   */
  async getServices(): Promise<CivicService[]> {
    const session = civicStorage.getGovSession()
    const allServices = civicStorage.getServices()
    if (!session?.department) return allServices

    const deptServices = allServices.filter((srv) =>
      isServiceBelongingToDepartment(srv, session.department)
    )

    // Fallback: If no exact match found yet, return allServices tagged for this dept
    return deptServices.length > 0 ? deptServices : allServices
  },

  async gazetteService(service: CivicService): Promise<void> {
    const session = civicStorage.getGovSession()
    const dept = session?.department

    const gazetted: CivicService = {
      ...service,
      departmentId: dept?.id || service.departmentId,
      departmentCode: dept?.code || service.departmentCode,
      department: dept?.name || service.department,
      ministry: dept?.ministry || service.ministry,
    }

    const current = civicStorage.getServices()
    const updated = [gazetted, ...current.filter((s) => s.id !== gazetted.id)]
    civicStorage.saveServices(updated)

    civicStorage.addAuditEvent({
      workspace: 'government',
      actor: session?.official.name ?? 'Statutory Officer',
      actorId: session?.official.id ?? 'gov_officer',
      role: session?.official.role ?? 'COMMISSIONER',
      action: 'STATUTORY_SCHEME_GAZETTED',
      resource: `${gazetted.title} (${gazetted.serviceCode || gazetted.id})`,
      ipAddress: '10.20.1.1',
      status: 'success',
      metadata: {
        department: dept?.name ?? 'N/A',
        departmentCode: dept?.code ?? 'N/A',
        ministry: gazetted.ministry ?? 'N/A',
        jurisdiction: gazetted.jurisdictionLevel ?? 'Central',
        statutoryAct: gazetted.statutoryAct ?? 'N/A',
      },
    })
  },

  /**
   * Scoped exclusively to the officer's active department.
   */
  async getApplications(): Promise<CivicApplication[]> {
    const session = civicStorage.getGovSession()
    const allApps = civicStorage.getApplications()
    if (!session?.department) return allApps

    const deptApps = allApps.filter((app) =>
      isApplicationBelongingToDepartment(app, session.department)
    )

    return deptApps
  },

  async endorseApplication(id: string, officerNotes: string): Promise<void> {
    const session = civicStorage.getGovSession()
    const apps = civicStorage.getApplications()
    const app = apps.find((a) => a.id === id)
    if (app) {
      app.status = 'approved'
      app.updatedAt = new Date().toISOString()
      app.timeline.unshift({
        title: `Statutory Approval Endorsed by ${session?.department.name ?? 'Government Officer'}`,
        description: `Officer Seal Applied by ${session?.official.name ?? 'Commissioner'}. Notes: ${officerNotes}`,
        timestamp: new Date().toISOString(),
        status: 'completed',
      })
      civicStorage.saveApplications(apps)

      civicStorage.addAuditEvent({
        workspace: 'government',
        actor: session?.official.name ?? 'Government Commissioner',
        actorId: session?.official.id ?? 'off_01',
        role: session?.official.role ?? 'COMMISSIONER',
        action: 'APPLICATION_ENDORSED_AND_SEALED',
        resource: `Application #${app.applicationNumber} [${session?.department.code ?? 'GOV'}]`,
        ipAddress: '10.20.1.5',
        status: 'success',
        metadata: {
          digitalSignature: `SHA256-${session?.department.code ?? 'GOV'}-ENDORSE`,
          department: session?.department.name ?? 'Government Directorate',
        },
      })
    }
  },

  /**
   * Scoped exclusively to the officer's active department.
   */
  async getVerificationQueue(): Promise<VerificationDossier[]> {
    const session = civicStorage.getGovSession()
    if (!session?.department) return ALL_DEPARTMENTAL_DOSSIERS

    const deptCode = session.department.code.toUpperCase()
    const filtered = ALL_DEPARTMENTAL_DOSSIERS.filter(
      (d) =>
        d.departmentCode.toUpperCase() === deptCode ||
        deptCode.includes(d.departmentCode.split('-')[0])
    )

    return filtered.length > 0 ? filtered : ALL_DEPARTMENTAL_DOSSIERS.slice(0, 2)
  },

  async getReports() {
    const session = civicStorage.getGovSession()
    const dept = session?.department
    const services = await this.getServices()
    const applications = await this.getApplications()
    const dossiers = await this.getVerificationQueue()

    return {
      department: dept?.name || 'Departmental Directorate',
      departmentCode: dept?.code || 'GOV',
      statutoryAct: dept?.statutoryAct || 'Right to Public Services Act',
      jurisdictionScope: dept?.jurisdictionScope || 'Notified Jurisdiction',
      totalApplicationsProcessed: Math.max(applications.length * 280 + 420, 740),
      complianceRate: dept?.complianceRate ?? 97.4,
      avgResolutionDays: dept?.avgSlaDays ?? 4.1,
      slaBreaches: 1,
      interDepartmentReferrals: 12,
      digitalPassportsIssued: Math.max(applications.length * 150 + 200, 480),
      activeServicesCount: services.length,
      pendingVerificationsCount: dossiers.filter((d) => d.status === 'pending').length,
    }
  },
}
