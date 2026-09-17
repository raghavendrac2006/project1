import { civicStorage } from './storage'
import { realtimeBus } from './eventBus'
import type { CitizenActionItem } from '@/types'

export const actionService = {
  async getActions(): Promise<CitizenActionItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return civicStorage.getActions()
  },

  async getActionById(id: string): Promise<CitizenActionItem | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const list = civicStorage.getActions()
    return list.find((a) => a.id === id)
  },

  async completeAction(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    civicStorage.completeAction(id)
    realtimeBus.emit('CITIZEN_ACTION_COMPLETED', { actionId: id })
  },

  async getPendingCount(): Promise<number> {
    const list = civicStorage.getActions()
    return list.filter((a) => !a.isCompleted).length
  },
}
