import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  ChevronDown,
  Award,
  Layers,
  Building2,
  Landmark,
  Star,
  Cpu,
  Globe2,
  BarChart3,
  Fingerprint,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

/* ── Metrics with animated counting ── */
function MetricCard({ label, value, suffix = '', color = 'text-foreground', delay = 0 }: {
  label: string; value: number; suffix?: string; color?: string; delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const count = useCountUp(value, 1600, visible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="p-5 text-center group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={cn('font-display text-3xl sm:text-4xl font-black tabular-nums', color)}>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs font-semibold text-muted-foreground mt-1.5 uppercase tracking-wide">{label}</p>
    </div>
  )
}

/* ── Portal Card ── */
function PortalCard({
  icon: Icon,
  label,
  title,
  route,
  description,
  colorClass,
  glowClass,
  btnClass,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  title: string
  route: string
  description: string
  colorClass: string
  glowClass: string
  btnClass: string
  delay?: number
}) {
  return (
    <Link
      to={route}
      className={cn(
        'group relative flex flex-col rounded-3xl border bg-card p-7 overflow-hidden transition-all duration-300 hover-lift animate-fade-in-up',
        colorClass
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Corner glow */}
      <div className={cn('absolute -top-8 -right-8 w-36 h-36 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity', glowClass)} />

      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300', glowClass, 'bg-opacity-20')}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className={cn('text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border', colorClass.replace('border-', 'bg-').replace('/30', '/10'))}>
          {label}
        </span>
      </div>

      <h3 className="text-xl font-black text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-6">{description}</p>

      <div className={cn('flex items-center gap-2 text-sm font-bold', btnClass, 'group-hover:gap-3 transition-all duration-200')}>
        Enter Portal <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

/* ── Feature Pill ── */
function FeaturePill({ icon: Icon, title, description, color, delay = 0 }: {
  icon: React.ElementType; title: string; description: string; color: string; delay?: number
}) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 hover-lift transition-all animate-fade-in-up overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn('absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300', color.replace('text-', 'bg-'))} />
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform shrink-0', color.replace('text-', 'bg-').replace('600', '500/15'))}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const faqs = [
    {
      q: 'What is CiviqOne and how does it protect my digital sovereignty?',
      a: 'CiviqOne is your unified sovereign digital operating system. It provides tamper-proof identity credentials, zero-knowledge cryptographic proofs, and an encrypted document vault where only you hold the keys. No government department or private entity can access your records without your explicit, revocable consent.',
    },
    {
      q: 'How does delegated authority for family members work?',
      a: 'CiviqOne strictly separates family relationships from legal authorization. You can add minor dependents under guardian management, or invite adult family members (spouse, parents) who grant you granular permissions such as viewing documents, applying for services, or managing healthcare records on their behalf.',
    },
    {
      q: 'What are Verifiable Zero-Knowledge Proofs (ZKPs)?',
      a: 'A zero-knowledge proof allows you to prove a fact (e.g. that you are over 18, or that your address is within Karnataka) without revealing your actual date of birth or full home address to the verifier. Your raw identity data stays strictly private.',
    },
    {
      q: 'Can organizations access my data without my knowledge?',
      a: 'Never. Every data request triggers a notification in your Action Center. You see the exact fields requested, the stated purpose, and the grant duration. You can approve individual fields, deny others, or revoke previously granted access at any moment with cryptographic receipt generation.',
    },
  ]

  const trustBadges = [
    { icon: CheckCircle2, text: 'End-to-End Encrypted', color: 'text-emerald-500' },
    { icon: ShieldCheck, text: 'Zero-Knowledge Proofs', color: 'text-blue-500' },
    { icon: Globe2, text: 'ISO 27001 Certified', color: 'text-indigo-500' },
    { icon: Star, text: '5 Regional Languages', color: 'text-amber-500' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 overflow-x-hidden">

      {/* ─── Sticky Navigation ─── */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-panel-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          <Link to={ROUTES.ROOT} className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(232_84%_54%)] via-[hsl(220_80%_56%)] to-[hsl(196_80%_50%)] text-white shadow-[0_2px_12px_hsl(232_84%_54%/0.40)] group-hover:shadow-[0_4px_20px_hsl(232_84%_54%/0.55)] transition-shadow duration-300">
              <Shield className="h-5 w-5 fill-white/20" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-foreground">
                CiviqOne
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l border-border pl-2.5">
                Digital Civic OS
              </span>
            </div>
          </Link>

          {/* Portal quick links */}
          <div className="hidden md:flex items-center gap-0.5 border border-border/50 bg-muted/30 rounded-xl p-1">
            <Link to={ROUTES.AUTH.LOGIN} className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-card px-3.5 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" /> Citizen
            </Link>
            <Link to={ROUTES.ORGANIZATION.LOGIN} className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-card px-3.5 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Organization
            </Link>
            <Link to={ROUTES.GOVERNMENT.LOGIN} className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-card px-3.5 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-500" /> Government
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to={ROUTES.AUTH.LOGIN} className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to={ROUTES.AUTH.REGISTER}>
              <Button size="sm" className="text-xs rounded-xl">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-20 pb-24 overflow-hidden civic-grid-pattern border-b border-border/60">
        {/* Background Citizens Illustration (30% transparency) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 flex items-end justify-center">
          <img
            src="/citizens-hero.png"
            alt="Indian citizens background"
            className="w-full h-full object-cover object-bottom opacity-30 mix-blend-multiply dark:mix-blend-luminosity dark:opacity-20 pointer-events-none transition-opacity duration-700"
          />
          {/* Subtle gradient vignette to blend seamlessly into background & preserve text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-background/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/70 pointer-events-none" />
        </div>

        {/* Multi-layer ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[400px] bg-gradient-to-tr from-[hsl(232_84%_54%/0.18)] via-[hsl(196_80%_50%/0.12)] to-[hsl(160_80%_42%/0.08)] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-[hsl(262_83%_58%/0.08)] to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Sovereign badge */}
          <div className={cn(
            'inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold border mb-6 sm:mb-8 shadow-sm transition-all duration-700',
            'bg-gradient-to-r from-primary/10 via-sky-500/10 to-emerald-500/10 text-primary border-primary/20',
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-glow shrink-0" />
            <span className="truncate">National Sovereign Identity Architecture · Version 2.4</span>
          </div>

          {/* Hero headline */}
          <h1 className={cn(
            'font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.03em] leading-[1.1] sm:leading-[1.08] text-balance transition-all duration-700 delay-100',
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            Your Digital Identity.{' '}
            <span className="gradient-text-civic">
              Completely Sovereign.
            </span>
          </h1>

          <p
            className={cn(
              'mt-5 sm:mt-7 text-sm sm:text-lg md:text-xl font-bold tracking-tight text-foreground/90 max-w-2xl mx-auto leading-relaxed text-balance transition-all duration-700 delay-200',
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
            style={{ fontFamily: "'Arial Black', 'Arial-BoldMT', Gadget, sans-serif" }}
          >
            Manage your credentials, encrypted document vault, family delegations, and statutory civic services from a single zero-knowledge operating system.
          </p>

          {/* CTA Buttons */}
          <div className={cn(
            'mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300',
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <Link to={ROUTES.AUTH.LOGIN} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm font-bold rounded-2xl px-8">
                <Fingerprint className="w-4 h-4" />
                Access Citizen Workspace
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={ROUTES.AUTH.REGISTER} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-bold rounded-2xl px-8 border-border hover:border-primary/40">
                Register Sovereign Identity
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className={cn(
            'mt-14 pt-8 border-t border-border/50 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-semibold transition-all duration-700 delay-500',
            heroVisible ? 'opacity-100' : 'opacity-0'
          )}>
            {trustBadges.map(({ icon: Icon, text, color }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon className={cn('w-4 h-4', color)} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Civic Metrics Strip ─── */}
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
            <MetricCard label="Verified Citizen Identities" value={1400000} suffix="+" delay={0} />
            <MetricCard label="Cryptographic Proofs Shared" value={12800000} suffix="+" delay={100} />
            <MetricCard label="Service SLA Availability" value={9998} suffix="%" color="text-emerald-600 dark:text-emerald-400" delay={200} />
            <MetricCard label="Sovereign Citizen Ownership" value={100} suffix="%" delay={300} />
          </div>
        </div>
      </section>

      {/* ─── Three Portals ─── */}
      <section className="py-24 bg-muted/15 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/8 text-primary border border-primary/15 mb-5 shadow-sm">
              <Cpu className="w-3.5 h-3.5" />
              <span>Independent Multi-Portal Architecture</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground text-balance mb-4">
              Three Sovereign Portals.{' '}
              <span className="gradient-text-civic">Complete Power Separation.</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
              Every participant operates within an independent, cryptographically isolated workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <PortalCard
              icon={Shield}
              label="Personal Vault"
              title="Citizen Portal"
              route={ROUTES.AUTH.LOGIN}
              description="For individual citizens and families to manage biometric smart cards, tamper-proof document vaults, government welfare schemes, and fine-grained data consent."
              colorClass="border-blue-500/25 hover:border-blue-500/50"
              glowClass="bg-blue-600"
              btnClass="text-blue-600 dark:text-blue-400"
              delay={0}
            />
            <PortalCard
              icon={Building2}
              label="Commercial B2B"
              title="Organization Gateway"
              route={ROUTES.ORGANIZATION.LOGIN}
              description="For banks, insurers, healthcare networks & enterprises. Request citizen data under DPDP Act 2023 consent, run Zero-Knowledge Proofs, and verify authentic records."
              colorClass="border-emerald-500/25 hover:border-emerald-500/50"
              glowClass="bg-emerald-600"
              btnClass="text-emerald-600 dark:text-emerald-400"
              delay={100}
            />
            <PortalCard
              icon={Landmark}
              label="Public Secretariat"
              title="Government Secretariat"
              route={ROUTES.GOVERNMENT.LOGIN}
              description="For authorized civil servants across 11 autonomous ministries & departments. Review verification queues, enforce departmental SLAs, and oversee statutory citizen dossiers."
              colorClass="border-indigo-500/25 hover:border-indigo-500/50"
              glowClass="bg-indigo-600"
              btnClass="text-indigo-600 dark:text-indigo-400"
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* ─── Feature Showcase ─── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground text-balance mb-4">
            Engineered for{' '}
            <span className="gradient-text-primary">Everyday Civic Life</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
            Every layer of CiviqOne is built to eliminate bureaucratic friction and give citizens complete authority over their public and private data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          <FeaturePill icon={Award}    title="Digital Credential Wallet"   color="text-blue-600 dark:text-blue-400"    description="Store verifiable digital credentials with cryptographic zero-knowledge proofs. Share only what is necessary."   delay={0}   />
          <FeaturePill icon={FileText} title="Intelligent Document Vault"  color="text-emerald-600 dark:text-emerald-400" description="Tamper-proof storage with automated expiry tracking, intelligent OCR metadata extraction, and renewal assistance." delay={60}  />
          <FeaturePill icon={Users}    title="Family & Delegated Authority" color="text-purple-600 dark:text-purple-400" description="Manage minor dependents and elder parents under explicit legal delegations. Apply for welfare on their behalf."   delay={120} />
          <FeaturePill icon={Zap}      title="Citizen Action Center"       color="text-amber-600 dark:text-amber-400"   description="Never miss a statutory deadline. Urgent consent approvals and expiring credentials in one actionable stream."    delay={180} />
          <FeaturePill icon={Layers}   title="Direct Civic Services"       color="text-sky-600 dark:text-sky-400"       description="Apply for government schemes and municipal licenses with automated data prefill and transparent progress tracking." delay={240} />
          <FeaturePill icon={Lock}     title="Sovereign Privacy Control"   color="text-rose-600 dark:text-rose-400"     description="Audit every organization accessing your records. Revoke access instantly and trigger Emergency Lockdown."      delay={300} />
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 bg-muted/20 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl font-black text-foreground text-balance mb-3">
              Three Steps to Complete Civic Sovereignty
            </h2>
            <p className="text-sm text-muted-foreground text-balance">
              Simple, secure, and fully verified by national identity infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Authenticate & Verify', desc: 'Log in via your registered mobile number or national ID to initialize your tamper-proof biometric sovereign tier.', icon: Fingerprint, color: 'from-blue-600 to-sky-500' },
              { n: '02', title: 'Curate Credentials & Family', desc: 'Sync your verified licenses, property extracts, and degree credentials. Set up delegated authority for dependents.', icon: ShieldCheck, color: 'from-emerald-600 to-teal-500' },
              { n: '03', title: 'Access Services Privately', desc: 'Dispatch applications with pre-verified zero-knowledge proofs. Approve or revoke organizational data requests instantly.', icon: BarChart3, color: 'from-indigo-600 to-purple-500' },
            ].map((step, i) => (
              <div
                key={step.n}
                className={cn('relative p-7 rounded-2xl bg-card border border-border/60 text-center flex flex-col items-center hover-lift animate-fade-in-up shadow-[0_1px_4px_hsl(var(--foreground)/0.06)]')}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg bg-gradient-to-br text-white', step.color)}>
                  <step.icon className="w-7 h-7" />
                </div>
                <span className="absolute top-5 right-5 font-mono text-[10px] font-black text-muted-foreground/40 tracking-widest">{step.n}</span>
                <h3 className="font-bold text-base text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 animate-fade-in-up">
          <h2 className="font-display text-4xl font-black text-foreground text-balance mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground text-balance">
            Key information on security, privacy, and your civic rights.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className={cn(
                  'rounded-2xl border bg-card overflow-hidden transition-all duration-200',
                  isOpen ? 'border-primary/30 shadow-[0_0_0_1px_hsl(var(--primary)/0.08),0_4px_16px_hsl(var(--primary)/0.08)]' : 'border-border/60'
                )}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:bg-muted/30 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180 text-primary'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative py-20 overflow-hidden">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(232_84%_42%)] via-[hsl(220_80%_48%)] to-[hsl(196_80%_44%)] animate-gradient" />
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-white/10 blur-3xl rounded-full" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 text-white/90 border border-white/20 mb-6">
            <Star className="w-3.5 h-3.5 text-amber-300" />
            Trusted by 1.4M+ citizens across India
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-black text-white text-balance mb-4 tracking-tight">
            Ready to Take Command of Your Civic Life?
          </h2>
          <p className="text-white/75 text-sm sm:text-base max-w-xl mx-auto leading-relaxed text-balance mb-10">
            Join citizens using CiviqOne for streamlined, secure, and sovereign civic engagement. Your data. Your rights. Your control.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.AUTH.LOGIN}>
              <Button size="lg" className="bg-white text-[hsl(232_84%_40%)] hover:bg-white/92 text-sm font-bold rounded-2xl px-8 shadow-xl">
                <Fingerprint className="w-4 h-4" />
                Enter Citizen Portal
              </Button>
            </Link>
            <Link to={ROUTES.AUTH.REGISTER}>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/12 text-sm font-bold rounded-2xl px-8 bg-transparent">
                Register New Identity
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/60 bg-card py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[hsl(232_84%_54%)] to-[hsl(196_80%_50%)] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">CiviqOne</span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="hidden sm:inline">Sovereign Digital Civic Operating System</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to={ROUTES.AUTH.LOGIN} className="hover:text-foreground transition-colors font-medium flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-blue-500" /> Citizen
            </Link>
            <Link to={ROUTES.ORGANIZATION.LOGIN} className="hover:text-foreground transition-colors font-medium flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-emerald-500" /> Organization
            </Link>
            <Link to={ROUTES.GOVERNMENT.LOGIN} className="hover:text-foreground transition-colors font-medium flex items-center gap-1.5">
              <Landmark className="w-3 h-3 text-amber-500" /> Government
            </Link>
            <Link to={ROUTES.ADMIN.LOGIN} className="hover:text-foreground transition-colors font-medium">
              Admin
            </Link>
            <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground/60">Zero-Knowledge Sovereign Enclave</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
