import React, { useState } from 'react'
import {
  Cloud,
  Server,
  Database,
  ShieldCheck,
  Cpu,
  Globe2,
  FileCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Activity,
  DollarSign,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { awsService, type AwsS3PresignedUrlResult, type AwsTextractExtractionResult, type AwsCreditsTelemetry } from '@/services/aws.service'

interface AwsCloudConsoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AwsCloudConsoleModal({ open, onOpenChange }: AwsCloudConsoleModalProps) {
  const [activeTab, setActiveTab] = useState<'services' | 's3' | 'textract' | 'credits'>('services')
  const [services, setServices] = useState(() => awsService.getAwsServicesStatus())
  const [credits, setCredits] = useState<AwsCreditsTelemetry>(() => awsService.getAwsActivateCreditsTelemetry())
  const [isLoadingBackend, setIsLoadingBackend] = useState(false)

  // S3 Presigned URL state
  const [presignedResult, setPresignedResult] = useState<AwsS3PresignedUrlResult | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false)

  // Textract state
  const [isProcessingTextract, setIsProcessingTextract] = useState(false)
  const [textractResult, setTextractResult] = useState<AwsTextractExtractionResult | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<'aadhaar' | 'pan' | 'degree' | 'license'>('aadhaar')

  // When modal is opened, query live backend status
  React.useEffect(() => {
    if (!open) return
    let isMounted = true
    setIsLoadingBackend(true)
    Promise.all([awsService.fetchLiveStatus(), awsService.fetchCreditsTelemetry()])
      .then(([liveServices, liveCredits]) => {
        if (!isMounted) return
        setServices(liveServices)
        setCredits(liveCredits)
      })
      .finally(() => {
        if (isMounted) setIsLoadingBackend(false)
      })
    return () => {
      isMounted = false
    }
  }, [open])

  const handleGenerateS3Url = async () => {
    setIsGeneratingUrl(true)
    try {
      const res = await awsService.requestS3PresignedUrl(`doc_${Date.now()}`)
      setPresignedResult(res)
    } finally {
      setIsGeneratingUrl(false)
    }
  }

  const handleCopyPresigned = () => {
    if (!presignedResult) return
    navigator.clipboard.writeText(presignedResult.presignedUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleRunTextract = async () => {
    setIsProcessingTextract(true)
    setTextractResult(null)
    const mockFileMap = {
      aadhaar: { name: 'aadhaar_card_scanned.pdf', size: 1024 * 1024 * 1.2 },
      pan: { name: 'pan_card_permanent.jpg', size: 1024 * 850 },
      degree: { name: 'btech_degree_convocation.pdf', size: 1024 * 1024 * 2.1 },
      license: { name: 'dl_smartcard.pdf', size: 1024 * 920 },
    }
    const res = await awsService.extractWithTextract(mockFileMap[selectedDocType])
    setTextractResult(res)
    setIsProcessingTextract(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl bg-card border-border shadow-2xl">
        <DialogHeader className="pb-4 border-b border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                  AWS Cloud Technology Console
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                    AWS Activate
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Production Cloud Architecture, Storage Encryption & AI/ML Microservices
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AWS ap-south-1 (Mumbai)</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Console Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-5">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/60 rounded-xl mb-6">
            <TabsTrigger value="services" className="text-xs font-bold rounded-lg gap-1.5">
              <Server className="w-3.5 h-3.5" /> Services ({services.length})
            </TabsTrigger>
            <TabsTrigger value="s3" className="text-xs font-bold rounded-lg gap-1.5">
              <Database className="w-3.5 h-3.5" /> S3 & KMS Vault
            </TabsTrigger>
            <TabsTrigger value="textract" className="text-xs font-bold rounded-lg gap-1.5">
              <Zap className="w-3.5 h-3.5" /> AWS Textract AI
            </TabsTrigger>
            <TabsTrigger value="credits" className="text-xs font-bold rounded-lg gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> AWS Credits
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AWS Services Status */}
          <TabsContent value="services" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3.5">
              {services.map((svc) => (
                <div
                  key={svc.code}
                  className="p-4 rounded-xl border border-border/70 bg-card hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-xs text-foreground truncate">{svc.serviceName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                        {svc.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                      {svc.details}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>Region: {svc.region.split(' ')[0]}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{svc.latencyMs}ms Latency</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: AWS S3 & KMS Vault */}
          <TabsContent value="s3" className="space-y-5">
            <div className="p-4.5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    Amazon S3 Sovereign Document Bucket
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target Bucket: <code className="text-primary font-mono text-[11px]">s3://civiqone-sovereign-vault-ap-south-1</code>
                  </p>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-bold">
                  SSE-KMS Encrypted
                </Badge>
              </div>

              <div className="grid sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground text-[10px] block font-medium">Encryption Standard</span>
                  <span className="font-bold text-foreground">AWS KMS (AES-256)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground text-[10px] block font-medium">Storage Class</span>
                  <span className="font-bold text-foreground">S3 Intelligent-Tiering</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground text-[10px] block font-medium">Durability SLA</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">99.999999999% (11 9s)</span>
                </div>
              </div>
            </div>

            {/* Presigned URL Generator */}
            <div className="p-4.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">AWS S3 Presigned URL Generator</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Generate secure, cryptographically signed 15-minute temporary URLs for zero-trust document uploads.
                  </p>
                </div>
                <Button size="sm" onClick={handleGenerateS3Url} className="text-xs font-bold rounded-xl gap-1.5 shrink-0">
                  <Lock className="w-3.5 h-3.5" /> Generate URL
                </Button>
              </div>

              {presignedResult && (
                <div className="space-y-2.5 pt-2">
                  <div className="p-3 rounded-lg bg-card border border-border/80 font-mono text-[11px] break-all select-all flex items-center justify-between gap-3 text-foreground/85">
                    <span className="truncate">{presignedResult.presignedUrl}</span>
                    <Button size="icon" variant="ghost" onClick={handleCopyPresigned} className="h-7 w-7 shrink-0">
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Key: <code className="font-mono text-primary">{presignedResult.key}</code></span>
                    <span>Expires in: <strong>{presignedResult.expiresInSeconds / 60} minutes</strong></span>
                    <span>KMS Key: <code className="font-mono text-amber-600 dark:text-amber-400">civiqone-sovereign-data-master-key</code></span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: AWS Textract Intelligent OCR */}
          <TabsContent value="textract" className="space-y-4">
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20">
              <h4 className="font-bold text-sm text-foreground mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                AWS Textract Document Intelligence Engine
              </h4>
              <p className="text-xs text-muted-foreground">
                Demonstrates AWS Textract neural computer vision extracting structured key-value pairs directly from citizen identity documents.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs font-semibold text-foreground">Select Sample Document:</span>
                {(['aadhaar', 'pan', 'degree', 'license'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedDocType(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedDocType === type
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-card border border-border hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
                <Button
                  size="sm"
                  onClick={handleRunTextract}
                  disabled={isProcessingTextract}
                  className="ml-auto text-xs font-bold rounded-xl gap-1.5"
                >
                  {isProcessingTextract ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      Analyzing with Textract...
                    </span>
                  ) : (
                    <>Run AWS Textract Analysis</>
                  )}
                </Button>
              </div>
            </div>

            {textractResult && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-foreground">
                      Document Analyzed: {textractResult.documentType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {textractResult.confidenceScore}% Confidence
                    </span>
                    <span className="text-muted-foreground">
                      {textractResult.processingTimeMs}ms
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 pt-2">
                  {Object.entries(textractResult.extractedFields).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-lg bg-card border border-border/60 text-xs">
                      <span className="text-muted-foreground text-[10px] block font-medium uppercase tracking-wider">{k}</span>
                      <span className="font-semibold text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 4: AWS Activate Credits */}
          <TabsContent value="credits" className="space-y-4">
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {credits.program}
                  </span>
                  <h4 className="font-display text-2xl font-black text-foreground mt-0.5">
                    ${credits.remainingCredits.toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">/ ${credits.totalCreditsGranted.toLocaleString()} USD</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {credits.tier} · Valid through {credits.validThrough}
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Active Grant
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                  style={{ width: `${(credits.remainingCredits / credits.totalCreditsGranted) * 100}%` }}
                />
              </div>

              <div className="pt-2">
                <h5 className="text-xs font-bold text-foreground mb-2.5">Monthly Credit Utilization by AWS Service:</h5>
                <div className="space-y-2">
                  {credits.activeServicesUtilizingCredits.map((item: { name: string; burnRate: string }, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-card/80 border border-border/50">
                      <span className="text-foreground/90 font-medium">{item.name}</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{item.burnRate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
