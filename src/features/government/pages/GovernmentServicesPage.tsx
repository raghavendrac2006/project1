import React, { useState, useEffect } from 'react'
import { governmentService } from '@/services/government.service'
import type { CivicService, GovSessionData } from '@/types'
import {
  Landmark,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldCheck,
  FileText,
  ExternalLink,
  MapPin,
  Building2,
  Scroll,
  Filter,
  Eye,
  Check,
  Globe2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/Dialog'

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
  'Puducherry'
]

const MINISTRIES = [
  'All Ministries',
  'Ministry of Electronics and Information Technology (MeitY)',
  'Ministry of Finance (MoF)',
  'Ministry of External Affairs (MEA)',
  'Election Commission of India (ECI)',
  'Ministry of Home Affairs (MHA)',
  'Ministry of Road Transport and Highways (MoRTH)',
  'Ministry of Health and Family Welfare (MoHFW)',
  'Ministry of Consumer Affairs, Food & Public Distribution',
  'Ministry of Agriculture & Farmers Welfare',
  'Ministry of New and Renewable Energy (MNRE)',
  'Ministry of Labour & Employment',
  'Ministry of Education (MoE)',
  'Ministry of Housing and Urban Affairs (MoHUA)',
  'Ministry of Law and Justice',
  'Ministry of Micro, Small & Medium Enterprises (MSME)',
  'Ministry of Commerce and Industry (MoCI)',
  'Ministry of Communications (DoP)',
  'Ministry of Personnel, Public Grievances and Pensions (DARPG)'
]

export function GovernmentServicesPage() {
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [services, setServices] = useState<CivicService[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('All India (Pan-National)')
  const [selectedMinistry, setSelectedMinistry] = useState('All Ministries')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [jurisdictionFilter, setJurisdictionFilter] = useState<'all' | 'Central' | 'State' | 'Municipal'>('all')
  const [loading, setLoading] = useState(true)

  // Detail Modal State
  const [viewService, setViewService] = useState<CivicService | null>(null)

  // Gazette Modal State
  const [isGazetteModalOpen, setIsGazetteModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newMinistry, setNewMinistry] = useState('Ministry of Electronics and Information Technology (MeitY)')
  const [newDept, setNewDept] = useState('')
  const [newJurisdiction, setNewJurisdiction] = useState<'Central' | 'State' | 'Municipal'>('Central')
  const [newState, setNewState] = useState('All India')
  const [newCategory, setNewCategory] = useState<'identity' | 'tax' | 'transport' | 'health' | 'welfare' | 'housing' | 'legal' | 'business' | 'other'>('identity')
  const [newAct, setNewAct] = useState('')
  const [newSla, setNewSla] = useState('7')
  const [newFee, setNewFee] = useState('0')
  const [newEligibility, setNewEligibility] = useState('')
  const [newDocs, setNewDocs] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [gazetteSuccessMsg, setGazetteSuccessMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const data = await governmentService.getServices()
      setServices(data)
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

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (srv.ministry && srv.ministry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (srv.serviceCode && srv.serviceCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (srv.statutoryAct && srv.statutoryAct.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesState =
      selectedState === 'All India (Pan-National)' ||
      srv.stateOrUt === selectedState ||
      (srv.jurisdictionLevel === 'Central' && selectedState === 'All India (Pan-National)') ||
      (srv.stateOrUt === 'All India' && selectedState === 'All India (Pan-National)')

    const matchesMinistry =
      selectedMinistry === 'All Ministries' ||
      srv.ministry === selectedMinistry

    const matchesCat = categoryFilter === 'all' || srv.category === categoryFilter
    const matchesJurisdiction =
      jurisdictionFilter === 'all' || srv.jurisdictionLevel === jurisdictionFilter

    return matchesSearch && matchesState && matchesMinistry && matchesCat && matchesJurisdiction
  })

  const handleGazetteScheme = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDept.trim()) return

    const gazettedService: CivicService = {
      id: `srv_${Date.now()}`,
      title: newTitle.trim(),
      slug: newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      serviceCode: newCode.trim() || `IN-${newJurisdiction.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      description: newDesc.trim() || 'Statutory public digital service enacted by gazette notification.',
      department: newDept.trim(),
      ministry: newMinistry,
      jurisdictionLevel: newJurisdiction,
      stateOrUt: newJurisdiction === 'Central' ? 'All India' : newState,
      category: newCategory,
      statutoryAct: newAct.trim() || 'Government of India Allocation of Business Rules',
      processingTime: `${newSla} Business Days`,
      processingTimeDays: parseInt(newSla, 10) || 7,
      fees: parseFloat(newFee) || 0,
      governmentFee: parseFloat(newFee) || 0,
      popular: false,
      recommended: false,
      eligibility: newEligibility ? newEligibility.split('\n').filter(Boolean) : ['Eligible Indian Citizens / Entities'],
      requiredDocuments: newDocs ? newDocs.split(',').map(s => s.trim()).filter(Boolean) : ['Aadhaar Card'],
      portalUrl: newUrl.trim() || 'https://india.gov.in',
      isPublished: true,
      verificationBadge: 'Gazette Validated',
    }

    await governmentService.gazetteService(gazettedService)
    const refreshed = await governmentService.getServices()
    setServices(refreshed)
    setGazetteSuccessMsg(`Scheme "${gazettedService.title}" (${gazettedService.serviceCode}) gazetted and synchronized to Citizen Portal.`)
    setTimeout(() => {
      setGazetteSuccessMsg('')
      setIsGazetteModalOpen(false)
      // Reset fields
      setNewTitle('')
      setNewCode('')
      setNewDept('')
      setNewDesc('')
      setNewAct('')
      setNewEligibility('')
      setNewDocs('')
      setNewUrl('')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Executive Senior Manager Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              National Portal of India · Senior Government Manager Directorate
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Landmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Statutory Schemes & Civic Services Directorate
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Unified governance, service standards, and gazette compliance authority governing{' '}
              <strong className="text-foreground">28 States</strong> and <strong className="text-foreground">8 Union Territories</strong>.
              All gazetted statutory services here are synchronized and accessible in the sovereign Citizen Portal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsGazetteModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Gazette New Scheme
            </Button>
          </div>
        </div>

        {/* National Metric Dashboard Strip */}
        <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card/60 backdrop-blur-xs border border-border/60 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium block flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-500" />
              National Service Grid
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">13,971</span>
              <span className="text-xs text-emerald-600 font-semibold">+ 12,350 State</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Central & State Portals</span>
          </div>

          <div className="bg-card/60 backdrop-blur-xs border border-border/60 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Territorial Jurisdiction
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">36 Jurisdictions</span>
            </div>
            <span className="text-[11px] text-muted-foreground">28 States + 8 UTs Covered</span>
          </div>

          <div className="bg-card/60 backdrop-blur-xs border border-border/60 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium block flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              Union Ministries
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">53 Ministries</span>
            </div>
            <span className="text-[11px] text-muted-foreground">18 Core Citizen Sectors</span>
          </div>

          <div className="bg-card/60 backdrop-blur-xs border border-border/60 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium block flex items-center gap-1.5">
              <Scroll className="w-3.5 h-3.5 text-purple-500" />
              Statutory Gazette In Force
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">{services.length} Active</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">100% Live in Citizen Portal</span>
          </div>
        </div>
      </div>

      {/* Multi-tier Filter and Search System */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3.5 shadow-xs">
        {/* Row 1: Search & State Selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search schemes by name, ministry, act, service code (e.g. IN-UIDAI-101)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-lg px-2.5 py-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                {ALL_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st} className="bg-card text-foreground">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value as any)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Jurisdictions</option>
              <option value="Central">Central Govt (All-India)</option>
              <option value="State">State Government</option>
              <option value="Municipal">Municipal / ULB</option>
            </select>
          </div>
        </div>

        {/* Row 2: Ministry and Category Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
          <div className="flex-1">
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MINISTRIES.map((min) => (
                <option key={min} value={min} className="bg-card text-foreground">
                  {min}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All 18 Functional Sectors</option>
              <option value="identity">Identity & Civil Documents</option>
              <option value="tax">Finance, Revenue & Taxes</option>
              <option value="transport">Transport, RTO & Transit</option>
              <option value="health">Healthcare & Wellness</option>
              <option value="welfare">Social Welfare & Subsidies</option>
              <option value="housing">Housing & Utilities</option>
              <option value="legal">Justice, Law & Grievances</option>
              <option value="business">Commerce & MSME</option>
            </select>

            {(searchTerm || selectedState !== 'All India (Pan-National)' || selectedMinistry !== 'All Ministries' || categoryFilter !== 'all' || jurisdictionFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedState('All India (Pan-National)')
                  setSelectedMinistry('All Ministries')
                  setCategoryFilter('all')
                  setJurisdictionFilter('all')
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-9"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-foreground">
              Gazetted Statutory Catalog
            </span>
            <Badge variant="secondary" className="text-xs font-semibold">
              {filteredServices.length} schemes displayed
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Directly provisioned across Central Ministries & State Secretariats
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[120px]">Service Code</TableHead>
                <TableHead className="min-w-[260px]">Scheme Name & Statutory Mandate</TableHead>
                <TableHead className="min-w-[200px]">Ministry & Department</TableHead>
                <TableHead>Jurisdiction / State</TableHead>
                <TableHead>Statutory SLA</TableHead>
                <TableHead>Official Fee</TableHead>
                <TableHead>Portal</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Landmark className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="font-semibold text-sm">No statutory schemes match current filters.</p>
                    <p className="text-xs mt-1">Try broadening your search term or clearing ministry and state filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((srv) => (
                  <TableRow key={srv.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                        {srv.serviceCode || 'IN-GOV-100'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-semibold text-foreground text-sm block">
                          {srv.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {srv.description}
                        </span>
                        {srv.statutoryAct && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 font-medium">
                            <Scroll className="w-3 h-3 text-amber-500" />
                            {srv.statutoryAct}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-foreground block">
                          {srv.department}
                        </span>
                        {srv.ministry && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {srv.ministry}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant={srv.jurisdictionLevel === 'Central' ? 'primary' : 'secondary'}
                          className="text-[11px] font-medium capitalize"
                        >
                          {srv.jurisdictionLevel || 'Central'}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground block flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                          {srv.stateOrUt || 'All India'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {srv.processingTimeDays ? `${srv.processingTimeDays} Days` : srv.processingTime}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-foreground">
                        {(srv.fees ?? srv.governmentFee) === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                        ) : (
                          `₹${(srv.fees ?? srv.governmentFee)?.toLocaleString('en-IN')}`
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {srv.portalUrl ? (
                        <a
                          href={srv.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
                        >
                          Official Portal
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">india.gov.in</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewService(srv)}
                        className="h-7 px-2.5 text-xs font-medium text-foreground hover:border-emerald-500"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Service Details Dialog */}
      <Dialog open={!!viewService} onOpenChange={(open) => !open && setViewService(null)}>
        {viewService && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-600">
                  {viewService.serviceCode || 'IN-GOV'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {viewService.jurisdictionLevel || 'Central'} Govt
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {viewService.stateOrUt || 'All India'}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {viewService.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {viewService.ministry} · {viewService.department}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Scheme Description
                </h4>
                <p className="text-foreground leading-relaxed">
                  {viewService.description}
                </p>
              </div>

              {viewService.statutoryAct && (
                <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-start gap-2.5">
                  <Scroll className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Statutory Act & Gazette Mandate</span>
                    <span className="text-xs text-muted-foreground">{viewService.statutoryAct}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-card border border-border rounded-lg">
                  <span className="text-xs text-muted-foreground block">Statutory SLA</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {viewService.processingTimeDays ? `${viewService.processingTimeDays} Days` : viewService.processingTime}
                  </span>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg">
                  <span className="text-xs text-muted-foreground block">Official Fee</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block">
                    {(viewService.fees ?? viewService.governmentFee) === 0 ? 'Free of Charge' : `₹${viewService.fees ?? viewService.governmentFee}`}
                  </span>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-xs text-muted-foreground block">Sovereign Portal</span>
                  <a
                    href={viewService.portalUrl || 'https://india.gov.in'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    Open Gateway <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {viewService.eligibility && viewService.eligibility.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Eligibility Benchmarks
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {viewService.eligibility.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {viewService.requiredDocuments && viewService.requiredDocuments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Statutory Document Checklist
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewService.requiredDocuments.map((doc, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-muted/30">
                        <FileText className="w-3 h-3 mr-1 text-muted-foreground" />
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewService(null)}>
                Close Dossier
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Gazette New Scheme Modal */}
      <Dialog open={isGazetteModalOpen} onOpenChange={setIsGazetteModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <DialogTitle className="text-xl font-bold text-foreground">
                Gazette New Statutory Scheme
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              As Senior Government Manager, enact and publish a new civic service across all 28 States, 8 UTs, or Central line ministries. This scheme will immediately become live in the Citizen Portal.
            </DialogDescription>
          </DialogHeader>

          {gazetteSuccessMsg ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-foreground">Gazette Promulgation Successful</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">{gazetteSuccessMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleGazetteScheme} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Scheme / Service Name *</label>
                  <Input
                    required
                    placeholder="e.g., Mukhyamantri Solar Pump Yojana"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Gazette Service Code</label>
                  <Input
                    placeholder="e.g., IN-MNRE-1202"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Union Ministry</label>
                  <select
                    value={newMinistry}
                    onChange={(e) => setNewMinistry(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {MINISTRIES.filter(m => m !== 'All Ministries').map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Department / Nodal Agency *</label>
                  <Input
                    required
                    placeholder="e.g., Renewable Energy Development Agency"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Jurisdiction Level</label>
                  <select
                    value={newJurisdiction}
                    onChange={(e) => setNewJurisdiction(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Central">Central Government</option>
                    <option value="State">State Government</option>
                    <option value="Municipal">Municipal / ULB</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Territory / State</label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {ALL_STATES_AND_UTS.map((st) => (
                      <option key={st} value={st === 'All India (Pan-National)' ? 'All India' : st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Functional Sector</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="identity">Identity & Civil</option>
                    <option value="tax">Finance & Tax</option>
                    <option value="transport">Transport & RTO</option>
                    <option value="health">Health & Wellness</option>
                    <option value="welfare">Welfare & Subsidies</option>
                    <option value="housing">Housing & Utilities</option>
                    <option value="legal">Legal & Grievances</option>
                    <option value="business">Commerce & MSME</option>
                    <option value="other">Other Civic Sector</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Statutory SLA (Days)</label>
                  <Input
                    type="number"
                    min="1"
                    value={newSla}
                    onChange={(e) => setNewSla(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Official Fee (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Official Portal URL</label>
                  <Input
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Statutory Act / Legal Authority</label>
                <Input
                  placeholder="e.g., National Solar Mission Act & State Energy Policy 2024"
                  value={newAct}
                  onChange={(e) => setNewAct(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Eligibility Criteria (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="Agricultural landholder&#10;Active electricity meter connection"
                  value={newEligibility}
                  onChange={(e) => setNewEligibility(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Required Documents (comma-separated)</label>
                <Input
                  placeholder="Aadhaar Card, Land Record 7/12, Electricity Bill, Bank Passbook"
                  value={newDocs}
                  onChange={(e) => setNewDocs(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Scheme Summary & Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed public scope and benefits of this scheme..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGazetteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Enact & Gazette Scheme
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
