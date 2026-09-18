import { civicStorage } from './storage'
import { apiClient } from './apiClient'
import type { LoginFormData, RegisterFormData } from '@/schemas'
import type { User } from '@/types'

export interface AuthSession {
  user: User
  token: string
}

export const authService = {
  async getSession(): Promise<AuthSession | null> {
    const token = civicStorage.getAuthToken()
    if (!token) return null
    
    return apiClient.get<AuthSession>(
      '/auth/me',
      async () => {
        const user = civicStorage.getUser()
        return { user, token }
      }
    )
  },

  async login(data: LoginFormData): Promise<AuthSession> {
    return apiClient.post<AuthSession>(
      '/auth/login',
      data,
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const user = civicStorage.getUser()
        const token = `civiq_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        civicStorage.setAuthToken(token)
        return { user, token }
      }
    )
  },

  async register(data: RegisterFormData): Promise<{ pendingVerification: boolean; phone: string }> {
    return apiClient.post<{ pendingVerification: boolean; phone: string }>(
      '/auth/register',
      data,
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const existingUser = civicStorage.getUser()
        const updatedUser: User = {
          ...existingUser,
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          nationalId: data.nationalId,
        }
        civicStorage.saveUser(updatedUser)
        return { pendingVerification: true, phone: data.phone }
      }
    )
  },

  async verifyOtp(otp: string): Promise<AuthSession> {
    return apiClient.post<AuthSession>(
      '/auth/verify-otp',
      { otp },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        if (otp !== '123456' && !/^\d{6}$/.test(otp)) {
          throw new Error('Invalid OTP. Use test OTP 123456 or any 6-digit number.')
        }
        const user = civicStorage.getUser()
        const token = `civiq_tok_verified_${Date.now()}`
        civicStorage.setAuthToken(token)
        return { user, token }
      }
    )
  },

  async resendOtp(identifier: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/auth/resend-otp',
      { identifier },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return {
          success: true,
          message: `A new 6-digit security code was dispatched to ${identifier}.`,
        }
      }
    )
  },

  async recoverPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/auth/recover-password',
      { identifier },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return {
          success: true,
          message: `Password recovery instructions dispatched to ${identifier}.`,
        }
      }
    )
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Ignore logout backend errors
    } finally {
      civicStorage.clearAuthToken()
    }
  },
}
