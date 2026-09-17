import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  FileText,
  AlertTriangle,
  Upload,
  FastForward,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { Timeline } from '@/components/ui/Timeline'
import { FileUploader } from '@/components/ui/FileUploader'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { applicationService } from '@/services/application.service'
import { realtimeBus } from '@/services/eventBus'
import { useToast } from '@/hooks'
import type { CivicApplication } from '@/types'

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [application, setApplication] = useState<CivicApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)

  const toast = useToast()
  const navigate = useNavigate()

  const loadApp = async () => {
    if (!applicationId) return
    try {
      const found = await applicationService.getApplicationById(applicationId)
      if (found) {
        setApplication(found)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApp()

    // Real-time synchronization
    const unsub = realtimeBus.subscribe('APPLICATION_STATUS_UPDATED', (payload) => {
      if (payload && (payload as { applicationId?: string }).applicationId === applicationId) {
        loadApp()
        toast.info('Status Updated', 'Casework officer updated this application.')
      } else {
        loadApp()
      }
    })

    return () => unsub()
  }, [applicationId])

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        Retrieving application record from central repository...
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-base font-bold text-foreground">Application Not Found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/app/applications')}>
          Return to Applications
        </Button>
      </div>
    )
  }

  const isActionRequired = application.status === 'action_required'

  const handleResolveAction = async () => {
    if (!selectedFile) {
      toast.error('File Required', 'Please select or drop the updated document file.')
      return
    }

    setIsResolving(true)
    try {
      const updated = await applicationService.resolveActionRequired(
        application.id,
        selectedFile.name
      )
      setApplication(updated)
      setResolveModalOpen(false)
      toast.success(
        'Action Resolved & Resubmitted',
        'Your updated document has been attached and returned to the Licensing Officer for re-scrutiny.'
      )
    } catch {
      toast.error('Submission Failed', 'Could not resolve query.')
    } finally {
      setIsResolving(false)
    }
  }

  const handleSimulateStage = async () => {
    if (!application) return
    setIsAdvancing(true)
    try {
      const updated = await applicationService.advanceWorkflowStage(application.id)
      setApplication(updated)
      toast.success(
        'Simulated Stage Advancement',
        `Application moved to step ${updated.currentStep} of ${updated.totalSteps || 4} (${updated.status.toUpperCase()}).`
      )
    } catch {
      toast.error('Simulation Failed', 'Could not advance workflow.')
    } finally {
      setIsAdvancing(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/app/applications')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Applications Tracker
      </button>

      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-sm font-extrabold text-primary">
                {application.applicationNumber}
              </span>
              <StatusIndicator status={application.status} />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
              {application.serviceName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              {application.department} • Submitted on {new Date(application.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateStage}
              disabled={isAdvancing}
              className="gap-1.5 text-xs border-primary/40 hover:bg-primary/10 text-primary font-semibold shrink-0"
            >
              <FastForward className="w-3.5 h-3.5" />
              {isAdvancing ? 'Advancing...' : 'Simulate Stage'}
            </Button>

            {isActionRequired && (
              <Button
                variant="primary"
                size="md"
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0"
                onClick={() => setResolveModalOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Resolve Query Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Animated Visual Workflow Stepper */}
      <Card className="border-border bg-card/70 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Statutory Workflow Progression Engine
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Current Stage: Step {application.currentStep || 1} of {application.totalSteps || 4} • Real-time synchronization
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {[
              { num: 1, title: 'Intake & Submission', desc: 'Timestamped form logged' },
              { num: 2, title: 'Biometric & KYC', desc: 'Aadhaar / Citizen Vault verify' },
              { num: 3, title: 'Officer Scrutiny', desc: 'Statutory compliance check' },
              { num: 4, title: 'Certificate Issued', desc: 'Digitally signed dispatch' },
            ].map((step) => {
              const currentStep = application.currentStep || 1
              const isCompleted = step.num < currentStep
              const isCurrent = step.num === currentStep
              return (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-primary/50 bg-primary/10 shadow-sm relative ring-2 ring-primary/20'
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/60 bg-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground animate-pulse'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? '✓' : step.num}
                    </span>
                    {isCurrent && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{step.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Required Banner */}
      {isActionRequired && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-card-foreground flex items-start gap-3.5 shadow-subtle animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Department Officer Query
            </h4>
            <p className="text-xs text-foreground font-medium mt-1 leading-relaxed">
              {application.actionRequiredMessage}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs bg-background/80 border-amber-500/40 text-amber-700 dark:text-amber-300"
              onClick={() => setResolveModalOpen(true)}
            >
              Upload Legible Document
            </Button>
          </div>
        </div>
      )}

      {/* Double Column: Step-by-Step Progress & Document Attachments */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-base">Department Scrutiny Progression</CardTitle>
              <CardDescription className="text-xs">
                Real-time statutory verification milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Timeline steps={application.timeline} />
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Attached Documents & Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Attached Documents</CardTitle>
              <CardDescription className="text-xs">
                Verified records linked from Citizen Vault
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {application.attachedDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.size}</p>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'verified' ? 'verified' : 'secondary'} size="sm">
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Applicant Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              {application.applicantNotes || 'No special remarks provided.'}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resolve Action Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Upload className="w-4 h-4 text-primary" />
              Re-upload Required Document
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload a clear, high-resolution copy to satisfy the officer's query.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-foreground">
              <strong>Query:</strong> {application.actionRequiredMessage}
            </div>

            <FileUploader
              onFileSelect={(file) => setSelectedFile(file)}
              label="Upload clear proof of address scan"
              description="PDF or JPG up to 10MB"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isResolving}
              onClick={handleResolveAction}
            >
              Submit Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
