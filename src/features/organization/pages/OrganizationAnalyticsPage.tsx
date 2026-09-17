import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { organizationService } from '@/services/organization.service'

// ─── Mock trend data ──────────────────────────────────────────────────────────
const MONTHLY_TREND = [
  { month: 'Apr', applications: 38, resolved: 33 },
  { month: 'May', applications: 52, resolved: 48 },
  { month: 'Jun', applications: 45, resolved: 40 },
  { month: 'Jul', applications: 61, resolved: 55 },
  { month: 'Aug', applications: 74, resolved: 68 },
  { month: 'Sep', applications: 58, resolved: 52 },
]

const TOP_SERVICES = [
  { name: 'Health Insurance Claim', volume: 312, pct: 100, color: 'bg-emerald-500' },
  { name: 'Personal Loan Pre-Approval', volume: 198, pct: 63, color: 'bg-blue-500' },
  { name: 'Motor Insurance Renewal', volume: 152, pct: 49, color: 'bg-purple-500' },
  { name: 'Life Insurance Issuance', volume: 87, pct: 28, color: 'bg-amber-500' },
  { name: 'Group Health Policy', volume: 41, pct: 13, color: 'bg-rose-400' },
]

const CONSENT_FUNNEL = [
  { stage: 'Access Requests Sent', count: 24, pct: 100, color: 'bg-blue-500' },
  { stage: 'Citizens Responded', count: 21, pct: 88, color: 'bg-indigo-500' },
  { stage: 'Fully Approved', count: 14, pct: 58, color: 'bg-emerald-500' },
  { stage: 'Partially Approved', count: 5, pct: 21, color: 'bg-amber-500' },
  { stage: 'Denied', count: 2, pct: 8, color: 'bg-rose-500' },
]

const SLA_HEATMAP = [
  { service: 'Health Insurance Claim', mon: 2, tue: 3, wed: 4, thu: 2, fri: 3 },
  { service: 'Loan Pre-Approval', mon: 5, tue: 6, wed: 4, thu: 5, fri: 7 },
  { service: 'Motor Insurance', mon: 1, tue: 1, wed: 2, thu: 1, fri: 1 },
  { service: 'Life Insurance', mon: 6, tue: 5, wed: 7, thu: 6, fri: 6 },
]

const SLA_TARGET = 5.0

function slaCellColor(days: number): string {
  if (days <= SLA_TARGET * 0.5) return 'bg-emerald-500/80 text-white'
  if (days <= SLA_TARGET) return 'bg-amber-400/80 text-white'
  return 'bg-rose-500/80 text-white'
}

const maxBarValue = Math.max(...MONTHLY_TREND.map((m) => m.applications))

export function OrganizationAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const data = await organizationService.getAnalytics()
      setStats(data)
    }
    load()
  }, [])

  if (!stats) return <div className="p-8 text-xs text-muted-foreground animate-pulse">Loading operational telemetry…</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Operational Analytics &amp; Telemetry
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time metrics on citizen application throughput, SLA adherence, consent conversion,
          and service performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Lifetime Applications</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.totalApplications}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↑ 12% vs last month</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Avg Resolution Turnaround</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.avgProcessingDays} Days</h3>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">SLA Target: 5.0 Days ✓</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Consent Approval Rate</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.consentApprovalRate}%</h3>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">High Citizen Trust</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Active Consented Grants</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.activeGrantsCount}</h3>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              {stats.expiringGrantsCount} Expiring &lt; 7d
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Application Trend */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">Monthly Application Throughput</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Applications submitted vs resolved over the past 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-end gap-3 h-36">
            {MONTHLY_TREND.map((m) => {
              const subPct = (m.applications / maxBarValue) * 100
              const resPct = (m.resolved / maxBarValue) * 100
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-28">
                    <div
                      className="flex-1 rounded-t-md bg-blue-500/70 transition-all"
                      style={{ height: `${subPct}%` }}
                      title={`Submitted: ${m.applications}`}
                    />
                    <div
                      className="flex-1 rounded-t-md bg-emerald-500/70 transition-all"
                      style={{ height: `${resPct}%` }}
                      title={`Resolved: ${m.resolved}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500/70 inline-block" />
              Submitted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70 inline-block" />
              Resolved
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Services by Volume */}
        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">Top Services by Volume</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Application submissions per service (last 12 months).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {TOP_SERVICES.map((svc) => (
              <div key={svc.name}>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="font-medium text-foreground truncate pr-2">{svc.name}</span>
                  <span className="font-bold text-foreground shrink-0">{svc.volume}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${svc.color}`} style={{ width: `${svc.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Consent Funnel */}
        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">Consent Request Funnel</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              From dispatched access requests to citizen determinations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {CONSENT_FUNNEL.map((stage, i) => (
              <div key={stage.stage}>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="text-muted-foreground">{stage.stage}</span>
                  <span className="font-bold text-foreground">{stage.count}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.color} transition-all`}
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>
                Overall consent conversion:{' '}
                <strong className="text-foreground">{stats.consentApprovalRate}%</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Compliance Heatmap */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">SLA Compliance Heatmap</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Average resolution days per service per weekday.{' '}
            <span className="text-emerald-600 font-semibold">Green</span> = within SLA,{' '}
            <span className="text-amber-600 font-semibold">Amber</span> = approaching,{' '}
            <span className="text-rose-500 font-semibold">Red</span> = breached (target: {SLA_TARGET}d).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 overflow-x-auto">
          <table className="w-full min-w-[500px] text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10px] text-muted-foreground font-semibold pb-2 pr-3 w-40">
                  Service
                </th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
                  <th key={d} className="text-center text-[10px] text-muted-foreground font-semibold pb-2 px-1">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-1">
              {SLA_HEATMAP.map((row) => (
                <tr key={row.service} className="mb-1">
                  <td className="text-[11px] text-foreground font-medium pr-3 py-1 truncate max-w-[160px]">
                    {row.service}
                  </td>
                  {[row.mon, row.tue, row.wed, row.thu, row.fri].map((days, idx) => (
                    <td key={idx} className="px-1 py-1 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md font-bold font-mono text-[11px] ${slaCellColor(days)}`}
                      >
                        {days}d
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Turnaround + Consent Ratio (preserved from original) */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">Turnaround Time Distribution</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Application disposition speed across volume.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            {[
              { label: '< 24 Hours (Instant Approval)', pct: 42, color: 'bg-emerald-500' },
              { label: '1 - 3 Business Days', pct: 38, color: 'bg-blue-500' },
              { label: '3 - 5 Business Days', pct: 16, color: 'bg-amber-500' },
              { label: '> 5 Business Days (Escalated)', pct: 4, color: 'bg-rose-500' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between mb-1 text-muted-foreground">
                  <span>{row.label}</span>
                  <span className="font-bold text-foreground">{row.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">Citizen Consent Response Ratio</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Granular determination of dispatched requests.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Fully or Partially Consented</p>
                <p className="text-[11px] text-muted-foreground">{stats.approvedRequestsCount} requests authorized</p>
              </div>
              <span className="text-lg font-bold text-emerald-600 font-mono">{stats.consentApprovalRate}%</span>
            </div>
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Denied by Citizen</p>
                <p className="text-[11px] text-muted-foreground">{stats.deniedRequestsCount} requests withheld</p>
              </div>
              <span className="text-lg font-bold text-rose-600 font-mono">15.5%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
