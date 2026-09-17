import React, { useState } from 'react'
import {
  Settings,
  Shield,
  Lock,
  CheckCircle2,
  Save,
  AlertTriangle,
  Server,
  RefreshCw,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export function AdminSettingsPage() {
  const [consentDays, setConsentDays] = useState('90')
  const [enforceStrictFieldMasking, setEnforceStrictFieldMasking] = useState(true)
  const [crossBorderTransferBlocked, setCrossBorderTransferBlocked] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [saved, setSaved] = useState(false)

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
          <Settings className="w-6 h-6 text-purple-600" />
          Global Platform Governance & Policies
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Root security policy configuration, default consent durations, and cross-portal privacy enforcement.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Global governance policies updated and broadcast to all gateway nodes.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Privacy & Consent Policies */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            Consent Framework Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Default Access Grant Lifetime (Days)
              </label>
              <select
                value={consentDays}
                onChange={(e) => setConsentDays(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="30">30 Days (Strict Temporary)</option>
                <option value="90">90 Days (Recommended Standard)</option>
                <option value="180">180 Days (Semi-Annual)</option>
                <option value="365">365 Days (Annual Verification)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Field Masking Algorithm
              </label>
              <Input defaultValue="SHA-256 / Dynamic Character Redaction" disabled className="bg-muted/50 font-mono text-xs" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceStrictFieldMasking}
                onChange={(e) => setEnforceStrictFieldMasking(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-border focus:ring-purple-500"
              />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Enforce Strict Field-Level Privacy Redaction
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Prevent organizations from reading unconsented citizen attributes under all circumstances.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={crossBorderTransferBlocked}
                onChange={(e) => setCrossBorderTransferBlocked(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-border focus:ring-purple-500"
              />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Block All Cross-Border Civic Data Exfiltration
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Guarantee data sovereignty by keeping citizen records strictly localized within India.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* System Operations */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-600" />
            Ecosystem Operations & Maintenance
          </h3>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border border-border">
            <div>
              <span className="text-sm font-semibold text-foreground block">
                Platform Maintenance Kill-Switch
              </span>
              <span className="text-xs text-muted-foreground">
                Gracefully pauses non-emergency citizen applications and freezes consent grants.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`text-xs ${
                maintenanceMode
                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                  : 'text-muted-foreground'
              }`}
            >
              {maintenanceMode ? 'System Locked in Maintenance' : 'Enable Maintenance'}
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Policies
          </Button>
        </div>
      </form>
    </div>
  )
}
