import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas'
import { authService } from '@/services/auth.service'
import { useToast } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await authService.recoverPassword(data.identifier)
      setSubmitted(true)
      toast.success('Recovery Dispatched', 'Password reset instructions have been forwarded.')
    } catch (err) {
      toast.error('Recovery Error', err instanceof Error ? err.message : 'Please check details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-md space-y-6">
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Citizen Sign In
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-elevation text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Account Recovery
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Enter your registered citizen email or phone number to receive a cryptographic reset link.
          </p>

          {submitted ? (
            <div className="my-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-foreground">Recovery Link Dispatched</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Please check your registered inbox and SMS for the one-time security link.
              </p>
              <Link to={ROUTES.AUTH.LOGIN}>
                <Button variant="outline" size="sm" className="mt-4 text-xs">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-6 text-left">
              <Input
                label="Registered Email or Mobile"
                placeholder="rajesh.sharma@civicmail.gov.in"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.identifier?.message}
                {...register('identifier')}
              />

              <Button type="submit" size="lg" className="w-full text-sm font-semibold" isLoading={isLoading}>
                Dispatch Recovery Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
