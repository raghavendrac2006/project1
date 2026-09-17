import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Key,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  Scale,
  Briefcase,
  Sun,
  Moon,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { organizationService } from '@/services/organization.service'
import { ROUTES } from '@/constants/routes'
import { useToast, useTheme } from '@/hooks'

export function OrganizationLoginPage() {
  const [email, setEmail] = useState('sarah.officer@apexhealth.org')
  const [password, setPassword] = useState('Partner@123')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await organizationService.login(email)
      toast({
        title: 'Organization Workspace Authenticated',
        description: 'Welcome back. Authorized role session active.',
        type: 'success',
      })
      navigate(ROUTES.ORGANIZATION.DASHBOARD)
    } catch {
      toast({
        title: 'Authentication Error',
        description: 'Invalid organization member credentials.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Partner@123')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md border border-emerald-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-display">
                CIVIQ<span className="text-emerald-600 dark:text-emerald-400">ORG</span> Gateway
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 font-semibold">
                Enterprise B2B Partner Portal
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Verified Civic Service Providers, Insurers & Financial Institutions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            DPDP Act 2023 Compliant Gateway
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <Link
            to={ROUTES.ROOT}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Return to Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content: Split Layout */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
        
        {/* Left: Enterprise Partner Value & Consent Architecture */}
        <div className="flex-1 space-y-6 max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider shadow-xs">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Institutional Data Governance
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-display">
              Enterprise Partner Gateway <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                Consent-Driven Civic Access
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Authenticate into your organization&apos;s isolated operational workspace. Manage published civic programs, verify citizen applications, and dispatch purpose-bounded data consent requests directly to citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Citizen Consent Mandate</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                No direct PII access. Organizations must dispatch consent requests that citizens independently authorize or deny.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Zero-Knowledge Verification</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Cryptographically verify citizen eligibility claims with zero raw data exposure using Groth16 zk-SNARK circuits.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-700 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Sovereign Portal Isolation</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Independent corporate domain. Organizations have zero statutory access to the sovereign Government Secretariat.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-700 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Immutable Audit Receipts</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Every data access transaction generates a signed SHA-256 audit receipt verifiable by regulatory authorities.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>DPDP Act 2023 & ISO 27001 Certified • Corporate Role-Based Access Control</span>
          </div>
        </div>

        {/* Right: Staff Login Card */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 relative transition-colors">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white mx-auto shadow-md border border-emerald-500/30 mb-2.5">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                Organization Staff Sign-In
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enter your verified corporate workspace credentials
              </p>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="mb-5 p-3 rounded-xl border border-emerald-500/25 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                Verified Organization Roles (1-Click Fill):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('sarah.officer@apexhealth.org')}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 text-left text-xs hover:border-emerald-500 transition-colors group shadow-2xs"
                >
                  <p className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Claims Officer</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('priya.manager@apexhealth.org')}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 text-left text-xs hover:border-emerald-500 transition-colors group shadow-2xs"
                >
                  <p className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">Priya Nair</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Service Manager</p>
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Staff Work Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@partner.org"
                  className="bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Security Passphrase
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 text-xs h-10"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 gap-1.5 text-xs shadow-md shadow-emerald-600/20"
                >
                  <Lock className="w-4 h-4" />
                  {isLoading ? 'Authenticating Staff...' : 'Sign In to Organization Workspace'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center text-[11px] text-slate-500 dark:text-slate-400">
              <span>Looking to register a new civic enterprise? </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline">
                Submit Onboarding Dossier
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            Independent Enterprise Portal • Regulated by Data Protection Board
          </p>
        </div>
      </main>

      {/* Sovereign Footer */}
      <footer className="relative z-20 border-t border-slate-200 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 px-4 sm:px-8 py-3 text-center text-[11px] text-slate-500 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
        <span>© 2026 CIVIQORG Enterprise Network · Sovereign Data Federation</span>
        <span>Strict Role-Based Access Control • All Actions Audited</span>
      </footer>
    </div>
  )
}
