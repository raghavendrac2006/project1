import { civicStorage } from './storage'
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
    const user = civicStorage.getUser()
    return { user, token }
  },

  async login(_data: LoginFormData): Promise<AuthSession> {
    // Simulated auth check
    await new Promise((resolve) => setTimeout(resolve, 400))
    const user = civicStorage.getUser()
    const token = `civiq_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    civicStorage.setAuthToken(token)
    return { user, token }
  },

  async register(data: RegisterFormData): Promise<{ pendingVerification: boolean; phone: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500))
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
  },

  async verifyOtp(otp: string): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    if (otp !== '123456' && !/^\d{6}$/.test(otp)) {
      throw new Error('Invalid OTP. Use test OTP 123456 or any 6-digit number.')
    }
    const user = civicStorage.getUser()
    const token = `civiq_tok_verified_${Date.now()}`
    civicStorage.setAuthToken(token)
    return { user, token }
  },

  async resendOtp(identifier: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      success: true,
      message: `A new 6-digit security code was dispatched to ${identifier}.`,
    }
  },

  async recoverPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
      success: true,
      message: `Password recovery instructions dispatched to ${identifier}.`,
    }
  },

  async logout(): Promise<void> {
    civicStorage.clearAuthToken()
  },
}
