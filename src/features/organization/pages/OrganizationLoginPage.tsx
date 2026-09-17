import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ShieldCheck, ArrowRight, Lock, Mail, Key } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { organizationService } from '@/services/organization.service'
import { ROUTES } from '@/constants/routes'
import { useToast } from '@/hooks'

export function OrganizationLoginPage() {
  const [email, setEmail] = useState('sarah.officer@apexhealth.org')
  const [password, setPassword] = useState('Partner@123')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await organizationService.login(email)
      toast({
        title: 'Organization Workspace Authenticated',
        description: `Welcome back. Authorized role session loaded.`,
        type: 'success',
      })
      navigate(ROUTES.ORGANIZATION.DASHBOARD)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Partner@123')
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-display">
            CIVIQ<span className="text-emerald-500">ORG</span> Gateway
          </h1>
          <p className="text-xs text-muted-foreground">
            Enterprise & Partner Portal for Verified Civic Service Providers
          </p>
        </div>

        {/* 1-Click Role Fillers */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            ⚡ 1-Click Demo Staff Logins:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('sarah.officer@apexhealth.org')}
              className="p-2 rounded-lg border border-border bg-card text-left text-xs hover:border-emerald-500 transition-colors"
            >
              <p className="font-bold text-foreground">Sarah Jenkins</p>
              <p className="text-[10px] text-muted-foreground">VERIFICATION_OFFICER</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('priya.manager@apexhealth.org')}
              className="p-2 rounded-lg border border-border bg-card text-left text-xs hover:border-emerald-500 transition-colors"
            >
              <p className="font-bold text-foreground">Priya Nair</p>
              <p className="text-[10px] text-muted-foreground">SERVICE_MANAGER</p>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Staff Work Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@partner.org"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-muted-foreground" />
                  Security Key / Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 gap-1.5"
                  disabled={isLoading}
                >
                  <Lock className="w-4 h-4" />
                  {isLoading ? 'Authenticating...' : 'Sign in to Operational Workspace'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Strict Role-Based Access Control • All Actions Audited</span>
        </div>
      </div>
    </div>
  )
}
