import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LifeBuoy,
  Headphones,
  FileQuestion,
  PhoneCall,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Send,
  User,
  Sparkles,
  Phone,
  ArrowRight,
  Filter,
  FileText,
  Check,
  AlertTriangle,
  Mic,
  Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useLanguage, useToast, useSpeechRecognition } from '@/hooks'
import { supportService, type SupportMetrics, type NewGrievancePayload } from '@/services/support.service'
import { cn } from '@/lib/utils'
import type {
  CustomerCareTicket,
  GrievanceCategory,
  GrievanceUrgency,
  LiveChatSession,
  CivicHelpline,
  KnowledgeFaqItem,
} from '@/types'

export function CitizenCustomerCarePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'tickets'
  const setActiveTab = (tab: string) => setSearchParams({ tab })

  const { language, currentLanguageDetails } = useLanguage()
  const toast = useToast()

  // State
  const [tickets, setTickets] = useState<CustomerCareTicket[]>([])
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<CustomerCareTicket | null>(null)
  const [ticketFilter, setTicketFilter] = useState<string>('all')
  const [helplines, setHelplines] = useState<CivicHelpline[]>([])
  const [faqs, setFaqs] = useState<KnowledgeFaqItem[]>([])
  const [faqSearch, setFaqSearch] = useState('')

  // Live Chat
  const [liveSession, setLiveSession] = useState<LiveChatSession | null>(null)
  const [liveInput, setLiveInput] = useState('')
  const [isSendingLive, setIsSendingLive] = useState(false)

  // Callback modal / state
  const [callbackPhone, setCallbackPhone] = useState('9845012345')
  const [callbackTime, setCallbackTime] = useState('Within 15 Minutes (Immediate)')
  const [isSchedulingCallback, setIsSchedulingCallback] = useState(false)

  // ── AI-Assisted Grievance Wizard Form ──
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1)
  const [grievanceText, setGrievanceText] = useState('')
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false)
  const [draftPayload, setDraftPayload] = useState<NewGrievancePayload>({
    category: 'service_delay',
    department: 'Transport Department',
    subject: '',
    description: '',
    urgency: 'standard',
    statutoryScheme: 'Right to Public Services Act (Sakala)',
  })
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>('Driving License Address Proof Document')

  // Speech Recognition for Grievance Lodging
  const { isListening, hasSupport, startListening, stopListening } = useSpeechRecognition({
    language,
    onResult: (spoken) => {
      setGrievanceText((prev) => (prev ? `${prev} ${spoken}` : spoken))
    },
    onError: (err) => {
      toast.error('Voice input error', err)
    },
  })

  // Load data
  useEffect(() => {
    async function loadData() {
      const allTickets = await supportService.getTickets()
      const m = await supportService.getMetrics()
      const session = await supportService.getLiveSession()
      setTickets(allTickets)
      setMetrics(m)
      setLiveSession(session)
      setHelplines(supportService.getHelplines())
      setFaqs(supportService.getFAQs(language))
      if (allTickets.length > 0 && !selectedTicket) {
        setSelectedTicket(allTickets[0])
      }
    }
    loadData()
  }, [language])

  // Handle pre-fill from AI Agent Diagnostic Blueprints
  useEffect(() => {
    if (activeTab === 'lodge') {
      const raw = sessionStorage.getItem('civiqone_prefill_grievance')
      if (raw) {
        try {
          const prefill = JSON.parse(raw)
          setGrievanceText(prefill.description || '')
          setDraftPayload({
            category: 'service_delay',
            department: prefill.department || 'Administrative Reforms Directorate',
            subject: prefill.subject || 'Citizen Grievance Redressal',
            description: prefill.description || '',
            urgency: prefill.priority === 'critical' ? 'critical_statutory' : 'urgent',
            statutoryScheme: 'Right to Public Services Act (Sakala 48-Hour SLA)',
          })
          setWizardStep(2)
          sessionStorage.removeItem('civiqone_prefill_grievance')
          toast.success('Grievance Dossier Loaded', 'Auto-populated from Senior AI Diagnostic Blueprint.')
        } catch {
          // ignore
        }
      }
    }
  }, [activeTab])

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true
    return t.status === ticketFilter
  })

  // AI Grievance Parsing
  const handleAnalyzeGrievance = () => {
    if (!grievanceText.trim()) return
    setIsAnalyzingAi(true)

    setTimeout(() => {
      const lower = grievanceText.toLowerCase()
      let cat: GrievanceCategory = 'service_delay'
      let dept = 'Transport Department'
      let urgency: GrievanceUrgency = 'standard'

      if (lower.includes('water') || lower.includes('road') || lower.includes('garbage') || lower.includes('bbmp') || lower.includes('municipal')) {
        cat = 'civic_infrastructure'
        dept = 'Bruhat Bengaluru Mahanagara Palike (BBMP)'
      } else if (lower.includes('tax') || lower.includes('refund') || lower.includes('bill') || lower.includes('payment') || lower.includes('money')) {
        cat = 'billing_payment'
        dept = 'Revenue & Financial Administration'
        urgency = 'urgent'
      } else if (lower.includes('pension') || lower.includes('subsidy') || lower.includes('welfare') || lower.includes('ration') || lower.includes('bribe')) {
        cat = 'social_welfare'
        dept = 'Department of Administrative Reforms & Grievances (CPGRAMS)'
        urgency = 'critical_statutory'
      }

      setDraftPayload({
        category: cat,
        department: dept,
        subject: `Citizen Grievance regarding ${dept}: ${grievanceText.slice(0, 45)}...`,
        description: grievanceText,
        urgency,
        statutoryScheme: 'Right to Public Services Act (Statutory Guarantee)',
      })

      setIsAnalyzingAi(false)
      setWizardStep(2)
      toast.success('AI Analysis Completed', `Auto-categorized as ${dept} (${urgency.toUpperCase()})`)
    }, 800)
  }

  // Submit Grievance
  const handleSubmitGrievance = async () => {
    try {
      const newTicket = await supportService.lodgeGrievance(draftPayload)
      setTickets((prev) => [newTicket, ...prev])
      setSelectedTicket(newTicket)
      setWizardStep(1)
      setGrievanceText('')
      setActiveTab('tickets')
      toast.success(
        'Grievance Registered!',
        `Official Reference #${newTicket.ticketNumber}. Statutory SLA: ${newTicket.slaHours} Hours.`
      )
    } catch {
      toast.error('Submission Failed', 'Could not register grievance. Please try again.')
    }
  }

  // Live Chat send
  const handleSendLiveMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!liveInput.trim() || isSendingLive) return

    const text = liveInput
    setLiveInput('')
    setIsSendingLive(true)

    try {
      const msg = await supportService.sendLiveMessage(text)
      setLiveSession((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : null)

      // Refresh session after officer response
      setTimeout(async () => {
        const refreshed = await supportService.getLiveSession()
        setLiveSession(refreshed)
        setIsSendingLive(false)
      }, 1500)
    } catch {
      toast.error('Connection Error', 'Could not send message to officer.')
      setIsSendingLive(false)
    }
  }

  // Schedule callback
  const handleScheduleCallback = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSchedulingCallback(true)
    const res = await supportService.requestCallback(callbackPhone, callbackTime)
    setIsSchedulingCallback(false)
    toast.success('Callback Confirmed', `Ref #${res.reference}. An officer will contact you ${callbackTime}.`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-border bg-gradient-to-r from-card via-card/90 to-primary/5 shadow-subtle">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Citizen Customer Care & Grievance Redressal
              </h1>
              <Badge variant="verified" size="sm">
                24x7 Statutory SLA
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              CPGRAMS & State Citizen Charter statutory portal for administrative redressal, ticket tracking & live officer support
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            onClick={() => setActiveTab('lodge')}
            className="h-10 px-4 rounded-xl gap-2 font-semibold shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Lodge New Grievance</span>
          </Button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 rounded-2xl border-border bg-card shadow-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">Active Grievances</span>
              <span className="text-xl font-bold font-display text-foreground">{metrics.activeTickets}</span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border-border bg-card shadow-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">Under Scrutiny</span>
              <span className="text-xl font-bold font-display text-foreground">{metrics.investigatingTickets}</span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border-border bg-card shadow-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">Resolved This Month</span>
              <span className="text-xl font-bold font-display text-foreground">{metrics.resolvedTickets}</span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border-border bg-card shadow-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">Charter SLA Rate</span>
              <span className="text-xl font-bold font-display text-foreground">{metrics.slaComplianceRate}%</span>
            </div>
          </Card>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-border bg-muted/50 overflow-x-auto no-scrollbar">
        {[
          { id: 'tickets', label: 'My Grievances & Tickets', icon: FileText, count: tickets.length },
          { id: 'lodge', label: 'AI Grievance Wizard', icon: Sparkles },
          { id: 'live', label: 'Live Officer Support', icon: Headphones },
          { id: 'helplines', label: '24x7 Civic Helplines', icon: PhoneCall, count: helplines.length },
          { id: 'faqs', label: 'Knowledge Base & FAQs', icon: FileQuestion },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-card text-foreground shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn('text-[10.5px] px-1.5 py-0.5 rounded-full font-mono font-bold', isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: TICKETS & ACTIVE GRIEVANCES TRACKER                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tickets List */}
          <div className="lg:col-span-5 space-y-3">
            {/* Filter bar */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1 pl-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {['all', 'lodged', 'investigating', 'action_proposed', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketFilter(st)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg font-medium text-[11px] capitalize transition-colors',
                      ticketFilter === st
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Cards */}
            <div className="space-y-2.5">
              {filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={cn(
                      'p-4 rounded-2xl border transition-all cursor-pointer text-left relative',
                      isSelected
                        ? 'bg-card border-primary ring-2 ring-primary/20 shadow-md'
                        : 'bg-card/70 hover:bg-card border-border shadow-subtle'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {t.ticketNumber}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 mt-0.5">
                          {t.subject}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{t.department}</p>
                      </div>

                      <Badge
                        variant={
                          t.status === 'resolved'
                            ? 'verified'
                            : t.status === 'investigating'
                            ? 'warning'
                            : 'pending'
                        }
                        size="sm"
                      >
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-2.5 border-t border-border/60">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {t.slaRemainingHours && t.slaRemainingHours > 0
                          ? `SLA: ${t.slaRemainingHours}h Left`
                          : 'SLA Fulfilled'}
                      </span>
                      <span className="text-[10px]">{t.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Selected Ticket Details Drawer */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <Card className="p-6 rounded-3xl border-border bg-card shadow-subtle space-y-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">
                        {selectedTicket.ticketNumber}
                      </span>
                      <Badge
                        variant={
                          selectedTicket.status === 'resolved'
                            ? 'verified'
                            : selectedTicket.status === 'investigating'
                            ? 'warning'
                            : 'attention'
                        }
                      >
                        {selectedTicket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mt-1.5">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{selectedTicket.department}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-muted-foreground block">Statutory SLA Target</span>
                    <span className="text-base font-mono font-black text-foreground">
                      {selectedTicket.slaHours} Hours Guaranteed
                    </span>
                  </div>
                </div>

                {/* Description & Problem Details */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Statutory Grievance Statement:
                  </span>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* AI Resolution / Action Proposed */}
                {selectedTicket.aiResolutionSummary && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Official Redressal Summary & Action Taken</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {selectedTicket.aiResolutionSummary}
                    </p>
                  </div>
                )}

                {/* Assigned Nodal Officer */}
                <div className="p-4 rounded-2xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {selectedTicket.nodalOfficer.name}
                        </span>
                        <Badge variant="verified" size="sm">
                          Nodal Officer
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedTicket.nodalOfficer.designation} • {selectedTicket.nodalOfficer.phone}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab('live')}
                    className="h-8 text-xs font-semibold rounded-xl gap-1.5"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Live Chat</span>
                  </Button>
                </div>

                {/* Milestone Timeline */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Statutory Milestone Timeline:
                  </span>
                  <div className="space-y-3 pl-2">
                    {selectedTicket.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="flex gap-3 text-left relative">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm',
                              event.status === 'completed'
                                ? 'bg-emerald-500'
                                : event.status === 'current'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-muted-foreground'
                            )}
                          >
                            {idx + 1}
                          </div>
                          {idx < selectedTicket.timeline.length - 1 && (
                            <div className="w-0.5 h-10 bg-border my-1" />
                          )}
                        </div>

                        <div className="pb-3">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-foreground">{event.title}</h5>
                            <span className="text-[10px] text-muted-foreground">{event.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                          <span className="text-[10px] font-mono text-primary font-semibold mt-1 block">
                            Actor: {event.actor}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escalation footer */}
                {selectedTicket.status !== 'resolved' && (
                  <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Has this grievance exceeded statutory deadlines without response?</span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs font-semibold rounded-xl"
                      onClick={() => {
                        supportService.escalateGrievance(
                          selectedTicket.id,
                          'Exceeded SLA without formal resolution. Escalated to Directorate Appellate Officer.'
                        )
                        toast.success('Grievance Escalated', 'Sent to First Appellate Authority under Sakala.')
                      }}
                    >
                      Escalate to Appellate Authority
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <div className="p-12 text-center text-muted-foreground border border-dashed rounded-3xl">
                Select a grievance from the left to view details and SLA audit trail.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: AI GRIEVANCE LODGING WIZARD                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'lodge' && (
        <Card className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border-border bg-card shadow-subtle space-y-6">
          {/* Stepper Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold font-mono">
                {wizardStep}/3
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {wizardStep === 1 && 'Step 1: Describe your grievance (Any Language or Voice)'}
                  {wizardStep === 2 && 'Step 2: Attach Evidence & Verify Department Details'}
                  {wizardStep === 3 && 'Step 3: Statutory Review & 1-Click Submission'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Grounded in CPGRAMS & Right to Public Services statutory guidelines
                </p>
              </div>
            </div>
            <Badge variant="verified" size="sm">
              AI Auto-Drafting
            </Badge>
          </div>

          {/* STEP 1: Voice or Text Problem Statement */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Explain the issue in detail:</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    Language: {currentLanguageDetails.nativeName} ({currentLanguageDetails.name})
                  </span>
                </label>

                <div className="relative">
                  <textarea
                    rows={6}
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder={`e.g. My Driving license application (#KA-RTO-2026-992140) has been pending for over 10 days despite uploading all valid proofs. Or describe water leakage, pension delay, or tax overcharge in your native language...`}
                    className="w-full p-4 rounded-2xl bg-muted/30 border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  />

                  {/* Mic trigger inside textarea corner */}
                  {hasSupport && (
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      className={cn(
                        'absolute bottom-3 right-3 p-2 rounded-xl transition-all',
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      )}
                      title={isListening ? 'Stop recording' : `Speak in ${currentLanguageDetails.nativeName}`}
                    >
                      {isListening ? <Radio className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {isListening && (
                  <p className="text-xs text-rose-500 font-semibold animate-pulse">
                    Recording audio transcription in {currentLanguageDetails.nativeName}... Speak clearly.
                  </p>
                )}
              </div>

              {/* Quick Sample Prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Quick Problem Templates:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Driving License scrutiny delay beyond 7 days statutory period',
                    'Property Tax early bird rebate concession not credited in receipt',
                    'Aadhaar e-KYC sync timeout for domestic subsidized LPG cylinder',
                    'Municipal garbage and street drainage overflowing on 12th Main Indiranagar',
                  ].map((temp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGrievanceText(temp)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors"
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  disabled={!grievanceText.trim() || isAnalyzingAi}
                  onClick={handleAnalyzeGrievance}
                  className="gap-2 h-10 px-5 rounded-xl font-semibold shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAnalyzingAi ? 'Analyzing & Classifying...' : 'AI Auto-Classify & Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Verify AI Pre-fill & Evidence */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Recommended Classification:
                  </span>
                  <Badge variant="verified" size="sm">
                    {draftPayload.urgency.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Target Government Department:
                    </label>
                    <Input
                      value={draftPayload.department}
                      onChange={(e) => setDraftPayload({ ...draftPayload, department: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Statutory Grievance Category:
                    </label>
                    <select
                      value={draftPayload.category}
                      onChange={(e) => setDraftPayload({ ...draftPayload, category: e.target.value as GrievanceCategory })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none"
                    >
                      <option value="service_delay">Service Delivery Delay</option>
                      <option value="billing_payment">Billing & Fee Dispute</option>
                      <option value="document_dispute">Document Scrutiny Dispute</option>
                      <option value="civic_infrastructure">Civic & Municipal Infrastructure</option>
                      <option value="social_welfare">Social Welfare & Subsidy</option>
                      <option value="officer_escalation">Officer Administrative Misconduct</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Formal Grievance Subject:
                  </label>
                  <Input
                    value={draftPayload.subject}
                    onChange={(e) => setDraftPayload({ ...draftPayload, subject: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Attach Document from Vault */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Attach Linked Citizen Document / Proof:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'Driving License Address Proof Document',
                    'BBMP Property Tax SAS Challan Receipt',
                    'Aadhaar e-KYC Verification XML Export',
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAttachment(doc)}
                      className={cn(
                        'p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between',
                        selectedAttachment === doc
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span className="truncate pr-2">{doc}</span>
                      {selectedAttachment === doc && <Check className="w-4 h-4 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setWizardStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setWizardStep(3)} className="gap-1.5 font-semibold">
                  <span>Review Statutory Terms</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Statutory Affirmation & Final Submit */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-bold text-foreground">{draftPayload.department}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-bold text-foreground">{draftPayload.category.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Guaranteed SLA:</span>
                  <span className="font-bold text-primary font-mono">
                    {draftPayload.urgency === 'critical_statutory' ? '24 Hours' : '48 Hours'} Guaranteed
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Attached Document:</span>
                  <span className="font-bold text-foreground">{selectedAttachment}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Subject:</span>
                  <p className="font-medium text-foreground bg-card p-2 rounded-lg border border-border/60">
                    {draftPayload.subject}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutory Citizen Charter Guarantee</span>
                </div>
                <p>
                  By submitting, you formally register this complaint under Section 4 of the Right to Public Services Act. A Nodal Officer is bound to investigate and provide written resolution within the published SLA.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setWizardStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmitGrievance}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 font-bold px-6 shadow-md shadow-primary/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Statutory Grievance</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: LIVE OFFICER CARE CONSOLE                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chat Stream Column */}
          <div className="lg:col-span-8">
            <Card className="rounded-3xl border-border bg-card shadow-subtle overflow-hidden flex flex-col h-[640px]">
              {/* Officer Header */}
              {liveSession && (
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary relative">
                      <Headphones className="w-5 h-5" />
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background absolute bottom-0 right-0 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-foreground">{liveSession.officerName}</h4>
                        <Badge variant="verified" size="sm">
                          Online
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{liveSession.officerRole} • {liveSession.officerDepartment}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-medium block">Queue Status</span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Connected Live
                    </span>
                  </div>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {liveSession?.messages.map((msg) => {
                  const isOfficer = msg.sender === 'officer'
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2.5 max-w-[85%]',
                        isOfficer ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                          isOfficer
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground border border-border'
                        )}
                      >
                        {isOfficer ? <Headphones className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div
                          className={cn(
                            'p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-subtle',
                            isOfficer
                              ? 'bg-muted/40 border border-border/80 text-foreground rounded-tl-sm'
                              : 'bg-primary text-primary-foreground font-medium rounded-tr-sm'
                          )}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block px-1">
                          {msg.senderName} • {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  )
                })}

                {isSendingLive && (
                  <div className="flex gap-2 mr-auto items-center text-xs text-muted-foreground">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Headphones className="w-3.5 h-3.5" />
                    </div>
                    <span className="italic">Officer Vikramaditya is typing response...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border bg-muted/20">
                <form onSubmit={handleSendLiveMessage} className="flex items-center gap-2">
                  <Input
                    value={liveInput}
                    onChange={(e) => setLiveInput(e.target.value)}
                    placeholder="Type official query or grievance update to Officer Vikram..."
                    className="flex-1 h-10 text-xs sm:text-sm bg-card"
                  />
                  <Button type="submit" disabled={!liveInput.trim() || isSendingLive} className="h-10 px-4 rounded-xl font-semibold gap-1.5">
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Callback & Phone Support Column */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 rounded-3xl border-border bg-card shadow-subtle space-y-4">
              <div className="flex items-center gap-2.5 text-foreground font-bold text-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>Request Priority Phone Callback</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Prefer speaking directly with a nodal officer? Schedule an expedited call on your verified phone number.
              </p>

              <form onSubmit={handleScheduleCallback} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Contact Number:
                  </label>
                  <Input
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Preferred Time Window:
                  </label>
                  <select
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none"
                  >
                    <option value="Within 15 Minutes (Immediate)">Within 15 Minutes (Immediate)</option>
                    <option value="Today, 04:00 PM – 05:00 PM">Today, 04:00 PM – 05:00 PM</option>
                    <option value="Tomorrow Morning, 10:00 AM">Tomorrow Morning, 10:00 AM</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isSchedulingCallback}
                  className="w-full h-9 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSchedulingCallback ? 'Booking...' : 'Schedule Officer Callback'}
                </Button>
              </form>
            </Card>

            {/* Toll Free Notice */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-2">
              <span className="font-bold text-foreground block">National Toll-Free Helpline:</span>
              <p className="text-muted-foreground">
                Dial <strong className="text-primary font-mono text-sm">1905</strong> anytime for multi-lingual citizen support across all 9 regional languages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: 24X7 CIVIC HELPLINES DIRECTORY                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'helplines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Official Government & Emergency Helplines
              </h3>
              <p className="text-xs text-muted-foreground">
                National and state statutory hotlines with zero-tariff toll-free dialing
              </p>
            </div>
            <Badge variant="verified">Verified Hotlines</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helplines.map((hl) => (
              <Card
                key={hl.id}
                className="p-5 rounded-2xl border-border bg-card shadow-subtle flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black font-mono text-primary px-2.5 py-1 rounded-xl bg-primary/10">
                        {hl.number}
                      </span>
                      {hl.tollFree && (
                        <Badge variant="verified" size="sm">
                          Toll-Free
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{hl.hours}</span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground">{hl.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{hl.description}</p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-muted-foreground">{hl.stateOrNational}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold rounded-xl gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(hl.number)
                      toast.success('Number Copied', `Dial ${hl.number} for ${hl.title}`)
                    }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Copy / Call {hl.number}</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: MULTILINGUAL KNOWLEDGE BASE & FAQS                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'faqs' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Search bar */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-card border border-input shadow-subtle">
            <Search className="w-5 h-5 text-muted-foreground ml-2" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => {
                setFaqSearch(e.target.value)
                setFaqs(supportService.getFAQs(language, e.target.value))
              }}
              placeholder={`Search statutory FAQs in ${currentLanguageDetails.nativeName} or English (e.g. driving license, khata, solar subsidy)...`}
              className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none pr-3"
            />
          </div>

          {/* FAQ Items Accordion */}
          <div className="space-y-3">
            {faqs.map((faq) => {
              const qText = faq.question[language] || faq.question.en
              const aText = faq.answer[language] || faq.answer.en
              return (
                <Card key={faq.id} className="p-5 rounded-2xl border-border bg-card shadow-subtle space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-foreground leading-snug">
                      {qText}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase shrink-0">
                      {faq.category}
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed pt-1">
                    {aText}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      {faq.tags.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span>{faq.helpfulCount} citizens found this helpful</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
