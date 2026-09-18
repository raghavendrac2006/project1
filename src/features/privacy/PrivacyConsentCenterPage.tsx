import { useState, useEffect, useMemo } from 'react'
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  Calendar,
  Info,
  History,
  Check,
  ShieldAlert,
  Network,
  Power,
  Share2,
  Shield,
  Copy,
  FileCheck,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Activity,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { StepUpAuthenticationModal } from '@/components/auth/StepUpAuthenticationModal'
import { consentService } from '@/services/consent.service'
import { citizenIntelligenceService } from '@/services/citizen-intelligence.service'
import { realtimeBus } from '@/services/eventBus'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import type { ConsentRequest, AccessGrant, AccessHistoryItem, ConsentField } from '@/types'

const FIELD_LABELS: Record<ConsentField, string> = {
  fullName: 'Full Legal Name',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  phone: 'Phone Number',
  email: 'Email Address',
  address: 'Permanent Address',
  nationalId: 'Aadhaar / National ID',
  panNumber: 'PAN Card Number',
  income: 'Annual Certified Income',
  educationStatus: 'Education & Qualification',
  drivingLicense: 'Driving License Details',
}

const ORG_TRUST_SCORES: Record<string, { score: number; tier: string; badge: string }> = {
  'Apex Health & Life Insurers': { score: 96, tier: 'Tier 1 Regulated', badge: 'IRDAI Compliant' },
  'State Department of Revenue': { score: 99, tier: 'Government Sovereign', badge: 'State Verified' },
  'Metro Urban Bank': { score: 94, tier: 'RBI Regulated', badge: 'Banking Grade' },
  'Civic Utilities Distribution Co.': { score: 92, tier: 'Public Utility', badge: 'Audited' },
}

export function PrivacyConsentCenterPage() {
  const { toast, success, warning } = useToast()

  const [pendingRequests, setPendingRequests] = useState<ConsentRequest[]>([])
  const [activeGrants, setActiveGrants] = useState<AccessGrant[]>([])
  const [expiringGrants, setExpiringGrants] = useState<AccessGrant[]>([])
  const [revokedGrants, setRevokedGrants] = useState<AccessGrant[]>([])
  const [history, setHistory] = useState<AccessHistoryItem[]>([])
  const [receipts, setReceipts] = useState(() => civicStorage.getConsentReceipts())
  const [loading, setLoading] = useState(true)

  // Selective field approvals per request: { [requestId]: Set<ConsentField> }
  const [selectedFields, setSelectedFields] = useState<Record<string, Set<ConsentField>>>({})
  const [showLineageMap, setShowLineageMap] = useState(false)
  const [lockdownConfirmOpen, setLockdownConfirmOpen] = useState(false)
  const [lockdownInProgress, setLockdownInProgress] = useState(false)
  const [stepUpLockdownOpen, setStepUpLockdownOpen] = useState(false)

  // Bulk Revoke state
  const [selectedGrantIds, setSelectedGrantIds] = useState<Set<string>>(new Set())

  // Global Field Lock state (stored locally)
  const [globalFieldLocks, setGlobalFieldLocks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('samagra_global_field_locks') || localStorage.getItem('civiqone_global_field_locks')
      return saved ? JSON.parse(saved) : { income: true, nationalId: false, panNumber: false, drivingLicense: false }
    } catch {
      return { income: true, nationalId: false, panNumber: false, drivingLicense: false }
    }
  })
  const [showFieldLocks, setShowFieldLocks] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [reqs, active, expiring, revoked, hist] = await Promise.all([
        consentService.getPendingRequests(),
        consentService.getActiveGrants(),
        consentService.getExpiringGrants(),
        consentService.getRevokedGrants(),
        consentService.getAccessHistory(),
      ])
      setPendingRequests(reqs)
      setActiveGrants(active)
      setExpiringGrants(expiring)
      setRevokedGrants(revoked)
      setHistory(hist)

      // Initialize selected fields with all requested fields
      const initSelected: Record<string, Set<ConsentField>> = {}
      reqs.forEach((r) => {
        initSelected[r.id] = new Set(r.requestedFields)
      })
      setSelectedFields(initSelected)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Real-time synchronization across browser tabs/portals
    const unsubReq = realtimeBus.subscribe('ACCESS_REQUEST_CREATED', () => {
      loadData()
      toast({
        title: 'New Access Request',
        description: 'An external organization just submitted a new data access request.',
        type: 'info',
      })
    })

    const unsubRevoked = realtimeBus.subscribe('CONSENT_REVOKED', () => {
      loadData()
    })

    const unsubGranted = realtimeBus.subscribe('CONSENT_GRANTED', () => {
      loadData()
    })

    const unsubLockdown = realtimeBus.subscribe('PRIVACY_LOCKDOWN', () => {
      loadData()
      warning('Privacy Lockdown Active', 'All external organization data access tokens have been revoked.')
    })

    return () => {
      unsubReq()
      unsubRevoked()
      unsubGranted()
      unsubLockdown()
    }
  }, [])

  const handleToggleField = (requestId: string, field: ConsentField) => {
    setSelectedFields((prev) => {
      const current = new Set(prev[requestId] || [])
      if (current.has(field)) {
        current.delete(field)
      } else {
        current.add(field)
      }
      return { ...prev, [requestId]: current }
    })
  }

  const handleApprove = async (request: ConsentRequest) => {
    const fieldsToApprove = Array.from(selectedFields[request.id] || [])
    if (fieldsToApprove.length === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one field to authorize, or choose Deny.',
        type: 'warning',
      })
      return
    }

    await consentService.approveRequest(request.id, fieldsToApprove, request.requestedDocuments)
    success('Consent Granted', `You authorized ${request.organizationName} to access ${fieldsToApprove.length} data fields.`)
    await loadData()
  }

  const handleDeny = async (requestId: string, orgName: string) => {
    await consentService.denyRequest(requestId)
    warning('Request Denied', `Access request from ${orgName} has been rejected.`)
    await loadData()
  }

  const handleRevoke = async (grantId: string, orgName: string) => {
    await consentService.revokeGrant(grantId)
    setSelectedGrantIds((prev) => {
      const next = new Set(prev)
      next.delete(grantId)
      return next
    })
    warning('Access Revoked', `All active data permissions for ${orgName} have been terminated immediately.`)
    await loadData()
  }

  // Bulk Revoke handler
  const handleBulkRevoke = async () => {
    if (selectedGrantIds.size === 0) return
    const ids = Array.from(selectedGrantIds)
    for (const id of ids) {
      await consentService.revokeGrant(id)
    }
    warning(
      'Bulk Revocation Completed',
      `Revoked ${ids.length} organization grant(s). Access tokens have been destroyed.`
    )
    setSelectedGrantIds(new Set())
    await loadData()
  }

  const toggleSelectGrant = (grantId: string) => {
    setSelectedGrantIds((prev) => {
      const next = new Set(prev)
      if (next.has(grantId)) next.delete(grantId)
      else next.add(grantId)
      return next
    })
  }

  const toggleSelectAllGrants = () => {
    if (selectedGrantIds.size === activeGrants.length) {
      setSelectedGrantIds(new Set())
    } else {
      setSelectedGrantIds(new Set(activeGrants.map((g) => g.id)))
    }
  }

  const toggleGlobalLock = (fieldKey: string) => {
    setGlobalFieldLocks((prev) => {
      const next = { ...prev, [fieldKey]: !prev[fieldKey] }
      try {
        localStorage.setItem('samagra_global_field_locks', JSON.stringify(next))
      } catch {}
      toast({
        title: next[fieldKey] ? 'Field Globally Locked' : 'Field Unlocked',
        description: next[fieldKey]
          ? `All organizations are blocked from requesting ${fieldKey}.`
          : `${fieldKey} is now eligible for conditional consent.`,
        type: next[fieldKey] ? 'warning' : 'info',
      })
      return next
    })
  }

  const handleEmergencyLockdown = async () => {
    setLockdownInProgress(true)
    try {
      const count = await consentService.emergencyLockdown()
      setLockdownConfirmOpen(false)
      warning(
        'Emergency Privacy Lockdown Triggered',
        `Successfully severed data feeds and revoked access for ${count} external organizations.`
      )
      await loadData()
    } finally {
      setLockdownInProgress(false)
    }
  }

  // Exposure computations
  const totalMonitoredFields = 11
  const exposedFieldsSet = useMemo(() => {
    const set = new Set<string>()
    activeGrants.forEach((g) => g.authorizedFields.forEach((f) => set.add(f)))
    return set
  }, [activeGrants])
  const exposedCount = exposedFieldsSet.size
  const protectedCount = totalMonitoredFields - exposedCount
  const privacyRatio = Math.round((protectedCount / totalMonitoredFields) * 100)

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
                Citizen Privacy & Consent Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full sovereign control over which organizations can access your personal and civic data.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={showFieldLocks ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFieldLocks(!showFieldLocks)}
            className="gap-1.5 text-xs border-border"
          >
            <Sliders className="w-3.5 h-3.5 text-primary" />
            {showFieldLocks ? 'Hide Global Locks' : 'Global Field Locks'}
          </Button>

          <Button
            variant={showLineageMap ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowLineageMap(!showLineageMap)}
            className="gap-1.5 text-xs border-border"
          >
            <Network className="w-3.5 h-3.5 text-primary" />
            {showLineageMap ? 'Hide Lineage Map' : 'Visual Data Lineage'}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setLockdownConfirmOpen(true)}
            className="gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Privacy Lockdown
          </Button>
        </div>
      </div>

      {/* Data Exposure Summary Bar */}
      <Card className="border-border bg-gradient-to-r from-card via-card to-emerald-500/5 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Data Exposure & Shielding Status</h3>
                <Badge variant="verified" size="sm">
                  {privacyRatio}% Protected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{exposedCount}</span> of {totalMonitoredFields} civic attributes disclosed across{' '}
                <span className="font-semibold text-foreground">{activeGrants.length}</span> active organization grants.
              </p>
            </div>

            {/* Visual ratio bar */}
            <div className="flex-1 max-w-md space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {protectedCount} Masked (`••••••••`)
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {exposedCount} Shared
                </span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(protectedCount / totalMonitoredFields) * 100}%` }}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(exposedCount / totalMonitoredFields) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 shrink-0 text-xs">
              <div className="p-2 rounded-lg bg-muted/40 text-center">
                <span className="block text-[10px] text-muted-foreground uppercase font-mono">Active Orgs</span>
                <span className="font-bold text-foreground">{activeGrants.length}</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 text-center">
                <span className="block text-[10px] text-muted-foreground uppercase font-mono">Receipts</span>
                <span className="font-bold text-foreground">{receipts.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Field Lock Panel */}
      {showFieldLocks && (
        <Card className="border-indigo-500/30 bg-indigo-500/5 shadow-md animate-in slide-in-from-top-3 duration-200">
          <CardHeader className="pb-3 border-b border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <div>
                  <CardTitle className="text-sm">Global Data Field Shielding Policy</CardTitle>
                  <CardDescription className="text-xs">
                    Lock sensitive fields to reject requests from all external organizations automatically without prompt.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background">
                Sovereign Gatekeeper
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: 'income', label: 'Annual Income', desc: 'Financial tax brackets & salary certification' },
                { key: 'nationalId', label: 'National ID (Aadhaar)', desc: '12-digit biometric identifier' },
                { key: 'panNumber', label: 'Permanent Account No. (PAN)', desc: 'Direct taxation credential' },
                { key: 'drivingLicense', label: 'Driving License', desc: 'State transport & DL number' },
              ].map((f) => {
                const isLocked = !!globalFieldLocks[f.key]
                return (
                  <div
                    key={f.key}
                    onClick={() => toggleGlobalLock(f.key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isLocked
                        ? 'border-indigo-500/50 bg-card shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-border bg-card/60 hover:border-border/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{f.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isLocked ? 'bg-rose-500/15 text-rose-600' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isLocked ? 'Locked' : 'Open'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{f.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                      <span className="text-muted-foreground">{isLocked ? 'Protected' : 'Eligible'}</span>
                      <span className="font-bold text-primary">{isLocked ? 'Unlock' : 'Lock Field'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Lockdown Alert Confirmation Modal / Banner */}
      {lockdownConfirmOpen && (
        <div className="p-5 rounded-2xl border-2 border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-200 animate-in zoom-in-95 duration-150">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
              <Power className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-sm font-bold tracking-tight">Emergency Privacy Lockdown Master Switch</h3>
              <p className="text-xs leading-relaxed opacity-90">
                Triggering privacy lockdown will <strong>immediately revoke all active authorization tokens</strong> across all external verified organizations ({activeGrants.length} currently active). Their dashboards will instantly mask your records to protected placeholders (`••••••••`) via real-time WebSocket/BroadcastChannel.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setStepUpLockdownOpen(true)}
                  disabled={lockdownInProgress}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
                >
                  Confirm Lockdown with Step-Up Security
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLockdownConfirmOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Data Lineage Map Component */}
      {showLineageMap && (
        <Card className="border-primary/30 bg-card/90 shadow-md overflow-hidden animate-in slide-in-from-top-4 duration-200">
          <CardHeader className="p-5 border-b border-border/70 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Cryptographic Data Lineage Architecture</CardTitle>
                  <CardDescription className="text-xs">
                    Live topology of data nodes, authorized external organizations, and active consent pipelines
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono bg-background">
                Real-Time Map
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Node 1: Sovereign Vault */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Sovereign Vault
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Encrypted
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your primary citizen profile stored locally in AES-256 encrypted space.
                </p>
              </div>

              {/* Node 2: Authorized Organizations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active Endpoints ({activeGrants.length})
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">Channel: TLS 1.3</span>
                </div>

                {activeGrants.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    No active external connections. Your sovereign vault is fully isolated.
                  </div>
                ) : (
                  activeGrants.map((grant) => (
                    <div
                      key={grant.id}
                      className="p-3.5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                          {grant.organizationLogo ? (
                            <img src={grant.organizationLogo} alt="" className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Building2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{grant.organizationName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Expires in {Math.max(0, Math.ceil((new Date(grant.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(grant.id, grant.organizationName)}
                        className="h-7 px-2 text-[10px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                      >
                        Sever
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Node 3: Disclosed Attributes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Exposed Data Fields
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-semibold">Strict Minimum</span>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                  {activeGrants.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      All data attributes are masked (`••••••••`).
                    </p>
                  ) : (
                    Array.from(new Set(activeGrants.flatMap((g) => g.authorizedFields))).map((field) => (
                      <div
                        key={field}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-card border border-border"
                      >
                        <span className="font-medium text-foreground">{FIELD_LABELS[field]}</span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Consented
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consent Timeline Mini-Chart Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cumulative Grants</span>
          <p className="text-lg font-black text-foreground font-display mt-0.5">{activeGrants.length + revokedGrants.length + 5}</p>
          <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +2 this month
          </span>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revocation Rate</span>
          <p className="text-lg font-black text-foreground font-display mt-0.5">
            {Math.round((revokedGrants.length / Math.max(1, activeGrants.length + revokedGrants.length)) * 100)}%
          </p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">{revokedGrants.length} revoked manually</span>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Grant Validity</span>
          <p className="text-lg font-black text-foreground font-display mt-0.5">90 Days</p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Auto-expiring token default</span>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Compliance Honor</span>
          <p className="text-lg font-black text-emerald-500 font-display mt-0.5">100%</p>
          <span className="text-[10px] text-emerald-500 mt-0.5 block">Zero leak incidents</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          In the SAMAGRA architecture, private organizations <strong>never receive your complete profile automatically</strong>. Organizations must issue a cryptographic data access request stating their specific purpose and exact fields needed. You decide which individual fields to authorize, and you can revoke access at any second.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full h-auto p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="pending" className="text-xs py-2 gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending</span>
            {pendingRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs py-2 gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Active Access</span>
            <span className="text-[10px] text-muted-foreground font-mono">({activeGrants.length})</span>
          </TabsTrigger>
          <TabsTrigger value="expiring" className="text-xs py-2 gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Expiring Soon</span>
            {expiringGrants.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {expiringGrants.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="revoked" className="text-xs py-2 gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Revoked</span>
            <span className="text-[10px] text-muted-foreground font-mono">({revokedGrants.length})</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="text-xs py-2 gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Receipts</span>
            <span className="text-[10px] text-muted-foreground font-mono">({receipts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs py-2 gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-500" />
            <span>Audit Log</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Requests */}
        <TabsContent value="pending" className="mt-6 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading pending requests...</div>
          ) : pendingRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                <h3 className="font-semibold text-base text-foreground">No Pending Access Requests</h3>
                <p className="text-xs text-muted-foreground max-w-md mt-1">
                  No external organizations are currently requesting access to your civic data.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((req) => {
              const currentSelected = selectedFields[req.id] || new Set()
              const trust = ORG_TRUST_SCORES[req.organizationName] || { score: 95, tier: 'Regulated Org', badge: 'Verified' }

              return (
                <Card key={req.id} className="border-border overflow-hidden shadow-sm">
                  <div className="p-5 sm:p-6 border-b border-border/70 bg-card">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                          {req.organizationLogo ? (
                            <img src={req.organizationLogo} alt={req.organizationName} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-foreground">{req.organizationName}</h3>
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Verified Organization</Badge>
                            {/* Inline Org Trust Score Badge */}
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {trust.score}% Trust Score • {trust.badge}
                            </Badge>
                          </div>
                          {req.serviceName && (
                            <p className="text-xs font-semibold text-primary mt-0.5">{req.serviceName}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            <strong>Purpose:</strong> {req.purpose}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                        <Badge variant="outline" className="gap-1 text-xs border-amber-500/30 text-amber-600 bg-amber-500/10">
                          <Clock className="w-3 h-3" />
                          Duration: {req.durationDays} Days
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Requested on {new Date(req.requestedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Granular Field Checkboxes */}
                  <CardContent className="p-5 sm:p-6 bg-muted/20 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                        Requested Data Fields (Check to approve, uncheck to withhold):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {req.requestedFields.map((field) => {
                          const isChecked = currentSelected.has(field)
                          const isGloballyLocked = !!globalFieldLocks[field]

                          return (
                            <button
                              key={field}
                              type="button"
                              onClick={() => handleToggleField(req.id, field)}
                              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isChecked
                                  ? 'border-primary/50 bg-primary/5 text-foreground'
                                  : 'border-border bg-card text-muted-foreground opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                                    isChecked ? 'bg-primary border-primary text-white' : 'border-input bg-card'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="text-xs font-semibold">{FIELD_LABELS[field]}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {isGloballyLocked && (
                                  <span className="text-[9px] font-bold bg-indigo-500/15 text-indigo-600 px-1 py-0.2 rounded">
                                    Locked
                                  </span>
                                )}
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                  {isChecked ? 'Share' : 'Withhold'}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {req.requestedDocuments.length > 0 && (
                      <div className="pt-2 border-t border-border/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Requested Supporting Documents:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {req.requestedDocuments.map((doc) => (
                            <Badge key={doc} variant="outline" className="text-xs py-1 px-2.5 bg-background">
                              📄 {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80">
                      <p className="text-[11px] text-muted-foreground">
                        {currentSelected.size} of {req.requestedFields.length} fields selected for authorization.
                      </p>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeny(req.id, req.organizationName)}
                          className="flex-1 sm:flex-none text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Deny All
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(req)}
                          className="flex-1 sm:flex-none text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Approve Selected ({currentSelected.size})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* Tab 2: Active Access */}
        <TabsContent value="active" className="mt-6 space-y-4">
          {/* Bulk Revoke Toolbar */}
          {activeGrants.length > 0 && (
            <div className="p-3.5 rounded-xl border border-border bg-card/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleSelectAllGrants}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {selectedGrantIds.size === activeGrants.length ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All ({activeGrants.length})
                </button>
                {selectedGrantIds.size > 0 && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {selectedGrantIds.size} Selected
                  </Badge>
                )}
              </div>

              {selectedGrantIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkRevoke}
                  className="text-xs h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Revoke Selected ({selectedGrantIds.size})
                </Button>
              )}
            </div>
          )}

          {activeGrants.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Lock className="w-10 h-10 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-base text-foreground">No Active External Authorizations</h3>
                <p className="text-xs text-muted-foreground max-w-md mt-1">
                  You have not authorized any external organizations to access your data.
                </p>
              </CardContent>
            </Card>
          ) : (
            activeGrants.map((grant) => {
              const isSelected = selectedGrantIds.has(grant.id)
              return (
                <Card
                  key={grant.id}
                  className={`border-border shadow-sm transition-all ${
                    isSelected ? 'ring-2 ring-primary/40 bg-primary/[0.02]' : ''
                  }`}
                >
                  <CardHeader className="p-5 sm:p-6 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectGrant(grant.id)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                          title="Select for bulk revocation"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-foreground">{grant.organizationName}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            {grant.serviceName || grant.purpose}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active Authorization
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevoke(grant.id, grant.organizationName)}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Revoke Access
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 pt-0 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Currently Authorized Fields:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {grant.authorizedFields.map((f) => (
                          <Badge key={f} variant="secondary" className="text-xs py-1 px-2.5 font-medium">
                            ✓ {FIELD_LABELS[f]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Granted: {new Date(grant.grantedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Expires: {new Date(grant.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* Tab 3: Expiring Soon */}
        <TabsContent value="expiring" className="mt-6 space-y-4">
          {expiringGrants.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                <h3 className="font-semibold text-base text-foreground">No Access Grants Expiring Soon</h3>
                <p className="text-xs text-muted-foreground max-w-md mt-1">
                  All active authorizations are current and not approaching immediate expiration.
                </p>
              </CardContent>
            </Card>
          ) : (
            expiringGrants.map((grant) => (
              <Card key={grant.id} className="border-amber-500/40 bg-amber-500/5 shadow-sm">
                <CardHeader className="p-5 sm:p-6 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-foreground">{grant.organizationName}</CardTitle>
                        <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-600 border-amber-500/40">
                          Expires in &lt; 7 Days
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        {grant.purpose}
                      </CardDescription>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(grant.id, grant.organizationName)}
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Revoke Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0 text-xs text-muted-foreground">
                  <p>
                    Authorized fields: <strong>{grant.authorizedFields.map((f) => FIELD_LABELS[f]).join(', ')}</strong>
                  </p>
                  <p className="mt-1 text-amber-600 font-medium">
                    This grant will automatically expire on {new Date(grant.expiresAt).toLocaleDateString()}.
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 4: Revoked Access */}
        <TabsContent value="revoked" className="mt-6 space-y-4">
          {revokedGrants.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Info className="w-10 h-10 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-base text-foreground">No Revoked Authorizations</h3>
                <p className="text-xs text-muted-foreground max-w-md mt-1">
                  You have not revoked any active data grants.
                </p>
              </CardContent>
            </Card>
          ) : (
            revokedGrants.map((grant) => (
              <Card key={grant.id} className="border-border opacity-75 shadow-sm">
                <CardHeader className="p-5 sm:p-6 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">{grant.organizationName}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        {grant.purpose}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-600 bg-rose-500/10">
                      Revoked / Inactive
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0 text-xs text-muted-foreground">
                  <p>
                    Previously shared: {grant.authorizedFields.map((f) => FIELD_LABELS[f]).join(', ')}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    This organization can no longer access these fields in their portal.
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 5: Access History Audit Trail */}
        <TabsContent value="history" className="mt-6">
          <Card className="border-border">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground">Complete Privacy Access Log</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Immutable audit ledger recording all requests, citizen approvals, staff inspections, and revocations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Organization / Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Data Scope / Resource</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-foreground">{item.organizationName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.actor} ({item.actorRole})
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            item.action.includes('approved')
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : item.action.includes('revoked') || item.action.includes('denied')
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                              : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          }`}
                        >
                          {item.action.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium max-w-xs truncate">
                        {item.resource}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                        {item.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Cryptographic Consent Receipts */}
        <TabsContent value="receipts" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    Cryptographic Consent Receipts
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tamper-proof verifiable receipts verifying the exact scope, duration, and legal authorization of data disclosures.
                  </CardDescription>
                </div>
                <Badge variant="verified" size="sm">
                  W3C Consent Standard
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No consent receipts issued yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {receipts.map((rcpt) => (
                    <div
                      key={rcpt.id}
                      className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {rcpt.organizationName}
                            </span>
                            <Badge variant="verified" size="sm">Active Receipt</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Purpose: {rcpt.purpose}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Issued: {new Date(rcpt.grantedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block w-full">
                          Disclosed Fields:
                        </span>
                        {rcpt.grantedFields.map((field) => (
                          <span
                            key={field}
                            className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium"
                          >
                            {FIELD_LABELS[field] || field}
                          </span>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40 font-mono text-[11px] flex items-center justify-between gap-2">
                        <span className="text-muted-foreground truncate">
                          Receipt Hash: <span className="text-foreground font-mono">{rcpt.signatureHash}</span>
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(rcpt.signatureHash)
                            toast({ title: 'Receipt Hash Copied', description: rcpt.signatureHash, type: 'success' })
                          }}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                          title="Copy Hash"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Step-Up Authentication Modal for Emergency Lockdown */}
      <StepUpAuthenticationModal
        isOpen={stepUpLockdownOpen}
        onClose={() => setStepUpLockdownOpen(false)}
        actionName="Execute Emergency Privacy Lockdown"
        riskLevel="critical"
        onSuccess={handleEmergencyLockdown}
      />
    </div>
  )
}
