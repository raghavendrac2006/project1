import { apiClient } from './apiClient'
import { civicStorage } from './storage'
import type { AuditEvent, WorkspaceType } from '@/types'

export const auditService = {
  async getEventsByWorkspace(workspace?: WorkspaceType): Promise<AuditEvent[]> {
    return apiClient.get<any[]>(
      '/access-history',
      () => civicStorage.getAuditEvents() as any
    ).then((res) => {
      if (!Array.isArray(res)) return []
      const events: AuditEvent[] = res.map((l: any) => ({
        id: l.id,
        workspace: (workspace || 'citizen') as WorkspaceType,
        actor: l.institution_name || 'System',
        actorId: l.user_id || 'usr_sys',
        role: 'Authorized User',
        action: l.action || 'ACCESS_HISTORY',
        resource: l.domain_name || 'Personal Data',
        timestamp: l.timestamp || new Date().toISOString(),
        ipAddress: '127.0.0.1',
        status: l.result === 'DENIED' ? 'denied' : 'success',
        metadata: l.metadata_json || {}
      }))
      if (!workspace) return events
      return events.filter((e) => e.workspace === workspace)
    })
  },

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'> & { timestamp?: string }): Promise<void> {
    civicStorage.addAuditEvent(event)
  },
}
