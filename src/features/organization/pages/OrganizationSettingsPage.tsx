import React, { useState } from 'react'
import { Shield, Webhook, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/hooks'

export function OrganizationSettingsPage() {
  const { success } = useToast()
  const [webhookUrl, setWebhookUrl] = useState('https://api.apexhealth.org/webhooks/samagra-events')
  const [autoExpire, setAutoExpire] = useState(true)
  const [strictEkyc, setStrictEkyc] = useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    success('Settings Updated', 'Organization operational parameters have been persisted.')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Organization Operational Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure API webhooks, automated data expiration, and cryptographic token keys.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Webhook className="w-4 h-4 text-emerald-500" />
              Event Webhook Integration
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Endpoint where SAMAGRA will dispatch real-time events (consent granted, access revoked, application submitted).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="text-xs font-mono"
            />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Privacy Compliance Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Strict Biometric eKYC Enforcement</p>
                <p className="text-[11px] text-muted-foreground">Reject applications from unverified citizen profiles.</p>
              </div>
              <Switch checked={strictEkyc} onCheckedChange={setStrictEkyc} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Automatic Data Purge on Expiry</p>
                <p className="text-[11px] text-muted-foreground">Instantly invalidate cached local tokens upon grant expiration.</p>
              </div>
              <Switch checked={autoExpire} onCheckedChange={setAutoExpire} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-1.5 text-xs">
          <Check className="w-3.5 h-3.5" />
          Save Configuration
        </Button>
      </form>
    </div>
  )
}
