import { useState, useEffect } from 'react'
import {
  Code,
  Key,
  Webhook,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  Terminal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { organizationDeveloperService } from '@/services/organization-developer.service'
import { useToast } from '@/hooks'
import type { ApiKeyItem, WebhookEndpoint, WebhookDeliveryLog } from '@/types'

export function OrganizationDeveloperPortalPage() {
  const { success, warning, info } = useToast()

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>([])
  const [loading, setLoading] = useState(true)

  // API Key creation modal
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [keyEnv, setKeyEnv] = useState<'production' | 'sandbox'>('production')
  const [keyScopes, setKeyScopes] = useState<string[]>(['applications:read', 'zkp:verify'])
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null)

  // Webhook creation modal
  const [createWebhookModalOpen, setCreateWebhookModalOpen] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookDesc, setWebhookDesc] = useState('')
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['application.status_changed', 'zkp.proof_verified'])

  // Test Webhook Dispatcher
  const [dispatchingTest, setDispatchingTest] = useState(false)
  const [selectedTestEvent, setSelectedTestEvent] = useState('application.status_changed')

  // Inspect Log Modal
  const [inspectLog, setInspectLog] = useState<WebhookDeliveryLog | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [keys, whs, lg] = await Promise.all([
        organizationDeveloperService.getApiKeys(),
        organizationDeveloperService.getWebhookEndpoints(),
        organizationDeveloperService.getDeliveryLogs(),
      ])
      setApiKeys(keys)
      setWebhooks(whs)
      setLogs(lg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) return

    const res = await organizationDeveloperService.createApiKey(keyName, keyEnv, keyScopes)
    setRevealedSecret(res.secret)
    setApiKeys((prev) => [res, ...prev])
    setKeyName('')
    success('API Key Generated', 'Store this secret securely. It will never be shown again.')
  }

  const handleRevokeKey = async (id: string) => {
    const updated = await organizationDeveloperService.revokeApiKey(id)
    setApiKeys((prev) => prev.map((k) => (k.id === id ? updated : k)))
    warning('API Key Revoked', 'The API key has been permanently deactivated.')
  }

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhookUrl.trim()) return

    const newEp = await organizationDeveloperService.createWebhookEndpoint(webhookUrl, webhookDesc, webhookEvents)
    setWebhooks((prev) => [newEp, ...prev])
    setCreateWebhookModalOpen(false)
    setWebhookUrl('')
    setWebhookDesc('')
    success('Webhook Endpoint Configured', 'Outbound event dispatching is now live.')
  }

  const handleDeleteWebhook = async (id: string) => {
    await organizationDeveloperService.deleteWebhookEndpoint(id)
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
    info('Endpoint Removed', 'Webhook endpoint deleted.')
  }

  const handleSendTestWebhook = async (endpointId: string) => {
    setDispatchingTest(true)
    try {
      const log = await organizationDeveloperService.sendTestWebhook(endpointId, selectedTestEvent)
      setLogs((prev) => [log, ...prev.slice(0, 49)])
      success(
        'Webhook Dispatched',
        `HTTP ${log.statusCode} received from endpoint in ${log.latencyMs}ms.`
      )
    } finally {
      setDispatchingTest(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    info('Copied', `${label} copied to clipboard.`)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              B2B Developer Hub & Webhooks
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-mono font-bold">
              v2.4 REST + SSE
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage enterprise programmatic API keys, subscribe to event streams, and verify HMAC-SHA256 signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setRevealedSecret(null)
              setCreateKeyModalOpen(true)
            }}
            className="text-xs font-bold gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-primary" />
            Generate API Key
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setCreateWebhookModalOpen(true)}
            className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Webhook
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Active API Keys
              </span>
              <span className="text-xl font-bold font-mono text-foreground">
                {apiKeys.filter((k) => k.status === 'active').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Webhook Endpoints
              </span>
              <span className="text-xl font-bold font-mono text-foreground">{webhooks.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Delivery Success SLA
              </span>
              <span className="text-xl font-bold font-mono text-emerald-600">99.98%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                24h Event Dispatches
              </span>
              <span className="text-xl font-bold font-mono text-foreground">14,819</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: API Keys Table */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Organizational API Keys
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Bearer tokens used to authenticate B2B server-to-server calls.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setRevealedSecret(null)
              setCreateKeyModalOpen(true)
            }}
            className="text-xs font-bold gap-1"
          >
            <Plus className="w-3 h-3" /> New Key
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <th className="p-3.5">Name & Description</th>
                  <th className="p-3.5">Key Prefix</th>
                  <th className="p-3.5">Environment</th>
                  <th className="p-3.5">Assigned Scopes</th>
                  <th className="p-3.5">Last Active</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-bold text-foreground">{key.name}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{key.keyPrefix}</span>
                        <button
                          onClick={() => copyToClipboard(key.keyPrefix, 'Key Prefix')}
                          className="hover:text-foreground"
                          title="Copy Prefix"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono font-bold uppercase ${
                          key.environment === 'production'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}
                      >
                        {key.environment}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase ${
                          key.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                        }`}
                      >
                        {key.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {key.status === 'active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeKey(key.id)}
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Webhooks & Test Dispatcher */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Webhook Endpoints */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border">
            <CardHeader className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-sky-500" />
                  Configured Webhook Endpoints
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Real-time HTTPS endpoints receiving signed JSON payloads upon portal events.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setCreateWebhookModalOpen(true)}
                className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
              >
                <Plus className="w-3 h-3" /> Add Endpoint
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              {webhooks.map((ep) => (
                <div key={ep.id} className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-foreground truncate max-w-[340px]">
                      {ep.url}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      {ep.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">{ep.description}</p>

                  <div className="flex flex-wrap items-center gap-1">
                    {ep.events.map((ev) => (
                      <span key={ev} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px] text-primary">
                        {ev}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Secret: {ep.secretPrefix}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendTestWebhook(ep.id)}
                        disabled={dispatchingTest}
                        className="h-7 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/10"
                      >
                        <Send className="w-3 h-3" />
                        Send Test Event
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteWebhook(ep.id)}
                        className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: cURL & HMAC Verification Snippet */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Integration Code Snippet
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Verify webhook signatures using HMAC-SHA256 in Node.js
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-muted/60 border border-border text-[11px] font-mono text-foreground overflow-x-auto leading-relaxed">
{`// Node.js Webhook Signature Verification
import crypto from 'crypto'

function verifySamagraSignature(payload, header, secret) {
  const [tPart, v1Part] = header.split(',')
  const timestamp = tPart.split('=')[1]
  const signature = v1Part.split('=')[1]

  const signedPayload = \`\${timestamp}.\${payload}\`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}`}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `import crypto from 'crypto'
function verifySamagraSignature(payload, header, secret) { ... }`,
                      'Snippet'
                    )
                  }
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground text-xs"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Delivery Logs Table */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Real-time Webhook Delivery Logs
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live HTTP delivery responses with latency metrics and payload inspections.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono font-bold">
            {logs.length} Logged Deliveries
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Endpoint Target</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-foreground">{log.event}</td>
                    <td className="p-3.5 font-mono text-muted-foreground truncate max-w-[280px]">
                      {log.endpointUrl}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                        }`}
                      >
                        HTTP {log.statusCode}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">{log.latencyMs} ms</td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInspectLog(log)}
                        className="h-7 text-xs text-primary gap-1"
                      >
                        Inspect Payload
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={createKeyModalOpen} onOpenChange={setCreateKeyModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Generate Enterprise API Key
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create a programmatic credential for your backend microservices.
            </DialogDescription>
          </DialogHeader>

          {revealedSecret ? (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  Save Secret Key Now
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This token will never be displayed again. Store it in your encrypted secrets manager.
                </p>
                <div className="p-2.5 rounded-lg bg-card border border-border font-mono text-xs flex items-center justify-between">
                  <span className="truncate mr-2 font-bold text-foreground">{revealedSecret}</span>
                  <button
                    onClick={() => copyToClipboard(revealedSecret, 'Secret Key')}
                    className="p-1 hover:text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setRevealedSecret(null)
                    setCreateKeyModalOpen(false)
                  }}
                  className="w-full font-bold"
                >
                  I Have Stored the Key Securely
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreateApiKey} className="space-y-4 my-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Key Name / Description</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Loan Underwriting Auto-Sync Worker"
                  className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Environment</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyEnv('production')}
                    className={`flex-1 p-2 rounded-xl border text-xs font-bold transition-all ${
                      keyEnv === 'production'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Production (civ_live_*)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyEnv('sandbox')}
                    className={`flex-1 p-2 rounded-xl border text-xs font-bold transition-all ${
                      keyEnv === 'sandbox'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Sandbox (civ_test_*)
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateKeyModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Generate Token
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={createWebhookModalOpen} onOpenChange={setCreateWebhookModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Webhook className="w-4 h-4 text-primary" />
              Register Webhook Endpoint
            </DialogTitle>
            <DialogDescription className="text-xs">
              Subscribe an HTTPS endpoint to real-time portal events.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWebhook} className="space-y-4 my-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Endpoint URL (HTTPS)</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/samagra/events"
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Description</label>
              <input
                type="text"
                value={webhookDesc}
                onChange={(e) => setWebhookDesc(e.target.value)}
                placeholder="Core CRM & underwriting pipeline webhook"
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateWebhookModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                Activate Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspect Log Dialog */}
      <Dialog open={!!inspectLog} onOpenChange={() => setInspectLog(null)}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Webhook Delivery Inspector</DialogTitle>
            <DialogDescription className="text-xs">
              Raw HTTP request and response payload captured during event dispatch.
            </DialogDescription>
          </DialogHeader>

          {inspectLog && (
            <div className="space-y-3.5 my-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">HMAC-SHA256 Signature Header</span>
                <p className="font-mono text-[11px] text-primary break-all bg-muted/40 p-2 rounded-lg border border-border">
                  {inspectLog.signatureHeader}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">JSON Payload Dispatched</span>
                <pre className="font-mono text-[10px] text-muted-foreground bg-card p-2.5 rounded-lg border border-border overflow-x-auto">
                  {inspectLog.payloadSnippet}
                </pre>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Receiver Response</span>
                <pre className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-card p-2.5 rounded-lg border border-border overflow-x-auto">
                  {inspectLog.responseSnippet}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setInspectLog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
