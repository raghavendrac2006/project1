import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Trash2,
  Lock,
  LogOut,
  AlertTriangle,
  History,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StepUpAuthenticationModal } from '@/components/auth/StepUpAuthenticationModal'
import { securityService } from '@/services/security.service'
import { useToast, useAuth } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { TrustedDevice, UserSession, AuditEvent } from '@/types'

export function SecurityCenterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [devices, setDevices] = useState<TrustedDevice[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Step-Up Modal state
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [stepUpActionName, setStepUpActionName] = useState('Authorizing Security Action')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [devList, sessList, auditList] = await Promise.all([
        securityService.getTrustedDevices(),
        securityService.getUserSessions(),
        securityService.getSecurityAuditEvents(),
      ])
      setDevices(devList)
      setSessions(sessList)
      setAuditEvents(auditList)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card to-sky-500/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 uppercase tracking-wider">
              Sovereign Hardware Protection
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Security & Device Control Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage trusted hardware terminals, revoke active remote sessions, review real-time security audit trails, and maintain sovereign key custody.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
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

      {/* Security Health Status Card */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Identity Tier</span>
            <p className="text-sm font-bold text-foreground">Level 3 Biometric Sovereign</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">2FA & Passkeys</span>
            <p className="text-sm font-bold text-foreground">FIDO2 Hardware Key Active</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Privacy Status</span>
            <Link to={ROUTES.APP.PRIVACY} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Consent Controls <Globe className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

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
    </div>
  )
}
