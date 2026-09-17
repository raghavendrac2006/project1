import { civicStorage } from './storage'
import type { User, UserSettings } from '@/types'
import type { ProfileUpdateFormData } from '@/schemas'

export const userService = {
  async getProfile(): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return civicStorage.getUser()
  },

  async updateProfile(data: ProfileUpdateFormData): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const current = civicStorage.getUser()
    const updated: User = {
      ...current,
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
    }
    civicStorage.saveUser(updated)
    return updated
  },

  async getSettings(): Promise<UserSettings> {
    return civicStorage.getSettings()
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const current = civicStorage.getSettings()
    const updated: UserSettings = {
      ...current,
      ...settings,
      account: { ...current.account, ...(settings.account || {}) },
      privacy: { ...current.privacy, ...(settings.privacy || {}) },
      notifications: { ...current.notifications, ...(settings.notifications || {}) },
      appearance: { ...current.appearance, ...(settings.appearance || {}) },
    }
    civicStorage.saveSettings(updated)
    return updated
  },
}
