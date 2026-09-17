import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { governmentService } from '@/services/government.service'
import type { CivicApplication, GovSessionData } from '@/types'
import { ROUTES } from '@/constants/routes'
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ShieldCheck,
  Building2,
  Calendar
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

export function GovernmentApplicationsPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [applications, setApplications] = useState<CivicApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const data = await governmentService.getApplications()
      setApplications(data)
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

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicantName && app.applicantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.serviceName && app.serviceName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            Official Application Backlog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Departmental casework queue for {session.department.name}.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by application number, citizen name, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Application Statuses</option>
            <option value="in-progress">In-Progress / Under Review</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved & Endorsed</option>
            <option value="rejected">Rejected / Query Raised</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case File / App ID</TableHead>
              <TableHead>Statutory Service</TableHead>
              <TableHead>Citizen / Applicant</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-mono font-medium text-foreground text-sm">
                  {app.applicationNumber}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {app.serviceTitle || app.serviceName}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {app.applicantName || 'Citizen Applicant'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(app.submittedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {app.department}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      app.status === 'approved'
                        ? 'success'
                        : app.status === 'rejected'
                        ? 'destructive'
                        : 'warning'
                    }
                    className="capitalize"
                  >
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(ROUTES.GOVERNMENT.APPLICATION_DETAIL(app.id))}
                    className="h-8 text-xs font-medium border-emerald-600/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Review & Endorse
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
