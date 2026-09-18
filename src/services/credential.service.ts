import { civicStorage } from './storage'
import { realtimeBus } from './eventBus'
import type { CivicCredential } from '@/types'

export interface GeneratedProof {
  proofId: string
  credentialId: string
  title: string
  zkpHash: string
  qrPayload: string
  validUntil: string
  recipient: string
  purpose: string
  disclosedAttributes: Record<string, string | number | boolean>
}

export const credentialService = {
  async getCredentials(): Promise<CivicCredential[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return civicStorage.getCredentials()
  },

  async getCredentialById(id: string): Promise<CivicCredential | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const list = civicStorage.getCredentials()
    return list.find((c) => c.id === id)
  },

  async generateVerifiableProof(
    credentialId: string,
    selectedFields: string[],
    purpose: string,
    recipient: string
  ): Promise<GeneratedProof> {
    await new Promise((resolve) => setTimeout(resolve, 350))
    const creds = civicStorage.getCredentials()
    const cred = creds.find((c) => c.id === credentialId)
    if (!cred) throw new Error('Credential not found')

    const proofId = `ZKP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const zkpHash = `0xzkp_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`
    const expires = new Date(Date.now() + 30 * 60 * 1000)
    const validUntil = expires.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const disclosedAttributes: Record<string, string | number | boolean> = {}
    selectedFields.forEach((field) => {
      if (cred.attributes[field] !== undefined) {
        disclosedAttributes[field] = cred.attributes[field]
      }
    })

    // Update credential's lastSharedWith and lastUsedAt
    const updated = creds.map((c) =>
      c.id === credentialId
        ? {
            ...c,
            lastSharedWith: recipient,
            lastUsedAt: new Date().toISOString(),
          }
        : c
    )
    civicStorage.saveCredentials(updated)

    // Emit event and add audit entry
    realtimeBus.emit('CREDENTIAL_PROOF_GENERATED', { credentialId, proofId, recipient })
    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: 'Rajesh K. Sharma',
      actorId: 'usr_samagra_99182',
      role: 'CITIZEN',
      action: 'GENERATED_VERIFIABLE_PROOF',
      resource: `${cred.title} (#${cred.credentialNumber})`,
      ipAddress: '14.139.128.9',
      status: 'success',
      metadata: { recipient, purpose, proofId },
    })

    return {
      proofId,
      credentialId,
      title: cred.title,
      zkpHash,
      qrPayload: `SAMAGRA:ZKP:${proofId}:HASH:${zkpHash}:EXP:${expires.toISOString()}`,
      validUntil,
      recipient,
      purpose,
      disclosedAttributes,
    }
  },

  async verifyCredential(credentialId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const creds = civicStorage.getCredentials()
    const updated = creds.map((c) =>
      c.id === credentialId
        ? {
            ...c,
            lastVerifiedAt: new Date().toISOString(),
            isVerified: true,
          }
        : c
    )
    civicStorage.saveCredentials(updated)
    return true
  },
}
