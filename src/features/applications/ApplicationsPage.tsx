import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Search,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Building,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Timer,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { EmptyState } from '@/components/ui/EmptyState'
import { civicStorage } from '@/services/storage'
import type { CivicApplication, ApplicationStatus } from '@/types'

type SortOption = 'date_desc' | 'date_asc' | 'action_first' | 'sla_urgent'

export function ApplicationsPage() {
  const [applications] = useState<CivicApplication[]>(() => civicStorage.getApplications())
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('action_first')
  const navigate = useNavigate()

  const statusTabs: { id: ApplicationStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Lifecycles' },
    { id: 'action_required', label: 'Action Required' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'completed', label: 'Completed' },
  ]

  // KPI calculations
  const kpis = useMemo(() => {
    const total = applications.length
    const actionReq = applications.filter((a) => a.status === 'action_required').length
    const underReview = applications.filter((a) => a.status === 'under_review' || a.status === 'submitted').length
    const completed = applications.filter((a) => a.status === 'completed').length
    return { total, actionReq, underReview, completed }
  }, [applications])

  // Helper to compute SLA days
  const getSLAInfo = (app: CivicApplication) => {
    if (app.status === 'completed') {
      return { daysRemaining: 0, isCompleted: true, text: 'SLA Fulfilled', variant: 'verified' as const }
    }
    const submittedTime = new Date(app.submittedAt).getTime()
    const slaTargetDays = app.serviceName.toLowerCase().includes('urgent') || app.status === 'action_required' ? 7 : 14
    const deadline = submittedTime + slaTargetDays * 24 * 60 * 60 * 1000
    const now = Date.now()
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

    if (daysRemaining <= 0) {
      return { daysRemaining: 0, isCompleted: false, text: 'SLA Scrutiny Breached', variant: 'destructive' as const }
    }
    if (daysRemaining <= 3) {
      return { daysRemaining, isCompleted: false, text: `SLA: ${daysRemaining}d remaining (Urgent)`, variant: 'warning' as const }
    }
    return { daysRemaining, isCompleted: false, text: `Officer response in ${daysRemaining}d`, variant: 'outline' as const }
  }

  const filteredApplications = useMemo(() => {
    let list = [...applications]

    if (selectedStatus !== 'all') {
      list = list.filter((a) => a.status === selectedStatus)
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q)
      )
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      }
      if (sortBy === 'date_asc') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      }
      if (sortBy === 'action_first') {
        const aScore = a.status === 'action_required' ? 2 : a.status === 'under_review' ? 1 : 0
        const bScore = b.status === 'action_required' ? 2 : b.status === 'under_review' ? 1 : 0
        return bScore - aScore
      }
      if (sortBy === 'sla_urgent') {
        const slaA = getSLAInfo(a).daysRemaining
        const slaB = getSLAInfo(b).daysRemaining
        return slaA - slaB
      }
      return 0
    })

    return list
  }, [applications, selectedStatus, searchQuery, sortBy])

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Applications & Tracking System
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time departmental workflow tracking, statutory scrutiny timelines, and action resolutions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="text-xs font-semibold"
          onClick={() => navigate('/app/services')}
        >
          Explore More Services
        </Button>
      </div>

      {/* Grouped Summary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'all' ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Tracked</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground font-display mt-1">{kpis.total}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Active dossiers</span>
        </div>

        <div
          onClick={() => setSelectedStatus('action_required')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'action_required'
              ? 'border-amber-500/50 bg-amber-500/10'
              : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-600">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Action Required</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-display mt-1">{kpis.actionReq}</p>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Needs your input</span>
        </div>

        <div
          onClick={() => setSelectedStatus('under_review')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'under_review'
              ? 'border-blue-500/50 bg-blue-500/10'
              : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Under Scrutiny</span>
            <Timer className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-display mt-1">{kpis.underReview}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">In officer review</span>
        </div>

        <div
          onClick={() => setSelectedStatus('completed')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'completed'
              ? 'border-emerald-500/50 bg-emerald-500/10'
              : 'border-border bg-card hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1">{kpis.completed}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Granted / Dispatched</span>
        </div>
      </div>

      {/* Filter Tabs & Search & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference or service..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 px-2.5 rounded-xl border border-input bg-card text-xs text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="action_first">Priority: Actions First</option>
              <option value="sla_urgent">SLA: Most Urgent</option>
              <option value="date_desc">Submitted: Newest First</option>
              <option value="date_asc">Submitted: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6" />}
          title="No Applications Found"
          description="No statutory applications match your search query or selected status filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedStatus('all')
            setSearchQuery('')
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const hasAction = app.status === 'action_required'
            const sla = getSLAInfo(app)

            return (
              <Card
                key={app.id}
                onClick={() => navigate(`/app/applications/${app.id}`)}
                className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md p-5 ${
                  hasAction ? 'border-amber-500/40 bg-amber-500/5' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {app.applicationNumber}
                      </span>
                      <StatusIndicator status={app.status} />

                      {/* SLA Countdown Badge */}
                      <Badge variant={sla.variant} size="sm" className="gap-1 text-[10px]">
                        <Clock className="w-3 h-3" />
                        {sla.text}
                      </Badge>

                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground truncate">
                      {app.serviceName}
                    </h3>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      {app.department}
                    </p>

                    {hasAction && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {app.actionRequiredMessage}
                      </p>
                    )}
                  </div>

                  {/* Right Progress & CTA */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs font-semibold text-foreground">
                        Step {app.currentStep} of {app.totalSteps}
                      </span>
                      <div className="w-32 bg-muted rounded-full h-2 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            hasAction ? 'bg-amber-500' : 'bg-primary'
                          }`}
                          style={{ width: `${(app.currentStep / app.totalSteps) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 block font-medium">
                        {app.status === 'completed' ? 'Fully Approved' : `${Math.round((app.currentStep / app.totalSteps) * 100)}% Processed`}
                      </span>
                    </div>

                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
