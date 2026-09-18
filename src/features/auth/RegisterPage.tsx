import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, User, Mail, Phone, CreditCard, Lock, ArrowLeft } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/schemas'
import { useAuth, useToast } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function RegisterPage() {
  const { register: registerCitizen } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      nationalId: '',
      password: '',
      confirmPassword: '',
      consentTerms: true,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await registerCitizen(data)
      toast.success('Registration Initiated', 'Please verify your mobile number via 6-digit security code.')
      navigate(ROUTES.AUTH.VERIFY_OTP, { state: { phone: data.phone } })
    } catch (err) {
      toast.error('Registration Failed', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-xl space-y-6">
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Citizen Sign In
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-elevation">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white shadow-md">
              <Shield className="h-5 w-5 fill-white/20" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
                Register Citizen Digital Identity
              </h1>
              <p className="text-xs text-muted-foreground">
                Create your verified sovereign profile on CiviqOne
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                placeholder="e.g. Ramesh Kumar"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Registered Email"
                type="email"
                placeholder="citizen@mail.gov.in"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Number (10 Digits)"
                placeholder="9876543210"
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="National ID (Aadhaar Reference)"
                placeholder="XXXX-XXXX-XXXX"
                leftIcon={<CreditCard className="w-4 h-4" />}
                error={errors.nationalId?.message}
                {...register('nationalId')}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Create Password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 mt-0.5"
                  {...register('consentTerms')}
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I solemnly declare that the credentials provided belong to me. I consent to biometric and digital address verification in accordance with the Citizen Data Charter.
                </span>
              </label>
              {errors.consentTerms && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.consentTerms.message}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full text-sm font-semibold mt-4" isLoading={isLoading}>
              Continue to Mobile Verification
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/60 pt-4">
            Already have an active identity profile?{' '}
            <Link to={ROUTES.AUTH.LOGIN} className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
