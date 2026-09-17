import { civicStorage } from './storage'
import type { PolicyTemplate, PolicyPurposeCategory, PolicyAttributeConfig, ConsentField } from '@/types'

const POLICY_STORAGE_KEY = 'civiqone_org_policies_v1'

function getPolicies(): PolicyTemplate[] {
  const stored = localStorage.getItem(POLICY_STORAGE_KEY)
  if (stored) return JSON.parse(stored) as PolicyTemplate[]
  const defaults = buildDefaultPolicies()
  localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(defaults))
  return defaults
}

function savePolicies(policies: PolicyTemplate[]): void {
  localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(policies))
}

function buildDefaultPolicies(): PolicyTemplate[] {
  return [
    {
      id: 'pol_001',
      name: 'Health Insurance Underwriting Bundle',
      version: 'v2.1',
      status: 'active',
      purposeCategory: 'insurance_underwriting',
      description:
        'Standard attribute set required for health insurance policy issuance and risk assessment under IRDAI guidelines.',
      attributes: [
        { field: 'fullName', required: true, purpose: 'Policy holder identity', retentionDays: 2555 },
        { field: 'dateOfBirth', required: true, purpose: 'Age-based premium calculation', retentionDays: 2555 },
        { field: 'gender', required: true, purpose: 'Actuarial risk profiling', retentionDays: 2555 },
        { field: 'income', required: false, purpose: 'Sum insured eligibility', retentionDays: 365 },
        { field: 'nationalId', required: true, purpose: 'KYC compliance', retentionDays: 2555 },
      ],
      requiredDocuments: ['Identity Proof (Aadhaar)', 'Medical History Disclosure Form'],
      defaultDurationDays: 365,
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-08-20T14:30:00Z',
      createdBy: 'Priya Kapoor',
      usageCount: 847,
    },
    {
      id: 'pol_002',
      name: 'Credit Risk Lite Bundle',
      version: 'v1.3',
      status: 'active',
      purposeCategory: 'credit_assessment',
      description:
        'Minimal attribute set for quick-approval personal loan eligibility checks, compliant with RBI data localization norms.',
      attributes: [
        { field: 'fullName', required: true, purpose: 'Borrower identity', retentionDays: 1095 },
        { field: 'panNumber', required: true, purpose: 'CIBIL score lookup', retentionDays: 1095 },
        { field: 'income', required: true, purpose: 'Loan-to-income ratio', retentionDays: 365 },
        { field: 'address', required: false, purpose: 'Residential stability check', retentionDays: 365 },
      ],
      requiredDocuments: ['Income Proof', 'Identity Proof (Aadhaar)'],
      defaultDurationDays: 90,
      createdAt: '2024-03-10T10:00:00Z',
      updatedAt: '2024-09-01T08:15:00Z',
      createdBy: 'Rajan Mehta',
      usageCount: 312,
    },
    {
      id: 'pol_003',
      name: 'Employment Background Screening',
      version: 'v1.0',
      status: 'draft',
      purposeCategory: 'employment_background',
      description:
        'Comprehensive attribute bundle for pre-employment verification including education, identity, and address validation.',
      attributes: [
        { field: 'fullName', required: true, purpose: 'Candidate identity verification', retentionDays: 180 },
        { field: 'dateOfBirth', required: true, purpose: 'Age eligibility check', retentionDays: 180 },
        { field: 'educationStatus', required: true, purpose: 'Qualification verification', retentionDays: 180 },
        { field: 'address', required: true, purpose: 'Address verification', retentionDays: 90 },
        { field: 'nationalId', required: true, purpose: 'Identity fraud prevention', retentionDays: 180 },
      ],
      requiredDocuments: ['Identity Proof (Aadhaar)', 'Degree Certificate'],
      defaultDurationDays: 30,
      createdAt: '2024-09-05T11:00:00Z',
      updatedAt: '2024-09-05T11:00:00Z',
      createdBy: 'Anika Sharma',
      usageCount: 0,
    },
  ]
}

export const organizationPolicyService = {
  async getAll(): Promise<PolicyTemplate[]> {
    await new Promise((r) => setTimeout(r, 120))
    return getPolicies()
  },

  async getById(id: string): Promise<PolicyTemplate | undefined> {
    return getPolicies().find((p) => p.id === id)
  },

  async create(data: Omit<PolicyTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<PolicyTemplate> {
    const policies = getPolicies()
    const session = civicStorage.getOrgSession()
    const now = new Date().toISOString()
    const newPolicy: PolicyTemplate = {
      ...data,
      id: `pol_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      createdBy: session?.member.name ?? 'Unknown Officer',
    }
    policies.unshift(newPolicy)
    savePolicies(policies)
    civicStorage.addAuditEvent({
      workspace: 'organization',
      actor: session?.member.name ?? 'Officer',
      actorId: session?.member.id ?? 'mem_00',
      role: session?.member.role ?? 'ADMIN',
      action: 'POLICY_TEMPLATE_CREATED',
      resource: `Policy #${newPolicy.id} (${newPolicy.name})`,
      ipAddress: '192.168.1.45',
      status: 'success',
    })
    return newPolicy
  },

  async updateStatus(id: string, status: PolicyTemplate['status']): Promise<void> {
    const policies = getPolicies()
    const p = policies.find((x) => x.id === id)
    if (p) {
      p.status = status
      p.updatedAt = new Date().toISOString()
      savePolicies(policies)
    }
  },

  getPurposeCategoryLabel(cat: PolicyPurposeCategory): string {
    const map: Record<PolicyPurposeCategory, string> = {
      identity_verification: 'Identity Verification',
      credit_assessment: 'Credit Risk Assessment',
      insurance_underwriting: 'Insurance Underwriting',
      employment_background: 'Employment Background',
      healthcare_eligibility: 'Healthcare Eligibility',
      government_benefit: 'Government Benefit',
      custom: 'Custom Purpose',
    }
    return map[cat] ?? cat
  },
}
