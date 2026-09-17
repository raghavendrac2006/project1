import { createContext } from 'react'
import type { SupportedLanguage, User } from '@/types'
import type { LanguageOption } from '@/constants/languages'
import type { LoginFormData, RegisterFormData } from '@/schemas'
import type { AuthSession } from '@/services/auth.service'

// Language Context
export interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  currentLanguageDetails: LanguageOption
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Toast Context
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
}

export interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Theme Context
export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Auth Context
export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginFormData) => Promise<AuthSession>
  register: (data: RegisterFormData) => Promise<{ pendingVerification: boolean; phone: string }>
  verifyOtp: (otp: string) => Promise<AuthSession>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
