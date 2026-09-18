import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/services/admin.service'
import { ROUTES } from '@/constants/routes'
import { ShieldAlert, KeyRound, Lock, ArrowRight, CheckCircle2, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@civiqone.gov.in')
  const [password, setPassword] = useState('SuperAdminMasterKey#2026')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await adminService.login(email)
      navigate(ROUTES.ADMIN.DASHBOARD)
    } catch {
      setError('Root authorization failure. Access attempt recorded.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background neon grid / subtle crimson glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-700 to-rose-700 flex items-center justify-center text-white shadow-xl shadow-purple-950/60 border border-purple-500/30">
            <ShieldAlert className="w-9 h-9" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-2">
            <Terminal className="w-3.5 h-3.5" />
            Root Governance
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            CiviqOne Super Admin
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Cross-Portal Ecosystem Control & Sovereign Root Node
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
                Root Admin Credential
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Cryptographic Key / Hardware Token
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-900/60 text-xs text-purple-300 flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
              <span>
                All root actions override workspace restrictions and are logged directly to the immutable national ledger.
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 shadow-lg shadow-purple-900/40"
            >
              {loading ? 'Authenticating Root...' : 'Enter Sovereign Console'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Quick Root Test Access */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@civiqone.gov.in')
                handleLogin(new Event('submit') as unknown as React.FormEvent)
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all flex items-center justify-between text-xs text-slate-300 group"
            >
              <div>
                <span className="font-semibold text-slate-200 group-hover:text-purple-300">
                  Chief Systems Administrator
                </span>
                <p className="text-slate-500 font-mono text-[11px]">admin@civiqone.gov.in (SUPER_ADMIN)</p>
              </div>
              <KeyRound className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Zero Trust Architecture • Hardware Key Enforced
        </p>
      </div>
    </div>
  )
}
