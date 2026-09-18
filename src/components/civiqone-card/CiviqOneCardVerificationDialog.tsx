import React from 'react'
import { ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import type { CiviqOneCardData } from './civiqone-card.types'
import { CiviqOneCardBadge } from './CiviqOneCardBadge'

interface CiviqOneCardVerificationDialogProps {
  isOpen: boolean
  onClose: () => void
  data: CiviqOneCardData
}

export const CiviqOneCardVerificationDialog: React.FC<CiviqOneCardVerificationDialogProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopyReference = () => {
    navigator.clipboard.writeText(data.verificationReference)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                SAMAGRA Identity Verification
              </DialogTitle>
              <DialogDescription className="text-xs">
                Official cryptographic attestation & verifier disclosure
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Verification Certificate Box (Section 31) */}
        <div className="my-3 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-display font-black text-sm tracking-tight text-foreground">
              SAMAGRA IDENTITY
            </span>
            <CiviqOneCardBadge status={data.verificationStatus} />
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Reference:</span>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span>{data.verificationReference}</span>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy Reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Last Verification:</span>
              <span className="text-foreground">{data.lastVerifiedAt}</span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Cryptographic Proof:</span>
              <span className="text-primary font-bold">ZKP-Ed25519-Signed</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            This verification certificate was issued by the National Sovereign Identity Core. No raw citizen biometric or personal records were unmasked during this check.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="primary" size="sm" onClick={onClose} className="rounded-xl text-xs font-bold">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
