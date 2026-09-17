import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database,
  Lock,
  Building2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { citizenIntelligenceService } from '@/services/citizen-intelligence.service'
import { ROUTES } from '@/constants/routes'
import type { DataFootprintField } from '@/types'

export function DataDashboardPage() {
  const [fields, setFields] = useState<DataFootprintField[]>([])
  const [loading, setLoading] = useState(true)
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [sortBy, setSortBy] = useState<'orgs' | 'risk' | 'recent'>('orgs')
  const navigate = useNavigate()

  useEffect(() => {
    citizenIntelligenceService.getDataFootprint().then((data) => {
      setFields(data)
      setLoading(false)
    })
  }, [])

  const filteredFields = useMemo(() => {
    let list = [...fields]
    if (riskFilter !== 'all') {
      list = list.filter((f) => f.riskLevel === riskFilter)
    }

    list.sort((a, b) => {
      if (sortBy === 'orgs') return b.sharedWithOrgs - a.sharedWithOrgs
      if (sortBy === 'recent') return new Date(b.lastSharedAt).getTime() - new Date(a.lastSharedAt).getTime()
      if (sortBy === 'risk') {
        const riskOrder = { high: 3, medium: 2, low: 1 }
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
      }
      return 0
    })

    return list
  }, [fields, riskFilter, sortBy])

  // Aggregate stats
  const totalOrgs = useMemo(() => {
    return Math.max(...fields.map((f) => f.sharedWithOrgs), 0)
  }, [fields])

  const highRiskCount = useMemo(() => {
    return fields.filter((f) => f.riskLevel === 'high').length
  }, [fields])

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card via-card to-indigo-500/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Sovereign Data Footprint Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Audit Grade
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Citizen Data Footprint & External Exposure
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            A comprehensive inventory of every personal and civic attribute you have authorized to third parties, complete with sensitivity risk scores and active organization holders.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(ROUTES.APP.PRIVACY)}
          className="text-xs font-bold rounded-xl shrink-0 gap-1.5 shadow-sm"
        >
          <Lock className="w-3.5 h-3.5" />
          Manage Consents in Privacy Center
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Disclosed Attributes</span>
          <p className="text-2xl font-black text-foreground font-display mt-1">{fields.length}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Of 11 profile attributes</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">High Sensitivity Fields</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-display mt-1">{highRiskCount}</p>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Aadhaar, PAN & Income</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active External Orgs</span>
          <p className="text-2xl font-black text-primary font-display mt-1">{totalOrgs}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Holding authorized tokens</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revocation Latency</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1">&lt; 100ms</p>
          <span className="text-[11px] text-emerald-500 font-semibold mt-0.5 block">Instant cryptographic cutoff</span>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'high', 'medium', 'low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                riskFilter === lvl
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {lvl === 'all' ? 'All Risk Levels' : `${lvl} Sensitivity`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'orgs' | 'risk' | 'recent')}
            className="h-9 px-2.5 rounded-xl border border-input bg-card text-xs text-foreground font-medium outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="orgs">Most Shared (Org Count)</option>
            <option value="risk">Risk Sensitivity (High to Low)</option>
            <option value="recent">Recently Authorized</option>
          </select>
        </div>
      </div>

      {/* Data Footprint Inventory Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-border/70">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Attribute-Level Disclosures</CardTitle>
              <CardDescription className="text-xs">
                Real-time mapping of which external organizations have active authorization to each personal field
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {filteredFields.length} Attributes Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
              Compiling cross-portal cryptographic data lineage...
            </div>
          ) : filteredFields.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No data fields match the selected filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Field / Attribute</TableHead>
                  <TableHead>Sensitivity Risk</TableHead>
                  <TableHead>Authorized Organizations</TableHead>
                  <TableHead>Active Grants</TableHead>
                  <TableHead>Last Disclosed</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFields.map((item) => (
                  <TableRow key={item.field} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Database className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs">{item.label}</p>
                          <span className="font-mono text-[10px] text-muted-foreground">{item.field}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.riskLevel === 'high'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : item.riskLevel === 'medium'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {item.riskLevel} Risk
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground text-xs flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        {item.sharedWithOrgs} organization{item.sharedWithOrgs > 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold text-foreground">
                      {item.activeGrants} token{item.activeGrants > 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(item.lastSharedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTES.APP.PRIVACY)}
                        className="text-xs text-primary font-semibold hover:underline h-7 px-2"
                      >
                        Manage & Revoke
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
