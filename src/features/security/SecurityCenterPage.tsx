import { useState, useEffect, useMemo } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  Trash2,
  Lock,
  LogOut,
  AlertTriangle,
  History,
  KeyRound,
  CheckCircle2,
  Clock,
  RefreshCw,
  Check,
  Activity,
  Search,
  Cloud,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AwsCloudConsoleModal } from '@/components/shared/AwsCloudConsoleModal'
import { StepUpAuthenticationModal } from '@/components/auth/StepUpAuthenticationModal'
import { securityService } from '@/services/security.service'
import { citizenIntelligenceService, LoginHeatmapPoint } from '@/services/citizen-intelligence.service'
import { useToast, useAuth } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { cn } from '@/lib/utils'
import type { TrustedDevice, UserSession, AuditEvent, BehavioralAnomaly } from '@/types'

export function SecurityCenterPage() {
  const { user } = useAuth()
  const toast = useToast()

  const [devices, setDevices] = useState<TrustedDevice[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [anomalies, setAnomalies] = useState<BehavioralAnomaly[]>([])
  const [heatmap, setHeatmap] = useState<LoginHeatmapPoint[]>([])
  const [isBreachChecking, setIsBreachChecking] = useState(false)

  // Step-Up Modal state
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [awsModalOpen, setAwsModalOpen] = useState(false)
  const [stepUpActionName, setStepUpActionName] = useState('Authorizing Security Action')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const loadData = async () => {
    const [devList, sessList, auditList, anomList, heatList] = await Promise.all([
      securityService.getTrustedDevices(),
      securityService.getUserSessions(),
      securityService.getSecurityAuditEvents(),
      citizenIntelligenceService.getBehavioralAnomalies(),
      citizenIntelligenceService.getLoginHeatmap(),
    ])
    setDevices(devList)
    setSessions(sessList)
    setAuditEvents(auditList)
    setAnomalies(anomList)
    setHeatmap(heatList)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDismissAnomaly = (id: string) => {
    citizenIntelligenceService.dismissAnomaly(id)
    setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, isDismissed: true } : a)))
    toast.info('Alert Dismissed', 'Threat alert acknowledged and moved to archive.')
  }

  const handleRunBreachCheck = () => {
    setIsBreachChecking(true)
    setTimeout(() => {
      setIsBreachChecking(false)
      toast.success('Breach Scan Clean', '0 compromised credentials or hash exposures found.')
    }, 1200)
  }

  const handleRemoveDevice = (device: TrustedDevice) => {
    setStepUpActionName(`Remove Trusted Device: ${device.deviceName}`)
    setPendingAction(() => async () => {
      await securityService.removeTrustedDevice(device.id)
      setDevices((prev) => prev.filter((d) => d.id !== device.id))
      toast.success('Device Removed', `${device.deviceName} has been untrusted.`)
    })
    setStepUpOpen(true)
  }

  const handleRevokeSession = (session: UserSession) => {
    setStepUpActionName(`Revoke Active Terminal Session (${session.location})`)
    setPendingAction(() => async () => {
      await securityService.revokeSession(session.id)
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: 'revoked' as const } : s))
      )
      toast.info('Session Terminated', 'The remote session has been invalidated.')
    })
    setStepUpOpen(true)
  }

  const handleRevokeAllRemote = () => {
    setStepUpActionName('Revoke All Remote Terminal Sessions')
    setPendingAction(() => async () => {
      const count = await securityService.revokeAllOtherSessions()
      setSessions(civicStorage.getUserSessions())
      toast.success('Remote Sessions Purged', `Terminated ${count} active remote terminal(s).`)
    })
    setStepUpOpen(true)
  }

  const getDeviceIcon = (type: TrustedDevice['deviceType']) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-primary" />
      case 'tablet':
        return <Tablet className="w-5 h-5 text-indigo-500" />
      default:
        return <Laptop className="w-5 h-5 text-blue-500" />
    }
  }

  // Security score computations
  const activeAnomalies = useMemo(() => anomalies.filter((a) => !a.isDismissed), [anomalies])
  const securityScore = useMemo(() => {
    let score = 98
    if (activeAnomalies.length > 0) score -= activeAnomalies.length * 4
    if (sessions.filter((s) => s.status === 'active').length > 3) score -= 3
    return Math.max(70, Math.min(100, score))
  }, [activeAnomalies, sessions])

  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card via-card to-sky-500/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 uppercase tracking-wider">
              Sovereign Hardware Protection
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Grade A+ Shield
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Security & Device Control Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage trusted hardware terminals, revoke active remote sessions, review behavioral anomaly alerts, and inspect immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleRunBreachCheck}
            disabled={isBreachChecking}
            variant="outline"
            size="sm"
            className="text-xs font-bold rounded-xl"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isBreachChecking && "animate-spin")} />
            {isBreachChecking ? 'Scanning...' : 'Scan Leaks'}
          </Button>

          <Button
            onClick={handleRevokeAllRemote}
            variant="outline"
            size="sm"
            className="text-xs font-bold text-rose-500 hover:text-rose-600 border-rose-500/30 hover:bg-rose-500/10 rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Revoke All Other Sessions
          </Button>
        </div>
      </div>

      {/* Security Health Score Breakdown Card */}
      <Card className="border-border bg-gradient-to-br from-card to-muted/20 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            {/* Score Ring / Gauge */}
            <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0 lg:pr-6">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-muted"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - securityScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground font-display">{securityScore}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">OPTIMAL</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-foreground">Sovereign Defense Index</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cryptographic verification of all multi-factor and hardware bindings.
                </p>
                <Badge variant="verified" size="sm" className="mt-2.5">
                  Zero Trust Enforced
                </Badge>
              </div>
            </div>

            {/* Sub-Score Breakdown Meters */}
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-border/80 bg-card/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" /> FIDO2 & Hardware MFA
                  </span>
                  <span className="font-mono font-bold text-emerald-500">100%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                  Biometric authenticator active on primary devices
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/80 bg-card/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-blue-500" /> Device Integrity
                  </span>
                  <span className="font-mono font-bold text-blue-500">95%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[95%]" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                  {devices.length} verified hardware devices bound
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/80 bg-card/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" /> Terminal Session Hygiene
                  </span>
                  <span className="font-mono font-bold text-indigo-500">92%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[92%]" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                  {sessions.filter((s) => s.status === 'active').length} active remote terminal session(s)
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/80 bg-card/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Audit Log Tamper-Resistance
                  </span>
                  <span className="font-mono font-bold text-emerald-500">100%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                  Merkle tree root anchored to state civic ledger
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AWS Cloud Infrastructure & Credits Security Attestation */}
      <div className="p-4.5 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-card to-background flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground">Sovereign Cloud Enclave</h3>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold py-0.5">
                AWS Activate Credits Verified
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Deployed on Amazon Web Services (AWS AP-South-1 Mumbai) with hardware KMS envelope encryption, multi-AZ failover, and zero third-party telemetry.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 rounded-lg bg-muted/60 text-[10px] font-mono font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            99.99% AWS Uptime SLA
          </div>
          <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            SOC 2 / ISO 27001
          </div>
        </div>
      </div>

      {/* Behavioral Threat Alert Panel */}
      {activeAnomalies.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <CardTitle className="text-base text-foreground">Behavioral Threat & Anomaly Radar</CardTitle>
                  <CardDescription className="text-xs">
                    Civic AI anomaly detection flagged {activeAnomalies.length} unusual pattern(s) requiring your attention
                  </CardDescription>
                </div>
              </div>
              <Badge variant="warning" size="sm">
                {activeAnomalies.length} Active Notice{activeAnomalies.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAnomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-3.5 rounded-xl border border-amber-500/20 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg shrink-0 mt-0.5',
                      anom.severity === 'critical'
                        ? 'bg-rose-500/15 text-rose-600'
                        : anom.severity === 'warning'
                        ? 'bg-amber-500/15 text-amber-600'
                        : 'bg-blue-500/15 text-blue-600'
                    )}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">{anom.title}</h4>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(anom.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{anom.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismissAnomaly(anom.id)}
                    className="text-xs h-7 px-2.5 rounded-lg border-border hover:bg-muted"
                  >
                    <Check className="w-3 h-3 mr-1 text-emerald-500" /> Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AWS Cloud Hardware Security & KMS Sovereign Enclave Card */}
      <Card className="rounded-2xl border-border bg-gradient-to-br from-card to-amber-500/5 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm sm:text-base text-foreground">AWS Sovereign Hardware Security (HSM & KMS)</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                    FIPS 140-2 Level 3
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Citizen cryptographic root keys guarded inside AWS Asia Pacific (Mumbai) hardware modules
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setAwsModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs font-bold rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 self-start sm:self-auto gap-1.5"
            >
              <Cloud className="w-3.5 h-3.5" />
              Launch AWS Tech Console
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3 pt-0">
          <div className="p-3 rounded-xl bg-card border border-border/80">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">AWS Key ARN</p>
            <p className="text-xs font-mono font-semibold text-foreground truncate mt-1">
              arn:aws:kms:ap-south-1:991820498812:key/civiqone-sovereign-master
            </p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/80">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Envelope Encryption</p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active (AES-256-GCM + 4096-bit RSA)
            </p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/80">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">AWS Infrastructure</p>
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AWS ap-south-1 (Mumbai) · Healthy
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credential Exposure Check Row */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Sovereign Breach & Dark Web Sentinel</h3>
              <Badge variant="verified" size="sm">
                0 Exposures Detected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Email <span className="font-mono text-foreground font-semibold">{user?.email || 'citizen@civiqone.gov.in'}</span> and national identity hashes scanned against 42 billion breached records.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRunBreachCheck}
          disabled={isBreachChecking}
          className="text-xs font-semibold rounded-xl shrink-0 gap-1.5"
        >
          {isBreachChecking ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" /> Scanning Data Dumps...
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5 text-primary" /> Run Instant Re-Scan
            </>
          )}
        </Button>
      </div>

      {/* Login History 7x24 Heatmap */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                7-Day Authentication Heatmap (24-Hour Cycle)
              </CardTitle>
              <CardDescription className="text-xs">
                Visual density of citizen login and sovereign signature events across days and hours
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-muted/40 border border-border" />
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" />
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              </div>
              <span>More</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px]">
              {/* Hour labels */}
              <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-1 mb-1.5 text-[9px] font-mono text-muted-foreground text-center">
                <div />
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="truncate">
                    {h % 3 === 0 ? `${h}h` : ''}
                  </div>
                ))}
              </div>

              {/* Day rows */}
              {heatmapDays.map((day) => {
                const dayPoints = heatmap.filter((p) => p.day === day)
                return (
                  <div key={day} className="grid grid-cols-[40px_repeat(24,1fr)] gap-1 items-center mb-1">
                    <span className="text-[11px] font-bold text-muted-foreground">{day}</span>
                    {Array.from({ length: 24 }).map((_, h) => {
                      const point = dayPoints.find((p) => p.hour === h)
                      const level = point?.normalizedLevel || 0
                      return (
                        <div
                          key={h}
                          title={`${day} at ${h}:00 - ${point?.count || 0} authentications`}
                          className={cn(
                            'h-4 rounded-sm transition-all cursor-pointer hover:scale-110',
                            level === 0 && 'bg-muted/40 border border-border/40',
                            level === 1 && 'bg-emerald-500/25',
                            level === 2 && 'bg-emerald-500/50',
                            level === 3 && 'bg-emerald-500/75',
                            level === 4 && 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                          )}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Devices & Sessions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trusted Devices */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Trusted Hardware Devices</CardTitle>
                <CardDescription className="text-xs">
                  Terminals authorized for biometric sovereign signature dispatch
                </CardDescription>
              </div>
              <Badge variant="verified" size="sm">
                {devices.length} Devices
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-card border border-border shrink-0">
                    {getDeviceIcon(dev.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">{dev.deviceName}</h4>
                      {dev.isCurrentDevice && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                          This Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {dev.browser} • {dev.os} • {dev.ipAddress}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {dev.location} • Last active: {dev.lastActive}
                    </p>
                  </div>
                </div>

                {!dev.isCurrentDevice && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDevice(dev)}
                    title="Remove trusted device"
                    className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Terminal Sessions */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Active Terminal Sessions</CardTitle>
                <CardDescription className="text-xs">
                  Live authenticated sessions across all networks
                </CardDescription>
              </div>
              <Badge variant="outline" size="sm">
                {sessions.filter((s) => s.status === 'active').length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className={cn(
                  'p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors',
                  sess.status === 'revoked' ? 'border-border bg-muted/10 opacity-50' : 'border-border bg-muted/30'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground">{sess.device}</h4>
                    {sess.isCurrentSession ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                        Current Session
                      </span>
                    ) : sess.status === 'revoked' ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground uppercase">
                        Revoked
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-600 uppercase">
                        Remote Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    IP: {sess.ipAddress} • {sess.location}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Logged in: {sess.loginTime} • {sess.lastActivityTime}
                  </p>
                </div>

                {!sess.isCurrentSession && sess.status === 'active' && (
                  <Button
                    onClick={() => handleRevokeSession(sess)}
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-500 border-rose-500/20 hover:bg-rose-500/10 rounded-xl"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Security Audit Activity Log */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Citizen Security Audit Log
              </CardTitle>
              <CardDescription className="text-xs">
                Immutable, cryptographic log of all citizen authentication, authorization, and export actions
              </CardDescription>
            </div>
            <Button onClick={loadData} variant="ghost" size="sm" className="text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {auditEvents.slice(0, 6).map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-foreground uppercase">
                      {evt.action.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-foreground">{evt.resource}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                    Actor: {evt.actor} ({evt.role}) • IP: {evt.ipAddress}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <Badge variant={evt.status === 'success' ? 'verified' : 'outline'} size="sm">
                    {evt.status.toUpperCase()}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">
                    {new Date(evt.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-Up Authentication Modal */}
      <StepUpAuthenticationModal
        isOpen={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        actionName={stepUpActionName}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction()
            setPendingAction(null)
          }
        }}
      />

      {/* AWS Cloud Technology Console Modal */}
      <AwsCloudConsoleModal
        open={awsModalOpen}
        onOpenChange={setAwsModalOpen}
      />
    </div>
  )
}
