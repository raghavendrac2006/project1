import React, { useState } from 'react'
import { Sparkles, CheckCircle2, Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks'

interface CiviqOneCardShareDialogProps {
  isOpen: boolean
  onClose: () => void
  onShareComplete?: () => void
}

export const CiviqOneCardShareDialog: React.FC<CiviqOneCardShareDialogProps> = ({
  isOpen,
  onClose,
  onShareComplete,
}) => {
  const toast = useToast()

  const [shareItems, setShareItems] = useState({
    identityVerified: true,
    age18: false,
    studentStatus: false,
    residencyVerified: false,
  })

  const [recipient, setRecipient] = useState('Apex Health Services')
  const [purpose, setPurpose] = useState('Proof of Age & Statutory Eligibility')
  const [duration, setDuration] = useState('15 Minutes (Single-Use Proof)')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proofGenerated, setProofGenerated] = useState<{
    receiptId: string
    timestamp: string
  } | null>(null)

  const handleToggle = (key: keyof typeof shareItems) => {
    setShareItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleConfirmShare = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      const receiptId = `RCP-ZKP-${Math.floor(100000 + Math.random() * 900000)}`
      setProofGenerated({
        receiptId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
      toast.success(
        'Zero-Knowledge Proof Dispatched',
        `Dispatched selective disclosure proof to ${recipient}.`
      )
      if (onShareComplete) {
        onShareComplete()
      }
    } catch {
      toast.error('Sharing Failed', 'Could not dispatch proof at this time.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setProofGenerated(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#6B4EFF]/15 text-[#6B4EFF] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Share Verifiable Zero-Knowledge Proof
              </DialogTitle>
              <DialogDescription className="text-xs">
                Selectively disclose only what is strictly necessary without revealing raw identity details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!proofGenerated ? (
          <div className="space-y-4 my-2 text-xs">
            {/* 1. Choose what to share (Section 41) */}
            <div>
              <label className="block font-semibold text-foreground mb-2">
                Choose what to share (Selective Disclosure)
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-primary/40 bg-primary/5 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareItems.identityVerified}
                      onChange={() => handleToggle('identityVerified')}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="font-semibold text-foreground">Identity Verified</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Cryptographic
                  </span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareItems.age18}
                      onChange={() => handleToggle('age18')}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">Age ≥ 18</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">ZKP Range Proof</span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareItems.studentStatus}
                      onChange={() => handleToggle('studentStatus')}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">Student Status</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">Academic VC</span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareItems.residencyVerified}
                      onChange={() => handleToggle('residencyVerified')}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">Residency Verified</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">Karnataka Domain</span>
                </label>
              </div>
            </div>

            {/* 2. Recipient Selection */}
            <div>
              <label className="block font-semibold text-foreground mb-1">Recipient</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Apex Health Services</option>
                <option>State Bank of India (e-KYC)</option>
                <option>HDFC Ergo General Insurance</option>
                <option>Urban Civic Transit Authority</option>
                <option>City Municipal Corporation</option>
              </select>
            </div>

            {/* 3. Purpose Entry */}
            <div>
              <label className="block font-semibold text-foreground mb-1">Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter verification purpose"
                className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 4. Duration Selection */}
            <div>
              <label className="block font-semibold text-foreground mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option>15 Minutes (Single-Use Proof)</option>
                <option>1 Hour (Temporary Verification)</option>
                <option>24 Hours (Session Access)</option>
                <option>Until Revoked (Explicit Continuous Consent)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleConfirmShare}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Confirm & Dispatch Proof
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-2 text-center animate-in zoom-in-95">
            <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-foreground">
                  ZKP Proof Dispatched Successfully
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receipt:{' '}
                  <strong className="font-mono text-primary">{proofGenerated.receiptId}</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border text-xs text-left font-mono space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Recipient:</span>
                  <span className="text-foreground font-semibold">{recipient}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Time:</span>
                  <span className="text-foreground">{proofGenerated.timestamp}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Validity:</span>
                  <span className="text-foreground">{duration}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={handleReset} className="rounded-xl text-xs font-bold">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
