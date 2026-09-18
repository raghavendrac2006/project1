import { civicStorage } from './storage'
import { apiClient } from './apiClient'
import type { LoginFormData, RegisterFormData } from '@/schemas'
import type { User } from '@/types'

export interface AuthSession {
  user: User
  token: string
}

function mapBackendUser(res: any, storedUser?: User | null): User {
  const isCitizen = !res.role || res.role.toUpperCase() === 'CITIZEN'
  return {
    id: res.id || res.user_id || storedUser?.id || 'usr_demo',
    name: res.full_name || res.name || storedUser?.name || (isCitizen ? 'Raghavendra' : 'Loan Officer'),
    email: res.email || storedUser?.email || '',
    phone: res.phone || storedUser?.phone || '+91 98450 12345',
    avatar: storedUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    nationalId: res.civic_one_id || storedUser?.nationalId || 'CIV-2026-004281',
    verificationLevel: storedUser?.verificationLevel || 'Level 3 - Biometric Sovereign',
    state: storedUser?.state || 'Karnataka',
    city: storedUser?.city || 'Bengaluru',
    pincode: storedUser?.pincode || '560001',
    memberSince: res.created_at || storedUser?.memberSince || '2026-01-15',
    securityScore: storedUser?.securityScore || 98
  }
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
      const storedUser = civicStorage.getUser()
      const user = mapBackendUser(res, storedUser)
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
      { username: data.email, password: data.password },
      async () => {
        const user = civicStorage.getUser()
        const token = `civiqone_tok_${Date.now()}`
        civicStorage.setAuthToken(token)
        return { user, token }
      }
    )

    const token = res.access_token || res.token
    if (token) {
      civicStorage.setAuthToken(token)
    }

    // Now fetch real user details using the token
    let user: User
    try {
      const meRes = await apiClient.get<any>('/auth/me')
      user = mapBackendUser(meRes, civicStorage.getUser())
    } catch {
      user = mapBackendUser(res, civicStorage.getUser())
    }

    civicStorage.saveUser(user)
    return { user, token: token || civicStorage.getAuthToken() || '' }
  },

  async register(data: RegisterFormData): Promise<{ pendingVerification: boolean; phone: string }> {
    return apiClient.post<{ pendingVerification: boolean; phone: string }>(
      '/auth/register',
      data,
      async () => {
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
