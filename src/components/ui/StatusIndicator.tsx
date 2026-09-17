import { cn } from '@/lib/utils'

export type StatusIndicatorType =
  | 'verified'
  | 'pending'
  | 'attention'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'draft'
  | 'paid'
  | 'overdue'

interface StatusIndicatorProps {
  status: StatusIndicatorType | string
  label?: string
  className?: string
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const normalized = status.toLowerCase()

  const config: Record<string, { bg: string; dot: string; text: string; defaultLabel: string }> = {
    verified: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
      defaultLabel: 'Verified',
    },
    approved: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
      defaultLabel: 'Approved',
    },
    completed: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
      defaultLabel: 'Completed',
    },
    paid: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
      defaultLabel: 'Paid',
    },
    pending: {
      bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      dot: 'bg-purple-500 animate-pulse',
      text: 'text-purple-700 dark:text-purple-400',
      defaultLabel: 'Pending',
    },
    under_review: {
      bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
      dot: 'bg-sky-500 animate-pulse',
      text: 'text-sky-700 dark:text-sky-400',
      defaultLabel: 'Under Review',
    },
    submitted: {
      bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      dot: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
      defaultLabel: 'Submitted',
    },
    attention: {
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
      defaultLabel: 'Action Required',
    },
    action_required: {
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500 animate-ping',
      text: 'text-amber-700 dark:text-amber-400',
      defaultLabel: 'Action Required',
    },
    overdue: {
      bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-400',
      defaultLabel: 'Overdue',
    },
    rejected: {
      bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-400',
      defaultLabel: 'Rejected',
    },
    draft: {
      bg: 'bg-muted text-muted-foreground border-border/50',
      dot: 'bg-muted-foreground',
      text: 'text-muted-foreground',
      defaultLabel: 'Draft',
    },
  }

  const item = config[normalized] || config.draft

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        item.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', item.dot)} />
      <span>{label || item.defaultLabel}</span>
    </div>
  )
}
