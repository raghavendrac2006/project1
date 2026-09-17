import { civicStorage } from './storage'
import type { ConsentRequest, AccessGrant, AccessHistoryItem, ConsentField } from '@/types'

export const consentService = {
  async getConsentRequests(): Promise<ConsentRequest[]> {
    return civicStorage.getConsentRequests()
  },

  async getPendingRequests(): Promise<ConsentRequest[]> {
    const all = civicStorage.getConsentRequests()
    return all.filter((r) => r.status === 'pending')
  },

  async getActiveGrants(): Promise<AccessGrant[]> {
    const all = civicStorage.getAccessGrants()
    return all.filter((g) => g.status === 'active' || g.status === 'expiring_soon')
  },

  async getExpiringGrants(): Promise<AccessGrant[]> {
    const all = civicStorage.getAccessGrants()
    return all.filter((g) => g.status === 'expiring_soon')
  },

  async getRevokedGrants(): Promise<AccessGrant[]> {
    const all = civicStorage.getAccessGrants()
    return all.filter((g) => g.status === 'revoked')
  },

  async getAccessHistory(): Promise<AccessHistoryItem[]> {
    return civicStorage.getAccessHistory()
  },

  async approveRequest(
    requestId: string,
    approvedFields: ConsentField[],
    approvedDocuments: string[] = []
  ): Promise<ConsentRequest | undefined> {
    return civicStorage.approveConsentRequest(requestId, approvedFields, approvedDocuments)
  },

  async denyRequest(requestId: string): Promise<ConsentRequest | undefined> {
    return civicStorage.denyConsentRequest(requestId)
  },

  async revokeGrant(grantId: string): Promise<AccessGrant | undefined> {
    return civicStorage.revokeAccessGrant(grantId)
  },

  async checkFieldAuthorization(
    organizationId: string,
    citizenId: string,
    field: ConsentField
  ): Promise<'authorized' | 'not_authorized' | 'revoked'> {
    const grants = civicStorage.getAccessGrants()
    const matchingGrant = grants.find(
      (g) => g.organizationId === organizationId && g.citizenId === citizenId
    )

    if (!matchingGrant) return 'not_authorized'
    if (matchingGrant.status === 'revoked' || matchingGrant.status === 'expired') return 'revoked'
    if (matchingGrant.authorizedFields.includes(field)) return 'authorized'
    return 'not_authorized'
  },

  async emergencyLockdown(): Promise<number> {
    return civicStorage.privacyLockdown()
  },
}
