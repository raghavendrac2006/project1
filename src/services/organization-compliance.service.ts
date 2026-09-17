/**
 * organization-compliance.service.ts
 * Regulatory Compliance, DPDP Act 2023 adherence audits, and cryptographic Data Purge engine.
 */

import type { ComplianceCheckItem, DataPurgePolicy, DestructionCertificate } from '@/types'
import { realtimeBus } from './eventBus'

const STORAGE_KEYS = {
  POLICIES: 'civiq_org_purge_policies',
  CERTIFICATES: 'civiq_org_destruction_certs',
}

const INITIAL_COMPLIANCE_CHECKS: ComplianceCheckItem[] = [
  {
    id: 'dpdp_sec_6',
    framework: 'DPDP_2023',
    clause: 'Section 6(1) - Consent Architecture',
    title: 'Itemized, Specific & Freely Given Consent Matrix',
    status: 'compliant',
    evidence: 'Granular field-level consent tokens registered with immutable timestamp and hash.',
    lastAuditDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dpdp_sec_8',
    framework: 'DPDP_2023',
    clause: 'Section 8(7) - Purpose Limitation & Erasure',
    title: 'Automated Post-Processing Data Erasure',
    status: 'compliant',
    evidence: 'Cryptographic data purge scheduler active. Zero residual records found past SLA.',
    lastAuditDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dpdp_sec_9',
    framework: 'DPDP_2023',
    clause: 'Section 9 - Special Protections for Minor Data',
    title: 'Strict Parental Verification & Zero Tracking on Minors',
    status: 'compliant',
    evidence: 'ZKP Age circuit enforces >=18 validation. Minor applications routed to Guardian flow.',
    lastAuditDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dpdp_sec_12',
    framework: 'DPDP_2023',
    clause: 'Section 12 - Right to Erasure & Grievance Redressal',
    title: 'Citizen Revocation & Data Wipe SLA (< 72 Hours)',
    status: 'compliant',
    evidence: 'Realtime bus listens to CONSENT_REVOKED. Automated purge executed in 4.2 hours avg.',
    lastAuditDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cert_in_2022',
    framework: 'CERT_IN',
    clause: 'Directions 2022 (Log Retention)',
    title: 'System & Security Log Mandate (180 Days Immutable)',
    status: 'compliant',
    evidence: 'Audit log hashes synced to immutable hash-chain storage with cold backups.',
    lastAuditDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const INITIAL_PURGE_POLICIES: DataPurgePolicy[] = [
  {
    id: 'pol_purge_kyc',
    name: 'Temporary KYC Working Cached Documents',
    dataType: 'Aadhaar / PAN Raw OCR Scans & Form Buffers',
    retentionDays: 14,
    autoPurgeEnabled: true,
    lastRunAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    nextScheduledAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    recordsPurgedTotal: 4892,
  },
  {
    id: 'pol_purge_rejected',
    name: 'Rejected Applications Citizen Dossier Wipe',
    dataType: 'Disapproved loan & subsidy working payloads',
    retentionDays: 30,
    autoPurgeEnabled: true,
    lastRunAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextScheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    recordsPurgedTotal: 1240,
  },
  {
    id: 'pol_purge_sessions',
    name: 'Citizen Real-time Session & Device Telemetry',
    dataType: 'IP telemetry, device fingerprints, ephemeral auth nonces',
    retentionDays: 7,
    autoPurgeEnabled: true,
    lastRunAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    nextScheduledAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    recordsPurgedTotal: 34190,
  },
]

const INITIAL_CERTIFICATES: DestructionCertificate[] = [
  {
    id: 'cert_shred_9918',
    certificateNumber: 'CIVIQ-SHRED-2026-0819',
    purgePolicyName: 'Temporary KYC Working Cached Documents',
    recordsCount: 312,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    shredMethod: 'NIST SP 800-88 Rev 1 Cryptographic Erasure & 3-Pass Overwrite',
    merkleRootHash: '0x8f01b92c4e1178a9c84e1209b17482ea09c314de8812',
    officerSignature: 'SecOps-Compliance-Key-0x9812 (Automated HSM Signer)',
  },
  {
    id: 'cert_shred_9917',
    certificateNumber: 'CIVIQ-SHRED-2026-0818',
    purgePolicyName: 'Rejected Applications Citizen Dossier Wipe',
    recordsCount: 89,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    shredMethod: 'NIST SP 800-88 Rev 1 Cryptographic Erasure & 3-Pass Overwrite',
    merkleRootHash: '0x3344ae1298bbcca17283401ef9092ca874130099ab12',
    officerSignature: 'Chief-Privacy-Officer-0x4421 (Co-Signed)',
  },
]

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export const organizationComplianceService = {
  getComplianceChecks: async (): Promise<ComplianceCheckItem[]> => {
    return INITIAL_COMPLIANCE_CHECKS
  },

  getPurgePolicies: async (): Promise<DataPurgePolicy[]> => {
    return getStored(STORAGE_KEYS.POLICIES, INITIAL_PURGE_POLICIES)
  },

  getDestructionCertificates: async (): Promise<DestructionCertificate[]> => {
    return getStored(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES)
  },

  executePurge: async (policyId: string): Promise<DestructionCertificate> => {
    const policies = getStored(STORAGE_KEYS.POLICIES, INITIAL_PURGE_POLICIES)
    const policy = policies.find((p) => p.id === policyId) || policies[0]

    // Simulate cryptographic shredding latency
    await new Promise((r) => setTimeout(r, 1200))

    const recordsCount = Math.floor(Math.random() * 250) + 40
    const randomHex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const certNum = `CIVIQ-SHRED-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`

    const newCert: DestructionCertificate = {
      id: `cert_shred_${Date.now()}`,
      certificateNumber: certNum,
      purgePolicyName: policy.name,
      recordsCount,
      timestamp: new Date().toISOString(),
      shredMethod: 'NIST SP 800-88 Rev 1 Cryptographic Erasure & 3-Pass Overwrite',
      merkleRootHash: `0x${randomHex}`,
      officerSignature: 'SecOps-Compliance-HSM-0x8921 (Automated Verifier)',
    }

    // Save cert
    const certs = getStored(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES)
    setStored(STORAGE_KEYS.CERTIFICATES, [newCert, ...certs])

    // Update policy
    const updatedPolicies = policies.map((p) => {
      if (p.id === policy.id) {
        return {
          ...p,
          lastRunAt: new Date().toISOString(),
          nextScheduledAt: new Date(Date.now() + p.retentionDays * 24 * 60 * 60 * 1000).toISOString(),
          recordsPurgedTotal: p.recordsPurgedTotal + recordsCount,
        }
      }
      return p
    })
    setStored(STORAGE_KEYS.POLICIES, updatedPolicies)

    // Broadcast audit event
    realtimeBus.publish('NOTIFICATION_TRIGGERED' as any, {
      title: `Cryptographic Data Purge: ${policy.name}`,
      category: 'security',
      recordsCount,
      certificateNumber: certNum,
    })

    return newCert
  },
}
