import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminService } from '@/services/admin.service'
import type { Organization, GovernmentDepartment, AuditEvent } from '@/types'
import { ROUTES } from '@/constants/routes'
import {
  ShieldAlert,
  Building2,
  Landmark,
  Users,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Server,
  FileCheck2,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<{
    totalCitizensRegistered: number
    activeOrganizations: number
    connectedDepartments: number
    activeServicesPublished: number
    dailyTransactions: number
    systemUptime: string
    securityAuditsLogged: number
    incidentAlerts: number
  } | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [departments, setDepartments] = useState<GovernmentDepartment[]>([])
  const [auditStream, setAuditStream] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const s = await adminService.getPlatformStats()
      setStats(s)
      const orgs = await adminService.getOrganizations()
      setOrganizations(orgs)
      const depts = await adminService.getDepartments()
      setDepartments(depts)
      const audits = await adminService.getAuditStream()
      setAuditStream(audits)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Supreme Sovereign Greeting Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950/70 to-slate-950 border border-purple-900/60 p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-56 h-56 text-purple-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-900/80 text-purple-200 text-xs font-semibold uppercase tracking-wider border border-purple-700">
                Sovereign Node • Level 0 ROOT
              </span>
              <span className="text-xs text-purple-300/80 font-mono">
                Cluster: BLR-DC1-SECURE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              SAMAGRA Ecosystem Control Console
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Cross-portal orchestration of Citizen Identity, Private Organization Vetting, and Public Sector Governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN.AUDIT)}
              className="border-purple-700 text-purple-200 hover:bg-purple-950/50 bg-purple-950/40"
            >
              <ShieldAlert className="w-4 h-4 mr-2 text-purple-400" />
              Global Audit Ledger
            </Button>
            <Button
              onClick={() => navigate(ROUTES.ADMIN.ORGANIZATIONS)}
              className="bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/50"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Manage Organizations
            </Button>
          </div>
        </div>
      </div>

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Registered Citizens
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stats.totalCitizensRegistered.toLocaleString()}
            </span>
            <span className="text-xs text-blue-600 font-medium">+1,420 today</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Unique Aadhaar-seeded accounts</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Vetted Organizations
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stats.activeOrganizations}
            </span>
            <span className="text-xs text-purple-600 font-medium">100% Verified</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Operating under Consent Agreements</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Connected Dept Nodes
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stats.connectedDepartments}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Active Connectors</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">MORTH, Revenue, BBMP Municipal</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ecosystem Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.systemUptime}</span>
            <span className="text-xs text-teal-600 font-medium">0 Incidents</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{stats.dailyTransactions.toLocaleString()} txns today</p>
        </div>
      </div>

      {/* Grid: Organizations & Department Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations Oversight */}
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Partner Organization Vetting
              </h2>
              <p className="text-xs text-muted-foreground">
                Private civic partners with active data access licenses.
              </p>
            </div>
            <Link
              to={ROUTES.ADMIN.ORGANIZATIONS}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              Manage All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {organizations.map((org) => (
              <div key={org.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block">
                      {org.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {org.type || org.category} • CIN: {org.cin || org.registrationNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={org.verificationStatus === 'verified' ? 'success' : 'warning'}
                    className="capitalize text-[11px]"
                  >
                    {org.verificationStatus}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(ROUTES.ADMIN.ORGANIZATIONS)}
                    className="h-7 text-xs border-purple-600/30 text-purple-600 dark:text-purple-400"
                  >
                    Audit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Government Nodes */}
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Government Department Nodes
              </h2>
              <p className="text-xs text-muted-foreground">
                Sovereign departmental connectors and gazette registries.
              </p>
            </div>
            <Link
              to={ROUTES.ADMIN.GOVERNMENT}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              Inspect Nodes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block">
                      {dept.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      CODE: {dept.code} • Nodal: {dept.nodalOfficer || dept.contactOfficer}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px]">
                    Connected
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Cross-Portal Audit Ledger Preview */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              Cross-Portal Master Audit Stream
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time immutable security trace across Citizen, Organization, Government, and Admin operations.
            </p>
          </div>
          <Link
            to={ROUTES.ADMIN.AUDIT}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
          >
            Full Audit Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Portal Workspace</TableHead>
              <TableHead>Actor / Official</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Resource</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditStream.slice(0, 6).map((evt) => (
              <TableRow key={evt.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {evt.workspace}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground text-sm">
                  {evt.actor}
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {evt.action}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {evt.resource}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={evt.status === 'success' ? 'success' : 'destructive'}
                    className="capitalize text-[11px]"
                  >
                    {evt.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
