import { civicStorage } from './storage'
import type { AuditEvent, WorkspaceType } from '@/types'

export const auditService = {
  async getEventsByWorkspace(workspace?: WorkspaceType): Promise<AuditEvent[]> {
    const all = civicStorage.getAuditEvents()
    if (!workspace) return all
    return all.filter((e) => e.workspace === workspace)
  },

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'> & { timestamp?: string }): Promise<void> {
    civicStorage.addAuditEvent(event)
  },
}
