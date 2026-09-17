import { CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApplicationTimelineStep } from '@/types'

export interface TimelineProps {
  steps: ApplicationTimelineStep[]
  className?: string
}

export function Timeline({ steps, className }: TimelineProps) {
  const getIcon = (status: ApplicationTimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      case 'current':
        return <Clock className="w-5 h-5 text-sky-500 animate-spin-slow shrink-0" />
      case 'action_required':
        return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
      default:
        return <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
    }
  }

  return (
    <div className={cn('relative space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border', className)}>
      {steps.map((step, index) => {
        const isCurrent = step.status === 'current'
        const isAction = step.status === 'action_required'

        return (
          <div key={index} className="relative flex items-start gap-4 pl-0">
            <div className="relative z-10 flex items-center justify-center w-5 h-5 bg-card rounded-full mt-0.5">
              {getIcon(step.status)}
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4
                  className={cn(
                    'text-sm font-semibold',
                    isCurrent ? 'text-sky-500 font-bold' : isAction ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground'
                  )}
                >
                  {step.title}
                </h4>
                {step.timestamp && (
                  <span className="text-[11px] text-muted-foreground">{step.timestamp}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
