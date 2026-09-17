import { useState } from 'react'
import {
  Lock,
  Fingerprint,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth, useToast } from '@/hooks'

interface SessionLockOverlayProps {
  isLocked: boolean
  onUnlock: () => void
}

export function SessionLockOverlay({ isLocked, onUnlock }: SessionLockOverlayProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  if (!isLocked) return null

  const handleBiometricUnlock = async () => {
    setIsVerifying(true)
    await new Promise((r) => setTimeout(r, 650))
    setIsVerifying(false)
    toast.success('Session Resumed', 'Biometric identity confirmed via passkey.')
    onUnlock()
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length < 4) {
      toast.error('Invalid PIN', 'Please enter your 4-digit security PIN.')
      return
    }
    // Default demo PIN accepts 1234 or any 4 digit sequence
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      toast.success('Session Unlocked', 'Identity verified successfully.')
      onUnlock()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card/90 shadow-2xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Shield Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-primary to-sky-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 relative">
            <Lock className="w-8 h-8" />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-[10px]">
              ✓
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Session Locked for Privacy
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            Inactivity timeout reached. Sensitive document vault and identity assets have been masked.
          </p>
        </div>

        {/* User Card Mini */}
        <div className="p-3 rounded-2xl border border-border/80 bg-muted/40 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.slice(0, 2).toUpperCase() || 'RK'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-foreground truncate">{user?.name || 'Rajesh K. Sharma'}</p>
            <p className="text-[10px] font-mono text-muted-foreground truncate">
              {user?.nationalId ? `ID: •••• ${user.nationalId.slice(-4)}` : 'Aadhaar: •••• 4912'}
            </p>
          </div>
          <Badge variant="verified" size="sm" className="text-[9px] px-1.5 py-0.5">
            Active
          </Badge>
        </div>

        {/* Fast Biometric Unlock Action */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleBiometricUnlock}
          isLoading={isVerifying}
          className="w-full gap-2 py-5 rounded-2xl font-bold shadow-md shadow-primary/25 text-sm"
        >
          <Fingerprint className="w-5 h-5 text-emerald-400" />
          <span>Unlock with Biometrics</span>
        </Button>

        {/* PIN Fallback Form */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
            Or Enter 4-Digit Security PIN (Demo: 1234)
          </span>
          <form onSubmit={handlePinSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-card text-center font-mono text-base tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-4 rounded-xl font-bold">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
