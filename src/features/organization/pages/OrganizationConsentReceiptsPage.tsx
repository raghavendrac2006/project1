import React, { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { civicStorage } from '@/services/storage'
import type { AccessGrant, ConsentField } from '@/types'

const FIELD_LABELS: Record<ConsentField, string> = {
  fullName: 'Full Legal Name',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  phone: 'Contact Phone',
  email: 'Email Address',
  address: 'Permanent Address',
  nationalId: 'National ID (Aadhaar)',
  panNumber: 'PAN Number',
  income: 'Annual Income',
  educationStatus: 'Education Status',
  drivingLicense: 'Driving License',
}

// Simulated "requested" fields per grant (what the org originally requested before citizen filtering)
const MOCK_REQUESTED_FIELDS: Record<string, ConsentField[]> = {
  grant_001: ['fullName', 'dateOfBirth', 'gender', 'income', 'nationalId', 'panNumber'],
  grant_002: ['fullName', 'panNumber', 'income', 'address', 'email'],
}

function ReceiptDiffRow({ field, granted, requested }: { field: ConsentField; granted: boolean; requested: boolean }) {
  if (!requested) return null

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border ${
        granted
          ? 'border-emerald-500/25 bg-emerald-500/5'
          : 'border-rose-500/25 bg-rose-500/5'
      }`}
    >
      <div className="flex items-center gap-2">
        {granted ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        )}
        <span className={granted ? 'text-foreground font-medium' : 'text-muted-foreground'}>
          {FIELD_LABELS[field] ?? field}
        </span>
      </div>
      <Badge
        variant="outline"
        className={`text-[9px] font-bold ${
          granted
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
        }`}
      >
        {granted ? 'GRANTED' : 'WITHHELD'}
      </Badge>
    </div>
  )
}

function GrantReceiptCard({ grant }: { grant: AccessGrant }) {
  const [expanded, setExpanded] = useState(false)
  const requestedFields = MOCK_REQUESTED_FIELDS[grant.id] ?? grant.authorizedFields
  const daysLeft = Math.ceil(
    (new Date(grant.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const isExpired = grant.status === 'expired' || grant.status === 'revoked'
  const grantedCount = grant.authorizedFields.length
  const requestedCount = requestedFields.length
  const withheldCount = requestedCount - grantedCount

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{grant.citizenName}</span>
              <Badge
                variant="outline"
                className={`text-[9px] font-bold ${
                  grant.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : grant.status === 'expiring_soon'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                }`}
              >
                {grant.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{grant.purpose}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> {grantedCount} fields granted
              </span>
              {withheldCount > 0 && (
                <span className="flex items-center gap-1 text-rose-500 font-semibold">
                  <MinusCircle className="w-3 h-3" /> {withheldCount} withheld by citizen
                </span>
              )}
              {!isExpired && daysLeft > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" /> Expires in {daysLeft}d
                </span>
              )}
              {isExpired && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" /> Expired{' '}
                  {new Date(grant.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => alert('Receipt export not available in demo mode')}
              aria-label="Download consent receipt"
              title="Download receipt"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse receipt' : 'Expand receipt diff'}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Expanded diff view */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border animate-in fade-in duration-150 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Requested vs Granted — Field Comparison
            </p>
            <div className="space-y-1.5">
              {requestedFields.map((field) => (
                <ReceiptDiffRow
                  key={field}
                  field={field as ConsentField}
                  requested={true}
                  granted={grant.authorizedFields.includes(field as ConsentField)}
                />
              ))}
            </div>

            {/* Documents */}
            {grant.authorizedDocuments.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Authorized Documents
                </p>
                <div className="flex flex-wrap gap-2">
                  {grant.authorizedDocuments.map((doc) => (
                    <Badge key={doc} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 bg-emerald-500/5 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Granted:{' '}
                <strong className="text-foreground ml-1">
                  {new Date(grant.grantedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expires:{' '}
                <strong className={`ml-1 ${isExpired ? 'text-rose-500' : 'text-foreground'}`}>
                  {new Date(grant.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </strong>
              </span>
              {grant.id && (
                <>
                  <span>·</span>
                  <span className="font-mono">Receipt ID: {grant.id}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function OrganizationConsentReceiptsPage() {
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | AccessGrant['status']>('all')

  useEffect(() => {
    const session = civicStorage.getOrgSession()
    const orgId = session?.organization.id ?? 'org_apex_health'
    const all = civicStorage.getAccessGrants()
    setGrants(all.filter((g) => g.organizationId === orgId))
  }, [])

  const filtered = filterStatus === 'all' ? grants : grants.filter((g) => g.status === filterStatus)

  const stats = {
    total: grants.length,
    active: grants.filter((g) => g.status === 'active').length,
    expiringSoon: grants.filter((g) => g.status === 'expiring_soon').length,
    expired: grants.filter((g) => g.status === 'expired' || g.status === 'revoked').length,
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="w-5 h-5 text-purple-500" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Consent Receipts
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Structural view of all citizen data grants received by this organization, including
          requested vs granted field comparison.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Receipts', value: stats.total, color: 'text-foreground' },
          { label: 'Active Grants', value: stats.active, color: 'text-emerald-600' },
          { label: 'Expiring Soon', value: stats.expiringSoon, color: 'text-amber-600' },
          { label: 'Expired / Revoked', value: stats.expired, color: 'text-rose-500' },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'expiring_soon', 'expired', 'revoked'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filterStatus === status
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Receipt list */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          No consent receipts found for the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((grant) => (
            <GrantReceiptCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2">
        <ClipboardCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Consent receipts are immutable records of what the citizen consented to share. The
          "Requested vs Granted" diff shows where citizens exercised their right to selective
          disclosure. You may not access any withheld fields regardless of your service requirements.
        </p>
      </div>
    </div>
  )
}
