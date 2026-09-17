import React, { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Archive,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { organizationPolicyService } from '@/services/organization-policy.service'
import type { PolicyTemplate, ConsentField } from '@/types'

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

function StatusBadge({ status }: { status: PolicyTemplate['status'] }) {
  const map = {
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    draft: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    deprecated: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[9px] font-bold uppercase ${map[status]}`}>
      {status}
    </Badge>
  )
}

function PurposePill({ cat }: { cat: string }) {
  return (
    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400">
      {organizationPolicyService.getPurposeCategoryLabel(cat as any)}
    </Badge>
  )
}

function PolicyCard({ policy }: { policy: PolicyTemplate }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{policy.name}</span>
              <StatusBadge status={policy.status} />
              <span className="text-[10px] font-mono text-muted-foreground">{policy.version}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {policy.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <PurposePill cat={policy.purposeCategory} />
              <span className="text-[10px] text-muted-foreground">
                Duration: <strong className="text-foreground">{policy.defaultDurationDays}d</strong>
              </span>
              <span className="text-[10px] text-muted-foreground">
                Used: <strong className="text-foreground">{policy.usageCount}×</strong>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse policy details' : 'Expand policy details'}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Expanded attribute list */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in duration-150">
            {/* Attributes */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Attribute Configuration ({policy.attributes.length} fields)
              </p>
              <div className="space-y-2">
                {policy.attributes.map((attr) => (
                  <div
                    key={attr.field}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/30 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {attr.required ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                      )}
                      <span className="font-medium text-foreground">
                        {FIELD_LABELS[attr.field as ConsentField] ?? attr.field}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="hidden sm:block">{attr.purpose}</span>
                      <span className="font-mono">
                        Retain: <strong className="text-foreground">{attr.retentionDays}d</strong>
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          attr.required
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {attr.required ? 'REQUIRED' : 'OPTIONAL'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required documents */}
            {policy.requiredDocuments.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Required Documents
                </p>
                <div className="flex flex-wrap gap-2">
                  {policy.requiredDocuments.map((doc) => (
                    <Badge key={doc} variant="outline" className="text-[10px] text-foreground border-border">
                      <FileText className="w-3 h-3 mr-1" />
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created by <strong className="text-foreground ml-1">{policy.createdBy}</strong>
              </span>
              <span>·</span>
              <span>
                Updated{' '}
                {new Date(policy.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function OrganizationPolicyEnginePage() {
  const [policies, setPolicies] = useState<PolicyTemplate[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | PolicyTemplate['status']>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    organizationPolicyService.getAll().then((data) => {
      setPolicies(data)
      setLoading(false)
    })
  }, [])

  const filtered =
    filterStatus === 'all' ? policies : policies.filter((p) => p.status === filterStatus)

  if (loading) {
    return <div className="p-8 text-xs text-muted-foreground animate-pulse">Loading policy templates…</div>
  }

  const counts = {
    all: policies.length,
    active: policies.filter((p) => p.status === 'active').length,
    draft: policies.filter((p) => p.status === 'draft').length,
    deprecated: policies.filter((p) => p.status === 'deprecated').length,
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-blue-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Consent Policy Engine
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure and version the attribute templates used for citizen data access requests.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
          onClick={() => alert('Policy builder UI — coming in next sprint')}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Policy Template
        </Button>
      </div>

      {/* Info panel */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>
          Policy templates define the <strong className="text-foreground">default attribute scope</strong> for your
          services. Citizens see the purpose and retention period for every field you request. Active templates
          are used in access requests; draft templates are not yet dispatched to citizens.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'draft', 'deprecated'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filterStatus === status
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 font-mono opacity-70">{counts[status]}</span>
          </button>
        ))}
      </div>

      {/* Policy cards */}
      <div className="space-y-3">
        {filtered.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No policy templates match the selected filter.
          </div>
        )}
      </div>
    </div>
  )
}
