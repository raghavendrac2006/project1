import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Lock,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Building2,
  Plus,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { organizationService } from '@/services/organization.service'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import type { CivicApplication, ConsentRequest } from '@/types'

export function OrganizationDashboardPage() {
  const navigate = useNavigate()
  const session = civicStorage.getOrgSession()

  const [applications, setApplications] = useState<CivicApplication[]>([])
  const [requests, setRequests] = useState<ConsentRequest[]>([])
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    avgProcessingDays: 3.4,
    consentApprovalRate: 84.5,
    activeGrantsCount: 2,
    expiringGrantsCount: 1,
    totalConsentRequests: 4,
    approvedRequestsCount: 2,
    deniedRequestsCount: 1,
  })

  useEffect(() => {
    async function loadData() {
      const [apps, reqs, analytics] = await Promise.all([
        organizationService.getApplications(),
        organizationService.getAccessRequests(),
        organizationService.getAnalytics(),
      ])
      setApplications(apps.slice(0, 5))
      setRequests(reqs)
      setStats(analytics)
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              {session?.organization.name}
            </span>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              IRDAI Empanelled
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-display">
            Operational Service Desk
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in as <strong>{session?.member.name}</strong> ({session?.member.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.ORGANIZATION.ACCESS_REQUESTS)}
            className="text-xs"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Issue Access Request
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.ORGANIZATION.SERVICES)}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Manage Services
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Applications</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.pendingApplications}</h3>
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Under Review
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Data Grants</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.activeGrantsCount}</h3>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Citizen Consented
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Consent Conversion</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.consentApprovalRate}%</h3>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" /> High Citizen Trust
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Turnaround SLA</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.avgProcessingDays} Days</h3>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Under Target
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Processing Desk */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Recent In-Flight Applications</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Incoming citizen submissions requiring review and verification.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.ORGANIZATION.APPLICATIONS)}
            className="text-xs text-primary"
          >
            View Full Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application #</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="text-xs font-mono font-bold text-foreground">
                    {app.applicationNumber}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {app.serviceName}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : app.status === 'action_required'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.ORGANIZATION.APPLICATION_DETAIL(app.id))}
                      className="text-xs h-7 px-2.5"
                    >
                      Process Dossier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Access Requests Monitor */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Active Citizen Consent Requests</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Current status of data access requests dispatched to citizens.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.ORGANIZATION.ACCESS_REQUESTS)}
              className="text-xs text-primary"
            >
              All Requests <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {requests.slice(0, 3).map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-border bg-card/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">{r.citizenName}</p>
                  <p className="text-[11px] text-muted-foreground truncate max-w-xs">{r.purpose}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-muted-foreground">Requested:</span>
                    <span className="text-[10px] font-mono text-primary font-semibold">{r.requestedFields.length} Fields</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    r.status === 'approved' || r.status === 'partially_approved'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : r.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                  }`}
                >
                  {r.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security & Audit Snapshot */}
        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">Compliance & Privacy Protocol</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Cryptographic guardrails protecting citizen sovereignty.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs text-muted-foreground">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Granular Whitelisting Active</p>
                <p className="text-[11px] leading-relaxed">
                  You can only view attributes that have been explicitly checked and consented by the citizen.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Automated Expiration & Revocation</p>
                <p className="text-[11px] leading-relaxed">
                  Grants automatically expire after the authorized duration. Citizens can revoke permissions at any moment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Immutable Audit Logging</p>
                <p className="text-[11px] leading-relaxed">
                  Every profile inspection, query, and status change is immutably logged with staff member badge ID.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
