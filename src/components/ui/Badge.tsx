import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'verified' | 'pending' | 'attention' | 'destructive' | 'outline' | 'neutral' | 'success' | 'warning'
  size?: 'sm' | 'md'
}

export function Badge({
  className,
  variant = 'secondary',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    primary:
      'bg-primary/10 text-primary border-primary/20',
    secondary:
      'bg-secondary text-secondary-foreground border-border/80',
    verified:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    pending:
      'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
    attention:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    destructive:
      'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
    outline:
      'text-foreground border-border bg-transparent',
    neutral:
      'bg-muted text-muted-foreground border-border/60',
    success:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    warning:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg gap-1.5',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center border font-sans uppercase tracking-wider transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
