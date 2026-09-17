import React, { useState, useEffect } from 'react'
import type { SupportedLanguage } from '@/types'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import { LanguageContext } from './contexts'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('civiqone_lang') as SupportedLanguage | null
    if (saved && ['en', 'te', 'ta', 'kn', 'ml'].includes(saved)) {
      return saved
    }
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('civiqone_lang', language)
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
  }

  const currentLanguageDetails =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguageDetails }}>
      {children}
    </LanguageContext.Provider>
  )
}
