import { apiClient } from './apiClient'
import { civicStorage } from './storage'
import type { ConsentRequest, AccessGrant, AccessHistoryItem, ConsentField } from '@/types'

function mapBackendRequest(req: any): ConsentRequest {
  return {
    id: req.id,
    organizationId: req.institution_id || 'inst_bank',
    organizationName: req.institution_name || 'HDFC Bank Ltd.',
    purpose: req.purpose || 'Verification',
    requestedFields: req.requested_fields || ['full_name'],
    approvedFields: req.requested_fields || ['full_name'],
    requestedDocuments: [],
    approvedDocuments: [],
    durationDays: Number(req.duration_days) || 30,
    status: (req.status?.toLowerCase() as any) || 'pending',
    requestedAt: req.created_at || new Date().toISOString(),
    expiresAt: req.expires_at || undefined,
    citizenId: req.citizen_id || 'usr_demo',
    citizenName: 'Raghavendra'
  }
}

function mapBackendGrant(g: any): AccessGrant {
  return {
    id: g.id,
    organizationId: g.institution_id || 'inst_bank',
    organizationName: g.institution_name || 'HDFC Bank Ltd.',
    serviceName: g.domain_name || 'Finance Records',
    citizenId: g.citizen_id || 'usr_demo',
    citizenName: 'Raghavendra',
    purpose: g.purpose || 'Verification',
    authorizedFields: g.approved_fields || [],
    authorizedDocuments: [],
    grantedAt: g.granted_at || new Date().toISOString(),
    expiresAt: g.expires_at || new Date().toISOString(),
    status: (g.status?.toLowerCase() as any) || 'active'
  }
}

export const consentService = {
  async getConsentRequests(): Promise<ConsentRequest[]> {
    return apiClient.get<any[]>(
      '/access-requests',
      () => civicStorage.getConsentRequests() as any
    ).then((res) => (Array.isArray(res) ? res.map(mapBackendRequest) : []))
  },

  async getPendingRequests(): Promise<ConsentRequest[]> {
    const all = await this.getConsentRequests()
    return all.filter((r) => r.status === 'pending')
  },

  async getActiveGrants(): Promise<AccessGrant[]> {
    return apiClient.get<any[]>(
      '/active-access',
      () => civicStorage.getAccessGrants() as any
    ).then((res) => (Array.isArray(res) ? res.map(mapBackendGrant) : []))
  },

  async getExpiringGrants(): Promise<AccessGrant[]> {
    const all = await this.getActiveGrants()
    return all.filter((g) => g.status === 'expiring_soon' || g.status === 'active')
  },

  async getRevokedGrants(): Promise<AccessGrant[]> {
    const all = await this.getActiveGrants()
    return all.filter((g) => g.status === 'revoked')
  },

  async getAccessHistory(): Promise<AccessHistoryItem[]> {
    return apiClient.get<any[]>(
      '/access-history',
      () => civicStorage.getAccessHistory() as any
    ).then((res) => (Array.isArray(res) ? res.map((l: any) => ({
      id: l.id,
      actor: l.institution_name || 'System',
      actorRole: 'Institution User',
      organizationName: l.institution_name || 'CivicOne Network',
      action: (l.action?.toLowerCase() as any) || 'viewed_authorized_data',
      resource: l.domain_name || 'Personal Data',
      timestamp: l.timestamp || new Date().toISOString(),
      details: l.purpose || 'Data access request'
    })) : []))
  },

  async approveRequest(
    requestId: string,
    approvedFields: ConsentField[],
    approvedDocuments: string[] = []
  ): Promise<ConsentRequest | undefined> {
    const res = await apiClient.post<any>(
      `/access-requests/${requestId}/approve`,
      { duration_days: 30 },
      () => civicStorage.approveConsentRequest(requestId, approvedFields, approvedDocuments) as any
    )
    return res ? mapBackendRequest(res) : undefined
  },

  async denyRequest(requestId: string): Promise<ConsentRequest | undefined> {
    const res = await apiClient.post<any>(
      `/access-requests/${requestId}/deny`,
      {},
      () => civicStorage.denyConsentRequest(requestId) as any
    )
    return res ? mapBackendRequest(res) : undefined
  },

  async revokeGrant(grantId: string): Promise<AccessGrant | undefined> {
    const res = await apiClient.post<any>(
      `/active-access/${grantId}/revoke`,
      {},
      () => civicStorage.revokeAccessGrant(grantId) as any
    )
    return res ? mapBackendGrant(res) : undefined
  },

  async checkFieldAuthorization(
    organizationId: string,
    citizenId: string,
    field: ConsentField
  ): Promise<'authorized' | 'not_authorized' | 'revoked'> {
    const grants = await this.getActiveGrants()
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
