import { useState, useMemo, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Briefcase,
  Search,
  Clock,
  IndianRupee,
  CheckCircle2,
  FileText,
  ArrowRight,
  Sparkles,
  Send,
  Building2,
  Landmark,
  ShieldCheck,
  Lock,
  Users,
  MapPin,
  ExternalLink,
  Scroll,
  Globe2,
} from 'lucide-react'

const ALL_STATES_AND_UTS = [
  'All India (Pan-National)',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { applicationService } from '@/services/application.service'
import { useToast, useAuth } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { realtimeBus } from '@/services/eventBus'
import { cn } from '@/lib/utils'
import type { CivicService, ServiceCategory, FamilyMember } from '@/types'

export function ServicesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const familyMembers = useMemo(() => civicStorage.getFamilyMembers(), [])

  const [services, setServices] = useState<CivicService[]>(() => civicStorage.getAllMarketplaceServices())
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'government' | 'organization'>('all')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all')
  const [selectedState, setSelectedState] = useState('All India (Pan-National)')
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyRecommended, setOnlyRecommended] = useState(false)

  // Service Detail / Application Modal
  const [activeService, setActiveService] = useState<CivicService | null>(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [applicantNotes, setApplicantNotes] = useState('')
  const [consentChecked, setConsentChecked] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedApplicantId, setSelectedApplicantId] = useState<'self' | string>(
    () => searchParams.get('applicant') || 'self'
  )

  // Interactive Eligibility Checklist state
  const [eligibilityChecks, setEligibilityChecks] = useState<Record<string, boolean>>({})

  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = realtimeBus.subscribe('SERVICE_PUBLISHED_CHANGED', () => {
      setServices(civicStorage.getAllMarketplaceServices())
      toast.info('Catalog Updated', 'New services or programs were just updated in the marketplace.')
    })
    return () => unsub()
  }, [])

  const categories: { id: ServiceCategory; label: string }[] = [
    { id: 'all', label: 'All Sectors' },
    { id: 'identity_civil', label: 'Identity & Civil' },
    { id: 'taxes_finance', label: 'Revenue & Finance' },
    { id: 'transport_driving', label: 'Transport & Driving' },
    { id: 'welfare_schemes', label: 'Welfare & Subsidies' },
    { id: 'land_property', label: 'Land & Property' },
    { id: 'utilities_municipal', label: 'Municipal & Utilities' },
    { id: 'education_skills', label: 'Education & Skills' },
  ]

  const filteredServices = useMemo(() => {
    let list = [...services]

    if (selectedProvider !== 'all') {
      list = list.filter((s) => (s.providerType || 'government') === selectedProvider)
    }

    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory)
    }

    if (selectedState !== 'All India (Pan-National)') {
      list = list.filter(
        (s) =>
          s.stateOrUt === selectedState ||
          s.jurisdictionLevel === 'Central' ||
          s.stateOrUt === 'All India' ||
          !s.stateOrUt
      )
    }

    if (onlyRecommended) {
      list = list.filter((s) => s.recommended || s.popular)
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          (s.ministry && s.ministry.toLowerCase().includes(q)) ||
          (s.serviceCode && s.serviceCode.toLowerCase().includes(q)) ||
          (s.statutoryAct && s.statutoryAct.toLowerCase().includes(q)) ||
          (s.stateOrUt && s.stateOrUt.toLowerCase().includes(q)) ||
          (s.providerName && s.providerName.toLowerCase().includes(q)) ||
          s.description.toLowerCase().includes(q) ||
          s.eligibility.some((e: string) => e.toLowerCase().includes(q))
      )
    }

    return list
  }, [services, selectedProvider, selectedCategory, selectedState, onlyRecommended, searchQuery])

  const handleStartApplication = (service: CivicService) => {
    setActiveService(service)
    setApplyModalOpen(true)
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!activeService) return

    if (!consentChecked) {
      toast.error('Consent Required', 'Please confirm the statutory truth declaration and data sharing consent.')
      return
    }

    setIsSubmitting(true)
    try {
      const isSelf = selectedApplicantId === 'self'
      const targetMember = !isSelf ? familyMembers.find((m: FamilyMember) => m.id === selectedApplicantId) : null
      const applicantName = targetMember ? targetMember.fullName : (user?.name || 'Rajesh Sharma')
      const proxyPrefix = targetMember
        ? `[Proxy Submission on behalf of ${targetMember.fullName} (${targetMember.relationship}) by citizen ${user?.name}]. `
        : ''

      const newApp = await applicationService.submitNewApplication(activeService.id, {
        applicantName,
        contactPhone: user?.phone || '9845012345',
        address: `${user?.city || 'Bengaluru'}, Karnataka`,
        notes: `${proxyPrefix}${applicantNotes}`,
        declarationConsent: true,
      })

      setApplyModalOpen(false)
      toast.success(
        'Application Submitted',
        `Your application for ${activeService.title} has been logged as ${newApp.applicationNumber}.`
      )
      navigate(`/app/applications/${newApp.id}`)
    } catch {
      toast.error('Submission Failed', 'An error occurred while submitting your application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Civic Services Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Discover and apply for statutory government services and verified private organization programs
          </p>
        </div>

        <button
          onClick={() => setOnlyRecommended(!onlyRecommended)}
          className={`flex items-center gap-1.5 h-9 px-3.5 rounded-xl border text-xs font-semibold transition-all ${
            onlyRecommended
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Popular & Recommended</span>
        </button>
      </div>

      {/* Provider Filter Tabs (Government vs Private Organization) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80 w-fit">
        <button
          onClick={() => setSelectedProvider('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedProvider === 'all'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>All Services</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-muted">
            {services.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedProvider('government')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedProvider === 'government'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-blue-500" />
          <span>🏛️ Government Services</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600">
            {services.filter((s: CivicService) => (s.providerType || 'government') === 'government').length}
          </span>
        </button>

        <button
          onClick={() => setSelectedProvider('organization')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedProvider === 'organization'
              ? 'bg-card text-emerald-600 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>🏢 Verified Organizations</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600">
            {services.filter((s: CivicService) => s.providerType === 'organization').length}
          </span>
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input & State Jurisdiction Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ministry, act, service code (e.g. IN-UIDAI-101)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 h-11">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer py-1 max-w-[200px]"
          >
            {ALL_STATES_AND_UTS.map((st) => (
              <option key={st} value={st} className="bg-card text-foreground">
                {st}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedState !== 'All India (Pan-National)' || selectedCategory !== 'all' || selectedProvider !== 'all' || onlyRecommended) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProvider('all')
              setSelectedCategory('all')
              setSelectedState('All India (Pan-National)')
              setSearchQuery('')
              setOnlyRecommended(false)
            }}
            className="text-xs h-11 px-3 text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No Services Found"
          description="No services match your current query or filter selection."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedProvider('all')
            setSelectedCategory('all')
            setSearchQuery('')
            setOnlyRecommended(false)
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((srv: CivicService) => {
            const isOrg = srv.providerType === 'organization'
            return (
              <Card
                key={srv.id}
                className="flex flex-col justify-between hover:border-primary/50 hover:shadow-card transition-all group"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    {/* Provider Trust Badge & Service Code */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isOrg ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1"
                          >
                            <Building2 className="w-3 h-3" />
                            Private Service • {srv.verificationBadge || 'Verified Partner'}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold gap-1"
                          >
                            <Landmark className="w-3 h-3" />
                            Official Government Service
                          </Badge>
                        )}

                        {srv.serviceCode && (
                          <Badge variant="outline" className="font-mono text-[9px] font-bold text-muted-foreground border-border bg-muted/30">
                            {srv.serviceCode}
                          </Badge>
                        )}
                      </div>

                      {srv.popular && (
                        <Badge variant="secondary" size="sm" className="text-[9px]">
                          Popular
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {srv.title}
                    </h3>

                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1 truncate">
                        {isOrg ? <Building2 className="w-3 h-3 text-muted-foreground shrink-0" /> : <Landmark className="w-3 h-3 text-muted-foreground shrink-0" />}
                        <span className="truncate">{srv.ministry ? `${srv.ministry}` : (srv.providerName || srv.department)}</span>
                      </span>
                      {srv.stateOrUt && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80 shrink-0 font-medium">
                          <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                          {srv.stateOrUt}
                        </span>
                      )}
                    </div>

                    {srv.statutoryAct && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">
                        <Scroll className="w-3 h-3 shrink-0" />
                        <span className="truncate">{srv.statutoryAct}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>

                    {/* Data Required Upfront Badge */}
                    <div className="mt-3 flex items-center justify-between text-[11px] bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/60">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-medium truncate">
                        <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">Upfront Data: {srv.requiredDocuments.length} credentials required</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0 pl-1">
                        Encrypted
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        {srv.processingTime}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-foreground">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                        {srv.governmentFee === 0 ? 'Free' : `₹${srv.governmentFee}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/60 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setActiveService(srv)
                        setEligibilityChecks({})
                      }}
                    >
                      Details & Eligibility
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs gap-1 font-semibold"
                      onClick={() => handleStartApplication(srv)}
                    >
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Service Details Modal */}
      <Dialog open={!!activeService && !applyModalOpen} onOpenChange={(open) => !open && setActiveService(null)}>
        {activeService && (
          <DialogContent className="max-w-xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {activeService.providerType === 'organization' ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    🏢 Verified Private Organization
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">
                    🏛️ Verified Government Provider
                  </Badge>
                )}
                {activeService.serviceCode && (
                  <Badge variant="outline" className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                    {activeService.serviceCode}
                  </Badge>
                )}
                {activeService.stateOrUt && (
                  <Badge variant="secondary" className="text-[10px]">
                    📍 {activeService.stateOrUt}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-lg font-bold">{activeService.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {activeService.ministry ? `${activeService.ministry} · ` : ''}
                Offered by: <strong>{activeService.providerName || activeService.department}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div>
                <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-1">
                  Service Description
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {activeService.description}
                </p>
              </div>

              {activeService.statutoryAct && (
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-start gap-2">
                  <Scroll className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] font-semibold text-foreground block">Statutory Act & Legal Mandate</span>
                    <span className="text-[11px] text-muted-foreground">{activeService.statutoryAct}</span>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Processing SLA</span>
                  <p className="font-semibold text-foreground mt-0.5">{activeService.processingTime}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Statutory Fee</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {(activeService.fees ?? activeService.governmentFee) === 0 ? 'Exempt / Free' : `₹${activeService.fees ?? activeService.governmentFee}`}
                  </p>
                </div>
                {activeService.portalUrl && (
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Sovereign Portal</span>
                    <p className="mt-0.5">
                      <a
                        href={activeService.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
                      >
                        Official Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive Eligibility Self-Assessor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Interactive Eligibility Check ({Object.values(eligibilityChecks).filter(Boolean).length}/{activeService.eligibility.length})
                  </h4>
                  {Object.values(eligibilityChecks).filter(Boolean).length === activeService.eligibility.length && activeService.eligibility.length > 0 && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      100% Eligible
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5 pl-1">
                  {activeService.eligibility.map((el: string, i: number) => {
                    const checked = !!eligibilityChecks[i]
                    return (
                      <label
                        key={i}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                          checked
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-foreground'
                            : 'bg-muted/20 border-border text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setEligibilityChecks((prev: Record<string, boolean>) => ({ ...prev, [i]: e.target.checked }))
                          }
                          className="mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                        />
                        <span className="text-xs leading-relaxed">{el}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  Required Supporting Documents
                </h4>
                <ul className="space-y-1.5 pl-1">
                  {activeService.requiredDocuments.map((doc: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="outline" size="sm" onClick={() => setActiveService(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 font-bold"
                onClick={() => {
                  setApplyModalOpen(true)
                }}
              >
                Apply for this Service <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* 3-Step Guided Application Modal with Data Sharing Transparency */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        {activeService && (
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Application: {activeService.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submitting to: <strong>{activeService.providerName || activeService.department}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-4 my-2 text-xs">
              {/* Data Sharing Transparency Disclosure */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  <span>Data Sharing & Consent Transparency</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  By submitting this application, you authorize <strong>{activeService.providerName || activeService.department}</strong> to receive only the specific verified attributes required for this workflow:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(activeService.dataFieldsRequired || ['fullName', 'phone', 'address']).map((f: string) => (
                    <Badge key={f} variant="secondary" className="text-[10px] px-2 py-0.5">
                      ✓ {f}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Who is this application for? */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Who is this statutory application for?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApplicantId('self')}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all',
                      selectedApplicantId === 'self'
                        ? 'border-primary bg-primary/10 text-foreground font-bold shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <p className="text-xs font-bold leading-tight">Myself</p>
                    <p className="text-[10px] text-muted-foreground">Self (Primary Citizen)</p>
                  </button>

                  {familyMembers.map((member: FamilyMember) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedApplicantId(member.id)}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all',
                        selectedApplicantId === member.id
                          ? 'border-primary bg-primary/10 text-foreground font-bold shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <p className="text-xs font-bold leading-tight truncate">{member.fullName.split(' ')[0]}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {member.relationship} {member.isMinor ? '(Minor)' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Applicant Summary */}
              <div className="p-3.5 rounded-xl border border-border bg-card grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">Applicant Name</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedApplicantId === 'self'
                      ? user?.name || 'Rajesh Sharma'
                      : familyMembers.find((m: FamilyMember) => m.id === selectedApplicantId)?.fullName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">Verified Phone</span>
                  <p className="font-semibold text-foreground mt-0.5">{user?.phone || '9845012345'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">Civic ID Level</span>
                  <p className="font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Biometric Level 3 Sovereign
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">Statutory Fee</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {activeService.governmentFee === 0 ? 'Exempt' : `₹${activeService.governmentFee}`}
                  </p>
                </div>
              </div>

              {/* Applicant Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Applicant Notes / Remarks (Optional)
                </label>
                <textarea
                  value={applicantNotes}
                  onChange={(e) => setApplicantNotes(e.target.value)}
                  placeholder="Enter any reference numbers, prior correspondence, or special circumstances..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  I solemnly affirm that all particulars submitted herein are true, correct, and verifiable against my sovereign civic credentials. I consent to share the specified fields strictly for processing this application.
                </span>
              </label>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setApplyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !consentChecked}
                  className="gap-1.5 font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Transmitting...' : 'Transmit Application'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
