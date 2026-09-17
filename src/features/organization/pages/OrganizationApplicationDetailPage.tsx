import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lock,
  FileText,
  Send,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  XCircle,
  MessageSquare,
  Scale,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { organizationService, type CitizenAuthorizedProfile } from '@/services/organization.service'
import { realtimeBus } from '@/services/eventBus'
import { useToast } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import type { CivicApplication, ConsentField, AiScrutinyResult, DiscrepancyItem } from '@/types'

const MOCK_AI_SCRUTINY: AiScrutinyResult = {
  confidenceScore: 89,
  status: 'review_recommended',
  summary: 'AI detected 1 minor identity name string permutation and 1 income bracket variance between declared value and DigiLocker OCR payload.',
  suggestedAction: 'request_clarification',
  discrepancies: [
    {
      id: 'disc_01',
      field: 'Applicant Legal Name',
      formValue: 'Rajesh K. Sharma',
      extractedValue: 'Rajesh Kumar Sharma',
      extractedOcrValue: 'Rajesh Kumar Sharma',
      confidence: 96,
      severity: 'low',
      message: 'Middle name abbreviated in web form. Digilocker Aadhaar OCR matches biometric UID hash.',
    },
    {
      id: 'disc_02',
      field: 'Annual Gross Income',
      formValue: '₹4,80,000 / annum',
      extractedValue: '₹5,15,000 / annum (ITR-V)',
      extractedOcrValue: '₹5,15,000 / annum (ITR-V)',
      confidence: 92,
      severity: 'medium',
      message: 'Self-declaration is 7.2% below ITR-V assessment figure. Cross-check for subsidy ceiling.',
    },
    {
      id: 'disc_03',
      field: 'Bangalore PIN & Ward',
      formValue: '560034 - Koramangala 3rd Block',
      extractedValue: '560034 - Koramangala 3rd Block',
      extractedOcrValue: '560034 - Koramangala 3rd Block',
      confidence: 99,
      severity: 'low',
      message: 'Exact match with municipal GIS boundary and electricity utility voucher.',
    },
  ],
}

export function OrganizationApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const { success, warning, info } = useToast()

  const [application, setApplication] = useState<CivicApplication | null>(null)
  const [profile, setProfile] = useState<CitizenAuthorizedProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrutiny, setScrutiny] = useState<AiScrutinyResult>(MOCK_AI_SCRUTINY)

  // Request Additional Access Dialog
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [additionalPurpose, setAdditionalPurpose] = useState('Underwriting risk verification requirement')
  const [selectedExtraFields, setSelectedExtraFields] = useState<ConsentField[]>(['address', 'income'])

  // 1-Click Query Citizen Dialog
  const [queryModalOpen, setQueryModalOpen] = useState(false)
  const [selectedQueryTemplate, setSelectedQueryTemplate] = useState<string>('income_variance')
  const [queryNote, setQueryNote] = useState(
    'Please clarify the ₹35,000 variance between self-declared income and attached ITR-V slip by uploading latest 3-month salary certificate.'
  )

  const loadApp = async () => {
    if (!applicationId) return
    setLoading(true)
    try {
      const app = await organizationService.getApplicationById(applicationId)
      if (app) {
        setApplication(app)
        const prof = await organizationService.getCitizenAuthorizedProfile('usr_civiq_99182')
        setProfile(prof)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApp()
  }, [applicationId])

  const handleStatusChange = async (newStatus: CivicApplication['status'], note: string) => {
    if (!application) return
    await organizationService.updateApplicationStatus(application.id, newStatus, note)
    
    // Broadcast status change across portal bus
    realtimeBus.publish('APPLICATION_STATUS_UPDATED', {
      applicationId: application.id,
      status: newStatus,
      note,
      timestamp: new Date().toISOString(),
    })

    if (newStatus === 'approved') {
      success('Application Approved', `Application #${application.applicationNumber} has been officially approved.`)
    } else {
      warning('Status Updated', `Application status changed to ${newStatus.toUpperCase()}.`)
    }
    await loadApp()
  }

  const handleSendAdditionalRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!application) return

    await organizationService.createAccessRequest({
      organizationId: 'org_apex_health',
      organizationName: 'Apex Health & Life Insurers',
      organizationLogo: '',
      serviceId: application.serviceId,
      serviceName: application.serviceName,
      purpose: additionalPurpose,
      requestedFields: selectedExtraFields,
      requestedDocuments: ['Income Tax Return Acknowledgement'],
      durationDays: 30,
      citizenId: 'usr_civiq_99182',
      citizenName: 'Rajesh K. Sharma',
    })

    success(
      'Additional Access Request Sent',
      `A new consent request has been transmitted to the citizen's Privacy Center.`
    )
    setRequestModalOpen(false)
  }

  const handleDispatchCitizenQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!application) return

    await handleStatusChange('action_required', `Casework Query Dispatched: ${queryNote}`)
    setQueryModalOpen(false)
    info(
      'Citizen Query Transmitted',
      'Citizen portal has been notified in real time to respond to this clarification notice.'
    )
  }

  const handleOverrideScrutiny = () => {
    setScrutiny((prev) => ({
      ...prev,
      confidenceScore: 98,
      status: 'passed',
      suggestedAction: 'approve',
      summary: 'Caseworker manually accepted minor name spelling permutation and verified ITR net income after standard deduction.',
    }))
    success('AI Scrutiny Overridden', 'Discrepancies resolved and dossier cleared for final approval.')
  }

  if (loading || !application) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading application dossier...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.ORGANIZATION.APPLICATIONS)}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
        </Button>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs uppercase font-bold px-3 py-1 ${
              application.status === 'approved'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : application.status === 'action_required'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
            }`}
          >
            {application.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Dossier Header Card */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
            {application.applicationNumber}
          </span>
          <h1 className="text-xl font-bold text-foreground font-display mt-0.5">
            {application.serviceName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted by <strong>Rajesh K. Sharma</strong> on {new Date(application.submittedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQueryModalOpen(true)}
            className="text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-1.5 font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            1-Click Citizen Query
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setRequestModalOpen(true)}
            className="text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Request Additional Access
          </Button>

          {application.status !== 'approved' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange('approved', 'Dossier fully verified and cleared by underwriting officer.')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve Application
            </Button>
          )}
        </div>
      </div>

      {/* Phase 1: AI Scrutiny Co-Pilot Strip & Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-primary/10 blur-3xl pointer-events-none rounded-full" />
        <CardHeader className="p-5 border-b border-border/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  AI Scrutiny & OCR Discrepancy Co-Pilot
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      scrutiny.status === 'passed'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    }`}
                  >
                    {scrutiny.status === 'passed' ? 'PASSED' : 'REVIEW RECOMMENDED'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Automated computer vision comparison between citizen self-declaration and verified DigiLocker evidence.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Match Confidence
                </span>
                <span className="text-xl font-bold font-mono text-primary">{scrutiny.confidenceScore}%</span>
              </div>
              {scrutiny.status !== 'passed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOverrideScrutiny}
                  className="text-xs text-foreground hover:bg-primary/10 border-primary/30 gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Accept & Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/60 leading-relaxed">
            <strong>Co-Pilot Assessment:</strong> {scrutiny.summary}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-primary" />
              Field-by-Field OCR Cross-Examination
            </h4>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground">
                    <th className="p-3">Dossier Field</th>
                    <th className="p-3">Self-Declared Input</th>
                    <th className="p-3">DigiLocker / OCR Extracted</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Finding & Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scrutiny.discrepancies.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{d.field}</td>
                      <td className="p-3 font-mono text-muted-foreground bg-muted/20">{d.formValue}</td>
                      <td className="p-3 font-mono text-foreground font-semibold bg-primary/5">{d.extractedOcrValue}</td>
                      <td className="p-3 font-mono font-bold text-primary">{d.confidence}%</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {d.severity === 'medium' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <span className="text-[11px] text-muted-foreground">{d.message}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Authorized Citizen Profile Fields & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader className="p-5 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Authorized Citizen Information
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Only fields explicitly consented by the citizen are readable. Unauthorized fields remain cryptographically masked.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {profile ? (
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {Object.values(profile.fields).map((item) => (
                    <div
                      key={item.field}
                      className={`p-3 rounded-xl border transition-colors ${
                        item.status === 'authorized'
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-border/60 bg-muted/20 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {item.label}
                        </span>
                        {item.status === 'authorized' ? (
                          <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            ✓ Authorized
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground border-border gap-1">
                            <Lock className="w-2.5 h-2.5" /> Not Authorized
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-bold text-foreground font-mono">
                        {item.status === 'authorized' ? item.value : '••••••••••••••••'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Loading profile credentials...</p>
              )}
            </CardContent>
          </Card>

          {/* Attached Supporting Documents */}
          <Card className="border-border">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                Submitted Supporting Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-2.5">
                {application.attachedDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.size}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      ✓ DigiLocker Verified
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Processing Milestone Timeline */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground">Processing Milestone Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {application.timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">{step.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                    {step.timestamp && (
                      <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 1-Click Citizen Query Dispatcher Dialog */}
      <Dialog open={queryModalOpen} onOpenChange={setQueryModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              1-Click Casework Query Dispatcher
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch an official clarification query directly into Rajesh K. Sharma&apos;s citizen portal inbox.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDispatchCitizenQuery} className="space-y-4 my-2 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-foreground">Standard Query Templates</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'income_variance',
                    title: 'Income Variance Clarification',
                    text: 'Please clarify the variance between self-declared income and attached ITR-V slip by uploading latest 3-month salary certificate.',
                  },
                  {
                    id: 'name_affidavit',
                    title: 'Name Permutation / Gazette Notice',
                    text: 'Please upload a formal Gazette notification or name affidavit explaining the abbreviation between your application and Aadhaar.',
                  },
                  {
                    id: 'address_utility',
                    title: 'Supplementary Municipal Address Proof',
                    text: 'Please furnish an updated BESCOM electricity bill or water connection invoice within 7 business days.',
                  },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedQueryTemplate(tmpl.id)
                      setQueryNote(tmpl.text)
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedQueryTemplate === tmpl.id
                        ? 'border-amber-500 bg-amber-500/10 font-bold text-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <p className="text-xs font-semibold">{tmpl.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{tmpl.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Query Notice Text to Citizen</label>
              <textarea
                value={queryNote}
                onChange={(e) => setQueryNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setQueryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Dispatch & Mark Action Required
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Additional Access Dialog */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Request Additional Data Access</DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch a formal consent request to <strong>Rajesh K. Sharma</strong> for supplementary verification fields.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendAdditionalRequest} className="space-y-4 my-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Purpose of Supplementary Access</label>
              <textarea
                value={additionalPurpose}
                onChange={(e) => setAdditionalPurpose(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-foreground">Select Additional Required Fields:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['address', 'income', 'panNumber', 'nationalId'] as ConsentField[]).map((f) => {
                  const isChecked = selectedExtraFields.includes(f)
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setSelectedExtraFields((prev) =>
                          isChecked ? prev.filter((x) => x !== f) : [...prev, f]
                        )
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                        isChecked ? 'border-primary bg-primary/5 font-bold text-foreground' : 'border-border text-muted-foreground'
                      }`}
                    >
                      <span className="capitalize">{f}</span>
                      <span>{isChecked ? '✓' : '+'}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Dispatch Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
