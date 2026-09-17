import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Search,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Building,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { EmptyState } from '@/components/ui/EmptyState'
import { civicStorage } from '@/services/storage'
import type { CivicApplication, ApplicationStatus } from '@/types'

export function ApplicationsPage() {
  const [applications] = useState<CivicApplication[]>(() => civicStorage.getApplications())
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const statusTabs: { id: ApplicationStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Lifecycles' },
    { id: 'action_required', label: 'Action Required' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'completed', label: 'Completed' },
  ]

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

    return list
  }, [applications, selectedStatus, searchQuery])

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Applications & Tracking System
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time departmental workflow tracking, statutory scrutiny timelines, and action resolutions
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60 no-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === tab.id
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by application reference number or service name..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
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
            return (
              <Card
                key={app.id}
                onClick={() => navigate(`/app/applications/${app.id}`)}
                className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-card p-5 ${
                  hasAction ? 'border-amber-500/40 bg-amber-500/5' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-primary">
                        {app.applicationNumber}
                      </span>
                      <StatusIndicator status={app.status} />
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Submitted: {new Date(app.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
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
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 pt-1">
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
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {app.status === 'completed' ? 'Fully Approved' : 'In Scrutiny'}
                      </span>
                    </div>

                    <Button variant="ghost" size="icon" className="text-muted-foreground">
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
