import { civicStorage } from './storage'
import type { CivicApplication, ApplicationStatus } from '@/types'
import type { ApplicationSubmissionFormData } from '@/schemas'

export const applicationService = {
  async getApplications(params?: { status?: ApplicationStatus | 'all'; query?: string }): Promise<CivicApplication[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    let apps = civicStorage.getApplications()

    if (params?.status && params.status !== 'all') {
      apps = apps.filter((a) => a.status === params.status)
    }

    if (params?.query && params.query.trim() !== '') {
      const q = params.query.toLowerCase()
      apps = apps.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q)
      )
    }

    return apps
  },

  async getApplicationById(id: string): Promise<CivicApplication | undefined> {
    const apps = civicStorage.getApplications()
    return apps.find((a) => a.id === id || a.applicationNumber === id)
  },

  async submitNewApplication(
    serviceId: string,
    formData: ApplicationSubmissionFormData
  ): Promise<CivicApplication> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const services = civicStorage.getServices()
    const targetService = services.find((s) => s.id === serviceId)
    if (!targetService) throw new Error('Service not found')

    const appNumber = `SAMAGRA-${targetService.department.slice(0, 3).toUpperCase()}-2026-${Math.floor(100000 + Math.random() * 900000)}`
    const now = new Date().toISOString()

    const newApp: CivicApplication = {
      id: `app_${Date.now()}`,
      applicationNumber: appNumber,
      serviceId: targetService.id,
      serviceName: targetService.title,
      department: targetService.department,
      submittedAt: now,
      updatedAt: now,
      status: 'submitted',
      currentStep: 1,
      totalSteps: 4,
      applicantNotes: formData.notes || 'Submitted via SAMAGRA Citizen Portal',
      timeline: [
        {
          title: 'Application Form Dispatched',
          description: `Application registered with ${formData.applicantName}`,
          timestamp: 'Just now',
          status: 'completed',
        },
        {
          title: 'Aadhaar e-KYC Verification',
          description: 'Automatic biometric reconciliation with Central Repository',
          status: 'current',
        },
        {
          title: 'Departmental Verification & Field Scrutiny',
          description: 'Case assignment to designated competent authority',
          status: 'upcoming',
        },
        {
          title: 'Statutory Approval & Certificate Issuance',
          description: 'Digitally signed document dispatch to citizen vault',
          status: 'upcoming',
        },
      ],
      attachedDocuments: [
        { name: 'National_Identity_Aadhaar.pdf', size: '1.4 MB', status: 'verified' },
        { name: 'Applicant_Self_Declaration.pdf', size: '420 KB', status: 'verified' },
      ],
    }

    const apps = civicStorage.getApplications()
    civicStorage.saveApplications([newApp, ...apps])
    return newApp
  },

  async resolveActionRequired(
    applicationId: string,
    documentName: string
  ): Promise<CivicApplication> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const apps = civicStorage.getApplications()
    const index = apps.findIndex((a) => a.id === applicationId)
    if (index === -1) throw new Error('Application not found')

    const current = apps[index]
    const updated: CivicApplication = {
      ...current,
      status: 'under_review',
      actionRequiredMessage: undefined,
      updatedAt: new Date().toISOString(),
      attachedDocuments: [
        ...current.attachedDocuments,
        { name: documentName || 'Reuploaded_Verification_Doc.pdf', size: '1.9 MB', status: 'uploaded' },
      ],
      timeline: current.timeline.map((step) => {
        if (step.status === 'action_required') {
          return {
            ...step,
            status: 'completed',
            description: `${step.description} — Citizen provided requested document. Under re-scrutiny.`,
            timestamp: 'Just now',
          }
        }
        return step
      }),
    }

    apps[index] = updated
    civicStorage.saveApplications(apps)
    return updated
  },

  async advanceWorkflowStage(applicationId: string): Promise<CivicApplication> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const apps = civicStorage.getApplications()
    const index = apps.findIndex((a) => a.id === applicationId)
    if (index === -1) throw new Error('Application not found')

    const current = apps[index]
    const currentStep = current.currentStep || 1
    const nextStep = currentStep >= 4 ? 1 : currentStep + 1

    const stepStatuses: ApplicationStatus[] = [
      'submitted',
      'under_review',
      'under_review',
      'approved',
    ]
    const newStatus: ApplicationStatus = stepStatuses[nextStep - 1] || 'approved'

    const updated: CivicApplication = {
      ...current,
      status: newStatus,
      currentStep: nextStep,
      updatedAt: new Date().toISOString(),
      timeline: current.timeline.map((t, idx) => {
        if (idx < nextStep - 1) {
          return { ...t, status: 'completed' as const, timestamp: 'Verified' }
        }
        if (idx === nextStep - 1) {
          return { ...t, status: 'current' as const, timestamp: 'In progress' }
        }
        return { ...t, status: 'upcoming' as const, timestamp: undefined }
      }),
    }

    apps[index] = updated
    civicStorage.saveApplications(apps)
    return updated
  },
}
