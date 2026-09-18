import { useState } from 'react'
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
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is SAMAGRA and how does it protect my digital sovereignty?',
      a: 'SAMAGRA is your unified sovereign digital operating system. It provides tamper-proof identity credentials, zero-knowledge cryptographic proofs, and an encrypted document vault where only you hold the keys. No government department or private entity can access your records without your explicit, revocable consent.',
    },
    {
      q: 'How does delegated authority for family members work?',
      a: 'SAMAGRA strictly separates family relationships from legal authorization. You can add minor dependents under guardian management, or invite adult family members (spouse, parents) who grant you granular permissions such as viewing documents, applying for services, or managing healthcare records on their behalf.',
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Civic Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={ROUTES.ROOT} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white shadow-md">
              <Shield className="h-5 w-5 fill-white/20" />
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-foreground">
                SAMAGRA
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest border-l border-border pl-2">
                Digital Civic OS
              </span>
            </div>
          </Link>

          {/* Independent Multi-Portal Quick Links */}
          <div className="hidden md:flex items-center gap-1 border border-border/60 bg-muted/40 rounded-xl p-1">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-background transition-colors"
            >
              Citizen
            </Link>
            <Link
              to={ROUTES.ORGANIZATION.LOGIN}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-background transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              Organization
            </Link>
            <Link
              to={ROUTES.GOVERNMENT.LOGIN}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-background transition-colors flex items-center gap-1.5"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-500" />
              Government
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link to={ROUTES.AUTH.REGISTER}>
              <Button size="sm" className="text-xs font-bold rounded-xl shadow-sm">
                Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden civic-grid-pattern border-b border-border">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary/15 via-sky-500/10 to-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>National Sovereign Identity Architecture • Version 2.4</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.15] text-balance">
            Your Digital Identity.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              Completely Sovereign.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Manage your credentials, encrypted document vault, family delegations, and statutory civic services from a single zero-knowledge operating system.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.AUTH.LOGIN} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm font-bold rounded-xl shadow-lg shadow-primary/20">
                Access Citizen Workspace <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={ROUTES.AUTH.REGISTER} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-bold rounded-xl">
                Register Sovereign Identity
              </Button>
            </Link>
          </div>

          {/* Trust Chips */}
          <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> End-to-End Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero-Knowledge Disclosures
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> WCAG 2.2 AA & ISO 27001
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 5 Regional Languages
            </span>
          </div>
        </div>
      </section>

      {/* Live Civic Metrics Strip */}
      <section className="bg-muted/40 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground">1.4M+</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Verified Citizen Identities</p>
            </div>
            <div className="p-3">
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground">12.8M+</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Cryptographic Proofs Shared</p>
            </div>
            <div className="p-3">
              <p className="font-display text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">99.98%</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Service SLA Availability</p>
            </div>
            <div className="p-3">
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground">100%</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Sovereign Citizen Ownership</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Sovereign Portals Gateway */}
      <section className="py-20 bg-muted/20 border-b border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-4 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Independent Multi-Portal Architecture</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-foreground tracking-tight text-balance">
              Three Sovereign Portals.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                Complete Separation of Powers.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed text-balance">
              Every participant operates within an independent, cryptographically isolated workspace. Select your portal gateway to begin:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Portal 1: Citizen */}
            <div className="rounded-3xl border-2 border-blue-500/30 bg-card p-7 shadow-lg shadow-blue-500/5 hover:border-blue-500/60 transition-all flex flex-col justify-between group relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Personal Vault
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground">Citizen Portal</h3>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">/login ➔ /app/*</p>

                <p className="text-xs text-muted-foreground mt-3 leading-relaxed flex-1">
                  For individual citizens and families to manage biometric smart cards, tamper-proof document vaults, government welfare schemes, and fine-grained data consent.
                </p>
              </div>

              <div className="mt-8 pt-4">
                <Link to={ROUTES.AUTH.LOGIN} className="block">
                  <Button size="lg" className="w-full text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
                    Enter Citizen Portal <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Portal 2: Organization */}
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-card p-7 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/60 transition-all flex flex-col justify-between group relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Commercial B2B
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground">Organization Gateway</h3>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">/organization/login ➔ /organization/*</p>

                <p className="text-xs text-muted-foreground mt-3 leading-relaxed flex-1">
                  For banks, insurers, healthcare networks & enterprises. Request citizen data under DPDP Act 2023 consent, run Zero-Knowledge Proofs, and verify authentic records.
                </p>
              </div>

              <div className="mt-8 pt-4">
                <Link to={ROUTES.ORGANIZATION.LOGIN} className="block">
                  <Button size="lg" className="w-full text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                    Enter Organization Gateway <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Portal 3: Government */}
            <div className="rounded-3xl border-2 border-indigo-500/30 bg-card p-7 shadow-lg shadow-indigo-500/5 hover:border-indigo-500/60 transition-all flex flex-col justify-between group relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Public Secretariat
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground">Government Secretariat</h3>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">/government/login ➔ /government/*</p>

                <p className="text-xs text-muted-foreground mt-3 leading-relaxed flex-1">
                  For authorized civil servants across 11 autonomous ministries & departments. Review verification queues, enforce departmental SLAs, and oversee statutory citizen dossiers.
                </p>
              </div>

              <div className="mt-8 pt-4">
                <Link to={ROUTES.GOVERNMENT.LOGIN} className="block">
                  <Button size="lg" className="w-full text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                    Enter Government Desk <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground text-balance">
            Engineered for Everyday Civic Life
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 text-balance">
            Every layer of SAMAGRA is built to eliminate bureaucratic friction and give citizens complete authority over their public and private data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Digital Credential Wallet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
              Store verifiable digital credentials with cryptographic zero-knowledge proofs. Share only what is necessary without exposing full document details.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Intelligent Document Vault</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
              Tamper-proof storage with automated document expiry tracking, intelligent OCR metadata extraction, and direct renewal assistance before licenses lapse.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Family & Delegated Authority</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
              Manage minor dependents and elder parents under explicit legal delegations. Apply for statutory welfare or school admissions on their behalf.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Citizen Action Center</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
              Never miss a statutory deadline. Urgent consent approvals, missing application documents, expiring credentials, and taxes aggregated into one actionable stream.
            </p>
          </div>

          {/* Card 5 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Direct Civic Services</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
              Apply for government schemes, municipal licenses, and transport services with automated data prefill and transparent step-by-step progress tracking.
            </p>
          </div>

          {/* Card 6 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Sovereign Privacy Control</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
              Audit every organization accessing your records. Revoke access instantly, generate cryptographic consent receipts, and trigger Emergency Lockdown when needed.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl font-black text-foreground text-balance">
              Three Steps to Complete Civic Sovereignty
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-balance">
              Simple, secure, and fully verified by national identity infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <div className="p-6 rounded-2xl bg-card border border-border text-center relative h-full flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto mb-4 text-sm shrink-0">
                1
              </div>
              <h3 className="font-bold text-base text-foreground">Authenticate & Verify</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed flex-1">
                Log in via your registered mobile number or national ID to initialize your tamper-proof biometric sovereign tier.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border text-center relative h-full flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto mb-4 text-sm shrink-0">
                2
              </div>
              <h3 className="font-bold text-base text-foreground">Curate Credentials & Family</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed flex-1">
                Sync your verified licenses, property extracts, and degree credentials. Set up delegated authority for children or elderly parents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border text-center relative h-full flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto mb-4 text-sm shrink-0">
                3
              </div>
              <h3 className="font-bold text-base text-foreground">Access Services Privately</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed flex-1">
                Dispatch applications with pre-verified zero-knowledge proofs. Approve or revoke organizational data requests with a single tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-black text-foreground text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 text-balance">
            Key information on security, privacy, and citizen rights.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:bg-muted/40 transition-colors"
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
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-balance">
            Ready to Take Command of Your Civic Life?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed text-balance">
            Join over 1.4 million citizens using SAMAGRA for streamlined, secure, and sovereign civic engagement.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.AUTH.LOGIN}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 text-sm font-bold rounded-xl shadow-lg">
                Enter Citizen Portal
              </Button>
            </Link>
            <Link to={ROUTES.AUTH.REGISTER}>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-sm font-bold rounded-xl">
                Register New Identity
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Citizen Sovereign Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">SAMAGRA</span>
            <span>• Sovereign Digital Civic Operating System</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to={ROUTES.AUTH.LOGIN} className="hover:text-foreground transition-colors font-medium">
              Citizen Portal
            </Link>
            <Link to={ROUTES.ORGANIZATION.LOGIN} className="hover:text-foreground transition-colors font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Organization Gateway
            </Link>
            <Link to={ROUTES.GOVERNMENT.LOGIN} className="hover:text-foreground transition-colors font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Landmark className="w-3 h-3" /> Government Desk
            </Link>
            <Link to={ROUTES.ADMIN.LOGIN} className="hover:text-foreground transition-colors font-medium">
              Admin
            </Link>
            <span className="hidden sm:inline text-border">|</span>
            <span className="font-mono text-[11px]">Zero-Knowledge Sovereign Enclave</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

