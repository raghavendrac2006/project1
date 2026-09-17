import React, { useState, useEffect } from 'react'
import { governmentService } from '@/services/government.service'
import type { GovSessionData } from '@/types'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Award,
  FileSpreadsheet
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function GovernmentReportsPage() {
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [reports, setReports] = useState<{
    department: string
    totalApplicationsProcessed: number
    complianceRate: number
    avgResolutionDays: number
    slaBreaches: number
    interDepartmentReferrals: number
    digitalPassportsIssued: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const rep = await governmentService.getReports()
      setReports(rep)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !session || !reports) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            {session.department.name} · Statutory SLA Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance analytics, turnaround metrics, and statutory service delivery for {session.department.code} ({session.department.jurisdictionScope || session.department.jurisdiction}).
          </p>
        </div>

        <Button variant="outline" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export Gazette Monthly Audit (PDF)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Casework Handled
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {reports.totalApplicationsProcessed}
            </span>
            <span className="text-xs text-emerald-600 font-medium">+14.2% YoY</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Digital applications across state portals</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Statutory SLA Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {reports.complianceRate}%
            </span>
            <span className="text-xs text-blue-600 font-medium">Benchmark 95%</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Only {reports.slaBreaches} statutory breaches recorded</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Digital Certificates Issued
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {reports.digitalPassportsIssued}
            </span>
            <span className="text-xs text-purple-600 font-medium">Digilocker Seeded</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Instant cryptographic issuance</p>
        </div>
      </div>

      {/* SLA Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Casework Turnaround Time Distribution
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Same-Day Instant eKYC</span>
                <span className="font-semibold text-foreground">62% (918 cases)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Within 1-3 Business Days</span>
                <span className="font-semibold text-foreground">28% (415 cases)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">4-7 Days (Field Inspection)</span>
                <span className="font-semibold text-foreground">8% (118 cases)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Extended / SLA Escalated (&gt; 7 Days)</span>
                <span className="font-semibold text-foreground">2% (31 cases)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '2%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Inter-Departmental Referrals */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Inter-Departmental Referral Metrics
          </h3>

          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Referrals to Revenue & Land Records:</span>
              <span className="font-semibold text-foreground">24 cases</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Referrals to Municipal Corporation (BBMP):</span>
              <span className="font-semibold text-foreground">16 cases</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Aadhaar Center Re-biometric Requests:</span>
              <span className="font-semibold text-foreground">8 cases</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Inter-department routing conforms to the National e-Governance Service Delivery Assessment (NeSDA) standards.
          </p>
        </div>
      </div>
    </div>
  )
}
