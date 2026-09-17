import React, { useState, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { governmentService } from '@/services/government.service'
import { civicStorage, type GovSessionData, type OrgSessionData } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { Landmark, Loader2, ShieldAlert, ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function GovernmentGuard({ children }: { children: React.ReactNode }) {
  const [govSession, setGovSession] = useState<GovSessionData | null>(null)
  const [orgSession, setOrgSession] = useState<OrgSessionData | null>(null)
  const [isCitizen, setIsCitizen] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const gov = await governmentService.getSession()
      const org = civicStorage.getOrgSession()
      const token = civicStorage.getAuthToken()
      setGovSession(gov)
      setOrgSession(org)
      setIsCitizen(!!token)
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg mb-4 animate-pulse">
          <Landmark className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          Verifying public sector officer credentials...
        </div>
      </div>
    )
  }

  // RULE: Organizations do NOT have access to the Government Secretariat
  if (!govSession && orgSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Landmark className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
              Statutory Boundary Enforced
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight pt-1">
              Secretariat Access Denied
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are currently authenticated as an Enterprise Organization member (<strong className="text-white">{orgSession.member.name}</strong> · <strong className="text-emerald-400">{orgSession.organization.name}</strong>).
              Private corporations do not possess statutory sovereign authority to enter the Government Secretariat.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Constitutional Safeguard:
            </div>
            <p>
              Government gazette authority, departmental case files, and civil verification desks are strictly reserved for verified civil servants under the Allocation of Business Rules.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              onClick={() => navigate(ROUTES.ORGANIZATION.DASHBOARD)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Organization
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.GOVERNMENT.LOGIN)}
              className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs h-10"
            >
              Official Sign-In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // RULE: Citizens do NOT have access to the Government Secretariat
  if (!govSession && isCitizen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-800/60">
              Official Secrets Act Clearance Required
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight pt-1">
              Civil Servant Portal Restricted
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are signed in with a Sovereign Citizen Account. The Government Secretariat is strictly restricted to designated civil servants and department commissioners.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              Citizen Rights Note:
            </div>
            <p>
              As a citizen, you can apply for government schemes, track statutory status, and manage identity cards directly from your sovereign Citizen Portal.
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
              onClick={() => navigate(ROUTES.GOVERNMENT.LOGIN)}
              className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs h-10"
            >
              Officer Sign-In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated as Government Official
  if (!govSession) {
    return <Navigate to={ROUTES.GOVERNMENT.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}
