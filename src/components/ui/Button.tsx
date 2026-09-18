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
      'relative inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] overflow-hidden select-none'

    const variants = {
      primary:
        'bg-[hsl(232_84%_54%)] text-white hover:bg-[hsl(232_84%_46%)] shadow-[0_1px_3px_hsl(232_84%_54%/0.35),0_4px_12px_hsl(232_84%_54%/0.25)] hover:shadow-[0_1px_3px_hsl(232_84%_46%/0.4),0_6px_20px_hsl(232_84%_46%/0.35)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent',
      civic:
        'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_1px_3px_hsl(217_91%_60%/0.35),0_4px_12px_hsl(217_91%_60%/0.20)] hover:shadow-[0_2px_8px_hsl(217_91%_53%/0.40),0_8px_20px_hsl(217_91%_53%/0.25)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border/60 shadow-[0_1px_2px_hsl(var(--foreground)/0.05)]',
      outline:
        'border border-border bg-transparent hover:bg-muted/60 text-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] hover:border-border/80',
      ghost:
        'hover:bg-muted/70 text-foreground hover:text-foreground',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/88 shadow-[0_1px_3px_hsl(0_86%_57%/0.25)]',
      link:
        'text-primary underline-offset-4 hover:underline p-0 h-auto font-medium',
    }

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-10 px-4.5 text-sm gap-2',
      lg: 'h-12 px-6 text-sm gap-2.5',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
