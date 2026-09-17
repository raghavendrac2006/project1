import React, { useState, useEffect } from 'react'
import { governmentService, type VerificationDossier } from '@/services/government.service'
import type { GovSessionData } from '@/types'
import {
  Fingerprint,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Award,
  FileSearch,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'

export function GovernmentVerificationPage() {
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [dossiers, setDossiers] = useState<VerificationDossier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const data = await governmentService.getVerificationQueue()
      setDossiers(data)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const handleUpdateStatus = (id: string, newStatus: 'cleared' | 'flagged') => {
    setDossiers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    )
  }

  const filteredDossiers = dossiers.filter((d) => {
    const matchesSearch =
      d.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || d.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-emerald-600" />
            Statutory Verification Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated Aadhaar eKYC, Biometric Match Verification, and Digilocker Document Integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            UIDAI Direct Node Active
          </Badge>
        </div>
      </div>

      {/* Verification Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Active Dossiers
          </span>
          <span className="text-2xl font-bold text-foreground">{dossiers.length}</span>
          <p className="text-xs text-muted-foreground mt-1">Under statutory investigation</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Cleared & Validated
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {dossiers.filter((d) => d.status === 'cleared').length}
          </span>
          <p className="text-xs text-muted-foreground mt-1">Biometric score &gt; 95%</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Flagged Discrepancies
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {dossiers.filter((d) => d.status === 'flagged').length}
          </span>
          <p className="text-xs text-muted-foreground mt-1">Requires physical biometric inspection</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dossier by applicant, application ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Dossier Statuses</option>
          <option value="pending">Pending Validation</option>
          <option value="cleared">Cleared</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* Verification Dossiers Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application Ref</TableHead>
              <TableHead>Citizen / Applicant</TableHead>
              <TableHead>Scheme / Service</TableHead>
              <TableHead>Biometric Match</TableHead>
              <TableHead>Digilocker Seal</TableHead>
              <TableHead>Physical Inspection</TableHead>
              <TableHead>Decision Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDossiers.map((dossier) => (
              <TableRow key={dossier.id}>
                <TableCell className="font-mono font-medium text-foreground text-xs">
                  {dossier.applicationId}
                </TableCell>
                <TableCell className="font-medium text-foreground text-sm">
                  {dossier.applicantName}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {dossier.serviceName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          dossier.biometricMatchScore >= 95
                            ? 'bg-emerald-500'
                            : dossier.biometricMatchScore >= 80
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${dossier.biometricMatchScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {dossier.biometricMatchScore}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {dossier.digilockerVerified ? (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[11px]">
                      <Award className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground text-[11px]">
                      Missing
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {dossier.physicalInspectionRequired ? (
                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Required
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Waived (eKYC)</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      dossier.status === 'cleared'
                        ? 'success'
                        : dossier.status === 'flagged'
                        ? 'destructive'
                        : 'warning'
                    }
                    className="capitalize text-[11px]"
                  >
                    {dossier.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {dossier.status !== 'cleared' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(dossier.id, 'cleared')}
                        className="h-7 text-xs border-emerald-600/40 text-emerald-600 hover:bg-emerald-500/10"
                      >
                        Clear
                      </Button>
                    )}
                    {dossier.status !== 'flagged' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(dossier.id, 'flagged')}
                        className="h-7 text-xs border-rose-600/40 text-rose-600 hover:bg-rose-500/10"
                      >
                        Flag
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
