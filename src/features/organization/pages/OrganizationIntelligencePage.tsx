import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Clock,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  organizationIntelligenceService,
  type ReadinessCheck,
} from '@/services/organization-intelligence.service'
import type { AnomalySignal, SLAForecast, AccessFrequencyPoint } from '@/types'

// ─── Anomaly severity helpers ─────────────────────────────────────────────────
const SEVERITY_STYLES = {
  critical: {
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
    border: 'border-l-4 border-l-rose-500',
    bg: '',
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    border: 'border-l-4 border-l-amber-500',
    bg: '',
  },
  info: {
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    border: 'border-l-4 border-l-blue-400',
    bg: '',
  },
}

// ─── Access Frequency Heatmap ─────────────────────────────────────────────────
const HEATMAP_COLORS = [
  'bg-muted',
  'bg-emerald-200/60 dark:bg-emerald-900/40',
  'bg-emerald-400/50 dark:bg-emerald-700/50',
  'bg-emerald-500/70 dark:bg-emerald-600/70',
  'bg-emerald-600 dark:bg-emerald-500',
]
const DISPLAY_HOURS = [0, 3, 6, 9, 12, 15, 18, 21]

function AccessHeatmap({ data }: { data: AccessFrequencyPoint[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Hour labels */}
        <div className="flex items-center gap-0.5 mb-1 ml-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="flex-1 text-center text-[9px] text-muted-foreground"
              style={{ minWidth: '12px' }}
            >
              {DISPLAY_HOURS.includes(h) ? `${h}h` : ''}
            </div>
          ))}
        </div>
        {/* Rows */}
        {days.map((day) => {
          const dayPoints = data.filter((p) => p.dayLabel === day)
          return (
            <div key={day} className="flex items-center gap-0.5 mb-0.5">
              <span className="text-[9px] text-muted-foreground w-8 shrink-0 text-right pr-1.5">
                {day}
              </span>
              {dayPoints.map((p) => (
                <div
                  key={p.hour}
                  title={`${day} ${p.hour}:00 — ${p.count} queries`}
                  className={`flex-1 h-3.5 rounded-sm transition-colors ${HEATMAP_COLORS[p.normalizedLevel]}`}
                  style={{ minWidth: '12px' }}
                />
              ))}
            </div>
          )
        })}
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-muted-foreground">
          <span>Less</span>
          {HEATMAP_COLORS.map((c, i) => (
            <div key={i} className={`h-3 w-4 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

// ─── SLA Forecast Row ──────────────────────────────────────────────────────────
function SLARow({ forecast }: { forecast: SLAForecast }) {
  const overTarget = forecast.forecastDays > forecast.targetDays
  const TrendIcon =
    forecast.trend === 'improving' ? TrendingUp : forecast.trend === 'degrading' ? TrendingDown : Minus
  const trendColor =
    forecast.trend === 'improving'
      ? 'text-emerald-500'
      : forecast.trend === 'degrading'
      ? 'text-rose-500'
      : 'text-muted-foreground'
  const barWidth = Math.min((forecast.currentAvgDays / (forecast.targetDays * 1.5)) * 100, 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{forecast.serviceName}</span>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`font-bold font-mono ${overTarget ? 'text-rose-500' : 'text-emerald-600'}`}>
            {forecast.forecastDays}d
          </span>
          <span className="text-muted-foreground text-[10px]">/ {forecast.targetDays}d target</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all ${overTarget ? 'bg-rose-500' : 'bg-emerald-500'}`}
          style={{ width: `${barWidth}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/30"
          style={{ left: `${Math.min((forecast.targetDays / (forecast.targetDays * 1.5)) * 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Confidence: <span className="font-semibold text-foreground">{forecast.confidence}%</span>
      </p>
    </div>
  )
}

// ─── Readiness Check Item ──────────────────────────────────────────────────────
function ReadinessItem({ check }: { check: ReadinessCheck }) {
  const iconMap = {
    pass: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    fail: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
  }
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      {iconMap[check.status]}
      <div className="flex-1">
        <p className="text-xs font-semibold text-foreground">{check.label}</p>
        <p className="text-[11px] text-muted-foreground">{check.description}</p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function OrganizationIntelligencePage() {
  const [anomalies, setAnomalies] = useState<AnomalySignal[]>([])
  const [slaForecasts, setSlaForecasts] = useState<SLAForecast[]>([])
  const [heatmap, setHeatmap] = useState<AccessFrequencyPoint[]>([])
  const [readiness, setReadiness] = useState<ReadinessCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      organizationIntelligenceService.getAnomalySignals(),
      organizationIntelligenceService.getSLAForecasts(),
      organizationIntelligenceService.getAccessFrequency(),
      organizationIntelligenceService.getReadinessChecks(),
    ]).then(([a, s, h, r]) => {
      setAnomalies(a)
      setSlaForecasts(s)
      setHeatmap(h)
      setReadiness(r)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-xs text-muted-foreground animate-pulse">Fetching operational telemetry…</div>
  }

  const unresolvedAnomalies = anomalies.filter((a) => !a.isResolved)
  const passCount = readiness.filter((r) => r.status === 'pass').length

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Operational Intelligence
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Anomaly detection, access frequency monitoring, SLA forecasting, and application readiness checks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unresolvedAnomalies.length > 0 && (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {unresolvedAnomalies.length} Active Signal{unresolvedAnomalies.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Top row — Anomaly Signals + Readiness */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Anomaly Feed */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Anomaly Signal Feed</h2>
          {anomalies.map((a) => {
            const styles = SEVERITY_STYLES[a.severity]
            return (
              <div
                key={a.id}
                className={`p-4 rounded-xl border border-border bg-card ${styles.border} ${
                  a.isResolved ? 'opacity-55' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase ${styles.badge}`}>
                        {a.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] text-muted-foreground border-border">
                        {a.category.replace('_', ' ')}
                      </Badge>
                      {a.isResolved && (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                          RESOLVED
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold text-foreground">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {a.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(a.detectedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {a.affectedCitizenCount > 0 && (
                        <span>· {a.affectedCitizenCount} citizen{a.affectedCitizenCount > 1 ? 's' : ''} affected</span>
                      )}
                    </div>
                  </div>
                  {!a.isResolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5 shrink-0"
                      onClick={() => {
                        organizationIntelligenceService.resolveAnomaly(a.id)
                        setAnomalies((prev) =>
                          prev.map((x) =>
                            x.id === a.id ? { ...x, isResolved: true, resolvedAt: new Date().toISOString() } : x
                          )
                        )
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Readiness Checklist */}
        <Card className="border-border h-fit">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">Application Readiness</CardTitle>
              <Badge variant="outline" className={`text-[10px] font-bold ${
                passCount === readiness.length
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              }`}>
                {passCount}/{readiness.length}
              </Badge>
            </div>
            <CardDescription className="text-[11px] text-muted-foreground">
              Pre-flight checks for operational compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {readiness.map((r) => (
              <ReadinessItem key={r.label} check={r} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SLA Forecast */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">SLA Turnaround Forecast</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Projected resolution times per service against SLA targets. Marker shows target boundary.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          {slaForecasts.map((f) => (
            <SLARow key={f.serviceId} forecast={f} />
          ))}
        </CardContent>
      </Card>

      {/* Access Frequency Heatmap */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">
            Citizen Data Access Frequency Heatmap
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Staff citizen profile queries by hour-of-day and day-of-week. Abnormal off-hours spikes
            trigger anomaly signals automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {heatmap.length > 0 ? (
            <AccessHeatmap data={heatmap} />
          ) : (
            <p className="text-xs text-muted-foreground">No frequency data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
