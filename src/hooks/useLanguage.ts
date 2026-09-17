import { useContext } from 'react'
import { LanguageContext, type LanguageContextType } from '@/app/providers/contexts'

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
