import { civicStorage } from './storage'
import type { CivicPayment } from '@/types'

export const paymentService = {
  async getPayments(): Promise<CivicPayment[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return civicStorage.getPayments()
  },

  async payDue(paymentId: string, method: string): Promise<CivicPayment> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const list = civicStorage.getPayments()
    const index = list.findIndex((p) => p.id === paymentId)
    if (index === -1) throw new Error('Payment record not found')

    const updated: CivicPayment = {
      ...list[index],
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
    }
    list[index] = updated
    civicStorage.savePayments(list)
    return updated
  },
}
