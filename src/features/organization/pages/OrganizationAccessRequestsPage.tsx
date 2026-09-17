import React, { useState, useEffect } from 'react'
import {
  Lock,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Send,
  Building2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { organizationService } from '@/services/organization.service'
import { useToast } from '@/hooks'
import type { ConsentRequest, ConsentField } from '@/types'

export function OrganizationAccessRequestsPage() {
  const { toast, success } = useToast()
  const [requests, setRequests] = useState<ConsentRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)

  // Form
  const [citizenName, setCitizenName] = useState('Rajesh K. Sharma')
  const [citizenId, setCitizenId] = useState('usr_civiq_99182')
  const [purpose, setPurpose] = useState('Comprehensive Health Risk Underwriting & Claim Verification')
  const [durationDays, setDurationDays] = useState(30)
  const [selectedFields, setSelectedFields] = useState<ConsentField[]>([
    'fullName',
    'dateOfBirth',
    'phone',
    'educationStatus',
  ])

  const loadRequests = async () => {
    const list = await organizationService.getAccessRequests()
    setRequests(list)
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose.trim()) return

    await organizationService.createAccessRequest({
      organizationId: 'org_apex_health',
      organizationName: 'Apex Health & Life Insurers',
      organizationLogo: '',
      purpose,
      requestedFields: selectedFields,
      requestedDocuments: ['Medical History Disclosure Form'],
      durationDays,
      citizenId,
      citizenName,
    })

    success('Access Request Dispatched', `Citizen ${citizenName} has received the consent authorization request.`)
    setModalOpen(false)
    await loadRequests()
  }

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Data Access Requests
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Issue and track purpose-bounded data consent requests dispatched to citizens.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Request
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/60 border border-border w-fit">
        {['all', 'pending', 'approved', 'partially_approved', 'denied', 'revoked'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === st
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {st === 'all' ? 'All Requests' : st.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citizen</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Requested Scope</TableHead>
                <TableHead>Approved Scope</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-bold text-foreground">
                    {r.citizenName}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {r.purpose}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-primary">
                    {r.requestedFields.length} Fields
                  </TableCell>
                  <TableCell className="text-xs font-mono text-emerald-600">
                    {r.approvedFields.length} Granted
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.durationDays} Days
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${
                        r.status === 'approved' || r.status === 'partially_approved'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : r.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.requestedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Access Request Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Data Access Request</DialogTitle>
            <DialogDescription className="text-xs">
              State your purpose and legal basis. The citizen retains ultimate veto power to approve, partially approve, or reject fields.
            </DialogDescription>
          </DialogHeader>

          {/* 1-Click Preset Bundles */}
          <div className="my-2 p-3 rounded-xl bg-muted/40 border border-border space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              1-Click Smart Request Bundles:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  name: '🏥 Healthcare',
                  purpose: 'Statutory health underwriting, pre-existing medical review, and emergency contact verification',
                  fields: ['fullName', 'dateOfBirth', 'phone', 'address'] as ConsentField[],
                  days: 30,
                },
                {
                  name: '🚇 Metro Pass',
                  purpose: 'Discounted monthly transit pass issuance and contactless tap credentialing',
                  fields: ['fullName', 'dateOfBirth', 'phone'] as ConsentField[],
                  days: 60,
                },
                {
                  name: '🎓 Student Pass',
                  purpose: 'Student tuition subsidy and educational qualification audit',
                  fields: ['fullName', 'dateOfBirth', 'educationStatus', 'income'] as ConsentField[],
                  days: 45,
                },
                {
                  name: '💼 Civic Loan',
                  purpose: 'Certified annual income and credit verification for municipal financial assistance',
                  fields: ['fullName', 'phone', 'income', 'address'] as ConsentField[],
                  days: 15,
                },
              ].map((bundle) => (
                <button
                  key={bundle.name}
                  type="button"
                  onClick={() => {
                    setPurpose(bundle.purpose)
                    setSelectedFields(bundle.fields)
                    setDurationDays(bundle.days)
                  }}
                  className="p-2 rounded-lg border border-border bg-card text-left text-[11px] font-semibold text-foreground hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all"
                >
                  {bundle.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Citizen Name</label>
                <Input value={citizenName} onChange={(e) => setCitizenName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Duration (Days)</label>
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  min={1}
                  max={90}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Specific Purpose & Legal Ground</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                placeholder="State why this data is required..."
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-foreground">Requested Attributes:</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  'fullName',
                  'dateOfBirth',
                  'gender',
                  'phone',
                  'email',
                  'address',
                  'educationStatus',
                  'income',
                ] as ConsentField[]).map((f) => {
                  const isChecked = selectedFields.includes(f)
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setSelectedFields((prev) =>
                          isChecked ? prev.filter((x) => x !== f) : [...prev, f]
                        )
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                        isChecked ? 'border-emerald-500 bg-emerald-500/5 font-bold text-foreground' : 'border-border text-muted-foreground'
                      }`}
                    >
                      <span className="capitalize">{f}</span>
                      <span>{isChecked ? '✓' : '+'}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Dispatch Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

