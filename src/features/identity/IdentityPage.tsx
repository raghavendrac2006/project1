import { useState } from 'react'
import {
  ShieldCheck,
  QrCode,
  Eye,
  EyeOff,
  Share2,
  Download,
  Copy,
  History,
  CheckCircle2,
  Lock,
  Clock,
  Award,
  Building2,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { StepUpAuthenticationModal } from '@/components/auth/StepUpAuthenticationModal'
import { identityService } from '@/services/identity.service'
import { credentialService, type GeneratedProof } from '@/services/credential.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { cn } from '@/lib/utils'
import type { CivicCredential } from '@/types'

export function IdentityPage() {
  const [identity, setIdentity] = useState(() => civicStorage.getIdentity())
  const [credentials, setCredentials] = useState(() => civicStorage.getCredentials())
  const [activeTab, setActiveTab] = useState<'smart_card' | 'credentials'>('smart_card')

  const [showFullId, setShowFullId] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [generatedToken, setGeneratedToken] = useState<{ token: string; qrPayload: string; validUntil: string } | null>(null)
  const [purpose, setPurpose] = useState('Govt Checkpoint Verification')
  const [isGenerating, setIsGenerating] = useState(false)

  // Step-Up Authentication Modal state
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [stepUpActionName, setStepUpActionName] = useState('Authorizing Action')

  // Verifiable Proof Generation Modal state
  const [proofModalOpen, setProofModalOpen] = useState(false)
  const [selectedCredential, setSelectedCredential] = useState<CivicCredential | null>(null)
  const [proofRecipient, setProofRecipient] = useState('Apex Health Services')
  const [proofPurpose, setProofPurpose] = useState('Proof of Age & Address')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [generatedProof, setGeneratedProof] = useState<GeneratedProof | null>(null)
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)

  const toast = useToast()

  const handleToggleMask = () => {
    setShowFullId((prev) => !prev)
    if (!showFullId) {
      toast.info('Sensitive Data Unmasked', 'National ID revealed for 30 seconds.')
    }
  }

  const handleGenerateShareToken = async () => {
    setIsGenerating(true)
    try {
      const res = await identityService.generateShareableToken(purpose)
      setGeneratedToken(res)
      setIdentity(civicStorage.getIdentity()) // Refresh audit trail
      toast.success('Temporary Token Generated', `Valid until ${res.validUntil} (15 minutes).`)
    } catch {
      toast.error('Token Generation Failed', 'Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToken = () => {
    if (!generatedToken) return
    navigator.clipboard.writeText(generatedToken.token)
    toast.success('Copied to Clipboard', generatedToken.token)
  }

  const handleOpenProofGenerator = (cred: CivicCredential) => {
    setSelectedCredential(cred)
    setSelectedFields(Object.keys(cred.attributes).slice(0, 2))
    setGeneratedProof(null)
    setProofModalOpen(true)
  }

  const handleConfirmProofGeneration = async () => {
    if (!selectedCredential) return
    setIsGeneratingProof(true)
    try {
      const proof = await credentialService.generateVerifiableProof(
        selectedCredential.id,
        selectedFields,
        proofPurpose,
        proofRecipient
      )
      setGeneratedProof(proof)
      setCredentials(civicStorage.getCredentials())
      toast.success('Zero-Knowledge Proof Generated', `Cryptographic proof #${proof.proofId} created.`)
    } catch (err) {
      toast.error('Proof Error', err instanceof Error ? err.message : 'Could not generate proof.')
    } finally {
      setIsGeneratingProof(false)
    }
  }

  const handleDownloadSmartCard = () => {
    setStepUpActionName('Exporting Encrypted Sovereign Smart Card')
    setPendingAction(() => () => {
      toast.success('Smart Card Exported', 'Downloaded encrypted PKCS#12 credentials to local storage.')
    })
    setStepUpOpen(true)
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Civic Identity & Credential Wallet
            </h1>
            <Badge variant="verified" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Sovereign Level 3
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tamper-proof biometric credentials, verifiable digital certificates, and zero-knowledge disclosures
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShareModalOpen(true)
              handleGenerateShareToken()
            }}
            className="gap-1.5 text-xs font-semibold rounded-xl"
          >
            <Share2 className="w-4 h-4 text-primary" />
            Share Verifiable Token
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadSmartCard}
            className="gap-1.5 text-xs font-semibold rounded-xl"
          >
            <Download className="w-4 h-4" />
            Download Smart ID
          </Button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex p-1 rounded-2xl bg-muted border border-border w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('smart_card')}
          className={cn(
            'flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
            activeTab === 'smart_card'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          National Sovereign ID Card
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={cn(
            'flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
            activeTab === 'credentials'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Award className="w-4 h-4" />
          Verifiable Credential Wallet ({credentials.length})
        </button>
      </div>

      {activeTab === 'smart_card' ? (
        /* ================= TAB 1: SMART CARD & LINKED REGISTRY ================= */
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Holographic Sovereign Citizen Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl border border-blue-500/30 overflow-hidden group">
              {/* Holographic shimmer effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-emerald-500/10 pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-start justify-between pb-6 border-b border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
                    <ShieldCheck className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-sky-300">
                      Republic of India • Digital Sovereign Identity
                    </h3>
                    <p className="text-[10px] text-white/70 tracking-widest font-mono">
                      CIVIQONE CITIZEN SMART SYSTEM
                    </p>
                  </div>
                </div>

                {/* Holographic Chip */}
                <div className="flex flex-col items-end">
                  <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-200 to-amber-400 border border-amber-300/80 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 mt-1 font-semibold">
                    SECURE CHIP
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="relative z-10 py-6 grid sm:grid-cols-3 gap-6 items-center">
                {/* Citizen Photo & Seal */}
                <div className="flex flex-col items-center sm:items-start space-y-2">
                  <div className="relative">
                    <img
                      src={identity.photoUrl}
                      alt={identity.fullName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-sky-400/60 shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/60 tracking-wider">
                    BLOOD: {identity.bloodGroup}
                  </span>
                </div>

                {/* Citizen Data */}
                <div className="sm:col-span-2 space-y-3 text-left">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-sky-300/80">
                      Citizen Name
                    </span>
                    <p className="font-display text-lg sm:text-xl font-black text-white leading-tight">
                      {identity.fullName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/60">
                        Date of Birth
                      </span>
                      <p className="font-semibold text-white mt-0.5">{identity.dateOfBirth}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/60">
                        Gender
                      </span>
                      <p className="font-semibold text-white mt-0.5">{identity.gender}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-sky-300/80">
                        National Sovereign Identifier
                      </span>
                      <button
                        onClick={handleToggleMask}
                        className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        {showFullId ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showFullId ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    <p className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-white mt-0.5">
                      {showFullId ? identity.nationalId : identity.maskedNationalId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/70">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Digital Signature Hash</p>
                  <p className="font-mono text-[11px] text-emerald-400 truncate max-w-[200px] sm:max-w-xs">
                    {identity.digitalSignature}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-white/50">VALID THRU</p>
                    <p className="text-xs font-bold text-white">{identity.expiryDate}</p>
                  </div>
                  <div className="w-10 h-10 bg-white p-1 rounded-lg flex items-center justify-center text-slate-950">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Masking advice banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                Sovereign privacy rules: Identity numbers are masked in all standard viewport renders.
              </span>
              <span className="font-mono text-[11px] font-semibold text-foreground">
                Encrypted AES-256
              </span>
            </div>
          </div>

          {/* Right 5 Cols: Linked Government Services & Digital Registry */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Linked Statutory Services</CardTitle>
                <CardDescription className="text-xs">
                  Synchronized live with central national databases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {identity.linkedServices.map((ls) => (
                  <div
                    key={ls.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">{ls.name}</h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{ls.department}</p>
                      <p className="font-mono text-[11px] text-primary font-semibold mt-1">
                        {ls.identifierMasked}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="verified" size="sm">Linked</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{ls.lastSync}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Verification Audit Trail */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Recent Verification Inquiries
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground">Last 90 Days</span>
                </div>
                <CardDescription className="text-xs">
                  Log of authorized agencies that inspected your cryptographic identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {identity.verificationHistory.map((vh) => (
                  <div key={vh.id} className="p-3 rounded-xl border border-border/50 bg-card text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{vh.verifier}</span>
                      <Badge variant="verified" size="sm">Authorized</Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-1">{vh.purpose}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">{vh.timestamp}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ================= TAB 2: VERIFIABLE CREDENTIAL WALLET ================= */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-gradient-to-r from-card to-primary/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Decentralized Verifiable Credentials (W3C DID/VC)
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Cryptographically signed certificates issued by government departments. Generate zero-knowledge proofs disclosing only what third parties need to know without revealing raw identities.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="verified" size="sm">
                Cryptographic ZKP Engine Active
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary uppercase">
                        {cred.type.replace('_', ' ')}
                      </span>
                      {cred.status === 'expiring_soon' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Expiring Soon
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Valid & Active
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      {cred.verificationMethod === 'cryptographic_zkp'
                        ? 'ZKP'
                        : cred.verificationMethod === 'qr_signed'
                        ? 'QR Signed'
                        : 'Gov Registry'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground">{cred.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    {cred.issuerDepartment}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border/60 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Credential ID:</span>
                      <strong className="text-foreground">{cred.credentialNumber}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Issued:</span>
                      <span>{cred.issuedDate}</span>
                    </div>
                    {cred.expiryDate && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Expires:</span>
                        <span className={cred.status === 'expiring_soon' ? 'text-amber-600 font-bold' : ''}>
                          {cred.expiryDate}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground truncate">
                      <span>ZKP Hash:</span>
                      <span className="text-primary truncate max-w-[180px]">{cred.proofHash}</span>
                    </div>
                  </div>

                  {/* Attributes disclosure chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(cred.attributes).map(([key, val]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-background border border-border text-foreground font-medium"
                      >
                        {key}: <strong className="text-primary font-mono">{String(val)}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {cred.lastSharedWith ? `Shared with: ${cred.lastSharedWith}` : 'Not shared publicly'}
                  </span>

                  <Button
                    onClick={() => handleOpenProofGenerator(cred)}
                    size="sm"
                    className="text-xs font-bold rounded-xl"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-300" />
                    Generate Proof
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Verifiable Token Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Share2 className="w-5 h-5 text-primary" />
              Generate Temporary Verification Token
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatches a zero-knowledge, time-expiring (15-min) cryptographic pass for public kiosks, police checkpoints, or bank KYC.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Purpose of Verification
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Govt Checkpoint Verification</option>
                <option>Bank / Financial e-KYC</option>
                <option>Airport / Travel Pass Security</option>
                <option>Property Registry Verification</option>
              </select>
            </div>

            {generatedToken && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-md flex items-center justify-center">
                  <div className="w-full h-full border-4 border-slate-900 grid grid-cols-6 grid-rows-6 p-1 gap-1">
                    <div className="bg-slate-900 col-span-2 row-span-2" />
                    <div className="bg-slate-900 col-span-2 col-start-5 row-span-2" />
                    <div className="bg-slate-900 col-span-2 row-start-5 row-span-2" />
                    <div className="bg-slate-900 col-span-2 col-start-3 row-start-3 row-span-2" />
                    <div className="bg-blue-600 col-span-1 row-span-1" />
                    <div className="bg-slate-900 col-span-1 col-start-4 row-start-1" />
                    <div className="bg-slate-900 col-span-1 col-start-1 row-start-4" />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-mono tracking-widest text-muted-foreground">
                    Token Pass Code
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <code className="text-sm font-bold font-mono text-primary bg-card px-2.5 py-1 rounded border border-border">
                      {generatedToken.token}
                    </code>
                    <button
                      onClick={handleCopyToken}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Copy Token"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid until {generatedToken.validUntil} (Single Use)</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShareModalOpen(false)}>
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isGenerating}
              onClick={handleGenerateShareToken}
            >
              Refresh Token
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verifiable Proof Generator Dialog */}
      <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Verifiable Zero-Knowledge Proof
            </DialogTitle>
            <DialogDescription className="text-xs">
              Disclose only necessary fields to the verifier. Your raw certificate remains cryptographically protected.
            </DialogDescription>
          </DialogHeader>

          {selectedCredential && !generatedProof ? (
            <div className="space-y-4 my-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <p className="text-xs font-bold text-foreground">{selectedCredential.title}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {selectedCredential.credentialNumber} • {selectedCredential.issuerDepartment}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Recipient Organization
                </label>
                <input
                  type="text"
                  value={proofRecipient}
                  onChange={(e) => setProofRecipient(e.target.value)}
                  placeholder="e.g. Apex Health Services, State Bank of India"
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Stated Verification Purpose
                </label>
                <input
                  type="text"
                  value={proofPurpose}
                  onChange={(e) => setProofPurpose(e.target.value)}
                  placeholder="e.g. Insurance Eligibility Check"
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Attributes to Disclose (Selective Disclosure)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {Object.entries(selectedCredential.attributes).map(([key, val]) => {
                    const isSelected = selectedFields.includes(key)
                    return (
                      <label
                        key={key}
                        className={cn(
                          'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-colors',
                          isSelected ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFields((prev) => [...prev, key])
                              } else {
                                setSelectedFields((prev) => prev.filter((k) => k !== key))
                              }
                            }}
                            className="rounded border-border text-primary"
                          />
                          <span className="font-semibold text-foreground">{key}</span>
                        </div>
                        <span className="font-mono text-muted-foreground text-[11px]">{String(val)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setProofModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedFields.length === 0}
                  isLoading={isGeneratingProof}
                  onClick={handleConfirmProofGeneration}
                >
                  Generate Proof
                </Button>
              </div>
            </div>
          ) : generatedProof ? (
            <div className="space-y-4 my-2 text-center animate-in zoom-in-95">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Zero-Knowledge Proof Generated</h4>
                <p className="text-xs text-muted-foreground">
                  Proof ID: <strong className="text-primary font-mono">{generatedProof.proofId}</strong>
                </p>

                <div className="text-left p-3 rounded-xl bg-card border border-border text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Recipient:</span>
                    <span className="text-foreground font-semibold">{generatedProof.recipient}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Valid Until:</span>
                    <span className="text-foreground">{generatedProof.validUntil}</span>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase">Disclosed Fields:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.keys(generatedProof.disclosedAttributes).map((field) => (
                        <span key={field} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  Hash: {generatedProof.zkpHash}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="primary" size="sm" onClick={() => setProofModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Step-Up Authentication Modal */}
      <StepUpAuthenticationModal
        isOpen={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        actionName={stepUpActionName}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction()
            setPendingAction(null)
          }
        }}
      />
    </div>
  )
}
