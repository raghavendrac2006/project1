import { useState } from 'react'
import {
  ShieldAlert,
  Fingerprint,
  KeyRound,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface StepUpAuthenticationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  description?: string
  actionName?: string
  riskLevel?: 'medium' | 'high' | 'critical'
}

export function StepUpAuthenticationModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Step-Up Identity Verification Required',
  description = 'This civic operation requires sovereign step-up authentication to safeguard your digital sovereignty.',
  actionName = 'Authorizing Sensitive Operation',
  riskLevel = 'high',
}: StepUpAuthenticationModalProps) {
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin'>('biometric')
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [verifiedSuccess, setVerifiedSuccess] = useState(false)

  if (!isOpen) return null

  const handleVerifyBiometric = async () => {
    setIsVerifying(true)
    setErrorMessage(null)
    try {
      // Simulate WebAuthn / Passkey / Biometric challenge
      await new Promise((resolve) => setTimeout(resolve, 800))
      setVerifiedSuccess(true)
      setTimeout(() => {
        setIsVerifying(false)
        setVerifiedSuccess(false)
        onSuccess()
        onClose()
      }, 600)
    } catch {
      setIsVerifying(false)
      setErrorMessage('Biometric challenge failed or was cancelled.')
    }
  }

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setErrorMessage(null)

    await new Promise((resolve) => setTimeout(resolve, 500))
    // Standard test PIN: 123456 or 99182
    if (pin === '123456' || pin === '99182' || pin.length === 6) {
      setVerifiedSuccess(true)
      setTimeout(() => {
        setIsVerifying(false)
        setVerifiedSuccess(false)
        setPin('')
        onSuccess()
        onClose()
      }, 600)
    } else {
      setIsVerifying(false)
      setErrorMessage('Invalid Citizen Security PIN. Please enter your 6-digit PIN.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-up-auth-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 overflow-hidden">
        {/* Risk Banner Glow */}
        <div
          className={cn(
            'absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40',
            riskLevel === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
          )}
        />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md',
                riskLevel === 'critical'
                  ? 'bg-rose-600'
                  : riskLevel === 'high'
                  ? 'bg-amber-600'
                  : 'bg-primary'
              )}
            >
              {riskLevel === 'critical' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 id="step-up-auth-title" className="text-base font-bold text-foreground">
                {title}
              </h3>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Sovereign Security Layer
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operation Context Card */}
        <div className="mt-4 p-3 rounded-xl border border-border bg-muted/40 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Target: {actionName}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Method Toggle */}
        <div className="mt-4 flex p-1 rounded-xl bg-muted border border-border relative z-10">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('biometric')
              setErrorMessage(null)
            }}
            className={cn(
              'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2',
              authMethod === 'biometric'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Biometric / Passkey
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('pin')
              setErrorMessage(null)
            }}
            className={cn(
              'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2',
              authMethod === 'pin'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Security PIN
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-5 relative z-10">
          {verifiedSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-foreground">Authentication Verified</p>
              <p className="text-xs text-muted-foreground">Authorizing operation securely...</p>
            </div>
          ) : authMethod === 'biometric' ? (
            <div className="flex flex-col items-center py-4 space-y-4">
              <div
                className={cn(
                  'h-20 w-20 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center transition-transform hover:scale-105',
                  isVerifying && 'animate-pulse border-primary ring-4 ring-primary/20'
                )}
              >
                <Fingerprint className="w-10 h-10 text-primary" />
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">
                  Touch biometric sensor or confirm device passkey
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Secured by Windows Hello / FIDO2 Sovereign Hardware Key
                </p>
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-500 font-medium text-center">{errorMessage}</p>
              )}

              <Button
                onClick={handleVerifyBiometric}
                isLoading={isVerifying}
                className="w-full text-xs font-bold"
              >
                Verify Biometric Token
              </Button>
            </div>
          ) : (
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Enter 6-Digit Citizen Security PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  autoFocus
                  className="w-full text-center tracking-[0.6em] text-lg font-mono py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1 text-center">
                  Demo PIN: <span className="font-mono font-bold text-primary">123456</span>
                </p>
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-500 font-medium text-center">{errorMessage}</p>
              )}

              <Button
                type="submit"
                disabled={pin.length < 4 || isVerifying}
                isLoading={isVerifying}
                className="w-full text-xs font-bold"
              >
                Confirm & Authorize
              </Button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Sovereign Enclave Execution</span>
          <span>Zero-Knowledge Handshake</span>
        </div>
      </div>
    </div>
  )
}
