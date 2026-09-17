import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react'
import { useAuth, useToast } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'

export function VerifyOtpPage() {
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(45)
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { verifyOtp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Cast safely
  const locationState = location.state as { phone?: string } | null
  const phone = locationState?.phone || '9845012345'

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newValues = [...otpValues]
    newValues[index] = value.slice(-1)
    setOtpValues(newValues)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newValues = [...otpValues]
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i]
    }
    setOtpValues(newValues)
    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleVerify = async (codeToVerify?: string) => {
    const fullOtp = codeToVerify || otpValues.join('')
    if (fullOtp.length !== 6) {
      toast.error('Incomplete Code', 'Please enter all 6 digits of the verification code.')
      return
    }

    setIsLoading(true)
    try {
      await verifyOtp(fullOtp)
      toast.success('Security Code Verified', 'Welcome to CIVIQONE Digital Civic OS.')
      navigate(ROUTES.APP.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error('Verification Failed', err instanceof Error ? err.message : 'Invalid code.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    try {
      await authService.resendOtp(phone)
      setTimer(45)
      toast.info('New Code Dispatched', `A fresh 6-digit OTP has been sent to ${phone}.`)
    } catch (err) {
      toast.error('Resend Failed', err instanceof Error ? err.message : 'Could not resend OTP.')
    }
  }

  const handleFillTestCode = () => {
    const testCode = ['1', '2', '3', '4', '5', '6']
    setOtpValues(testCode)
    handleVerify('123456')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-md space-y-6">
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-elevation text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Two-Factor Verification
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Enter the 6-digit secure authorization code dispatched to{' '}
            <span className="font-semibold text-foreground">••••••{phone.slice(-4)}</span>
          </p>

          {/* 6 OTP Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3 my-8" onPaste={handlePaste}>
            {otpValues.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border border-input bg-card shadow-subtle focus:border-primary focus:ring-2 focus:ring-ring outline-none transition-all"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={() => handleVerify()}
            size="lg"
            className="w-full text-sm font-semibold"
            isLoading={isLoading}
            disabled={otpValues.join('').length !== 6}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Authenticate Session
          </Button>

          {/* Resend Timer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {timer > 0 ? (
              <span>Resend security code in <strong className="text-foreground">{timer}s</strong></span>
            ) : (
              <button
                onClick={handleResend}
                className="font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Resend Code
              </button>
            )}
          </div>

          {/* One-click test helper */}
          <div className="mt-6 pt-4 border-t border-border/60">
            <button
              onClick={handleFillTestCode}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Use demo verification code (123456)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
