import { useState, useEffect, useCallback } from 'react'

export type FontScale = 'normal' | 'large' | 'xlarge'

const STORAGE_FONT_SCALE_KEY = 'civiqone_font_scale_v1'
const STORAGE_HIGH_CONTRAST_KEY = 'civiqone_high_contrast_v1'

const SCALE_SIZES: Record<FontScale, string> = {
  normal: '16px',
  large: '18px',
  xlarge: '20px',
}

export function useAccessibility() {
  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    try {
      return (
        (localStorage.getItem(STORAGE_FONT_SCALE_KEY) as FontScale) ||
        (localStorage.getItem('civiqone_font_scale_v1') as FontScale) ||
        'normal'
      )
    } catch {
      return 'normal'
    }
  })

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_HIGH_CONTRAST_KEY) === 'true' ||
        localStorage.getItem('civiqone_high_contrast_v1') === 'true'
      )
    } catch {
      return false
    }
  })

  // Apply font-size to root html element
  useEffect(() => {
    try {
      document.documentElement.style.fontSize = SCALE_SIZES[fontScale] || '16px'
      localStorage.setItem(STORAGE_FONT_SCALE_KEY, fontScale)
    } catch {
      // ignore
    }
  }, [fontScale])

  // Apply high contrast class to root html element
  useEffect(() => {
    try {
      if (highContrast) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
      localStorage.setItem(STORAGE_HIGH_CONTRAST_KEY, String(highContrast))
    } catch {
      // ignore
    }
  }, [highContrast])

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleState(scale)
  }, [])

  const toggleHighContrast = useCallback(() => {
    setHighContrastState((prev) => !prev)
  }, [])

  const cycleFontScale = useCallback(() => {
    setFontScaleState((prev) => {
      if (prev === 'normal') return 'large'
      if (prev === 'large') return 'xlarge'
      return 'normal'
    })
  }, [])

  return {
    fontScale,
    setFontScale,
    cycleFontScale,
    highContrast,
    toggleHighContrast,
  }
}
