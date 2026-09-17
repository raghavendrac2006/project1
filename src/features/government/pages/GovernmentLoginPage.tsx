import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { governmentService } from '@/services/government.service'
import { ROUTES } from '@/constants/routes'
import { Landmark, Shield, Lock, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function GovernmentLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('rajiv.patel@transport.gov.in')
  const [password, setPassword] = useState('GovSecure#2026')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await governmentService.login(email)
      navigate(ROUTES.GOVERNMENT.DASHBOARD)
    } catch {
      setError('Invalid officer credentials or access token expired.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (officerEmail: string) => {
    setEmail(officerEmail)
    setLoading(true)
    setError(null)
    try {
      await governmentService.login(officerEmail)
      navigate(ROUTES.GOVERNMENT.DASHBOARD)
    } catch {
      setError('Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Official background decorative glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xl shadow-emerald-950/50 border border-emerald-500/30">
            <Landmark className="w-9 h-9" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-2">
            <Shield className="w-3.5 h-3.5" />
            Sovereign Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            CIVIQONE Government
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Authorized Public Sector & Departmental Officer Gateway
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official GOV Email / GovID
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer.name@department.gov.in"
                className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Officer Security Key / Passphrase
                </label>
                <span className="text-xs text-emerald-400 hover:underline cursor-pointer">
                  Hardware DSC?
                </span>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-xs text-emerald-300 flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                All session actions are cryptographically sealed and recorded on the National Sovereign Audit Ledger.
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 shadow-lg shadow-emerald-900/40"
            >
              {loading ? 'Authenticating Official...' : 'Sign In with Gov ID'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Test Officer Accounts for Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Quick Test Official Accounts
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('rajiv.patel@transport.gov.in')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all flex items-center justify-between text-xs group"
              >
                <div>
                  <span className="font-semibold text-slate-200 group-hover:text-emerald-300">
                    Joint Commissioner Rajiv Patel
                  </span>
                  <p className="text-slate-400">Transport & Motor Vehicles (COMMISSIONER)</p>
                </div>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sunita.desai@transport.gov.in')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all flex items-center justify-between text-xs group"
              >
                <div>
                  <span className="font-semibold text-slate-200 group-hover:text-emerald-300">
                    Inspector Sunita Desai
                  </span>
                  <p className="text-slate-400">Field Verification & eKYC (VERIFICATION_OFFICER)</p>
                </div>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Protected under Official Secrets Act & Cyber Defense Security Tier-IV
        </p>
      </div>
    </div>
  )
}
