import { useState, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { civicStorage, type GovSessionData, type OrgSessionData } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { Shield, Loader2, Lock, ArrowLeft, ArrowRight, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const [govSession, setGovSession] = useState<GovSessionData | null>(null)
  const [orgSession, setOrgSession] = useState<OrgSessionData | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setGovSession(civicStorage.getGovSession())
    setOrgSession(civicStorage.getOrgSession())
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow mb-4 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Verifying citizen security credentials...
        </div>
      </div>
    )
  }

  // RULE: Organizations CANNOT directly access Citizen Vault without explicit consent
  if (!isAuthenticated && orgSession && !govSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800/60">
              DPDP Act 2023 Consent Wall
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight pt-1">
              Direct Citizen Access Prohibited
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are logged in as an Organization member (<strong className="text-white">{orgSession.member.name}</strong> · <strong className="text-emerald-400">{orgSession.organization.name}</strong>).
              Organizations cannot browse private citizen vaults directly. You must request purpose-bounded data consent from the citizen.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              Statutory Consent Protocol:
            </div>
            <p>
              Citizens hold sovereign ownership of their credentials. When an access request is approved by the citizen, authorized fields will appear in your Organization Directory.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              onClick={() => navigate(ROUTES.ORGANIZATION.ACCESS_REQUESTS)}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs h-10"
            >
              Dispatch Consent Request <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ORGANIZATION.DASHBOARD)}
              className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs h-10"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Org
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // RULE: Government Officials HAVE statutory oversight access on Citizens
  if (!isAuthenticated && govSession) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-50 bg-amber-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            <span>
              Official Government Statutory Oversight Session · {govSession.department.name} ({govSession.department.code})
            </span>
          </div>
          <button
            onClick={() => navigate(ROUTES.GOVERNMENT.DASHBOARD)}
            className="text-[11px] bg-amber-700 hover:bg-amber-800 px-2 py-0.5 rounded font-mono"
          >
            Return to Secretariat Desk →
          </button>
        </div>
        {children}
      </div>
    )
  }

  // Standard citizen authentication check
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}
