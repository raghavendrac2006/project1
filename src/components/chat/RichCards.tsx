import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Headphones,
  CreditCard,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

import { DiagnosticBlueprintCard } from './DiagnosticBlueprintCard'
import type { DiagnosticBlueprint } from '@/types'

interface RichCardProps {
  type: 'application' | 'service' | 'grievance' | 'officer' | 'payment' | 'diagnostic' | 'step_guide'
  data: Record<string, any>
  onAction?: (action: string, payload?: any) => void
}

export function RichCards({ type, data, onAction }: RichCardProps) {
  const navigate = useNavigate()

  if (type === 'application') {
    return (
      <div className="mt-2.5 p-3.5 rounded-xl border border-primary/25 bg-card shadow-sm space-y-2.5 max-w-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground truncate">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{data.serviceName || 'Statutory Application'}</span>
          </div>
          <Badge
            variant={data.status === 'action_required' ? 'attention' : 'pending'}
            size="sm"
          >
            {data.status === 'action_required' ? 'Action Required' : 'In Review'}
          </Badge>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
          <span>#{data.applicationNumber}</span>
          <span>Step {data.currentStep} of {data.totalSteps}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              data.status === 'action_required' ? 'bg-amber-500' : 'bg-primary'
            )}
            style={{ width: `${(data.currentStep / data.totalSteps) * 100}%` }}
          />
        </div>

        {data.actionRequiredMessage && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-snug">{data.actionRequiredMessage}</span>
          </div>
        )}

        <Button
          size="sm"
          variant="primary"
          className="w-full h-8 text-xs font-semibold gap-1.5 rounded-lg"
          onClick={() => {
            if (data.targetUrl) navigate(data.targetUrl)
            onAction?.('navigate', data.targetUrl)
          }}
        >
          <span>Resolve / View Application</span>
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  if (type === 'service') {
    return (
      <div className="mt-2.5 p-3.5 rounded-xl border border-border bg-card shadow-sm space-y-2.5 max-w-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground leading-tight truncate">
              {data.title}
            </h4>
            <p className="text-[10px] text-muted-foreground truncate">{data.department}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-2 rounded-lg border border-border/50">
          <div>
            <span className="text-[10px] text-muted-foreground block">Subsidy / Benefit</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {data.subsidyAmount || 'Statutory Relief'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">SLA Processing</span>
            <span className="font-semibold text-foreground">{data.processingTime || '15 Days'}</span>
          </div>
        </div>

        {data.requiredDocs && (
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Required Documents:
            </span>
            <ul className="text-[11px] text-foreground space-y-0.5">
              {data.requiredDocs.map((doc: string, idx: number) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          size="sm"
          className="w-full h-8 text-xs font-semibold gap-1.5 rounded-lg"
          onClick={() => {
            if (data.targetUrl) navigate(data.targetUrl)
            onAction?.('navigate', data.targetUrl)
          }}
        >
          <span>Apply Online Now</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  if (type === 'grievance') {
    return (
      <div className="mt-2.5 p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/10 shadow-sm space-y-2.5 max-w-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Building2 className="w-4 h-4 text-rose-500" />
            <span>Statutory Citizen Grievance</span>
          </div>
          <Badge variant="attention" size="sm">
            {data.slaHours || 48}h Guaranteed SLA
          </Badge>
        </div>

        <div className="text-[11px] text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">{data.suggestedDepartment}</p>
          <p className="text-[10.5px] italic text-muted-foreground truncate">{data.suggestedSubject}</p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg gap-1.5"
            onClick={() => {
              navigate(data.targetUrl || '/app/support?tab=lodge')
              onAction?.('navigate', data.targetUrl)
            }}
          >
            <span>Proceed to File Grievance</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  if (type === 'officer') {
    return (
      <div className="mt-2.5 p-3.5 rounded-xl border border-primary/30 bg-primary/5 shadow-sm space-y-2.5 max-w-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0 relative">
            <Headphones className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-foreground truncate">{data.officerName}</h4>
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{data.designation}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10.5px] text-muted-foreground bg-card/60 p-2 rounded-lg border border-border/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {data.status || 'Active On Duty'}
          </span>
          <span className="font-mono text-foreground font-semibold">Wait Time: {data.queueWaitTime || '< 1m'}</span>
        </div>

        <Button
          size="sm"
          className="w-full h-8 text-xs font-semibold gap-1.5 rounded-lg"
          onClick={() => {
            navigate(data.targetUrl || '/app/support?tab=live')
            onAction?.('connect_officer', data)
          }}
        >
          <span>Connect with Officer Now</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  if (type === 'payment') {
    return (
      <div className="mt-2.5 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 shadow-sm space-y-2 max-w-sm">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-foreground">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            {data.recentTransaction}
          </span>
          <span className="text-emerald-600 font-bold">{data.amount}</span>
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Status: {data.status}</span>
          <span>BBPS Certified</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs font-semibold rounded-lg"
          onClick={() => {
            navigate(data.targetUrl || '/app/payments')
            onAction?.('navigate', data.targetUrl)
          }}
        >
          View Payment Ledger & Receipt
        </Button>
      </div>
    )
  }

  if (type === 'diagnostic') {
    return (
      <DiagnosticBlueprintCard
        blueprint={data as DiagnosticBlueprint}
        onAction={onAction}
      />
    )
  }

  return null
}
