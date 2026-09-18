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

    try {
      const res = await apiClient.get<any>(
        '/auth/me',
        async () => {
          const user = civicStorage.getUser()
          return { user, token }
        }
      )

      if (!res) return null
      if (res.user && res.token) return res as AuthSession

      const storedUser = civicStorage.getUser()
      const user: User = {
        id: res.id || storedUser?.id || 'usr_demo',
        name: res.full_name || storedUser?.name || 'Rajesh Sharma',
        email: res.email || storedUser?.email || 'rajesh.sharma@civicmail.gov.in',
        phone: res.phone || storedUser?.phone || '+91 98450 12345',
        nationalId: storedUser?.nationalId || 'CIV-2026-001001',
        isVerified: true,
        verificationLevel: storedUser?.verificationLevel || 3,
        role: (res.role?.toLowerCase() as any) || storedUser?.role || 'citizen',
        createdAt: res.created_at || storedUser?.createdAt || new Date().toISOString(),
      }
      civicStorage.saveUser(user)
      return { user, token }
    } catch {
      civicStorage.clearAuthToken()
      return null
    }
  },

  async login(data: LoginFormData): Promise<AuthSession> {
    const res = await apiClient.post<any>(
      '/auth/login',
      data,
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const user = civicStorage.getUser()
        const token = `civiqone_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        civicStorage.setAuthToken(token)
        return { user, token }
      }
    )

    const token = res.token || res.access_token
    let user = res.user

    if (!user && res.email) {
      const storedUser = civicStorage.getUser()
      user = {
        id: res.user_id || storedUser?.id || 'usr_demo',
        name: storedUser?.name || (res.email.includes('rajesh') ? 'Rajesh Sharma' : 'Raghavendra'),
        email: res.email,
        phone: storedUser?.phone || '+91 98450 12345',
        nationalId: storedUser?.nationalId || 'CIV-2026-001001',
        isVerified: true,
        verificationLevel: storedUser?.verificationLevel || 3,
        role: (res.role?.toLowerCase() as any) || 'citizen',
        createdAt: storedUser?.createdAt || new Date().toISOString(),
      }
    }

    if (token) {
      civicStorage.setAuthToken(token)
    }
    if (user) {
      civicStorage.saveUser(user)
    }

    return { user, token }
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
        const token = `civiqone_tok_verified_${Date.now()}`
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
