import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  HeartPulse,
  GraduationCap,
  Home,
  ShieldAlert,
  Coins,
  FileCheck,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { citizenIntelligenceService } from '@/services/citizen-intelligence.service'
import { useToast } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import type { BenefitScheme } from '@/types'

export function BenefitsEligibilityPage() {
  const [schemes, setSchemes] = useState<BenefitScheme[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    citizenIntelligenceService.getBenefits().then((data) => {
      setSchemes(data)
      setLoading(false)
    })
  }, [])

  const categories = [
    { id: 'all', label: 'All Schemes' },
    { id: 'health', label: 'Health & Medical', icon: HeartPulse },
    { id: 'education', label: 'Education & Scholarships', icon: GraduationCap },
    { id: 'housing', label: 'Housing & Urban', icon: Home },
    { id: 'pension', label: 'Pensions & Social Security', icon: Coins },
    { id: 'finance', label: 'Micro-Finance & Loans', icon: FileCheck },
  ]

  const filteredSchemes = useMemo(() => {
    let list = [...schemes]
    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.eligibilityReason.toLowerCase().includes(q)
      )
    }
    return list
  }, [schemes, selectedCategory, searchQuery])

  const handleApply = async (scheme: BenefitScheme) => {
    setApplyingId(scheme.id)
    await new Promise((r) => setTimeout(r, 1000))
    setApplyingId(null)
    setSchemes((prev) =>
      prev.map((s) => (s.id === scheme.id ? { ...s, isApplied: true } : s))
    )
    toast.success(
      'Application Dossier Generated',
      `Your application for ${scheme.name} has been filed using verified Citizen Vault credentials.`
    )
  }

  const appliedCount = schemes.filter((s) => s.isApplied).length

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card via-card to-primary/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Sovereign AI Welfare Matcher
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Direct Benefit Transfer (DBT) Ready
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Government Schemes & Entitlements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Automatic eligibility matching based on your verified sovereign profile, household income tier, and family demographics. Zero manual forms required.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/services')}
          className="text-xs font-bold rounded-xl shrink-0"
        >
          View All Civic Services
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Eligible Schemes</span>
          <p className="text-2xl font-black text-foreground font-display mt-1">{schemes.length}</p>
          <span className="text-[11px] text-emerald-500 font-semibold mt-0.5 block">100% matched by AI</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Potential Annual Value</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1">₹5.62 Lakh+</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Medical + education + housing</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Enrolled / Applied</span>
          <p className="text-2xl font-black text-primary font-display mt-1">{appliedCount}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Active benefit pipelines</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nearest Deadline</span>
          <p className="text-lg font-black text-foreground font-display mt-1.5">30 Nov 2026</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 block">Merit Scholarship</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes or ministries..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Scheme Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">
          Evaluating citizen profile attributes against national entitlement database...
        </div>
      ) : filteredSchemes.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-sm font-bold text-foreground">No Schemes Match Filter</h3>
          <p className="text-xs text-muted-foreground mt-1">Try resetting the category filter or searching for another term.</p>
          <Button variant="outline" size="sm" onClick={() => { setSelectedCategory('all'); setSearchQuery('') }} className="mt-3 text-xs">
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className={`border-border flex flex-col justify-between shadow-sm transition-all hover:border-primary/40 hover:shadow-md ${
                scheme.isApplied ? 'bg-primary/[0.02] border-primary/30' : ''
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                        {scheme.category}
                      </Badge>
                      <Badge variant="verified" size="sm">
                        Verified Match
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground pt-1">{scheme.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      {scheme.department}
                    </CardDescription>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-right shrink-0">
                    <span className="text-[9px] uppercase font-mono font-bold block">Benefit Value</span>
                    <span className="text-xs font-black">{scheme.benefitValue}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">{scheme.description}</p>

                {/* AI Rationale Box */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Why You Qualify:
                  </span>
                  <p className="text-foreground text-[11px] leading-relaxed">{scheme.eligibilityReason}</p>
                </div>

                {/* Footer Strip with Deadline & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {scheme.applicationDeadline ? (
                      <span>Deadline: <strong className="text-foreground">{scheme.applicationDeadline}</strong></span>
                    ) : (
                      <span>Rolling Enrolment (Always Open)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {scheme.isApplied ? (
                      <Badge variant="verified" size="sm" className="gap-1 py-1.5 px-3">
                        <Check className="w-3.5 h-3.5" /> Enrolled / Applied
                      </Badge>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={applyingId === scheme.id}
                        onClick={() => handleApply(scheme)}
                        className="text-xs font-semibold gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Apply with Digital ID
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
