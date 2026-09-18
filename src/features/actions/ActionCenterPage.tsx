import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileUp,
  CreditCard,
  Users,
  KeyRound,
  Check,
  Building2,
  Calendar,
} from 'lucide-react'
import { actionService } from '@/services/action.service'
import { useToast } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { CitizenActionItem, ActionCategory } from '@/types'

export function ActionCenterPage() {
  const [actions, setActions] = useState<CitizenActionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | ActionCategory>('all')
  const toast = useToast()
  const navigate = useNavigate()

  const loadActions = async () => {
    setIsLoading(true)
    try {
      const data = await actionService.getActions()
      setActions(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadActions()
  }, [])

  const handleResolveAction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await actionService.completeAction(id)
      setActions((prev) => prev.map((a) => (a.id === id ? { ...a, isCompleted: true } : a)))
      toast.success('Action Resolved', 'The civic action item has been marked as completed.')
    } catch {
      toast.error('Error', 'Could not resolve action.')
    }
  }

  const filteredActions = actions.filter((a) => {
    if (selectedCategory === 'all') return true
    return a.category === selectedCategory
  })

  const pendingCount = actions.filter((a) => !a.isCompleted).length
  const criticalCount = actions.filter((a) => !a.isCompleted && a.urgency === 'critical').length

  const getCategoryIcon = (category: ActionCategory) => {
    switch (category) {
      case 'consent_approval':
        return <ShieldAlert className="w-4 h-4 text-purple-500" />
      case 'missing_document':
        return <FileUp className="w-4 h-4 text-amber-500" />
      case 'application_query':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'expiring_credential':
      case 'identity_renewal':
        return <Clock className="w-4 h-4 text-rose-500" />
      case 'family_task':
        return <Users className="w-4 h-4 text-indigo-500" />
      case 'payment_due':
        return <CreditCard className="w-4 h-4 text-emerald-500" />
      case 'security_alert':
        return <KeyRound className="w-4 h-4 text-rose-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-primary" />
    }
  }

  const getUrgencyBadge = (urgency: CitizenActionItem['urgency']) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            Critical
          </span>
        )
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            High Priority
          </span>
        )
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            Medium
          </span>
        )
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border uppercase tracking-wider">
            Informational
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Summary Card */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card via-card to-primary/5 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                CiviqOne Proactive Intelligence
              </span>
              {criticalCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  {criticalCount} Critical Required
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
              Citizen Action Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Consolidated statutory obligations, urgent consent grants, missing documents, and credential renewals requiring citizen intervention.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-black text-foreground">{pendingCount}</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Pending Actions</p>
            </div>
            <Button
              onClick={loadActions}
              variant="outline"
              size="sm"
              className="text-xs font-bold rounded-xl"
            >
              Refresh Stream
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border',
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'
          )}
        >
          All Actions ({actions.length})
        </button>
        <button
          onClick={() => setSelectedCategory('consent_approval')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5',
            selectedCategory === 'consent_approval'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Consent Requests
        </button>
        <button
          onClick={() => setSelectedCategory('missing_document')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5',
            selectedCategory === 'missing_document'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'
          )}
        >
          <FileUp className="w-3.5 h-3.5" />
          Missing Docs
        </button>
        <button
          onClick={() => setSelectedCategory('expiring_credential')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5',
            selectedCategory === 'expiring_credential'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Expiring Items
        </button>
        <button
          onClick={() => setSelectedCategory('family_task')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5',
            selectedCategory === 'family_task'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          Family Tasks
        </button>
        <button
          onClick={() => setSelectedCategory('payment_due')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5',
            selectedCategory === 'payment_due'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'
          )}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Payments Due
        </button>
      </div>

      {/* Action Items List */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground text-sm">
          Loading citizen actions...
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border text-center bg-card">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">No Pending Actions</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You are completely caught up! All statutory filings, consents, and document requirements are in good standing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((item) => (
            <div
              key={item.id}
              className={cn(
                'p-5 rounded-2xl border bg-card transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/40 shadow-sm',
                item.isCompleted ? 'opacity-60 border-border bg-muted/20' : 'border-border'
              )}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 p-2 rounded-xl bg-muted border border-border shrink-0">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getUrgencyBadge(item.urgency)}
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {item.sourceEntity}
                    </span>
                    {item.dueDate && (
                      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 border-l border-border pl-2">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        Due {item.dueDate}
                      </span>
                    )}
                  </div>

                  <h3 className={cn('text-sm font-bold text-foreground', item.isCompleted && 'line-through')}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                {!item.isCompleted ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleResolveAction(item.id, e)}
                      title="Mark as completed"
                      className="h-8 px-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Done</span>
                    </button>

                    <Button
                      onClick={() => navigate(item.targetRoute)}
                      size="sm"
                      className="text-xs font-bold rounded-xl shadow-sm"
                    >
                      {item.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
