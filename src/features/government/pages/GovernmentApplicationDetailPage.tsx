import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { governmentService } from '@/services/government.service'
import type { CivicApplication, GovSessionData } from '@/types'
import { ROUTES } from '@/constants/routes'
import {
  FileCheck2,
  ArrowLeft,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Fingerprint,
  FileText,
  Stamp,
  Download,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function GovernmentApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [application, setApplication] = useState<CivicApplication | null>(null)
  const [officerNotes, setOfficerNotes] = useState(
    'All submitted proofs matched with National Registry. Biometric verification score 99.4%. Approved for Smart Card issuance under statutory authority.'
  )
  const [isEndorsing, setIsEndorsing] = useState(false)
  const [endorsedSuccess, setEndorsedSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const apps = await governmentService.getApplications()
      const found = apps.find((a) => a.id === id) || apps[0]
      setApplication(found || null)
      setLoading(false)
    }
    loadData()
  }, [id])

  if (loading || !session || !application) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const handleEndorse = async () => {
    setIsEndorsing(true)
    try {
      await governmentService.endorseApplication(application.id, officerNotes)
      setEndorsedSuccess(true)
      // refresh application state
      const apps = await governmentService.getApplications()
      const updated = apps.find((a) => a.id === application.id)
      if (updated) setApplication(updated)
    } finally {
      setIsEndorsing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.GOVERNMENT.APPLICATIONS)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Application Queue
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-xs font-mono text-muted-foreground">
            DOSSIER ID: {application.applicationNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              application.status === 'approved'
                ? 'success'
                : application.status === 'rejected'
                ? 'destructive'
                : 'warning'
            }
            className="text-xs px-3 py-1 font-semibold uppercase tracking-wider"
          >
            {application.status}
          </Badge>
        </div>
      </div>

      {endorsedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Application Officially Endorsed & Sealed
              </p>
              <p className="text-xs text-muted-foreground">
                Cryptographic digital stamp #SHA256-GOV-ENDORSE-KA applied to applicant's Digilocker vault.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEndorsedSuccess(false)}
            className="text-xs border-emerald-500/40"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Dossier Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details and Documents */}
        <div className="md:col-span-2 space-y-6">
          {/* Dossier Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {application.department}
              </span>
              <h2 className="text-xl font-bold text-foreground mt-0.5">
                {application.serviceTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Submitted on {new Date(application.submittedAt).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Applicant Name</span>
                <span className="font-semibold text-foreground">{application.applicantName}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Applicant Aadhaar Ref</span>
                <span className="font-mono font-medium text-foreground">XXXX-XXXX-8921</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Current Workflow Stage</span>
                <span className="font-medium text-foreground capitalize">{application.status}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">SLA Target Date</span>
                <span className="font-medium text-foreground">
                  {application.estimatedCompletion ? new Date(application.estimatedCompletion).toLocaleDateString() : '7 Days from Submission'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Evidence Vault */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Electronic Evidence & Identity Dossier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      UIDAI Biometric Match
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      99.4% Match Confirmed
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Digilocker Document Vault
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">
                      Original Issuer Verified
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
            </div>

            {/* Submitted Files List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-muted-foreground block">
                Submitted Documentation:
              </span>
              {[
                'Digilocker Aadhaar Card XML Certificate',
                'Government Medical Fitness Form 1-A',
                'Existing Driving License Scan & Smart Card UID',
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{doc}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px] text-emerald-600">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Inspect Proof
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Application History Timeline */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Official Case Progression Timeline
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {application.timeline.map((step, idx) => (
                <div key={idx} className="flex gap-4 relative pl-8">
                  <div className="absolute left-1.5 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-600 border-2 border-background" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                      {step.timestamp ? new Date(step.timestamp).toLocaleString() : 'Stage in progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Officer Endorsement Desk */}
        <div className="space-y-6">
          <div className="bg-card border border-emerald-600/30 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Stamp className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Official Statutory Seal
              </h3>
            </div>

            <p className="text-xs text-muted-foreground">
              By issuing approval, your digital certificate (DSC) will be applied as the statutory certifying authority.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Official Order & Verification Findings:
              </label>
              <textarea
                rows={4}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                className="w-full text-xs rounded-lg border border-border bg-background p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certifying Officer:</span>
                <span className="font-semibold text-foreground">{session.official.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Officer Role:</span>
                <span className="font-mono text-foreground">{session.official.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction:</span>
                <span className="text-foreground">{session.department.name}</span>
              </div>
            </div>

            <Button
              onClick={handleEndorse}
              disabled={isEndorsing || application.status === 'approved'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 shadow-md shadow-emerald-950/30"
            >
              <Stamp className="w-4 h-4 mr-2" />
              {isEndorsing
                ? 'Applying Cryptographic Stamp...'
                : application.status === 'approved'
                ? 'Endorsement Sealed'
                : 'Approve & Issue Smart Card'}
            </Button>

            <Button
              variant="outline"
              disabled={application.status === 'approved'}
              className="w-full text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
            >
              Raise Discrepancy / Query to Citizen
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
