import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Shield,
  Lock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  KeyRound,
  ArrowRight,
  Sun,
  Moon,
  Home,
} from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/schemas'
import { useAuth, useToast, useTheme } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const { theme, toggleTheme } = useTheme()
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'password' | 'phone_otp'>('password')

  // OTP Mode states
  const [phoneNumber, setPhoneNumber] = useState('9845012345')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(30)

  // Cast location state safely without 'any'
  const locationState = location.state as { from?: { pathname?: string } } | null
  const from = locationState?.from?.pathname || ROUTES.APP.DASHBOARD

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: 'rajesh.sharma@civicmail.gov.in',
      password: 'Password@123',
      rememberMe: true,
    },
  })

  const onSubmitPassword = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data)
      toast.success('Welcome back, Citizen Rajesh Sharma', 'Biometric identity verified successfully.')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error('Authentication Failed', err instanceof Error ? err.message : 'Please check credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length < 10) {
      toast.error('Invalid Phone Number', 'Please enter a valid 10-digit registered mobile number.')
      return
    }
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsLoading(false)
    setOtpSent(true)
    setCountdown(30)
    toast.info('OTP Dispatched', 'Verification code sent to +91 ' + phoneNumber + ' (Demo code: 991820)')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 6) {
      toast.error('Invalid Code', 'Please enter the full 6-digit OTP.')
      return
    }
    setIsLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      // Use standard credentials login behind the scenes
      await login({
        identifier: 'rajesh.sharma@civicmail.gov.in',
        password: 'Password@123',
        rememberMe: true,
      })
      toast.success('Identity Verified via OTP', 'Welcome back, Citizen Rajesh Sharma.')
      navigate(from, { replace: true })
    } catch {
      toast.error('Verification Error', 'Failed to authenticate via OTP token.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickDemoFill = () => {
    if (authMode === 'password') {
      setValue('identifier', 'rajesh.sharma@civicmail.gov.in')
      setValue('password', 'Password@123')
      toast.info('Credentials Populated', 'Pre-filled verified citizen test credentials.')
    } else {
      setPhoneNumber('9845012345')
      setOtpCode('991820')
      setOtpSent(true)
      toast.info('Mobile Credentials Populated', 'Pre-filled phone & verification OTP.')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Column: Brand Hero Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden civic-grid-pattern">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to={ROUTES.ROOT} className="inline-flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white shadow-md group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6 fill-white/20" />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
                SAMAGRA
              </span>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Digital Civic Operating System
              </p>
            </div>
          </Link>

          <div className="mt-20 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sovereign Identity Protocol v2.4
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              One Unified Interface for All Civic Lifecycles.
            </h1>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed">
              Empowering citizens with tamper-proof digital credentials, zero-knowledge verification, instant service applications, and proactive statutory intelligence.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Level 3 Biometric Sovereign Verification',
                'Zero-Knowledge Encrypted Document Vault',
                'Direct Delegated Authority for Family & Dependents',
                'Citizen Action Center for Statutory Reminders',
                'End-to-End Privacy Control with Grant Receipts',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-foreground/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-8 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
          <span>Official Citizen Portal • Secured by Central Civic Infrastructure</span>
          <span className="font-mono text-[11px]">ISO 27001 & WCAG 2.2 AA</span>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        {/* Top utility controls */}
        <div className="w-full max-w-md flex items-center justify-between pb-4 mb-2">
          <Link
            to={ROUTES.ROOT}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Civic Gateway</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium shadow-sm transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <Link to={ROUTES.ROOT} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white shadow-md">
                <Shield className="h-5 w-5 fill-white/20" />
              </div>
              <div>
                <span className="font-display text-lg font-extrabold text-foreground">
                  SAMAGRA
                </span>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Digital Civic OS
                </p>
              </div>
            </Link>
          </div>

          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Sign In to Citizen Portal
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Choose your preferred sovereign authentication method
            </p>
          </div>

          {/* Authentication Mode Switcher */}
          <div className="flex p-1 rounded-xl bg-muted border border-border">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2',
                authMode === 'password'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Email / National ID
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('phone_otp')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2',
                authMode === 'phone_otp'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Phone className="w-3.5 h-3.5" />
              Phone & OTP
            </button>
          </div>

          {/* Form Content */}
          {authMode === 'password' ? (
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              <Input
                label="Email, Phone, or National ID"
                placeholder="rajesh.sharma@civicmail.gov.in"
                leftIcon={<UserIcon className="w-4 h-4" />}
                error={errors.identifier?.message}
                {...register('identifier')}
              />

              <Input
                label="Citizen Password"
                type="password"
                placeholder="Enter citizen security password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    {...register('rememberMe')}
                  />
                  <span className="text-muted-foreground hover:text-foreground">Remember this terminal</span>
                </label>

                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="font-semibold text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" size="lg" className="w-full text-sm font-semibold" isLoading={isLoading}>
                Sign In with Credentials
              </Button>
            </form>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="flex rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary overflow-hidden">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-muted-foreground bg-muted/60 border-r border-border">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9845012345"
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent text-foreground focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  A 6-digit one-time code will be dispatched to this verified terminal.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full text-sm font-semibold" isLoading={isLoading}>
                Send Verification OTP <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Change Phone
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="991820"
                    autoFocus
                    className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                  <span>Sent to +91 {phoneNumber}</span>
                  <span>Demo Code: <strong className="text-primary font-mono">991820</strong></span>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full text-sm font-semibold" isLoading={isLoading}>
                Verify & Enter Portal
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Didn't receive code?{' '}
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => {
                    setCountdown(30)
                    toast.info('Code Resent', 'Sent new OTP to +91 ' + phoneNumber)
                  }}
                  className="font-bold text-primary hover:underline disabled:opacity-50"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Pre-fill */}
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Test Citizen: Rajesh Sharma</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs font-bold text-primary hover:underline"
            >
              Autofill Demo
            </button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            New citizen to the digital ecosystem?{' '}
            <Link to={ROUTES.AUTH.REGISTER} className="font-bold text-primary hover:underline">
              Register Digital Identity
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
