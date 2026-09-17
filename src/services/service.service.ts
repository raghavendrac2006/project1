import { civicStorage } from './storage'
import type { CivicService, ServiceCategory } from '@/types'

export const civicServiceApi = {
  async getServices(params?: {
    category?: ServiceCategory
    providerType?: 'all' | 'government' | 'organization'
    query?: string
    onlyRecommended?: boolean
  }): Promise<CivicService[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    let list = civicStorage.getAllMarketplaceServices()

    if (params?.providerType && params.providerType !== 'all') {
      list = list.filter((s) => s.providerType === params.providerType)
    }

    if (params?.category && params.category !== 'all') {
      list = list.filter((s) => s.category === params.category)
    }

    if (params?.onlyRecommended) {
      list = list.filter((s) => s.recommended || s.popular)
    }

    if (params?.query && params.query.trim() !== '') {
      const q = params.query.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          (s.providerName && s.providerName.toLowerCase().includes(q)) ||
          s.description.toLowerCase().includes(q)
      )
    }

    return list
  },

  async getServiceById(id: string): Promise<CivicService | undefined> {
    const list = civicStorage.getAllMarketplaceServices()
    return list.find((s) => s.id === id || s.slug === id)
  },
}
