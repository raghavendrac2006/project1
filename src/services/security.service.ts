import { civicStorage } from './storage'
import { realtimeBus } from './eventBus'
import type { TrustedDevice, UserSession, AuditEvent } from '@/types'

export const securityService = {
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return civicStorage.getTrustedDevices()
  },

  async removeTrustedDevice(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const devices = civicStorage.getTrustedDevices()
    const target = devices.find((d) => d.id === id)
    civicStorage.removeTrustedDevice(id)

    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: 'Rajesh K. Sharma',
      actorId: 'usr_civiq_99182',
      role: 'CITIZEN',
      action: 'REMOVED_TRUSTED_DEVICE',
      resource: target ? target.deviceName : `Device #${id}`,
      ipAddress: '14.139.128.9',
      status: 'success',
    })

    realtimeBus.emit('DEVICE_REMOVED', { deviceId: id })
  },

  async getUserSessions(): Promise<UserSession[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return civicStorage.getUserSessions()
  },

  async revokeSession(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    civicStorage.revokeUserSession(id)

    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: 'Rajesh K. Sharma',
      actorId: 'usr_civiq_99182',
      role: 'CITIZEN',
      action: 'REVOKED_ACTIVE_SESSION',
      resource: `Session #${id}`,
      ipAddress: '14.139.128.9',
      status: 'warning',
    })

    realtimeBus.emit('SESSION_REVOKED', { sessionId: id })
  },

  async revokeAllOtherSessions(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const sessions = civicStorage.getUserSessions()
    let revokedCount = 0
    const updated = sessions.map((s) => {
      if (!s.isCurrentSession && s.status === 'active') {
        revokedCount++
        return { ...s, status: 'revoked' as const }
      }
      return s
    })
    localStorage.setItem('civiqone_user_sessions_v1', JSON.stringify(updated))

    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: 'Rajesh K. Sharma',
      actorId: 'usr_civiq_99182',
      role: 'CITIZEN',
      action: 'REVOKED_ALL_REMOTE_SESSIONS',
      resource: `${revokedCount} Remote Sessions Terminated`,
      ipAddress: '14.139.128.9',
      status: 'warning',
    })

    realtimeBus.emit('ALL_REMOTE_SESSIONS_REVOKED', { count: revokedCount })
    return revokedCount
  },

  async getSecurityAuditEvents(): Promise<AuditEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const events = civicStorage.getAuditEvents()
    return events.filter((e) => e.workspace === 'citizen')
  },
}
