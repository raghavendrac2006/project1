import { useState, useEffect, useRef } from 'react'
import {
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { sha256 } from '@/lib/crypto'

export interface ScannedCredentialResult {
  rawPayload: string
  credentialType: 'AADHAAR' | 'DRIVING_LICENSE' | 'TAX_CHALLAN' | 'CONSENT_TOKEN'
  identifier: string
  holderName: string
  verificationHash: string
  verifiedAt: string
  confidenceScore: number
}

interface CredentialScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanSuccess: (result: ScannedCredentialResult) => void
}

const SAMPLE_CREDENTIALS: Array<Omit<ScannedCredentialResult, 'verificationHash' | 'verifiedAt'>> = [
  {
    rawPayload: 'CIVIQ://UIDAI/E-KYC/V3?uid=991849120042&name=Rajesh+K+Sharma&dob=1988-06-14&state=KA',
    credentialType: 'AADHAAR',
    identifier: '•••• •••• 4912',
    holderName: 'Rajesh K. Sharma',
    confidenceScore: 99.8,
  },
  {
    rawPayload: 'CIVIQ://SARATHI/DL/V2?dl=KA0320150009842&name=Rajesh+K+Sharma&class=LMV+TRANS&exp=2026-10-28',
    credentialType: 'DRIVING_LICENSE',
    identifier: 'KA03-20150009842',
    holderName: 'Rajesh K. Sharma',
    confidenceScore: 98.5,
  },
  {
    rawPayload: 'CIVIQ://TREASURY/CHALLAN/V1?rcpt=BBMP-PT-2026-489012&amt=4800&dept=REVENUE&status=CLEARED',
    credentialType: 'TAX_CHALLAN',
    identifier: 'BBMP-PT-2026-489012',
    holderName: 'Property Unit #B-402, Indiranagar',
    confidenceScore: 100,
  },
]

export function CredentialScannerModal({
  open,
  onOpenChange,
  onScanSuccess,
}: CredentialScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamActive, setStreamActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detectedResult, setDetectedResult] = useState<ScannedCredentialResult | null>(null)

  useEffect(() => {
    let localStream: MediaStream | null = null

    if (open) {
      setDetectedResult(null)
      setCameraError(null)

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((stream) => {
            localStream = stream
            if (videoRef.current) {
              videoRef.current.srcObject = stream
              videoRef.current.play().catch(() => {})
              setStreamActive(true)
            }
          })
          .catch((err) => {
            console.warn('Camera access denied or unattached:', err)
            setCameraError('Camera access not active or device not found. Using interactive holographic scanner simulator.')
            setStreamActive(false)
          })
      } else {
        setCameraError('Camera hardware API not available. Using simulated hardware detector.')
        setStreamActive(false)
      }
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [open])

  const handleSimulateScan = async (sample: (typeof SAMPLE_CREDENTIALS)[0]) => {
    setIsAnalyzing(true)
    await new Promise((r) => setTimeout(r, 700))

    const verificationHash = await sha256(sample.rawPayload + '::ANCHORED_GOV_ROOT')
    const fullResult: ScannedCredentialResult = {
      ...sample,
      verificationHash,
      verifiedAt: new Date().toISOString(),
    }

    setDetectedResult(fullResult)
    setIsAnalyzing(false)
  }

  const handleConfirmResult = () => {
    if (detectedResult) {
      onScanSuccess(detectedResult)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-card border border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground font-display">
              <Camera className="w-5 h-5 text-primary" />
              Statutory Credential & QR Scanner
            </DialogTitle>
            <Badge variant="verified" size="sm" className="gap-1 font-mono text-[10px]">
              <ShieldCheck className="w-3 h-3" />
              UIDAI / DigiLocker Node
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Point camera at physical credential QR, or select a simulated citizen credential below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Viewfinder Window */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {streamActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary animate-pulse">
                  <QrCode className="w-8 h-8" />
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  Holographic Camera Viewfinder Active
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {cameraError || 'Ready to capture QR cryptographic signatures.'}
                </p>
              </div>
            )}

            {/* Scan Reticle & Animated Laser Line */}
            <div className="absolute inset-6 border-2 border-primary/40 rounded-xl pointer-events-none flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

              {/* Laser Scanning Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan shadow-lg shadow-cyan-400/50" />
            </div>

            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-mono font-medium">Validating SHA-256 Merkle Root...</span>
              </div>
            )}
          </div>

          {/* Test Presets for Instant Simulation */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground block">
              Quick Scan Simulation Targets:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_CREDENTIALS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSimulateScan(sample)}
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/80 text-left transition-all text-xs focus:ring-1 focus:ring-primary"
                >
                  <p className="font-bold text-[11px] text-foreground truncate">{sample.credentialType}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sample.identifier}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detected Credential Card */}
          {detectedResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Statutory Match Verified ({detectedResult.confidenceScore}%)</span>
                </div>
                <Badge variant="verified" size="sm">
                  {detectedResult.credentialType}
                </Badge>
              </div>

              <div className="text-xs space-y-1 text-foreground">
                <p>
                  <span className="text-muted-foreground">Subject: </span>
                  <span className="font-semibold">{detectedResult.holderName}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">ID: </span>
                  <span className="font-mono font-bold">{detectedResult.identifier}</span>
                </p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">
                  Hash: {detectedResult.verificationHash}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmResult}
                className="w-full mt-2 gap-1.5 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Verified Dossier
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
