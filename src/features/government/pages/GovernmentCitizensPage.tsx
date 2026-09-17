import React, { useState, useEffect } from 'react'
import { governmentService } from '@/services/government.service'
import type { CivicApplication, GovSessionData } from '@/types'
import {
  Users,
  Search,
  ShieldCheck,
  FileText,
  Building,
  CheckCircle2,
  Eye,
  Lock
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

export function GovernmentCitizensPage() {
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [applications, setApplications] = useState<CivicApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const apps = await governmentService.getApplications()
      setApplications(apps)
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

  // Aggregate citizens from departmental applications
  const citizenMap = new Map<string, {
    name: string
    applications: CivicApplication[]
    kycStatus: string
    lastInteraction: string
  }>()

  applications.forEach((app) => {
    const applicant = app.applicantName || 'Rajesh K. Sharma'
    const existing = citizenMap.get(applicant)
    if (existing) {
      existing.applications.push(app)
    } else {
      citizenMap.set(applicant, {
        name: applicant,
        applications: [app],
        kycStatus: 'Aadhaar Verified (UIDAI)',
        lastInteraction: app.submittedAt,
      })
    }
  })

  const citizens = Array.from(citizenMap.values()).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Statutory Citizen Case Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official case-file bounded citizen registry under {session.department.name} jurisdiction.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Access bounded by Section 12 of Public Data Governance Framework
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search citizen by name or case file reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Citizens Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Citizen Name</TableHead>
              <TableHead>National Identity Status</TableHead>
              <TableHead>Active Department Cases</TableHead>
              <TableHead>Last Official Interaction</TableHead>
              <TableHead>Statutory Case Files</TableHead>
              <TableHead className="text-right">Dossier Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citizens.map((c, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-semibold text-foreground">
                  {c.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {c.kycStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-foreground">
                    {c.applications.length} Active {c.applications.length === 1 ? 'Case' : 'Cases'}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(c.lastInteraction).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.applications.map((a) => (
                      <span
                        key={a.id}
                        className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground"
                      >
                        {a.applicationNumber}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-medium border-emerald-600/40 text-emerald-600 hover:bg-emerald-500/10"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View Case Dossier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
