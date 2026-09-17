import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Calendar,
  Building2,
  Download,
  Share2,
  Trash2,
  Lock,
  Clock,
  ExternalLink,
  Tag,
  User,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StepUpAuthenticationModal } from '@/components/auth/StepUpAuthenticationModal'
import { documentService } from '@/services/document.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'

export function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [stepUpAction, setStepUpAction] = useState<'download' | 'share' | 'delete'>('download')

  const doc = useMemo(() => {
    const list = civicStorage.getDocuments()
    return list.find((d) => d.id === documentId)
  }, [documentId])

  if (!doc) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Document Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested document record does not exist or was removed.</p>
        <Button onClick={() => navigate(ROUTES.APP.DOCUMENTS)} variant="outline" size="sm">
          Return to Document Vault
        </Button>
      </div>
    )
  }

  const handleAuthorizedAction = () => {
    if (stepUpAction === 'download') {
      toast.success('Secure Download Initialized', `Exported ${doc.title} (${doc.fileSize})`)
    } else if (stepUpAction === 'share') {
      toast.success('Temporary Link Generated', 'One-time encrypted share link copied to clipboard.')
    } else if (stepUpAction === 'delete') {
      documentService.deleteDocument(doc.id)
      toast.info('Document Removed', 'Record purged from local vault.')
      navigate(ROUTES.APP.DOCUMENTS)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate(ROUTES.APP.DOCUMENTS)}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Vault
        </Button>
        <span className="text-xs text-muted-foreground font-mono">/ {doc.id}</span>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm">
                {doc.category.toUpperCase()}
              </Badge>
              {doc.verificationStatus === 'verified' && (
                <Badge variant="verified" size="sm">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Digilocker Sovereign Verified
                </Badge>
              )}
              {doc.verificationStatus === 'expiring_soon' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Expiring Soon
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-1.5">
              {doc.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Issued by {doc.issuer}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => {
              setStepUpAction('share')
              setStepUpOpen(true)
            }}
            variant="outline"
            size="sm"
            className="text-xs font-bold rounded-xl"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share Proof
          </Button>

          <Button
            onClick={() => {
              setStepUpAction('download')
              setStepUpOpen(true)
            }}
            variant="primary"
            size="sm"
            className="text-xs font-bold rounded-xl"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Encrypted File
          </Button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Document Metadata & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cryptographic Record Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Document Identifier Number
                  </span>
                  <p className="font-mono text-sm font-bold text-foreground mt-0.5">
                    {doc.documentNumber}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Document Owner
                  </span>
                  <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    {doc.ownerName || 'Self (Rajesh K. Sharma)'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Issue Date
                  </span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {doc.issueDate}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Expiry Date
                  </span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {doc.expiryDate || 'Permanent / Lifetime Validity'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="pt-2">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold block mb-2">
                  Classification Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs bg-muted text-foreground border border-border flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Encrypted preview representation */}
              <div className="pt-3 border-t border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold block mb-2">
                  Document Preview (Encrypted Render)
                </span>
                <div className="p-8 rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center text-primary shadow-sm">
                    <FileText className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-foreground">{doc.title} ({doc.fileSize})</p>
                  <p className="text-[11px] text-muted-foreground max-w-sm">
                    Format: {doc.fileType} • Validated against State Identity Registry
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Sovereign Security & Renewal */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                Sovereign Custody
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                This document is stored within your citizen sovereign enclave. No third party has access to its unencrypted contents without your express digital consent.
              </p>
              <div className="p-3 rounded-xl bg-muted/50 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="text-foreground">AES-256 GCM</span>
                </div>
                <div className="flex justify-between">
                  <span>Signer:</span>
                  <span className="text-foreground">{doc.issuer.substring(0, 18)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {doc.verificationStatus === 'expiring_soon' && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 space-y-2.5">
                <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Renewal Assistance
                </span>
                <p className="text-xs text-foreground">
                  This document approaches statutory expiry. Early renewal ensures seamless continuation of driving and identification rights.
                </p>
                <Button
                  onClick={() => navigate(ROUTES.APP.SERVICES)}
                  size="sm"
                  className="w-full text-xs font-bold rounded-xl"
                >
                  Initiate Renewal Service
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="pt-2">
            <Button
              onClick={() => {
                setStepUpAction('delete')
                setStepUpOpen(true)
              }}
              variant="outline"
              size="sm"
              className="w-full text-xs text-rose-500 hover:text-rose-600 border-rose-500/20 hover:bg-rose-500/10 rounded-xl"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Purge from Vault
            </Button>
          </div>
        </div>
      </div>

      <StepUpAuthenticationModal
        isOpen={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        actionName={`Authorize ${stepUpAction.toUpperCase()} for ${doc.title}`}
        onSuccess={handleAuthorizedAction}
      />
    </div>
  )
}
