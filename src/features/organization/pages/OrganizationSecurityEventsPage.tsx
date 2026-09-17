import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldOff,
  UserMinus,
  Shield,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { organizationIntelligenceService } from '@/services/organization-intelligence.service'
import type { OrgSecurityEvent, OffboardingTask } from '@/types'

const SEVERITY_STYLES: Record<OrgSecurityEvent['severity'], string> = {
  critical: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
}

const OUTCOME_STYLES: Record<OrgSecurityEvent['outcome'], string> = {
  blocked: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  flagged: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  allowed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  resolved: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
}

const CATEGORY_ICONS: Record<OrgSecurityEvent['category'], React.ReactNode> = {
  unauthorized_access: <ShieldOff className="w-4 h-4 text-rose-500" />,
  staff_offboarding: <UserMinus className="w-4 h-4 text-amber-500" />,
  policy_violation: <XCircle className="w-4 h-4 text-amber-500" />,
  anomalous_query: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  session_hijack_attempt: <ShieldOff className="w-4 h-4 text-rose-500" />,
  privilege_escalation: <AlertTriangle className="w-4 h-4 text-purple-500" />,
}

export function OrganizationSecurityEventsPage() {
  const [events, setEvents] = useState<OrgSecurityEvent[]>([])
  const [offboarding, setOffboarding] = useState<OffboardingTask[]>([])
  const [activeTab, setActiveTab] = useState<'events' | 'offboarding'>('events')
  const [severityFilter, setSeverityFilter] = useState<'all' | OrgSecurityEvent['severity']>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      organizationIntelligenceService.getSecurityEvents(),
      organizationIntelligenceService.getOffboardingTasks(),
    ]).then(([e, o]) => {
      setEvents(e)
      setOffboarding(o)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-xs text-muted-foreground animate-pulse">Loading security events…</div>
  }

  const filteredEvents =
    severityFilter === 'all' ? events : events.filter((e) => e.severity === severityFilter)

  const stats = {
    critical: events.filter((e) => e.severity === 'critical').length,
    high: events.filter((e) => e.severity === 'high').length,
    blocked: events.filter((e) => e.outcome === 'blocked').length,
    flagged: events.filter((e) => e.outcome === 'flagged').length,
  }

  const offboardingPending = offboarding.filter((t) => t.status === 'pending' || t.status === 'overdue')
  const offboardingComplete = offboarding.filter((t) => t.status === 'completed')

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-rose-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Security Events
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Staff security incidents, policy violations, and active offboarding checklists.
          </p>
        </div>
        {(stats.critical > 0 || stats.high > 0) && (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {stats.critical} Critical · {stats.high} High
          </Badge>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Critical Events', value: stats.critical, color: 'text-rose-600' },
          { label: 'High Severity', value: stats.high, color: 'text-orange-600' },
          { label: 'Blocked Actions', value: stats.blocked, color: 'text-rose-500' },
          { label: 'Flagged for Review', value: stats.flagged, color: 'text-amber-600' },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['events', 'offboarding'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 px-1 text-xs font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'events' ? 'Security Event Log' : `Offboarding Checklist`}
            {tab === 'offboarding' && offboardingPending.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[9px] font-bold">
                {offboardingPending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Severity filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  severityFilter === s
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Event cards */}
          <div className="space-y-3">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border border-border bg-card flex items-start gap-3 ${
                  evt.severity === 'critical' ? 'border-l-4 border-l-rose-500' :
                  evt.severity === 'high' ? 'border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">{CATEGORY_ICONS[evt.category]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className={`text-[9px] font-bold ${SEVERITY_STYLES[evt.severity]}`}>
                      {evt.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={`text-[9px] font-bold ${OUTCOME_STYLES[evt.outcome]}`}>
                      {evt.outcome.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {evt.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{evt.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {evt.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      {evt.actor}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{evt.actorRole}</span>
                    <span>·</span>
                    <span className="font-mono">{evt.ipAddress}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(evt.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(evt.metadata).map(([k, v]) => (
                        <span
                          key={k}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground"
                        >
                          <span className="text-foreground">{k}:</span> {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No security events match the selected severity.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offboarding Tab */}
      {activeTab === 'offboarding' && (
        <div className="space-y-4">
          {/* Member info */}
          {offboarding.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <UserMinus className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-foreground">
                  Offboarding: {offboarding[0].memberName}
                </span>
                <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                  {offboarding[0].memberRole}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Member inactive for 45 days. Complete all tasks below to finalize offboarding and revoke data access privileges.
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(offboardingComplete.length / offboarding.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground">
              {offboardingComplete.length}/{offboarding.length} complete
            </span>
          </div>

          {/* Task list */}
          <Card className="border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offboarding.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="text-xs font-medium text-foreground">
                        {task.task}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold ${
                            task.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : task.status === 'overdue'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }`}
                        >
                          {task.status === 'completed' ? (
                            <><CheckCircle2 className="w-2.5 h-2.5 mr-1 inline" />DONE</>
                          ) : task.status === 'overdue' ? (
                            <><AlertTriangle className="w-2.5 h-2.5 mr-1 inline" />OVERDUE</>
                          ) : (
                            <><Clock className="w-2.5 h-2.5 mr-1 inline" />PENDING</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {task.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() =>
                              setOffboarding((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
                                    : t
                                )
                              )
                            }
                          >
                            Mark Done
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Staff offboarding in this portal is a frontend workflow tracker only. Actual access
              revocation, session invalidation, and registry removal require action on your backend
              IAM system. This checklist serves as a human-readable audit trail.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
