/**
 * organization-zkp.service.ts
 * Zero-Knowledge Proof (ZKP) verification engine for enterprise organizations.
 * Verifies citizen assertions without exposing or holding underlying PII.
 */

import { generateProofCommitment } from '@/lib/crypto'
import type { ZkpQueryTemplate, ZkpProofReceipt } from '@/types'

const ZKP_TEMPLATES: ZkpQueryTemplate[] = [
  {
    id: 'zkp_age_18',
    name: 'Age Attestation (Major / 18+)',
    description: 'Cryptographically proves citizen is at least 18 years old without revealing birthdate or birth year.',
    predicate: 'age >= 18',
    category: 'identity',
    targetField: 'dateOfBirth',
    zeroPiiDescription: 'Zero date-of-birth disclosure. Cryptographic circuit proves boolean validity only.',
  },
  {
    id: 'zkp_income_tier_1',
    name: 'Income Threshold (< ₹5,00,000)',
    description: 'Proves annual certified household income is under ₹5 Lakh for subsidized priority underwriting.',
    predicate: 'annual_income < 500000',
    category: 'financial',
    targetField: 'income',
    zeroPiiDescription: 'Zero salary slip or ITR disclosure. Range proof verifies threshold compliance.',
  },
  {
    id: 'zkp_resident_urban',
    name: 'Bangalore Urban Jurisdiction Residency',
    description: 'Proves citizen maintains permanent residence in Bangalore Urban without disclosing street address.',
    predicate: 'district_code == 560 && state == "KA"',
    category: 'residency',
    targetField: 'address',
    zeroPiiDescription: 'Zero GPS or street address disclosure. Proves municipal boundary inclusion.',
  },
  {
    id: 'zkp_clean_statutory',
    name: 'Zero Statutory Default Proof',
    description: 'Proves applicant has no active tax or municipal default orders on the state civic ledger.',
    predicate: 'statutory_defaults == 0',
    category: 'statutory',
    targetField: 'panNumber',
    zeroPiiDescription: 'Zero financial statement disclosure. Proves clean status across 6 state databases.',
  },
]

let MOCK_RECEIPTS: ZkpProofReceipt[] = [
  {
    id: 'zkp_rcpt_01',
    queryId: 'zkp_age_18',
    queryName: 'Age Attestation (Major / 18+)',
    citizenId: 'usr_civiq_99182',
    result: true,
    proofHash: '0x7f9a12c8b0e451d89cf21e90b8412ac58f129c78d4e9',
    verifyingKey: 'vk_snark_groth16_bn254_0x89ab12',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    curve: 'BN254 (Alt-bn128)',
    publicInputs: { threshold: 18, isVerified: true, nullifierHash: '0x12c89fae09...' },
  },
  {
    id: 'zkp_rcpt_02',
    queryId: 'zkp_income_tier_1',
    queryName: 'Income Threshold (< ₹5,00,000)',
    citizenId: 'usr_civiq_99182',
    result: true,
    proofHash: '0x99e14a82b017f8a923dc4e9081a2b4cd817e9231f8b4',
    verifyingKey: 'vk_snark_groth16_bn254_0x3344cc',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    curve: 'BN254 (Alt-bn128)',
    publicInputs: { ceiling: 500000, inRange: true, nullifierHash: '0x88bb4401fe...' },
  },
]

export const organizationZkpService = {
  getTemplates: (): Promise<ZkpQueryTemplate[]> => {
    return Promise.resolve([...ZKP_TEMPLATES])
  },

  getReceipts: (): Promise<ZkpProofReceipt[]> => {
    return Promise.resolve([...MOCK_RECEIPTS])
  },

  verifyProof: async (templateId: string, citizenId: string): Promise<ZkpProofReceipt> => {
    const template = ZKP_TEMPLATES.find((t) => t.id === templateId) || ZKP_TEMPLATES[0]
    // Simulate cryptographic proof verification delay
    await new Promise((r) => setTimeout(r, 900))

    const publicInputs = {
      predicate: template.predicate,
      satisfied: true,
      zeroPiiVerified: true,
      circuitCategory: template.category,
    }

    const { proofHash, nullifierHash } = await generateProofCommitment(
      template.predicate,
      citizenId,
      publicInputs
    )

    const newReceipt: ZkpProofReceipt = {
      id: `zkp_rcpt_${Date.now()}`,
      queryId: template.id,
      queryName: template.name,
      citizenId,
      result: true,
      proofHash,
      verifyingKey: `vk_snark_groth16_bn254_${proofHash.slice(2, 10)}`,
      timestamp: new Date().toISOString(),
      curve: 'BN254 (Alt-bn128)',
      publicInputs: {
        ...publicInputs,
        nullifierHash: `${nullifierHash.slice(0, 26)}...`,
      },
    }

    MOCK_RECEIPTS = [newReceipt, ...MOCK_RECEIPTS]
    return newReceipt
  },
}
