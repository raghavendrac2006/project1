import { useState, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Search,
  UploadCloud,
  Grid,
  List,
  Star,
  Download,
  Clock,
  Plus,
  ArrowRight,
  Users,
  Building2,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  QrCode,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { StepUpAuthenticationModal } from '@/components/auth/StepUpAuthenticationModal'
import { CredentialScannerModal, type ScannedCredentialResult } from '@/components/shared/CredentialScannerModal'
import { documentService } from '@/services/document.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { GuillochePattern } from '@/components/ui/GuillochePattern'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { CivicDocument, DocumentCategory } from '@/types'

// Mock access lineage for documents
const DOC_USAGE_MAP: Record<string, string[]> = {
  doc_aadhaar: ['State Department of Revenue', 'Apex Health & Life Insurers'],
  doc_pan: ['State Department of Revenue', 'Metro Urban Bank'],
  doc_driving: ['Traffic & Transport Licensing Bureau'],
  doc_property: ['Municipal Property Tax Board'],
  doc_degree: ['Civil Services Commission'],
}

export function DocumentVaultPage() {
  const [documents, setDocuments] = useState<CivicDocument[]>(() => civicStorage.getDocuments())
  const familyMembers = useMemo(() => civicStorage.getFamilyMembers(), [])
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'self' | 'family'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'size'>('date')

  // Per-document sharing block list: Set of doc IDs blocked from external sharing
  const [blockedSharingIds, setBlockedSharingIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('civiqone_blocked_doc_shares') || localStorage.getItem('civiqone_blocked_doc_shares')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [isOcrScanning, setIsOcrScanning] = useState(false)
  const [ocrCompleted, setOcrCompleted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Step-Up Authentication Modal
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [stepUpActionName, setStepUpActionName] = useState('Authorizing Action')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCategory, setUploadCategory] = useState<Exclude<DocumentCategory, 'all'>>('identity')
  const [uploadDocNumber, setUploadDocNumber] = useState('')
  const [uploadIssuer, setUploadIssuer] = useState('')
  const [uploadOwner, setUploadOwner] = useState<'self' | string>('self')
  const [uploadExpiryDate, setUploadExpiryDate] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)

  const toast = useToast()
  const navigate = useNavigate()

  const handleScanCredential = (scanned: ScannedCredentialResult) => {
    const existing = documents.find((d) => d.documentNumber.includes(scanned.identifier.replace(/\s/g, '')))
    if (existing) {
      const updated = { ...existing, verificationStatus: 'verified' as const }
      const allDocs = documents.map((d) => (d.id === existing.id ? updated : d))
      civicStorage.saveDocuments(allDocs)
      setDocuments(allDocs)
      toast.success('Document Cryptographically Re-Verified', `${existing.title} matched state ledger root.`)
      return
    }

    const newDoc: CivicDocument = {
      id: `doc_qr_${Date.now()}`,
      title:
        scanned.credentialType === 'AADHAAR'
          ? 'Aadhaar Biometric e-Card'
          : scanned.credentialType === 'DRIVING_LICENSE'
          ? 'Smart Driving License'
          : 'Treasury Clearance Receipt',
      category:
        scanned.credentialType === 'AADHAAR'
          ? 'identity'
          : scanned.credentialType === 'DRIVING_LICENSE'
          ? 'identity'
          : 'revenue',
      documentNumber: scanned.identifier,
      issuer:
        scanned.credentialType === 'AADHAAR'
          ? 'UIDAI'
          : scanned.credentialType === 'DRIVING_LICENSE'
          ? 'Ministry of Road Transport'
          : 'State Treasury',
      issueDate: new Date().toISOString().split('T')[0],
      fileSize: '1.2 MB',
      fileType: 'PDF',
      verificationStatus: 'verified',
      isFavorite: true,
      tags: ['Verified QR', 'Digital Ledger', 'Zero-Knowledge Anchored'],
      owner: 'self',
      ownerName: scanned.holderName,
    }

    const allDocs = [newDoc, ...documents]
    civicStorage.saveDocuments(allDocs)
    setDocuments(allDocs)
    toast.success('QR Credential Vaulted', `${newDoc.title} is verified and added to your sovereign vault.`)
  }

  const categories: { id: DocumentCategory; label: string }[] = [
    { id: 'all', label: 'All Vault Records' },
    { id: 'identity', label: 'Identity & KYC' },
    { id: 'revenue', label: 'Tax & Revenue' },
    { id: 'property', label: 'Land & Property' },
    { id: 'education', label: 'Education' },
    { id: 'health', label: 'Healthcare' },
    { id: 'legal', label: 'Legal & Certifications' },
  ]

  const expiringCount = useMemo(() => {
    return documents.filter((d) => d.verificationStatus === 'expiring_soon').length
  }, [documents])

  const filteredDocs = useMemo(() => {
    let list = [...documents]

    // Owner filter
    if (ownerFilter === 'self') {
      list = list.filter((d) => !d.owner || d.owner === 'self')
    } else if (ownerFilter === 'family') {
      list = list.filter((d) => d.owner === 'family_member')
    }

    if (selectedCategory !== 'all') {
      list = list.filter((d) => d.category === selectedCategory)
    }

    if (onlyFavorites) {
      list = list.filter((d) => d.isFavorite)
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.documentNumber.toLowerCase().includes(q) ||
          d.issuer.toLowerCase().includes(q) ||
          (d.ownerName && d.ownerName.toLowerCase().includes(q)) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'size') return a.fileSize.localeCompare(b.fileSize)
      return b.id.localeCompare(a.id)
    })

    return list
  }, [documents, ownerFilter, selectedCategory, onlyFavorites, searchQuery, sortBy])

  const handleToggleFavorite = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const updated = await documentService.toggleFavorite(id)
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
      toast.info(updated.isFavorite ? 'Added to Starred' : 'Removed from Starred')
    } catch {
      toast.error('Failed to update favorite status')
    }
  }

  const handleToggleDocSharing = (id: string, title: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setBlockedSharingIds((prev) => {
      const next = new Set(prev)
      const isNowBlocked = !next.has(id)
      if (isNowBlocked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      try {
        localStorage.setItem('civiqone_blocked_doc_shares', JSON.stringify(Array.from(next)))
      } catch {}

      if (isNowBlocked) {
        toast.warning(
          'Document Shielded',
          `${title} is temporarily locked from external organization data requests.`
        )
      } else {
        toast.success(
          'Sharing Restored',
          `${title} can now be conditionally requested with citizen consent.`
        )
      }
      return next
    })
  }

  const handleDownload = (doc: CivicDocument, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setStepUpActionName(`Exporting Encrypted File: ${doc.title}`)
    setPendingAction(() => () => {
      toast.success('Download Authorized', `Exported ${doc.title} (${doc.fileSize}).`)
    })
    setStepUpOpen(true)
  }

  // Simulated OCR trigger
  const handleSimulateOcr = async () => {
    setIsOcrScanning(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsOcrScanning(false)
    setOcrCompleted(true)
    setUploadTitle('Senior Citizen Transport Pass')
    setUploadCategory('identity')
    setUploadDocNumber('SCP-KA-2026-8812')
    setUploadIssuer('Bangalore Metropolitan Transport Corp.')
    setUploadExpiryDate('2031-12-31')
    setUploadOwner('fam_03') // Sunita Sharma
    toast.success('AI OCR Metadata Extracted', 'Fields automatically populated from scanned digital signature.')
  }

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!uploadTitle.trim() || !uploadDocNumber.trim() || !uploadIssuer.trim()) {
      toast.error('Missing Information', 'Please fill all required document attributes.')
      return
    }

    setIsUploading(true)
    try {
      const assignedFamily = familyMembers.find((m) => m.id === uploadOwner)
      const newDoc = await documentService.uploadDocument(
        {
          title: uploadTitle,
          category: uploadCategory,
          documentNumber: uploadDocNumber,
          issuer: uploadIssuer,
        },
        `${uploadTitle}.pdf`,
        '1.6 MB'
      )

      // Add owner fields
      const enrichedDoc: CivicDocument = {
        ...newDoc,
        expiryDate: uploadExpiryDate || undefined,
        owner: uploadOwner === 'self' ? 'self' : 'family_member',
        ownerId: uploadOwner === 'self' ? undefined : uploadOwner,
        ownerName: uploadOwner === 'self' ? 'Rajesh K. Sharma' : assignedFamily?.fullName,
      }

      const allDocs = [enrichedDoc, ...documents]
      civicStorage.saveDocuments(allDocs)
      setDocuments(allDocs)

      setUploadModalOpen(false)
      setOcrCompleted(false)
      setUploadTitle('')
      setUploadDocNumber('')
      setUploadIssuer('')
      setUploadExpiryDate('')
      setUploadOwner('self')
      toast.success('Document Vaulted & Verified', `${newDoc.title} is now secured.`)
    } catch {
      toast.error('Upload Failed', 'Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Vault Header with Expiring Monitor & Add Document Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Sovereign Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Zero-knowledge encrypted repository for national certificates, deeds, family records, and statutory proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expiringCount > 0 && (
            <Button
              onClick={() => navigate(ROUTES.APP.DOCUMENTS_EXPIRING)}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              Expiring ({expiringCount})
            </Button>
          )}

          <Button
            onClick={() => setScannerOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs font-bold gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
          >
            <QrCode className="w-4 h-4" />
            Scan QR Pass
          </Button>

          <Button
            onClick={() => setUploadModalOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs font-bold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Document Health Dashboard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Identity & KYC
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-sm font-black text-foreground mt-1">100% Verified</p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Aadhaar, PAN & Passport active</span>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Tax & Revenue
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-sm font-black text-foreground mt-1">Current</p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">AY 2026-27 filed & verified</span>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Property & Deeds
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-black text-foreground mt-1">1 Review Due</p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Khata certificate renewal soon</span>
        </div>

        <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Vault Cryptography
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm font-black text-foreground mt-1">AES-256-GCM</p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Zero-knowledge sealed</span>
        </div>
      </div>

      {/* Scope Segment Tabs (Self vs Family vs All) */}
      <div className="space-y-3">
        <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border">
          <button
            onClick={() => setOwnerFilter('all')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
              ownerFilter === 'all'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All Vault Records ({documents.length})
          </button>
          <button
            onClick={() => setOwnerFilter('self')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
              ownerFilter === 'self'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="w-3.5 h-3.5" />
            My Documents
          </button>
          <button
            onClick={() => setOwnerFilter('family')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
              ownerFilter === 'family'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Family Records
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold transition-all border',
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filter, Sort, and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, owner name, ID, or issuer..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={cn(
              'flex items-center gap-1.5 h-10 px-3 rounded-xl border text-xs font-semibold transition-colors',
              onlyFavorites
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            <Star className={cn('w-3.5 h-3.5', onlyFavorites && 'fill-amber-500 text-amber-500')} />
            <span>Starred</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'size')}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="date">Sort: Recent First</option>
            <option value="title">Sort: Title (A-Z)</option>
            <option value="size">Sort: File Size</option>
          </select>

          <div className="flex items-center rounded-xl border border-border bg-card p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Render */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          title="No Matching Documents Found"
          description="No credentials in your digital vault match the active filter or search keywords."
        />
      ) : viewMode === 'table' ? (
        /* Aligned Table for Desktop with Mobile Card Transformation */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 w-10">★</th>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Identifier / Number</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Issuer</th>
                  <th className="py-3 px-4">External Access</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDocs.map((doc) => {
                  const isBlocked = blockedSharingIds.has(doc.id)
                  const usedBy = DOC_USAGE_MAP[doc.id] || (doc.category === 'identity' ? ['State Department of Revenue'] : [])

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => navigate(`/app/documents/${doc.id}`)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4" onClick={(e) => handleToggleFavorite(doc.id, e)}>
                        <Star
                          className={cn(
                            'w-4 h-4 text-muted-foreground hover:text-amber-500 transition-colors',
                            doc.isFavorite && 'fill-amber-500 text-amber-500'
                          )}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {doc.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                              {doc.fileType} • {doc.fileSize}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">
                        {doc.documentNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                          {doc.owner === 'family_member' ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                              {doc.ownerName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Self</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground truncate max-w-[140px]">
                        {doc.issuer}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {usedBy.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-semibold text-primary">
                              {usedBy.length} active org{usedBy.length > 1 ? 's' : ''}
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate max-w-[130px]" title={usedBy.join(', ')}>
                              {usedBy[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Not shared</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1 w-fit">
                            <Lock className="w-2.5 h-2.5" /> Shielded
                          </span>
                        ) : doc.verificationStatus === 'expiring_soon' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Expiring Soon
                          </span>
                        ) : (
                          <Badge variant="verified" size="sm">Verified</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleToggleDocSharing(doc.id, doc.title, e)}
                            title={isBlocked ? 'Unlock sharing' : 'Shield document from orgs'}
                            className={cn(
                              'p-1.5 rounded-lg text-xs transition-colors',
                              isBlocked
                                ? 'bg-rose-500/15 text-rose-600 hover:bg-rose-500/25'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                          >
                            {isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDownload(doc, e)}
                            title="Download document"
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <Button
                            onClick={() => navigate(`/app/documents/${doc.id}`)}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 font-semibold"
                          >
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isBlocked = blockedSharingIds.has(doc.id)
            const usedBy = DOC_USAGE_MAP[doc.id] || (doc.category === 'identity' ? ['State Department of Revenue'] : [])

            return (
              <Card
                key={doc.id}
                onClick={() => navigate(`/app/documents/${doc.id}`)}
                className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-card flex flex-col justify-between p-4 group"
              >
                {/* Statutory Guilloche Security Rosette Watermark */}
                <GuillochePattern opacity={0.07} color="#0284C7" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" size="sm">
                        {doc.category.toUpperCase()}
                      </Badge>
                      {isBlocked && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-600 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Shielded
                        </span>
                      )}
                      {doc.owner === 'family_member' && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                          {doc.ownerName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleToggleFavorite(doc.id, e)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-amber-500"
                    >
                      <Star className={cn('w-4 h-4', doc.isFavorite && 'fill-amber-500 text-amber-500')} />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{doc.documentNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {doc.issuer}
                  </p>

                  {/* Used By Lineage Tag */}
                  {usedBy.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Used by:</span> {usedBy.join(', ')}
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {doc.expiryDate ? `Exp: ${doc.expiryDate}` : 'Lifetime Valid'}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleDocSharing(doc.id, doc.title, e)}
                      title={isBlocked ? 'Unlock sharing' : 'Shield document from orgs'}
                      className={cn(
                        'p-1.5 rounded-lg text-xs transition-colors',
                        isBlocked
                          ? 'bg-rose-500/15 text-rose-600'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDownload(doc, e)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-primary font-bold flex items-center gap-0.5 ml-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Intelligent Upload Modal with AI OCR Extraction */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UploadCloud className="w-5 h-5 text-primary" />
              Intelligent Document Ingestion & Vaulting
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload statutory certificates or cards. Intelligent OCR scanning will extract credential numbers and verify digital signatures.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 my-2">
            {/* OCR Simulator Trigger */}
            <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center text-center space-y-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <p className="text-xs font-bold text-foreground">AI OCR Smart Ingestion</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Extract metadata automatically from government certificates and smart cards.
              </p>
              <Button
                type="button"
                onClick={handleSimulateOcr}
                isLoading={isOcrScanning}
                variant="outline"
                size="sm"
                className="text-xs font-bold rounded-xl mt-1"
              >
                Scan & Extract Test Certificate
              </Button>
              {ocrCompleted && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ✓ Verified Metadata Extracted & Populated
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Senior Citizen Pass"
                required
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as Exclude<DocumentCategory, 'all'>)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="identity">Identity & KYC</option>
                  <option value="revenue">Tax & Revenue</option>
                  <option value="property">Land & Property</option>
                  <option value="education">Education</option>
                  <option value="health">Healthcare</option>
                  <option value="legal">Legal & Certifications</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Document Owner
                </label>
                <select
                  value={uploadOwner}
                  onChange={(e) => setUploadOwner(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="self">Self (Rajesh K. Sharma)</option>
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Document Number / Identifier
                </label>
                <input
                  type="text"
                  value={uploadDocNumber}
                  onChange={(e) => setUploadDocNumber(e.target.value)}
                  placeholder="e.g. KA-2026-99120"
                  required
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={uploadExpiryDate}
                  onChange={(e) => setUploadExpiryDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Issuing Authority / Department
              </label>
              <input
                type="text"
                value={uploadIssuer}
                onChange={(e) => setUploadIssuer(e.target.value)}
                placeholder="e.g. Department of Social Welfare, Karnataka"
                required
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUploading}>
                Save to Encrypted Vault
              </Button>
            </div>
          </form>
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

      {/* Credential Scanner Modal */}
      <CredentialScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleScanCredential}
      />
    </div>
  )
}
