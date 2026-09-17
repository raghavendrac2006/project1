import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
  Lock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks'
import { citizenIntelligenceService } from '@/services/citizen-intelligence.service'
import { consentService } from '@/services/consent.service'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { BehavioralAnomaly, ActivityFeedEvent, DataFootprintField } from '@/types'

export function CitizenIntelligenceRail() {
  const [anomalies, setAnomalies] = useState<BehavioralAnomaly[]>([])
  const [activities, setActivities] = useState<ActivityFeedEvent[]>([])
  const [footprint, setFootprint] = useState<DataFootprintField[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const [anomData, actData, footData] = await Promise.all([
          citizenIntelligenceService.getBehavioralAnomalies(),
          citizenIntelligenceService.getActivityFeed(),
          citizenIntelligenceService.getDataFootprint(),
        ])
        setAnomalies(anomData.filter((a) => !a.isDismissed))
        setActivities(actData.slice(0, 5))
        setFootprint(footData.slice(0, 4))
      } catch (err) {
        console.error('Failed to load telemetry', err)
      } finally {
        setLoading(false)
      }
    }
    loadTelemetry()
  }, [])

  const handleDismissAnomaly = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    citizenIntelligenceService.dismissAnomaly(id)
    setAnomalies((prev) => prev.filter((a) => a.id !== id))
    toast.info('Security Incident Acknowledged', 'Anomaly archived to historical audit logs.')
  }

  const handleEmergencyLockdown = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const revokedCount = await consentService.emergencyLockdown()
      toast.error(
        'Identity Lockdown Activated',
        `Immediately revoked active authorization grants across ${revokedCount} external organizations.`
      )
      setAnomalies([])
    } catch {
      toast.error('Lockdown failed', 'Please retry in Privacy Center.')
    }
  }

  const handleAuthorizeDevice = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    citizenIntelligenceService.dismissAnomaly(id)
    setAnomalies((prev) => prev.filter((a) => a.id !== id))
    toast.success('Device Added to Trusted Ring', 'Location verified via biometric step-up.')
  }

  return (
    <div className="space-y-6">
      {/* 1. Real-Time Anomaly Radar */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-card space-y-4">
        {/* Radar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {anomalies.length > 0 ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              )}
            </span>
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
              Behavioural Telemetry Radar
            </span>
          </div>

          <Badge variant={anomalies.length > 0 ? 'attention' : 'verified'} size="sm" className="text-[10px]">
            {anomalies.length > 0 ? `${anomalies.length} Flagged Events` : 'Zero Anomalies'}
          </Badge>
        </div>

        {/* Anomaly Cards List */}
        {anomalies.length > 0 ? (
          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className={cn(
                  'p-3.5 rounded-xl border text-xs space-y-2 transition-all relative overflow-hidden',
                  anom.severity === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-current" />
                    <span className="font-bold text-foreground">{anom.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDismissAnomaly(anom.id, e)}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {anom.description}
                </p>

                {/* Instant Mitigations */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => handleAuthorizeDevice(anom.id, e)}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground hover:bg-muted transition-colors"
                  >
                    Authorize Device
                  </button>
                  <button
                    onClick={handleEmergencyLockdown}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold transition-colors"
                  >
                    Lockdown Identity
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-1">
            <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="font-bold text-xs text-foreground">Clean Operational Perimeter</p>
            <p className="text-[11px] text-muted-foreground">
              No unauthorized geolocation hops or rapid automated harvesting attempts detected.
            </p>
          </div>
        )}
      </div>

      {/* 2. Live Citizen Telemetry Stream */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              Live Audit Stream
            </span>
          </div>
          <button
            onClick={() => navigate(ROUTES.APP.DATA_DASHBOARD)}
            className="text-[10px] font-mono font-bold text-primary hover:underline flex items-center gap-1"
          >
            Telemetry &gt;
          </button>
        </div>

        <div className="divide-y divide-border/40">
          {activities.map((event) => (
            <div
              key={event.id}
              onClick={() => event.relatedRoute && navigate(event.relatedRoute)}
              className="py-2.5 flex items-start gap-3 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors group"
            >
              <div className="w-2 h-2 rounded-full bg-primary/60 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {event.title}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {event.description}
                </p>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5">
                {event.timestamp ? new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sensitive Data Footprint Gauge */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
            Sovereign Data Footprint
          </span>
          <span className="text-[10px] font-mono font-bold text-muted-foreground">
            Zero-Trust Matrix
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Top exposed attributes authorized across verified external institutions:
        </p>

        <div className="space-y-2 pt-1">
          {footprint.map((fp) => (
            <div key={fp.field} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground">{fp.label}</span>
                <span className="font-mono text-muted-foreground text-[10px]">
                  {fp.sharedWithOrgs} Orgs ({fp.riskLevel})
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    fp.riskLevel === 'high' ? 'bg-amber-500' : fp.riskLevel === 'medium' ? 'bg-sky-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${Math.min(100, fp.sharedWithOrgs * 25)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTES.APP.PRIVACY)}
          className="w-full text-xs font-bold gap-1.5 mt-2"
        >
          <Lock className="w-3 h-3 text-primary" />
          Manage Consent Grants
        </Button>
      </div>
    </div>
  )
}
