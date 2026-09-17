import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-subtle placeholder:text-muted-foreground/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon ? 'pl-10' : '',
              isPassword || rightIcon ? 'pr-10' : '',
              error ? 'border-destructive focus-visible:ring-destructive' : '',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && <div className="absolute right-3.5 text-muted-foreground">{rightIcon}</div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-destructive mt-1 flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
