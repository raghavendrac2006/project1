import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  AlertTriangle,
  Scale,
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  Headphones,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks'
import { cn } from '@/lib/utils'
import type { DiagnosticBlueprint } from '@/types'

interface DiagnosticBlueprintCardProps {
  blueprint: DiagnosticBlueprint
  onAction?: (action: string, payload?: any) => void
}

export function DiagnosticBlueprintCard({
  blueprint,
  onAction,
}: DiagnosticBlueprintCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const severityStyles = {
    critical: {
      border: 'border-rose-500/40 dark:border-rose-500/30',
      bg: 'bg-rose-500/5 dark:bg-rose-950/20',
      badge: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
      accent: 'text-rose-600 dark:text-rose-400',
    },
    high: {
      border: 'border-amber-500/40 dark:border-amber-500/30',
      bg: 'bg-amber-500/5 dark:bg-amber-950/20',
      badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      accent: 'text-amber-600 dark:text-amber-400',
    },
    moderate: {
      border: 'border-sky-500/40 dark:border-sky-500/30',
      bg: 'bg-sky-500/5 dark:bg-sky-950/20',
      badge: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30',
      accent: 'text-sky-600 dark:text-sky-400',
    },
  }[blueprint.severity || 'high']

  const handleAutoFileGrievance = () => {
    if (blueprint.prefillGrievance) {
      sessionStorage.setItem('civiqone_prefill_grievance', JSON.stringify(blueprint.prefillGrievance))
    }
    toast.success('Grievance Dossier Generated', 'Pre-filled with statutory sections & facts.')
    navigate('/app/support?tab=lodge')
    onAction?.('auto_file_grievance', blueprint.prefillGrievance)
  }

  const handleDownloadAffidavit = () => {
    const text = `AFFIDAVIT / STATUTORY APPEAL DRAFT
Matter: ${blueprint.problemTitle}
Statutory Authority: ${blueprint.statutoryAct}
Statutory Turnaround SLA: ${blueprint.statutorySLA}

STATEMENT OF FACTS & ROOT CAUSE:
${blueprint.rootCause}

MANDATORY RESOLUTION STEPS:
${blueprint.actionSteps.map((s) => `${s.stepNumber}. ${s.title}: ${s.description} (Document: ${s.mandatoryDocument || 'N/A'})`).join('\n')}

VERIFICATION:
I hereby solemnly verify that the contents stated above are true to my personal knowledge under penalty of perjury.
Date: ${new Date().toLocaleDateString('en-IN')}
`
    navigator.clipboard.writeText(text)
    setCopiedTemplate(true)
    toast.success('Affidavit Draft Copied', 'Standard legal template copied to clipboard.')
    setTimeout(() => setCopiedTemplate(false), 2500)
    onAction?.('download_template', text)
  }

  return (
    <div
      className={cn(
        'mt-3 rounded-2xl border p-3.5 sm:p-4 shadow-md transition-all duration-300 space-y-3 max-w-md',
        severityStyles.border,
        severityStyles.bg
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border',
                severityStyles.badge
              )}
            >
              {blueprint.severity.toUpperCase()} STATUTORY BOTTLENECK
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-card/80 px-2 py-0.5 rounded-full border border-border/80">
              <Clock className="w-3 h-3 text-primary" />
              SLA: {blueprint.statutorySLA}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
            {blueprint.problemTitle}
          </h4>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
          title={isExpanded ? 'Collapse blueprint' : 'Expand blueprint'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Statutory Act Quote Bar */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-card/90 border border-border/70 text-[11px] shadow-sm">
        <Scale className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Statutory Governing Act
          </span>
          <span className="font-semibold text-foreground truncate block">
            {blueprint.statutoryAct}
          </span>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Root Cause Analysis */}
          <div className="p-2.5 rounded-xl bg-card/60 border border-border/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
              <AlertTriangle className={cn('w-3.5 h-3.5', severityStyles.accent)} />
              <span>Root Cause Diagnosis</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              {blueprint.rootCause}
            </p>
          </div>

          {/* Action Steps Roadmap */}
          <div className="space-y-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              Step-by-Step Resolution Roadmap:
            </span>
            <div className="space-y-2">
              {blueprint.actionSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-card border border-border/70 text-xs shadow-subtle"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step.stepNumber}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="font-bold text-foreground text-[11.5px] flex items-center justify-between">
                      <span>{step.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    {step.mandatoryDocument && (
                      <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground border border-border/80">
                        <FileText className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">Required: {step.mandatoryDocument}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Remedies Footer */}
          <div className="pt-2 border-t border-border/60 space-y-1.5">
            <Button
              size="sm"
              onClick={handleAutoFileGrievance}
              className="w-full h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5 shadow-sm"
            >
              <span>Auto-Draft Grievance Dossier (48h SLA)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadAffidavit}
                className="h-8 text-[11px] font-medium rounded-xl gap-1"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied Draft!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Copy Affidavit</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigate('/app/support?tab=live')
                  onAction?.('connect_officer')
                }}
                className="h-8 text-[11px] font-medium rounded-xl gap-1"
              >
                <Headphones className="w-3.5 h-3.5 text-primary" />
                <span>Nodal Officer</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
