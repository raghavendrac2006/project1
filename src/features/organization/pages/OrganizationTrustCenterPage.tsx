import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Award,
  Globe,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { civicStorage } from '@/services/storage'
import type { OrgTrustProfile, TrustCertification, DataPracticeDeclaration } from '@/types'

// ── Mock trust data (static for now, service-ready interface) ────────────────
function buildTrustProfile(): OrgTrustProfile {
  return {
    overallScore: 91,
    verificationStatus: 'verified',
    registrationNumber: 'IRDAI/HLT/APEX/2019/0041',
    regulatoryBody: 'Insurance Regulatory & Development Authority of India (IRDAI)',
    partnerSince: '2022-06-15',
    totalServicesDeployed: 6,
    totalCitizenInteractions: 2847,
    consentHonorRate: 98.3,
    certifications: [
      {
        id: 'cert_001',
        name: 'ISO 27001:2022 — Information Security',
        issuingBody: 'Bureau Veritas Certification',
        validUntil: '2025-11-30',
        status: 'active',
        badgeColor: 'emerald',
      },
      {
        id: 'cert_002',
        name: 'DPDP Act 2023 — Data Processor Registration',
        issuingBody: 'MeitY Data Protection Board',
        validUntil: '2026-03-31',
        status: 'active',
        badgeColor: 'blue',
      },
      {
        id: 'cert_003',
        name: 'IRDAI Privacy Compliance Certificate',
        issuingBody: 'IRDAI Consumer Affairs Dept.',
        validUntil: '2025-01-31',
        status: 'expiring',
        badgeColor: 'amber',
      },
      {
        id: 'cert_004',
        name: 'NASSCOM Data Ethics Pledge',
        issuingBody: 'NASSCOM Foundation',
        validUntil: '2025-09-30',
        status: 'active',
        badgeColor: 'purple',
      },
    ],
    dataPractices: [
      {
        category: 'Minimal Data Collection',
        description: 'Only attributes required for the declared service purpose are requested from citizens.',
        isCompliant: true,
        lastAuditDate: '2024-09-01',
      },
      {
        category: 'Purpose Limitation',
        description: 'Citizen data is never used for secondary purposes without explicit re-consent.',
        isCompliant: true,
        lastAuditDate: '2024-09-01',
      },
      {
        category: 'Automated Expiration',
        description: 'All data grants expire automatically at the declared duration. No indefinite retention.',
        isCompliant: true,
        lastAuditDate: '2024-08-15',
      },
      {
        category: 'Citizen Revocation Honoring',
        description: 'All citizen-initiated revocations are honored within 15 minutes.',
        isCompliant: true,
        lastAuditDate: '2024-09-01',
      },
      {
        category: 'Third-Party Sharing',
        description: 'Citizen data is NOT sold or shared with third-party data brokers.',
        isCompliant: true,
        lastAuditDate: '2024-07-20',
      },
      {
        category: 'Biometric Data Collection',
        description:
          'This organization does not collect or request biometric attributes. Biometric data is out of scope.',
        isCompliant: true,
        lastAuditDate: '2024-09-01',
      },
    ],
  }
}

const CERT_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400',
  amber: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400',
  purple: 'bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-400',
}

export function OrganizationTrustCenterPage() {
  const [profile, setProfile] = useState<OrgTrustProfile | null>(null)
  const session = civicStorage.getOrgSession()

  useEffect(() => {
    setTimeout(() => setProfile(buildTrustProfile()), 150)
  }, [])

  if (!profile) {
    return (
      <div className="p-8 text-xs text-muted-foreground animate-pulse">
        Loading trust profile…
      </div>
    )
  }

  const scoreColor =
    profile.overallScore >= 85
      ? 'text-emerald-600'
      : profile.overallScore >= 65
      ? 'text-amber-600'
      : 'text-rose-600'

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Trust Center
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Transparency record for{' '}
          <strong className="text-foreground">{session?.organization.name}</strong> — verifications,
          certifications, and citizen data practice declarations.
        </p>
      </div>

      {/* Trust Score Banner */}
      <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-card to-card flex flex-col md:flex-row md:items-center gap-6">
        {/* Score Gauge */}
        <div className="flex flex-col items-center shrink-0 gap-1">
          <div
            className="relative flex items-center justify-center h-28 w-28 rounded-full border-4 border-emerald-500/40 bg-card shadow-inner"
            role="meter"
            aria-valuenow={profile.overallScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Trust score"
          >
            <div className="text-center">
              <span className={`text-3xl font-black font-mono ${scoreColor}`}>
                {profile.overallScore}
              </span>
              <span className="text-[10px] text-muted-foreground block">/ 100</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600">Civic Trust Score</span>
        </div>

        {/* Meta */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-bold dark:text-emerald-400">
              ✓ CIVIQONE VERIFIED PARTNER
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400">
              {profile.regulatoryBody.split('(')[0].trim()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Registration No.', value: profile.registrationNumber, icon: FileText },
              { label: 'Partner Since', value: new Date(profile.partnerSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: Clock },
              { label: 'Citizen Interactions', value: profile.totalCitizenInteractions.toLocaleString(), icon: Users },
              { label: 'Consent Honor Rate', value: `${profile.consentHonorRate}%`, icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                  <span className="text-sm font-bold text-foreground flex items-center gap-1 mt-0.5">
                    <Icon className="w-3 h-3 text-emerald-500 shrink-0" />
                    {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-base font-bold text-foreground">
              Regulatory Certifications &amp; Compliance Badges
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Active certifications that validate this organization's data handling standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid sm:grid-cols-2 gap-3">
            {profile.certifications.map((cert: TrustCertification) => (
              <div
                key={cert.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <div className={`mt-0.5 p-1.5 rounded-lg border ${CERT_COLORS[cert.badgeColor]}`}>
                  <Star className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground leading-snug">{cert.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{cert.issuingBody}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        cert.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : cert.status === 'expiring'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      }`}
                    >
                      {cert.status === 'active' ? '● ACTIVE' : cert.status === 'expiring' ? '⚠ EXPIRING' : '✗ EXPIRED'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Valid until {new Date(cert.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Practice Declarations */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <CardTitle className="text-base font-bold text-foreground">
              Citizen Data Practice Declarations
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Binding declarations of how this organization handles citizen data — audited quarterly.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {profile.dataPractices.map((dp: DataPracticeDeclaration) => (
            <div
              key={dp.category}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-border"
            >
              {dp.isCompliant ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">{dp.category}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  {dp.description}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                  Last audited: {new Date(dp.lastAuditDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-[9px] shrink-0 font-bold ${
                  dp.isCompliant
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                }`}
              >
                {dp.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer notice */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2">
        <Building2 className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
        <p>
          This Trust Center is auto-generated from CIVIQONE's verified partner registry. The scores and
          declarations shown here are for transparency purposes and do not constitute legal certification.
          Citizens can review this page before granting data access to this organization.
        </p>
      </div>
    </div>
  )
}
