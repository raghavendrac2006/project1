import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { governmentService } from '@/services/government.service'
import type { GovSessionData } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { Landmark, Loader2 } from 'lucide-react'

export function GovernmentGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    async function checkAuth() {
      const sess = await governmentService.getSession()
      setSession(sess)
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg mb-4 animate-pulse">
          <Landmark className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          Verifying public sector officer credentials...
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to={ROUTES.GOVERNMENT.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}
