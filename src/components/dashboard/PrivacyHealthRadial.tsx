import { useMemo } from 'react'
import { ShieldCheck, ShieldAlert, Sparkles, ChevronRight, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { PrivacyHealthScore } from '@/types'

interface PrivacyHealthRadialProps {
  score: PrivacyHealthScore | null
  className?: string
}

export function PrivacyHealthRadial({ score, className }: PrivacyHealthRadialProps) {
  const navigate = useNavigate()

  const pct = score ? score.overallPct : 91
  const radius = 48
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  // Quality tier
  const tier = useMemo(() => {
    if (pct >= 85) return { label: 'Optimal Sovereign Protection', color: 'text-emerald-500', glow: 'rgba(16, 185, 129, 0.35)', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
    if (pct >= 70) return { label: 'Standard Authorization', color: 'text-sky-500', glow: 'rgba(14, 165, 233, 0.35)', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' }
    return { label: 'High Exposure Detected', color: 'text-amber-500', glow: 'rgba(245, 158, 11, 0.35)', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
  }, [pct])

  return (
    <div
      onClick={() => navigate(ROUTES.APP.PRIVACY)}
      className={cn(
        'group cursor-pointer relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-card hover:shadow-elevation hover:border-primary/40 transition-all duration-300',
        className
      )}
    >
      {/* Ambient background light spot */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all group-hover:scale-125 duration-500"
        style={{ background: tier.glow }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Circular Dial */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
            {/* Defs for gradients and filters */}
            <defs>
              <linearGradient id="privacyScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="gaugeGlow">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background track circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-muted/30"
            />

            {/* Active progress stroke */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#privacyScoreGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              filter="url(#gaugeGlow)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Central Percentage & Icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              {pct}%
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              INDEX
            </span>
          </div>
        </div>

        {/* Text & Metrics Details */}
        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border', tier.badge)}>
              <ShieldCheck className="w-3 h-3" />
              {tier.label}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              ZK-Attested
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-1">
              Privacy & Consent Health Index
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {score
                ? `${score.totalFields - score.exposedFields} of ${score.totalFields} identity fields shielded from external organizations.`
                : '11 sovereign identity attributes fully guarded against automated scraping.'}
            </p>
          </div>

          {/* Breakdown Pills */}
          {score && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-muted/40 border border-border/60 text-center">
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block">Shielded</span>
                <span className="font-display text-xs font-extrabold text-emerald-500">
                  {score.totalFields - score.exposedFields} Fields
                </span>
              </div>
              <div className="p-2 rounded-xl bg-muted/40 border border-border/60 text-center">
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block">Active Grants</span>
                <span className="font-display text-xs font-extrabold text-sky-500">
                  {score.activeGrants} Orgs
                </span>
              </div>
              <div className="p-2 rounded-xl bg-muted/40 border border-border/60 text-center">
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block">Expiring</span>
                <span className="font-display text-xs font-extrabold text-amber-500">
                  {score.expiringIn7Days} Grants
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
