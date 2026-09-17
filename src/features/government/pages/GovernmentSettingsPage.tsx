import React, { useState, useEffect } from 'react'
import { governmentService } from '@/services/government.service'
import type { GovSessionData } from '@/types'
import {
  Settings,
  Shield,
  Key,
  Building,
  CheckCircle2,
  Save,
  Cpu
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export function GovernmentSettingsPage() {
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Departmental Configuration & Security
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage jurisdiction parameters, digital signing tokens, and secure inter-agency connectors.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Departmental settings updated and gazette configuration re-synced.
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Department Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            Department Jurisdiction
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Department Name
              </label>
              <Input defaultValue={session.department.name} disabled className="bg-muted/50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Department Gazette Code
              </label>
              <Input defaultValue={session.department.code} disabled className="bg-muted/50 font-mono" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground block mb-1">
                Official Department Secretariat Address
              </label>
              <Input defaultValue="MS Building, 1st Floor, Dr. B.R. Ambedkar Veedhi, Bengaluru 560001" />
            </div>
          </div>
        </div>

        {/* Digital Signature Certificates (DSC) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" />
            Hardware DSC Token & Cryptographic Key
          </h3>

          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    CCA Class-3 Digital Signature Certificate
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Token ID: E-PASS2003-882190-KA
                  </span>
                </div>
              </div>
              <Badge variant="success">Active & Verified</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
              <div>
                <span className="text-muted-foreground block">Issuer CA:</span>
                <span className="font-semibold text-foreground">eMudhra National Root CA</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Valid Until:</span>
                <span className="font-semibold text-foreground">18 October 2028</span>
              </div>
            </div>
          </div>
        </div>

        {/* National Data Exchange Node */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            API & Public Data Exchange Connectors
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <span className="font-semibold text-foreground block">UIDAI Aadhaar eKYC Gateway</span>
                <span className="text-muted-foreground">Direct leased line node for biometric validation</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Connected
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <span className="font-semibold text-foreground block">Digilocker National Document Vault API</span>
                <span className="text-muted-foreground">Original certificate retrieval & digital stamping</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Connected
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
