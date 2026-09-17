import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  ShieldCheck,
  Lock,
  Eye,
  Plus,
  ArrowRight,
  ShieldAlert,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { civicStorage } from '@/services/storage'
import { organizationService } from '@/services/organization.service'
import { realtimeBus } from '@/services/eventBus'
import { useToast } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import type { AccessGrant, ConsentField } from '@/types'

export function OrganizationCitizensPage() {
  const navigate = useNavigate()
  const { success, error, info } = useToast()
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Request Form State
  const [citizenName, setCitizenName] = useState('Rajesh K. Sharma')
  const [citizenId, setCitizenId] = useState('usr_civiq_99182')
  const [purpose, setPurpose] = useState('Comprehensive Health Risk Underwriting & Claim Verification')
  const [durationDays, setDurationDays] = useState(30)
  const [selectedFields, setSelectedFields] = useState<ConsentField[]>([
    'fullName',
    'dateOfBirth',
    'phone',
    'address',
    'panNumber',
  ])

  const refreshGrants = () => {
    setGrants(civicStorage.getAccessGrants())
  }

  useEffect(() => {
    refreshGrants()

    // Listen for realtime consent updates from Citizen Privacy Center
    const unsubGranted = realtimeBus.subscribe('CONSENT_GRANTED', () => {
      refreshGrants()
      success('Consent Received', 'A citizen has granted data access authorization.')
    })

    const unsubRevoked = realtimeBus.subscribe('CONSENT_REVOKED', () => {
      refreshGrants()
      info('Grant Revoked', 'A citizen consent grant was revoked or expired.')
    })

    return () => {
      unsubGranted()
      unsubRevoked()
    }
  }, [])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose.trim()) return

    setIsSubmitting(true)
    try {
      const session = civicStorage.getOrgSession()
      const orgName = session?.organization.name || 'Apex Health & Life Insurers'
      const orgId = session?.organization.id || 'org_apex_health'

      await organizationService.createAccessRequest({
        organizationId: orgId,
        organizationName: orgName,
        organizationLogo: '',
        purpose,
        requestedFields: selectedFields,
        requestedDocuments: ['Income Certificate / Tax Receipt'],
        durationDays,
        citizenId,
        citizenName,
      })

      success(
        'Consent Request Dispatched',
        `A real-time authorization request was delivered to ${citizenName}'s personal Privacy Center.`
      )
      setModalOpen(false)
      refreshGrants()
    } catch {
      error('Dispatch Failed', 'Could not transmit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = grants.filter(
    (g) =>
      g.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const allAvailableFields: { key: ConsentField; label: string }[] = [
    { key: 'fullName', label: 'Full Legal Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Contact Phone' },
    { key: 'email', label: 'Official Email' },
    { key: 'address', label: 'Permanent Address' },
    { key: 'panNumber', label: 'PAN Card' },
    { key: 'drivingLicense', label: 'Driving License' },
    { key: 'income', label: 'Certified Income' },
    { key: 'educationStatus', label: 'Education Level' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Authorized Citizens Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Citizens who have granted active, purpose-bounded data consent grants to your organization.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Request Access from Citizen
        </Button>
      </div>

      {/* DPDP Consent Architecture Notice */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
        <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold block text-emerald-950 dark:text-emerald-100">
            DPDP Act 2023 Statutory Consent Architecture
          </span>
          <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300">
            Organizations have <strong>zero unconsented access</strong> to citizen vaults. Every citizen record below represents an active, cryptographically signed consent receipt. To inspect a citizen not listed here, click <strong>"Request Access from Citizen"</strong> to dispatch a statutory request to their personal Privacy Center.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by citizen name or purpose..."
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Grants Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">No Citizen Consent Grants Found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Your organization does not currently hold active data consent for this query. Dispatch a request to the citizen to obtain authorization.
                </p>
              </div>
              <Button
                onClick={() => setModalOpen(true)}
                variant="outline"
                className="text-xs h-8 gap-1.5"
              >
                Dispatch Consent Request <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen Name</TableHead>
                  <TableHead>Authorization Scope</TableHead>
                  <TableHead>Declared Purpose</TableHead>
                  <TableHead>Grant Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell className="text-xs font-bold text-foreground">
                      {grant.citizenName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="font-mono text-emerald-600 font-semibold">{grant.authorizedFields.length} Fields</span> authorized
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {grant.serviceName || grant.purpose}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          grant.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : grant.status === 'expiring_soon'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                        }`}
                      >
                        {grant.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(grant.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.ORGANIZATION.CITIZEN_DETAIL(grant.citizenId))}
                        className="text-xs h-7 px-3 text-emerald-600 hover:bg-emerald-500/10 gap-1 border-emerald-500/30"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 1-Click Request Access from Citizen Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold">
                Dispatch Data Access Request
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Request verifiable identity attributes directly from the citizen under DPDP Act 2023 purpose-limitation rules.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Presets */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Quick Purpose Bundles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCitizenName('Rajesh K. Sharma')
                  setCitizenId('usr_civiq_99182')
                  setPurpose('Comprehensive Health Risk Underwriting & Claim Verification')
                  setSelectedFields(['fullName', 'dateOfBirth', 'phone', 'address', 'panNumber'])
                  setDurationDays(30)
                }}
                className="p-2 text-left rounded-lg border border-border bg-card hover:border-emerald-500 text-[11px] font-semibold transition-colors"
              >
                🏥 Health Insurance Underwriting
              </button>
              <button
                type="button"
                onClick={() => {
                  setCitizenName('Rajesh K. Sharma')
                  setCitizenId('usr_civiq_99182')
                  setPurpose('Instant Video KYC & Bank Account Opening Verification')
                  setSelectedFields(['fullName', 'dateOfBirth', 'phone', 'address', 'panNumber', 'income'])
                  setDurationDays(90)
                }}
                className="p-2 text-left rounded-lg border border-border bg-card hover:border-emerald-500 text-[11px] font-semibold transition-colors"
              >
                🏦 Digital KYC & Bank Verification
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Target Citizen</label>
                <Input
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Rajesh K. Sharma"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Consent Validity (Days)</label>
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  min={1}
                  max={365}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Declared Purpose & Lawful Basis</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                placeholder="Specific purpose for processing this personal data..."
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground">Required Identity Attributes:</label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedFields.length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {allAvailableFields.map((f) => {
                  const isChecked = selectedFields.includes(f.key)
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => {
                        setSelectedFields((prev) =>
                          isChecked ? prev.filter((x) => x !== f.key) : [...prev, f.key]
                        )
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500/10 font-bold text-foreground'
                          : 'border-border text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className="text-[11px]">{isChecked ? '✓' : '+'}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || selectedFields.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Transmitting...' : 'Dispatch Request to Citizen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
