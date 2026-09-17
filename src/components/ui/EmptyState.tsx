import * as React from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/50',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mb-4 shadow-subtle">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold font-display text-foreground tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
