import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass,
  Milestone,
  Shield,
  FileText,
  Briefcase,
  KeyRound,
  Lock,
  CreditCard,
  Users,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { citizenJourneyService } from '@/services/citizen-journey.service'
import { ROUTES } from '@/constants/routes'
import type { CivicMilestone } from '@/types'

export function CivicJourneyPage() {
  const [milestones, setMilestones] = useState<CivicMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    citizenJourneyService.getTimeline().then((data) => {
      setMilestones(data)
      setLoading(false)
    })
  }, [])

  const types = [
    { id: 'all', label: 'All Milestones' },
    { id: 'identity', label: 'Identity & Sovereign ID', icon: Shield },
    { id: 'document', label: 'Vault Documents', icon: FileText },
    { id: 'service', label: 'Departmental Services', icon: Briefcase },
    { id: 'consent', label: 'Data Consents', icon: Lock },
    { id: 'security', label: 'Security & 2FA', icon: KeyRound },
    { id: 'payment', label: 'Civic Payments', icon: CreditCard },
  ]

  const filteredMilestones = useMemo(() => {
    let list = [...milestones]
    if (selectedType !== 'all') {
      list = list.filter((m) => m.type === selectedType)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q)
      )
    }
    return list
  }, [milestones, selectedType, searchQuery])

  const highlightCount = milestones.filter((m) => m.isHighlight).length

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card via-card to-sky-500/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Complete Civic Lifecourse
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Immutable Ledger
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Citizen Civic Journey & Lifecourse
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            A chronological, cryptographically verified timeline of your sovereign interactions with state departments, credential issuances, and civic events.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTES.APP.DASHBOARD)}
          className="text-xs font-bold rounded-xl shrink-0"
        >
          Return to Dashboard
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Milestones</span>
          <p className="text-2xl font-black text-foreground font-display mt-1">{milestones.length}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Recorded on ledger</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary Highlights</span>
          <p className="text-2xl font-black text-primary font-display mt-1">{highlightCount}</p>
          <span className="text-[11px] text-primary/80 mt-0.5 block">Key statutory achievements</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identity Level</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1">Tier 3</p>
          <span className="text-[11px] text-emerald-500 font-semibold mt-0.5 block">Biometric Sovereign</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Tenancy</span>
          <p className="text-lg font-black text-foreground font-display mt-1.5">3.5 Years Active</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Verified citizen record</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t.label}
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
            placeholder="Search milestones..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Interactive Vertical Timeline */}
      <div className="relative border-l-2 border-primary/25 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8 py-2">
        {loading ? (
          <div className="p-12 text-sm text-muted-foreground animate-pulse">
            Constructing timeline from decentralized audit ledgers...
          </div>
        ) : filteredMilestones.length === 0 ? (
          <div className="p-8 text-xs text-muted-foreground">
            No milestones found matching your search.
          </div>
        ) : (
          filteredMilestones.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline dot node */}
              <div
                className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm shadow-sm transition-transform group-hover:scale-110 ${
                  item.isHighlight
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-card border-2 border-border text-foreground'
                }`}
              >
                <span>{item.icon}</span>
              </div>

              {/* Milestone Card */}
              <Card
                className={`border-border transition-all hover:border-primary/50 hover:shadow-md ${
                  item.isHighlight ? 'bg-primary/[0.02] border-primary/30 ring-1 ring-primary/15' : ''
                }`}
              >
                <CardContent className="p-5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.isHighlight && (
                        <Badge variant="verified" size="sm">
                          Milestone
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {new Date(item.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40">
                    <span className="uppercase font-mono font-bold tracking-wider text-primary">
                      Category: {item.type}
                    </span>
                    <span className="font-mono">Verified Cryptographic Timestamp</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
