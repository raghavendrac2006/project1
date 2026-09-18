import { apiClient } from './apiClient'
import { civicStorage } from './storage'
import type { CivicNotification, NotificationCategory } from '@/types'

function mapBackendNotification(n: any): CivicNotification {
  return {
    id: n.id,
    title: n.title || 'CivicOne Alert',
    message: n.message || '',
    category: 'security',
    priority: n.title?.toLowerCase().includes('revoked') ? 'high' : 'medium',
    isRead: Boolean(n.is_read),
    createdAt: n.created_at || new Date().toISOString()
  }
}

export const notificationService = {
  async getNotifications(category?: NotificationCategory | 'all'): Promise<CivicNotification[]> {
    return apiClient.get<any[]>(
      '/notifications',
      () => civicStorage.getNotifications() as any
    ).then((res) => {
      if (!Array.isArray(res)) return []
      let list = res.map(mapBackendNotification)
      if (category && category !== 'all') {
        list = list.filter((n) => n.category === category)
      }
      return list
    })
  },

  async markAsRead(id: string): Promise<CivicNotification> {
    await apiClient.patch(
      `/notifications/${id}/read`,
      {},
      () => {
        const list = civicStorage.getNotifications()
        const index = list.findIndex((n) => n.id === id)
        if (index !== -1) {
          list[index].isRead = true
          civicStorage.saveNotifications(list)
        }
      }
    )
    const list = await this.getNotifications()
    const match = list.find((n) => n.id === id)
    return match || {
      id,
      title: 'Notification',
      message: 'Marked as read',
      category: 'security',
      priority: 'low',
      isRead: true,
      createdAt: new Date().toISOString()
    }
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post(
      '/notifications/mark-all-read',
      {},
      () => {
        const list = civicStorage.getNotifications()
        const updated = list.map((n) => ({ ...n, isRead: true }))
        civicStorage.saveNotifications(updated)
      }
    )
  },

  async getUnreadCount(): Promise<number> {
    return apiClient.get<{ unread_count: number }>(
      '/notifications/unread-count',
      () => ({ unread_count: civicStorage.getNotifications().filter((n) => !n.isRead).length })
    ).then((res) => (typeof res?.unread_count === 'number' ? res.unread_count : 0))
  },
}
