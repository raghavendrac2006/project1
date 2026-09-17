import { civicStorage } from './storage'
import type { CivicNotification, NotificationCategory } from '@/types'

export const notificationService = {
  async getNotifications(category?: NotificationCategory | 'all'): Promise<CivicNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    let list = civicStorage.getNotifications()
    if (category && category !== 'all') {
      list = list.filter((n) => n.category === category)
    }
    return list
  },

  async markAsRead(id: string): Promise<CivicNotification> {
    const list = civicStorage.getNotifications()
    const index = list.findIndex((n) => n.id === id)
    if (index === -1) throw new Error('Notification not found')
    list[index].isRead = true
    civicStorage.saveNotifications(list)
    return list[index]
  },

  async markAllAsRead(): Promise<void> {
    const list = civicStorage.getNotifications()
    const updated = list.map((n) => ({ ...n, isRead: true }))
    civicStorage.saveNotifications(updated)
  },

  async getUnreadCount(): Promise<number> {
    const list = civicStorage.getNotifications()
    return list.filter((n) => !n.isRead).length
  },
}
