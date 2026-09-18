import React from 'react'
import { RotateCw, ShieldCheck, Share2, Award, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CiviqOneCardActionsProps {
  isFlipped: boolean
  onFlip: () => void
  onSelectSide?: (side: 'front' | 'back') => void
  onVerify?: () => void
  onShareProof?: () => void
  onViewCredentials?: () => void
  privacyMode?: boolean
  onTogglePrivacyMode?: () => void
  className?: string
}

export const CiviqOneCardActions: React.FC<CiviqOneCardActionsProps> = ({
  isFlipped,
  onFlip,
  onSelectSide,
  onVerify,
  onShareProof,
  onViewCredentials,
  privacyMode = false,
  onTogglePrivacyMode,
  className,
}) => {
  return (
    <div className={cn('space-y-3 pt-1', className)}>
      {/* 1. View Mode Switcher & Privacy Shield Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        {/* Front View / Back View (QR) Glass Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/60 dark:border-white/10 text-xs font-mono shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => onSelectSide ? onSelectSide('front') : (isFlipped && onFlip())}
            className={cn(
              'px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs',
              !isFlipped
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
            )}
            aria-label="View Front of Identity Card"
          >
            Front View
          </button>
          <button
            type="button"
            onClick={() => onSelectSide ? onSelectSide('back') : (!isFlipped && onFlip())}
            className={cn(
              'px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs',
              isFlipped
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
            )}
            aria-label="View Back of Identity Card"
          >
            Back View (QR)
          </button>
        </div>

        {/* Privacy Shield Mode Toggle */}
        {onTogglePrivacyMode && (
          <button
            type="button"
            onClick={onTogglePrivacyMode}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm backdrop-blur-md',
              privacyMode
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-amber-500/10'
                : 'bg-white/80 dark:bg-slate-900/80 text-muted-foreground hover:text-foreground border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-900'
            )}
            title={privacyMode ? 'Turn Privacy Mode OFF' : 'Turn Privacy Mode ON'}
          >
            {privacyMode ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Privacy Mode: {privacyMode ? 'ON' : 'OFF'}</span>
          </button>
        )}
      </div>

      {/* 2. Primary Action Bar: Flip, Verify, Share Proof, View Credentials */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. Flip Card */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFlip}
          className="gap-1.5 text-xs font-bold rounded-xl border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-slate-900 hover:border-violet-500/40 transition-all"
        >
          <RotateCw
            className={cn(
              'w-3.5 h-3.5 text-violet-600 dark:text-violet-400 transition-transform duration-500',
              isFlipped && 'rotate-180'
            )}
          />
          <span>Flip Card</span>
        </Button>

        {/* 2. Verify */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onVerify}
          className="gap-1.5 text-xs font-bold rounded-xl border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/40 transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Verify</span>
        </Button>

        {/* 3. Share Proof */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onShareProof}
          className="gap-1.5 text-xs font-bold rounded-xl border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-slate-900 hover:border-violet-500/40 transition-all"
        >
          <Share2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Share Proof</span>
        </Button>

        {/* 4. View Credentials */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onViewCredentials}
          className="gap-1.5 text-xs font-bold rounded-xl border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-slate-900 hover:border-amber-500/40 transition-all"
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>View Credentials</span>
        </Button>
      </div>
    </div>
  )
}
