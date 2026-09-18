import React, { useState, useCallback } from 'react'
import type { CiviqOneCardProps } from './civiqone-card.types'
import { CiviqOneCardFront } from './CiviqOneCardFront'
import { CiviqOneCardBack } from './CiviqOneCardBack'
import { CiviqOneCardActions } from './CiviqOneCardActions'
import { CiviqOneCardVerificationDialog } from './CiviqOneCardVerificationDialog'
import { CiviqOneCardShareDialog } from './CiviqOneCardShareDialog'
import { useCiviqOneCardData } from './useCiviqOneCardData'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { soundService } from '@/services/sound.service'
import './civiqone-card.css'

export const CiviqOneCard: React.FC<CiviqOneCardProps> = ({
  data: propData,
  flipped: controlledFlipped,
  onFlip: controlledOnFlip,
  onVerify,
  onShareProof,
  onViewCredentials,
  isLoading = false,
  error = null,
  onRetry,
  showActions = true,
  className,
  privacyMode: controlledPrivacyMode,
  onTogglePrivacyMode: controlledOnTogglePrivacyMode,
}) => {
  // 1. Single source of truth data hook (or overridden by prop)
  const { data: hookData, refresh } = useCiviqOneCardData()
  const data = propData || hookData

  // 2. Controlled / Uncontrolled Flip State
  const [internalFlipped, setInternalFlipped] = useState(false)
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped

  const handleFlip = useCallback(() => {
    soundService.tactileClick()
    const next = !isFlipped
    if (controlledOnFlip) {
      controlledOnFlip(next)
    } else {
      setInternalFlipped(next)
    }
  }, [isFlipped, controlledOnFlip])

  const handleSelectSide = useCallback(
    (side: 'front' | 'back') => {
      const targetFlipped = side === 'back'
      if (isFlipped !== targetFlipped) {
        soundService.tactileClick()
        if (controlledOnFlip) {
          controlledOnFlip(targetFlipped)
        } else {
          setInternalFlipped(targetFlipped)
        }
      }
    },
    [isFlipped, controlledOnFlip]
  )

  // 3. Controlled / Uncontrolled Privacy Mode State
  const [internalPrivacyMode, setInternalPrivacyMode] = useState(false)
  const privacyMode =
    controlledPrivacyMode !== undefined ? controlledPrivacyMode : internalPrivacyMode

  const handleTogglePrivacyMode = useCallback(() => {
    soundService.shieldEngage()
    if (controlledOnTogglePrivacyMode) {
      controlledOnTogglePrivacyMode()
    } else {
      setInternalPrivacyMode((prev) => !prev)
    }
  }, [controlledOnTogglePrivacyMode])

  // 4. Modal Dialog State Management
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const handleOpenVerify = () => {
    if (onVerify) {
      onVerify()
    } else {
      setVerifyDialogOpen(true)
    }
  }

  const handleOpenShare = () => {
    if (onShareProof) {
      onShareProof()
    } else {
      setShareDialogOpen(true)
    }
  }

  // 5. Accessible Keyboard Navigation (Enter / Space to Flip)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }

  // 6. Loading Skeleton State
  if (isLoading) {
    return (
      <div className={cn('civiq-atmospheric-wrapper', className)}>
        <div className="w-full aspect-[1.586/1] min-h-[270px] rounded-[24px] p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-white/10 animate-pulse flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-slate-300 dark:bg-slate-800 rounded-lg" />
            <div className="h-6 w-24 bg-slate-300 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-300 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-44 bg-slate-300 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-32 bg-slate-300 dark:bg-slate-800 rounded-md" />
            </div>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="h-4 w-24 bg-slate-300 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-24 bg-slate-300 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  // 7. Error Recovery State
  if (error) {
    return (
      <div className={cn('civiq-atmospheric-wrapper', className)}>
        <div className="w-full aspect-[1.586/1] min-h-[270px] rounded-[24px] p-6 bg-rose-500/5 border border-rose-500/30 flex flex-col items-center justify-center text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Unable to load CiviqOne Digital Card.</h3>
            <p className="text-xs text-muted-foreground mt-1">Please try re-authenticating.</p>
          </div>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry} className="rounded-xl gap-1.5 text-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4 max-w-lg mx-auto', className)}>
      {/* 1. Atmospheric Ambient Backdrop Wrapper */}
      <div className="civiq-atmospheric-wrapper">
        {/* 2. Flat Glassmorphic Flip Card Container */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`CiviqOne Digital Civic Identity Card for ${data.displayName}. Currently showing ${isFlipped ? 'Identity Verification Back' : 'Digital Identity Front'}. Press Enter or Space to flip.`}
          aria-pressed={isFlipped}
          onClick={handleFlip}
          onKeyDown={handleKeyDown}
          className={cn('civiq-card-flip-container', isFlipped && 'is-flipped')}
        >
          {/* Surface 1: Front Face */}
          <CiviqOneCardFront data={data} privacyMode={privacyMode} />

          {/* Surface 2: Back Face */}
          <CiviqOneCardBack data={data} privacyMode={privacyMode} />
        </div>
      </div>

      {/* 3. Action Toolbar (Flip, Verify, Share Proof, View Credentials) */}
      {showActions && (
        <CiviqOneCardActions
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onSelectSide={handleSelectSide}
          onVerify={handleOpenVerify}
          onShareProof={handleOpenShare}
          onViewCredentials={onViewCredentials}
          privacyMode={privacyMode}
          onTogglePrivacyMode={handleTogglePrivacyMode}
        />
      )}

      {/* 4. Verification Attestation Dialog */}
      <CiviqOneCardVerificationDialog
        isOpen={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        data={data}
      />

      {/* 5. Zero-Knowledge Proof Sharing Dialog */}
      <CiviqOneCardShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        onShareComplete={refresh}
      />
    </div>
  )
}
