import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'civic'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow',
      civic:
        'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60',
      outline:
        'border border-border bg-transparent hover:bg-muted text-foreground',
      ghost:
        'hover:bg-muted text-foreground hover:text-foreground',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
      link:
        'text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
