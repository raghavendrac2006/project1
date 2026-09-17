import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { governmentService, type VerificationDossier } from '@/services/government.service'
import type { CivicApplication, GovSessionData } from '@/types'
import { ROUTES } from '@/constants/routes'
import {
  Landmark,
  FileCheck2,
  Clock,
  ShieldCheck,
  Award,
  ArrowRight,
  Fingerprint,
  BarChart3
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

export function GovernmentDashboardPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [applications, setApplications] = useState<CivicApplication[]>([])
  const [verificationQueue, setVerificationQueue] = useState<VerificationDossier[]>([])
  const [reports, setReports] = useState<{
    complianceRate: number
    avgResolutionDays: number
    totalApplicationsProcessed: number
    slaBreaches: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const apps = await governmentService.getApplications()
      setApplications(apps)
      const queue = await governmentService.getVerificationQueue()
      setVerificationQueue(queue)
      const rep = await governmentService.getReports()
      setReports(rep)
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

  const pendingApps = applications.filter(
    (a) => a.status === 'in-progress' || a.status === 'submitted' || a.status === 'under_review'
  )
  const pendingVerifications = verificationQueue.filter((v) => v.status === 'pending' || v.status === 'flagged')

  return (
    <div className="space-y-6">
      {/* Official Government Greeting & Jurisdiction Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-900/60 p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Landmark className="w-48 h-48 text-emerald-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold uppercase tracking-wider border border-emerald-700">
                {session.department.code} • Tier-1 Official
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Clearance: SECRET-CIVIC
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {session.official.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {session.official.designation} — {session.department.name}. All actions taken here are certified under statutory authority.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.GOVERNMENT.VERIFICATION)}
              className="border-emerald-700 text-emerald-200 hover:bg-emerald-900/50 bg-emerald-950/40"
            >
              <Fingerprint className="w-4 h-4 mr-2 text-emerald-400" />
              Verification Desk ({pendingVerifications.length})
            </Button>
            <Button
              onClick={() => navigate(ROUTES.GOVERNMENT.APPLICATIONS)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
            >
              <FileCheck2 className="w-4 h-4 mr-2" />
              Review Backlog
            </Button>
          </div>
        </div>
      </div>

      {/* Official Departmental KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Endorsements
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{pendingApps.length}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Require Approval</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Applications awaiting statutory digital sign</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              eKYC / Biometric Backlog
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{pendingVerifications.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active Dossiers</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Identity proofs & Digilocker dossiers</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              SLA Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{reports?.complianceRate ?? 97.4}%</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Target 95%</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">3 SLA breaches recorded this quarter</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg. Resolution Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{reports?.avgResolutionDays ?? 4.1} days</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">-1.2 days vs avg</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Across all departmental schemes</p>
        </div>
      </div>

      {/* Verification Desk Highlights */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-semibold text-foreground">
              Statutory Verification Desk
            </h2>
          </div>
          <Link
            to={ROUTES.GOVERNMENT.VERIFICATION}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            Open Full Verification Desk <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {verificationQueue.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border bg-muted/30 hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {item.applicationId}
                  </span>
                  <Badge
                    variant={
                      item.status === 'cleared'
                        ? 'success'
                        : item.status === 'flagged'
                        ? 'destructive'
                        : 'warning'
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {item.applicantName}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                  {item.serviceName}
                </p>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Biometric Match:</span>
                    <span className="font-semibold text-foreground">
                      {item.biometricMatchScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Digilocker Vault:</span>
                    <span className={item.digilockerVerified ? 'text-emerald-600 font-medium' : 'text-amber-600'}>
                      {item.digilockerVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{item.submissionDate}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(ROUTES.GOVERNMENT.VERIFICATION)}
                  className="h-7 text-xs border-emerald-600/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  Verify Dossier
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Application Review Queue */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Official Application Queue
            </h2>
            <p className="text-xs text-muted-foreground">
              Departmental applications awaiting review, endorsement, and digital certification.
            </p>
          </div>
          <Link
            to={ROUTES.GOVERNMENT.APPLICATIONS}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            View All Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application No.</TableHead>
              <TableHead>Scheme / Service</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.slice(0, 5).map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-mono font-medium text-foreground">
                  {app.applicationNumber}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {app.serviceTitle || app.serviceName}
                </TableCell>
                <TableCell>{app.applicantName || 'Citizen Applicant'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(app.submittedAt).toLocaleDateString()}
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
