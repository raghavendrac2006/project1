import React, { useState, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { organizationService } from '@/services/organization.service'
import { civicStorage, type OrgSessionData, type GovSessionData } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { Building2, Loader2, ShieldAlert, ArrowLeft, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function OrganizationGuard({ children }: { children: React.ReactNode }) {
  const [orgSession, setOrgSession] = useState<OrgSessionData | null>(null)
  const [govSession, setGovSession] = useState<GovSessionData | null>(null)
  const [isCitizen, setIsCitizen] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const org = await organizationService.getSession()
      const gov = civicStorage.getGovSession()
      const token = civicStorage.getAuthToken()
      setOrgSession(org)
      setGovSession(gov)
      setIsCitizen(!!token)
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg mb-4 animate-pulse">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          Verifying enterprise organization credentials...
        </div>
      </div>
    )
  }

  // RULE: Government Officials do NOT have access to private Organization operational workspaces
  if (!orgSession && govSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
              Separation of Powers Enforced
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight pt-1">
              Government Access Restricted
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are currently authenticated as <strong className="text-white">{govSession.official.name}</strong> under <strong className="text-emerald-400">{govSession.department.code}</strong>.
              Government officials do not possess administrative access to private enterprise operational workspaces.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Sovereign Separation Mandate:
            </div>
            <p>
              Corporate data, customer claims, and B2B webhooks are strictly firewalled from state administrative oversight without a court subpoena.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              onClick={() => navigate(ROUTES.GOVERNMENT.DASHBOARD)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Secretariat
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ORGANIZATION.LOGIN)}
              className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs h-10"
            >
              Org Sign-In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // RULE: Citizens do NOT have access to the Organization Portal
  if (!orgSession && isCitizen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800/60">
              Enterprise Portal Restricted
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight pt-1">
              Organization Account Required
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are currently signed in with a Sovereign Citizen Account. The Organization Gateway is restricted to verified enterprise partners, insurers, and institutional service providers.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Citizen Privacy Protection:
            </div>
            <p>
              Your citizen credentials remain safely in your personal vault. Organizations must request explicit consent to access any of your information.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              onClick={() => navigate(ROUTES.APP.DASHBOARD)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Return to Citizen Portal
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ORGANIZATION.LOGIN)}
              className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs h-10"
            >
              Org Sign-In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in to Organization
  if (!orgSession) {
    return <Navigate to={ROUTES.ORGANIZATION.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}
