import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Filter,
  Kanban,
  Table as TableIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { organizationService } from '@/services/organization.service'
import { applicationService } from '@/services/application.service'
import { realtimeBus } from '@/services/eventBus'
import { ROUTES } from '@/constants/routes'
import { useToast } from '@/hooks'
import type { CivicApplication } from '@/types'

export function OrganizationApplicationsPage() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [applications, setApplications] = useState<CivicApplication[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban')

  const loadApps = async () => {
    const apps = await organizationService.getApplications()
    setApplications(apps)
  }

  useEffect(() => {
    loadApps()

    // Real-time synchronization
    const unsub = realtimeBus.subscribe('APPLICATION_STATUS_UPDATED', () => {
      loadApps()
    })

    return () => unsub()
  }, [])

  const handleQuickAdvance = async (appId: string) => {
    const updated = await applicationService.advanceWorkflowStage(appId)
    success(
      'Stage Advanced',
      `Application ${updated.applicationNumber} advanced to ${updated.status.toUpperCase()}`
    )
    loadApps()
  }

  const filtered = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      return (
        app.applicationNumber.toLowerCase().includes(q) ||
        app.serviceName.toLowerCase().includes(q) ||
        app.department.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Applications Processing Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review incoming citizen dossiers, verify authorized credentials, and record determination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-muted border border-border">
            <Button
              size="sm"
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('kanban')}
              className="h-8 text-xs gap-1.5"
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('table')}
              className="h-8 text-xs gap-1.5"
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
          {['all', 'submitted', 'under_review', 'action_required', 'approved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st === 'all' ? 'All Applications' : st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by app # or service..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* View 1: Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { id: 'submitted', label: 'Intake / Submitted', color: 'border-sky-500/30 bg-sky-500/5' },
            { id: 'under_review', label: 'Under Review & Scrutiny', color: 'border-blue-500/30 bg-blue-500/5' },
            { id: 'action_required', label: 'Action Required', color: 'border-amber-500/30 bg-amber-500/5' },
            { id: 'approved', label: 'Approved & Certified', color: 'border-emerald-500/30 bg-emerald-500/5' },
          ].map((col) => {
            const colApps = filtered.filter((a) => {
              if (col.id === 'approved') return a.status === 'approved' || a.status === 'completed'
              return a.status === col.id
            })

            return (
              <div key={col.id} className="flex flex-col space-y-3">
                <div className={`p-3 rounded-xl border ${col.color} flex items-center justify-between`}>
                  <span className="text-xs font-bold text-foreground">{col.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-card font-bold border border-border">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {colApps.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                      No applications in this stage
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <Card key={app.id} className="border-border hover:border-primary/50 transition-all shadow-sm">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-primary">{app.applicationNumber}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(app.submittedAt).toLocaleDateString()}</span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-foreground leading-snug">{app.serviceName}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{app.department}</p>
                          </div>

                          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{app.attachedDocuments.length} files attached</span>
                            <span className="font-mono font-bold text-foreground">Step {app.currentStep || 1}/4</span>
                          </div>

                          <div className="pt-1 flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(ROUTES.ORGANIZATION.APPLICATION_DETAIL(app.id))}
                              className="h-7 px-2.5 text-[11px] flex-1"
                            >
                              Process
                            </Button>
                            {app.status !== 'approved' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleQuickAdvance(app.id)}
                                className="h-7 px-2.5 text-[11px] text-emerald-600 gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              >
                                Advance <ArrowRight className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* View 2: Table View */
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application Ref</TableHead>
                  <TableHead>Service Program</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Workflow Status</TableHead>
                  <TableHead>Required Documents</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                      No applications match the current filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="text-xs font-mono font-bold text-foreground">
                        {app.applicationNumber}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {app.serviceName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold ${
                            app.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : app.status === 'action_required'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : app.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                              : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {app.attachedDocuments.length} Attached
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(ROUTES.ORGANIZATION.APPLICATION_DETAIL(app.id))}
                          className="text-xs h-7 px-3 text-primary hover:bg-primary/5"
                        >
                          Process Dossier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
