import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lock,
  FileText,
  Send,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { organizationService, type CitizenAuthorizedProfile } from '@/services/organization.service'
import { useToast } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import type { CivicApplication, ConsentField } from '@/types'

export function OrganizationApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const { success, warning } = useToast()

  const [application, setApplication] = useState<CivicApplication | null>(null)
  const [profile, setProfile] = useState<CitizenAuthorizedProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Request Additional Access Dialog
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [additionalPurpose, setAdditionalPurpose] = useState('Underwriting risk verification requirement')
  const [selectedExtraFields, setSelectedExtraFields] = useState<ConsentField[]>(['address', 'income'])

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
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            onClick={() => setRequestModalOpen(true)}
            className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/20 gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Request Additional Access
          </Button>

          {application.status !== 'approved' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange('approved', 'Dossier fully verified by staff officer.')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve Application
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Authorized Citizen Profile Fields */}
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

        {/* Right Col: Timeline & Decision Controls */}
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

