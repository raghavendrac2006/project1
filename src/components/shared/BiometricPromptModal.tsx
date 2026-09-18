import { useState, useEffect } from 'react'
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Lock,
  CheckCircle2,
  RefreshCw,
  KeyRound,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { soundService } from '@/services/sound.service'
import { webauthnService, type BiometricVerificationResult } from '@/services/webauthn.service'
import { cn } from '@/lib/utils'

interface BiometricPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  actionLabel?: string
  isEmergency?: boolean
  onVerified: (result: BiometricVerificationResult) => void
}

type ScanState = 'ready' | 'scanning' | 'verifying' | 'success' | 'failed'

export function BiometricPromptModal({
  open,
  onOpenChange,
  title,
  subtitle,
  actionLabel = 'Authorize Action',
  isEmergency = false,
  onVerified,
}: BiometricPromptModalProps) {
  const [scanState, setScanState] = useState<ScanState>('ready')
  const [hasHardware, setHasHardware] = useState<boolean>(false)
  const [challengeStr, setChallengeStr] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setScanState('ready')
      setErrorMessage(null)
      const challenge = webauthnService.generateChallenge()
      setChallengeStr('0x' + webauthnService.bufferToHex(challenge.slice(0, 8)))

      webauthnService.isPlatformAuthenticatorAvailable().then(setHasHardware)
      soundService.biometricPrompt()
    }
  }, [open])

  const handleStartVerification = async () => {
    setScanState('scanning')
    setErrorMessage(null)
    soundService.tactileClick()

    try {
      // Step 1: Initiating platform sensor handshake
      setScanState('verifying')

      const result = await webauthnService.verifyBiometric({
        title,
        subtitle: subtitle || 'Platform Authenticator Required',
        reason: actionLabel,
      })

      if (result.success) {
        setScanState('success')
        if (isEmergency) {
          soundService.emergencyLockdown()
        } else {
          soundService.biometricSuccess()
        }

        // Allow user to see the success state for 600ms
        setTimeout(() => {
          onVerified(result)
          onOpenChange(false)
        }, 650)
      } else {
        setScanState('failed')
        setErrorMessage(result.error || 'Biometric attestation was not completed.')
        soundService.emergencyLockdown()
      }
    } catch {
      setScanState('failed')
      setErrorMessage('Hardware communication timeout. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl p-6 shadow-2xl space-y-5">
        <DialogHeader className="text-center sm:text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Badge
              variant={isEmergency ? 'attention' : 'verified'}
              size="sm"
              className="text-[10px] font-mono tracking-wider uppercase gap-1"
            >
              <Cpu className="w-3 h-3" />
              {hasHardware ? 'Hardware Secure Enclave / TPM 2.0' : 'WebAuthn Cryptographic Protocol'}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-black tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            {subtitle || 'Biometric platform step-up required to seal this cryptographic operation.'}
          </DialogDescription>
        </DialogHeader>

        {/* Central Biometric Sensor Graphic */}
        <div className="relative flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            {/* Concentric Pulse Rings */}
            <div
              className={cn(
                'absolute w-36 h-36 rounded-full border border-primary/20 transition-all duration-700',
                scanState === 'verifying' || scanState === 'scanning'
                  ? 'animate-ping opacity-35 scale-125'
                  : 'opacity-15'
              )}
            />
            <div
              className={cn(
                'absolute w-28 h-28 rounded-full border transition-all duration-500',
                scanState === 'success'
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : scanState === 'failed'
                  ? 'border-rose-500/60 bg-rose-500/10'
                  : isEmergency
                  ? 'border-rose-500/30'
                  : 'border-primary/30'
              )}
            />

            {/* Central Touch Target */}
            <button
              onClick={handleStartVerification}
              disabled={scanState === 'verifying' || scanState === 'success'}
              className={cn(
                'relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform',
                scanState === 'success'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-105'
                  : scanState === 'failed'
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : isEmergency
                  ? 'bg-gradient-to-tr from-rose-600 to-amber-600 text-white hover:scale-105 active:scale-95'
                  : 'bg-gradient-to-tr from-primary via-primary/90 to-sky-500 text-white hover:scale-105 active:scale-95 cursor-pointer'
              )}
              title="Touch to verify biometric credentials"
            >
              {scanState === 'verifying' ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : scanState === 'success' ? (
                <CheckCircle2 className="w-9 h-9" />
              ) : scanState === 'failed' ? (
                <ShieldAlert className="w-9 h-9" />
              ) : (
                <Fingerprint className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Real-Time Telemetry & Status Text */}
          <div className="mt-4 text-center space-y-1">
            <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
              {scanState === 'ready' && (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  <span>Ready for Biometric Sensor Handshake</span>
                </>
              )}
              {scanState === 'verifying' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Awaiting Biometric Attestation...</span>
                </>
              )}
              {scanState === 'success' && (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Hardware Attestation Verified ✓</span>
                </>
              )}
              {scanState === 'failed' && (
                <span className="text-rose-500">Verification Interrupted</span>
              )}
            </p>

            <p className="text-[11px] font-mono text-muted-foreground/80">
              Challenge: <span className="text-primary font-semibold">{challengeStr}</span>
            </p>

            {errorMessage && (
              <p className="text-[11px] text-rose-500 font-medium pt-1 max-w-xs mx-auto">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant={isEmergency ? 'destructive' : 'primary'}
            onClick={handleStartVerification}
            disabled={scanState === 'verifying' || scanState === 'success'}
            className="flex-1 text-xs font-bold gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            {scanState === 'verifying' ? 'Verifying...' : actionLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
