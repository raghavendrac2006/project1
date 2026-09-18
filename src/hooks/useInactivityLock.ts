import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes
const STORAGE_LOCK_KEY = 'civiqone_session_locked_v1'

interface UseInactivityLockOptions {
  timeoutMs?: number
  enabled?: boolean
}

export function useInactivityLock({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  enabled = true,
}: UseInactivityLockOptions = {}) {
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      return (sessionStorage.getItem(STORAGE_LOCK_KEY) || sessionStorage.getItem('civiqone_session_locked_v1')) === 'true'
    } catch {
      return false
    }
  })

  const timerRef = useRef<number | null>(null)

  const lockSession = useCallback(() => {
    setIsLocked(true)
    try {
      sessionStorage.setItem(STORAGE_LOCK_KEY, 'true')
    } catch {
      // ignore
    }
  }, [])

  const unlockSession = useCallback(() => {
    setIsLocked(false)
    try {
      sessionStorage.removeItem(STORAGE_LOCK_KEY)
    } catch {
      // ignore
    }
    resetTimer()
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    if (enabled && !isLocked) {
      timerRef.current = window.setTimeout(() => {
        lockSession()
      }, timeoutMs)
    }
  }, [enabled, isLocked, lockSession, timeoutMs])

  useEffect(() => {
    if (!enabled || isLocked) return

    const handleActivity = () => {
      resetTimer()
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }))

    resetTimer()

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      events.forEach((ev) => window.removeEventListener(ev, handleActivity))
    }
  }, [enabled, isLocked, resetTimer])

  return {
    isLocked,
    lockSession,
    unlockSession,
    resetTimer,
  }
}
