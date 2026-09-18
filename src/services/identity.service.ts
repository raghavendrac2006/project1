import { civicStorage } from './storage'
import type { CitizenIdentity, VerificationRecord } from '@/types'

export const identityService = {
  async getIdentity(): Promise<CitizenIdentity> {
    await new Promise((resolve) => setTimeout(resolve, 250))
    return civicStorage.getIdentity()
  },

  async generateShareableToken(purpose: string): Promise<{ token: string; qrPayload: string; validUntil: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350))
    const validUntil = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const token = `SAMAGRA-TOK-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
    
    // Add verification record
    const identity = civicStorage.getIdentity()
    const newRecord: VerificationRecord = {
      id: `vh_${Date.now()}`,
      verifier: 'Citizen Self-Dispatched Token',
      department: purpose || 'Third-party KYC verification',
      timestamp: 'Just now',
      purpose: purpose || 'Temporary Identity Verification (15 mins)',
      status: 'authorized',
    }
    civicStorage.saveIdentity({
      ...identity,
      verificationHistory: [newRecord, ...identity.verificationHistory],
    })

    return {
      token,
      qrPayload: `SAMAGRA:SHARE:${token}:PURPOSE:${encodeURIComponent(purpose)}:EXP:${validUntil}`,
      validUntil,
    }
  },
}
