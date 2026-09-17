import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  FileText,
  Briefcase,
  ArrowRight,
  AlertTriangle,
  Clock,
  Bot,
  QrCode,
  Lock,
  ChevronRight,
  Users,
  Award,
  Zap,
  TrendingUp,
  Activity,
  Star,
  CheckCircle2,
  XCircle,
  CreditCard,
  Layers,
  ShieldOff,
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { citizenIntelligenceService } from '@/services/citizen-intelligence.service'
import type { PrivacyHealthScore, ActivityFeedEvent } from '@/types'

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  consent_granted: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  consent_revoked: <XCircle className="w-4 h-4 text-rose-500" />,
  doc_verified: <FileText className="w-4 h-4 text-purple-500" />,
  app_updated: <Layers className="w-4 h-4 text-sky-500" />,
  login: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
  payment: <CreditCard className="w-4 h-4 text-amber-500" />,
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const identity = useMemo(() => civicStorage.getIdentity(), [])
  const documents = useMemo(() => civicStorage.getDocuments(), [])
  const applications = useMemo(() => civicStorage.getApplications(), [])
  const services = useMemo(() => civicStorage.getServices(), [])
  const credentials = useMemo(() => civicStorage.getCredentials(), [])
  const familyMembers = useMemo(() => civicStorage.getFamilyMembers(), [])
  const actions = useMemo(() => civicStorage.getActions(), [])

  // Intelligence data
  const [privacyScore, setPrivacyScore] = useState<PrivacyHealthScore | null>(null)
  const [activityFeed, setActivityFeed] = useState<ActivityFeedEvent[]>([])

  useEffect(() => {
    citizenIntelligenceService.getPrivacyHealthScore().then(setPrivacyScore)
    citizenIntelligenceService.getActivityFeed().then(setActivityFeed)
  }, [])

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Action Center metrics
  const pendingActions = useMemo(() => actions.filter((a) => !a.isCompleted), [actions])
  const criticalAction = useMemo(
    () => pendingActions.find((a) => a.urgency === 'critical') || pendingActions[0],
    [pendingActions]
  )

  // Attention items
  const actionRequiredApp = applications.find((a) => a.status === 'action_required')
  const expiringDoc = documents.find((d) => d.verificationStatus === 'expiring_soon')

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                National Citizen Workspace
              </span>
              <span className="text-muted-foreground/60">•</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user?.verificationLevel || 'Level 3 Sovereign'}
              </div>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting}, {user?.name || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Your civic identity is synchronized. All statutory vaults, active service applications, family delegations, and verified credentials are encrypted under sovereign citizen privacy protocols.
            </p>
          </div>

          {/* Quick primary CTA and Security Score */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
                94%
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-foreground leading-none">Security Score</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Hardware 2FA Active</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="gap-2 shadow-sm font-semibold rounded-xl"
              onClick={() => navigate(ROUTES.APP.IDENTITY)}
            >
              <QrCode className="w-4 h-4" />
              View Digital ID
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Citizen Action Center Strip (Interactive & Proactive) */}
      {pendingActions.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Citizen Action Center
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/20 text-primary">
                  {pendingActions.length} Pending
                </span>
              </div>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {criticalAction.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                {criticalAction.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={() => navigate(criticalAction.targetRoute)}
              size="sm"
              className="text-xs font-bold rounded-xl shadow-sm"
            >
              {criticalAction.actionLabel}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
            <Button
              onClick={() => navigate(ROUTES.APP.ACTIONS)}
              variant="outline"
              size="sm"
              className="text-xs font-bold rounded-xl"
            >
              All Actions ({pendingActions.length})
            </Button>
          </div>
        </div>
      )}

      {/* 3. Attention Required Alerts Area (If specific application or expiring document) */}
      {(actionRequiredApp || expiringDoc) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {actionRequiredApp && (
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-card-foreground shadow-subtle animate-in fade-in duration-200">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Application Query
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {actionRequiredApp.applicationNumber}
                  </span>
                </div>
                <p className="text-xs text-foreground font-semibold mt-0.5">
                  {actionRequiredApp.serviceName}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {actionRequiredApp.actionRequiredMessage}
                </p>
                <button
                  onClick={() => navigate(`/app/applications/${actionRequiredApp.id}`)}
                  className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Resolve query now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {expiringDoc && (
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 text-card-foreground shadow-subtle animate-in fade-in duration-200">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Expiring Document
                  </span>
                  <span className="text-[11px] text-muted-foreground">Expires 28 Oct 2026</span>
                </div>
                <p className="text-xs text-foreground font-semibold mt-0.5">{expiringDoc.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Grace period renewal avoids administrative surcharge penalties.
                </p>
                <button
                  onClick={() => navigate(ROUTES.APP.DOCUMENTS_EXPIRING)}
                  className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  View in Expiring Documents <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. KPI Summary Metric Cards (4 Pillars of Sovereign Citizen OS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Identity & Credentials */}
        <Card
          onClick={() => navigate(ROUTES.APP.IDENTITY)}
          className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-card group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Civic Identity</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold font-display text-foreground">Verified</span>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span>{identity.maskedNationalId}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Verifiable Credentials */}
        <Card
          onClick={() => navigate(ROUTES.APP.IDENTITY)}
          className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-card group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Credential Wallet</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-primary group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold font-display text-foreground">
                {credentials.length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Verifiable digital proofs</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Document Vault */}
        <Card
          onClick={() => navigate(ROUTES.APP.DOCUMENTS)}
          className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-card group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Document Vault</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold font-display text-foreground">
                {documents.length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Encrypted records stored</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Family & Dependents */}
        <Card
          onClick={() => navigate(ROUTES.APP.FAMILY)}
          className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-card group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Family & Dependents</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold font-display text-foreground">
                {familyMembers.length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Active legal delegations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4b. Intelligence Layer Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Privacy Health Score */}
        {privacyScore && (
          <Card
            className="border-border cursor-pointer hover:border-emerald-500/40 transition-all"
            onClick={() => navigate(ROUTES.APP.PRIVACY)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Privacy Health</span>
                <ShieldOff className="w-4 h-4 text-emerald-500" />
              </div>
              {/* Score ring */}
              <div className="flex items-center gap-4">
                <div
                  className="relative flex items-center justify-center h-14 w-14 rounded-full border-4 border-emerald-500/30 bg-card shrink-0"
                  role="meter"
                  aria-valuenow={privacyScore.overallPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className={`text-base font-black font-mono ${
                    privacyScore.overallPct >= 70 ? 'text-emerald-600' : privacyScore.overallPct >= 40 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {privacyScore.overallPct}%
                  </span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Fields exposed</span>
                    <span className="font-bold text-foreground">{privacyScore.exposedFields}/{privacyScore.totalFields}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(privacyScore.exposedFields / privacyScore.totalFields) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Active grants</span>
                    <span className="font-bold text-foreground">{privacyScore.activeGrants}</span>
                  </div>
                  {privacyScore.expiringIn7Days > 0 && (
                    <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold">
                      ⚠ {privacyScore.expiringIn7Days} grant{privacyScore.expiringIn7Days > 1 ? 's' : ''} expiring &lt;7d
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Progress Donut */}
        <Card className="border-border cursor-pointer hover:border-blue-500/40 transition-all" onClick={() => navigate(ROUTES.APP.APPLICATIONS)}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Applications</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: 'Total', val: applications.length, color: 'text-foreground' },
                { label: 'Action Needed', val: applications.filter(a => a.status === 'action_required').length, color: 'text-amber-600' },
                { label: 'Under Review', val: applications.filter(a => a.status === 'under_review').length, color: 'text-blue-600' },
                { label: 'Completed', val: applications.filter(a => a.status === 'completed').length, color: 'text-emerald-600' },
              ] as const).map((s) => (
                <div key={s.label} className="p-2 rounded-lg bg-muted/40 text-center">
                  <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Deadline Strip */}
        <Card className="border-border cursor-pointer hover:border-purple-500/40 transition-all" onClick={() => navigate(ROUTES.APP.DOCUMENTS_EXPIRING)}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Doc Deadlines</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <div className="space-y-2">
              {documents
                .filter(d => d.verificationStatus === 'expiring_soon' || d.verificationStatus === 'expired')
                .slice(0, 3)
                .map((doc) => {
                  const daysLeft = Math.ceil(
                    (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div key={doc.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate flex-1 pr-2">{doc.name}</span>
                      <Badge variant="outline" className={`text-[9px] font-bold shrink-0 ${
                        daysLeft <= 0 ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      }`}>
                        {daysLeft <= 0 ? 'EXPIRED' : `${daysLeft}d left`}
                      </Badge>
                    </div>
                  )
                })
              }
              {documents.filter(d => d.verificationStatus === 'expiring_soon' || d.verificationStatus === 'expired').length === 0 && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All documents current
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4c. Cross-Portal Activity Timeline */}
      {activityFeed.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-foreground">Recent Activity</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold" onClick={() => navigate(ROUTES.APP.PRIVACY)}>
                Full History <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="space-y-0">
              {activityFeed.map((event, i) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 rounded-lg px-1 transition-colors"
                  onClick={() => event.relatedRoute && navigate(event.relatedRoute)}
                >
                  <div className="mt-0.5 shrink-0">{ACTIVITY_ICONS[event.type] ?? <Activity className="w-4 h-4 text-muted-foreground" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">{event.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Civic Operations
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: 'Action Center',
              desc: `${pendingActions.length} items waiting`,
              icon: Zap,
              color: 'text-amber-500 bg-amber-500/10',
              url: ROUTES.APP.ACTIONS,
            },
            {
              label: 'Smart Identity',
              desc: 'QR & Proofs',
              icon: ShieldCheck,
              color: 'text-emerald-500 bg-emerald-500/10',
              url: ROUTES.APP.IDENTITY,
            },
            {
              label: 'Document Vault',
              desc: 'Upload & renew',
              icon: FileText,
              color: 'text-blue-500 bg-blue-500/10',
              url: ROUTES.APP.DOCUMENTS,
            },
            {
              label: 'Family Hub',
              desc: 'Manage dependents',
              icon: Users,
              color: 'text-indigo-500 bg-indigo-500/10',
              url: ROUTES.APP.FAMILY,
            },
            {
              label: 'Services',
              desc: 'Browse catalog',
              icon: Briefcase,
              color: 'text-purple-500 bg-purple-500/10',
              url: ROUTES.APP.SERVICES,
            },
            {
              label: 'Security Center',
              desc: 'Devices & audit',
              icon: Lock,
              color: 'text-sky-500 bg-sky-500/10',
              url: ROUTES.APP.SECURITY,
            },
          ].map((act, idx) => {
            const Icon = act.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(act.url)}
                className="flex flex-col items-start p-4 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all text-left group shadow-sm"
              >
                <div className={`p-2.5 rounded-xl ${act.color} mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">{act.label}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">{act.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 6. Main Content Double-Column: Applications Tracker & Family Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Applications Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Recent Application Lifecycles
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary font-semibold"
              onClick={() => navigate(ROUTES.APP.APPLICATIONS)}
            >
              View all ({applications.length}) <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <Card
                key={app.id}
                onClick={() => navigate(`/app/applications/${app.id}`)}
                className="cursor-pointer hover:border-primary/40 transition-all hover:shadow-subtle p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {app.applicationNumber}
                      </span>
                      <StatusIndicator status={app.status} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mt-1">{app.serviceName}</h3>
                    <p className="text-xs text-muted-foreground">{app.department}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground">Step {app.currentStep} of {app.totalSteps}</span>
                    <div className="w-28 sm:w-32 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${(app.currentStep / app.totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">
                    Latest: <strong className="text-foreground font-medium">{app.timeline[app.timeline.length - 1]?.title || 'Processing'}</strong>
                  </span>
                  <span className="shrink-0 ml-2 font-mono text-[11px]">
                    {new Date(app.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Family & Dependents Hub Widget */}
        <div className="space-y-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Family & Dependents</CardTitle>
                    <CardDescription className="text-xs">Delegated legal authority</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary font-semibold p-0 h-auto"
                  onClick={() => navigate(ROUTES.APP.FAMILY)}
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/app/family/${member.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-border shrink-0">
                      {member.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {member.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {member.relationship} • {member.isMinor ? 'Minor Child' : 'Adult Member'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold rounded-xl mt-2"
                onClick={() => navigate(ROUTES.APP.FAMILY_DELEGATION)}
              >
                Review Delegations
              </Button>
            </CardContent>
          </Card>

          {/* AI Civic Assistant Box */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground">CIVIQONE Copilot</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need guidance applying for your family or checking document renewal rules? Ask in 5 regional languages.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-bold rounded-xl"
                onClick={() => navigate(ROUTES.APP.ASSISTANT)}
              >
                Open Assistant Console
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 7. Recommended Civic Services Directory */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              Recommended Statutory Services
            </h2>
            <p className="text-xs text-muted-foreground">
              Frequently accessed civic procedures with automated pre-fill
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold rounded-xl"
            onClick={() => navigate(ROUTES.APP.SERVICES)}
          >
            Explore all services <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.slice(0, 3).map((srv) => (
            <Card key={srv.id} className="flex flex-col justify-between hover:shadow-card transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" size="sm">
                    {srv.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {srv.processingTime}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground line-clamp-1">{srv.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Gov Fee: <strong className="text-foreground">{srv.governmentFee > 0 ? `₹${srv.governmentFee}` : 'Free'}</strong>
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs h-8 px-3 font-semibold rounded-xl"
                    onClick={() => navigate(`/app/services`)}
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
