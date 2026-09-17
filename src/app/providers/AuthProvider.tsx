import React, { useState, useEffect } from 'react'
import { authService, type AuthSession } from '@/services/auth.service'
import type { User } from '@/types'
import type { LoginFormData, RegisterFormData } from '@/schemas'
import { AuthContext } from './contexts'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      try {
        const session = await authService.getSession()
        if (session) {
          setUser(session.user)
          setToken(session.token)
        }
      } catch (err) {
        console.error('Failed initializing auth session:', err)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (data: LoginFormData): Promise<AuthSession> => {
    setIsLoading(true)
    try {
      const session = await authService.login(data)
      setUser(session.user)
      setToken(session.token)
      return session
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterFormData) => {
    return authService.register(data)
  }

  const verifyOtp = async (otp: string): Promise<AuthSession> => {
    setIsLoading(true)
    try {
      const session = await authService.verifyOtp(otp)
      setUser(session.user)
      setToken(session.token)
      return session
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setToken(null)
  }

  const refreshUser = async () => {
    const session = await authService.getSession()
    if (session) {
      setUser(session.user)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
