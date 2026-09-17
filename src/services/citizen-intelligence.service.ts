/**
 * citizen-intelligence.service.ts
 * Provides computed intelligence data for the citizen portal:
 * privacy health scores, activity feed, behavioural anomalies,
 * benefits eligibility, and data footprint.
 */

import { civicStorage } from './storage'
import type {
  PrivacyHealthScore,
  ActivityFeedEvent,
  BehavioralAnomaly,
  BenefitScheme,
  DataFootprintField,
  ConsentField,
} from '@/types'

const FIELD_LABELS: Record<ConsentField, string> = {
  fullName: 'Full Legal Name',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  phone: 'Contact Phone',
  email: 'Email Address',
  address: 'Permanent Address',
  nationalId: 'National ID (Aadhaar)',
  panNumber: 'PAN Number',
  income: 'Annual Income',
  educationStatus: 'Education Status',
  drivingLicense: 'Driving License',
}

// ─── Privacy Health Score ───────────────────────────────────────────────────
function computePrivacyHealthScore(): PrivacyHealthScore {
  const grants = civicStorage.getAccessGrants()
  const activeGrants = grants.filter((g) => g.status === 'active' || g.status === 'expiring_soon')
  const expiringIn7Days = grants.filter((g) => g.status === 'expiring_soon').length

  const allFields: ConsentField[] = [
    'fullName', 'dateOfBirth', 'gender', 'phone', 'email',
    'address', 'nationalId', 'panNumber', 'income', 'educationStatus', 'drivingLicense',
  ]

  const exposedFieldSet = new Set<ConsentField>()
  activeGrants.forEach((g) => g.authorizedFields.forEach((f) => exposedFieldSet.add(f as ConsentField)))

  const exposedFields = exposedFieldSet.size
  const totalFields = allFields.length
  const overallPct = Math.round(((totalFields - exposedFields) / totalFields) * 100)

  const revoked = grants.filter((g) => g.status === 'revoked')
  const lastRevocationAt = revoked.length > 0
    ? revoked.sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())[0].grantedAt
    : null

  return {
    overallPct,
    activeGrants: activeGrants.length,
    totalFields,
    exposedFields,
    expiringIn7Days,
    lastRevocationAt,
    breakdown: [
      { label: 'Protected Fields', count: totalFields - exposedFields, color: 'bg-emerald-500' },
      { label: 'Exposed Fields', count: exposedFields, color: 'bg-amber-500' },
      { label: 'Active Grants', count: activeGrants.length, color: 'bg-blue-500' },
      { label: 'Expiring ≤7d', count: expiringIn7Days, color: 'bg-rose-500' },
    ],
  }
}

// ─── Activity Feed ──────────────────────────────────────────────────────────
function buildActivityFeed(): ActivityFeedEvent[] {
  const grants = civicStorage.getAccessGrants()
  const apps = civicStorage.getApplications()
  const payments = civicStorage.getPayments()

  const events: ActivityFeedEvent[] = []

  grants.slice(0, 3).forEach((g, i) => {
    if (g.status === 'revoked') {
      events.push({
        id: `act_rev_${i}`,
        type: 'consent_revoked',
        title: 'Consent Revoked',
        description: `You revoked data access from ${g.organizationName}.`,
        timestamp: g.grantedAt,
        relatedRoute: '/app/privacy',
      })
    } else {
      events.push({
        id: `act_grant_${i}`,
        type: 'consent_granted',
        title: 'Data Access Granted',
        description: `You authorized ${g.organizationName} to access ${g.authorizedFields.length} fields.`,
        timestamp: g.grantedAt,
        relatedRoute: '/app/privacy',
      })
    }
  })

  apps.slice(0, 2).forEach((a, i) => {
    events.push({
      id: `act_app_${i}`,
      type: 'app_updated',
      title: 'Application Updated',
      description: `${a.serviceName} — status changed to ${a.status.replace('_', ' ')}.`,
      timestamp: a.submittedAt,
      relatedId: a.id,
      relatedRoute: `/app/applications/${a.id}`,
    })
  })

  payments.filter((p) => p.status === 'paid').slice(0, 1).forEach((p, i) => {
    events.push({
      id: `act_pay_${i}`,
      type: 'payment',
      title: 'Payment Settled',
      description: `₹${p.amount.toLocaleString()} paid for ${p.description}.`,
      timestamp: p.paidAt || p.dueDate,
      relatedRoute: '/app/payments',
    })
  })

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6)
}

// ─── Behavioural Anomalies ──────────────────────────────────────────────────
function buildAnomalies(): BehavioralAnomaly[] {
  return [
    {
      id: 'anom_001',
      severity: 'warning',
      title: 'Login from New Location',
      description: 'A login was detected from Mumbai, Maharashtra — not your usual Bengaluru location.',
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isDismissed: false,
      category: 'unusual_login',
    },
    {
      id: 'anom_002',
      severity: 'info',
      title: 'Rapid Consent Requests',
      description: 'Apex Health & Life Insurers sent 2 data access requests within 10 minutes.',
      detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isDismissed: false,
      category: 'rapid_consent',
    },
    {
      id: 'anom_003',
      severity: 'info',
      title: 'New Device Recognized',
      description: 'iPad Pro was added as a trusted device from a new IP address.',
      detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isDismissed: true,
      category: 'device_change',
    },
  ]
}

// ─── Benefits Eligibility ───────────────────────────────────────────────────
function buildBenefits(): BenefitScheme[] {
  return [
    {
      id: 'ben_001',
      name: 'PM-JAY Ayushman Bharat Health Coverage',
      department: 'Ministry of Health & Family Welfare',
      category: 'health',
      description: 'Free hospitalization coverage up to ₹5 lakh per family per year at empanelled hospitals.',
      eligibilityReason: 'Your income profile and family size qualify under SECC-2011 criteria.',
      applicationDeadline: null,
      benefitValue: '₹5,00,000 / year',
      applyUrl: '/app/services',
      isApplied: false,
    },
    {
      id: 'ben_002',
      name: 'National Scholarship Portal — Merit Scholarship',
      department: 'Ministry of Education',
      category: 'education',
      description: 'Annual scholarship for students based on academic merit and family income.',
      eligibilityReason: 'Your education status and income level meet the scholarship eligibility threshold.',
      applicationDeadline: '2026-11-30',
      benefitValue: '₹12,000 / year',
      applyUrl: '/app/services',
      isApplied: false,
    },
    {
      id: 'ben_003',
      name: 'PMAY-U — Urban Housing Subsidy',
      department: 'Ministry of Housing & Urban Affairs',
      category: 'housing',
      description: 'Interest subsidy on home loans for economically weaker section and low-income groups.',
      eligibilityReason: 'No property registered under your national ID. You may qualify as a first-time homebuyer.',
      applicationDeadline: '2026-12-31',
      benefitValue: 'Up to ₹2.67 lakh interest subsidy',
      applyUrl: '/app/services',
      isApplied: false,
    },
    {
      id: 'ben_004',
      name: 'Atal Pension Yojana — Guaranteed Pension Plan',
      department: 'Ministry of Finance — PFRDA',
      category: 'pension',
      description: 'Guaranteed monthly pension of ₹1,000–5,000 on retirement for unorganised sector workers.',
      eligibilityReason: 'Your age and income profile match APY eligibility. No existing pension scheme detected.',
      applicationDeadline: null,
      benefitValue: '₹1,000–₹5,000 / month post-retirement',
      applyUrl: '/app/services',
      isApplied: false,
    },
    {
      id: 'ben_005',
      name: 'MUDRA Loan — Shishu Category',
      department: 'Ministry of Finance — MUDRA Bank',
      category: 'finance',
      description: 'Collateral-free micro-business loan for small entrepreneurs up to ₹50,000.',
      eligibilityReason: 'Verified income category and no active MUDRA loan on record.',
      applicationDeadline: null,
      benefitValue: 'Up to ₹50,000 loan (0% collateral)',
      applyUrl: '/app/services',
      isApplied: false,
    },
  ]
}

// ─── Data Footprint ──────────────────────────────────────────────────────────
function buildDataFootprint(): DataFootprintField[] {
  const grants = civicStorage.getAccessGrants()
  const activeGrants = grants.filter((g) => g.status === 'active' || g.status === 'expiring_soon')

  const fieldMap: Record<string, { orgs: Set<string>; lastAt: string; count: number }> = {}

  activeGrants.forEach((g) => {
    g.authorizedFields.forEach((f) => {
      if (!fieldMap[f]) fieldMap[f] = { orgs: new Set(), lastAt: g.grantedAt, count: 0 }
      fieldMap[f].orgs.add(g.organizationId)
      fieldMap[f].count += 1
      if (new Date(g.grantedAt) > new Date(fieldMap[f].lastAt)) {
        fieldMap[f].lastAt = g.grantedAt
      }
    })
  })

  const HIGH_RISK: ConsentField[] = ['nationalId', 'panNumber', 'income']
  const MED_RISK: ConsentField[] = ['dateOfBirth', 'address', 'phone']

  return Object.entries(fieldMap).map(([field, data]) => ({
    field: field as ConsentField,
    label: FIELD_LABELS[field as ConsentField] ?? field,
    sharedWithOrgs: data.orgs.size,
    activeGrants: data.count,
    lastSharedAt: data.lastAt,
    riskLevel: (HIGH_RISK.includes(field as ConsentField)
      ? 'high'
      : MED_RISK.includes(field as ConsentField)
      ? 'medium'
      : 'low') as 'high' | 'medium' | 'low',
  })).sort((a, b) => b.sharedWithOrgs - a.sharedWithOrgs)
}

// ─── Login Heatmap ────────────────────────────────────────────────────────────
export interface LoginHeatmapPoint {
  day: string
  hour: number
  count: number
  normalizedLevel: 0 | 1 | 2 | 3 | 4
}

function buildLoginHeatmap(): LoginHeatmapPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const points: LoginHeatmapPoint[] = []

  const MOCK_COUNTS: Record<string, number[]> = {
    Mon: [0,0,0,0,0,0,1,3,2,1,0,0,1,2,1,0,0,0,1,2,0,0,0,0],
    Tue: [0,0,0,0,0,0,0,2,3,2,1,0,1,1,0,0,0,0,2,1,0,0,0,0],
    Wed: [0,0,0,0,0,0,1,4,3,1,0,0,2,2,1,0,0,1,3,2,0,0,0,0],
    Thu: [0,0,0,0,0,0,0,2,2,1,0,0,1,2,1,0,0,0,1,1,0,0,0,0],
    Fri: [0,0,0,0,0,0,1,3,2,1,0,1,1,2,1,0,0,1,2,3,1,0,0,0],
    Sat: [0,0,0,0,0,0,0,0,1,2,1,0,1,1,0,0,0,0,0,1,1,0,0,0],
    Sun: [0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,1,0,0,0],
  }

  days.forEach((day) => {
    const counts = MOCK_COUNTS[day]
    const max = Math.max(...counts)
    counts.forEach((count, hour) => {
      const normalized = max === 0 ? 0 : Math.round((count / max) * 4) as 0|1|2|3|4
      points.push({ day, hour, count, normalizedLevel: normalized })
    })
  })

  return points
}

// ─── Public Service ───────────────────────────────────────────────────────────
export const citizenIntelligenceService = {
  getPrivacyHealthScore: (): Promise<PrivacyHealthScore> =>
    Promise.resolve(computePrivacyHealthScore()),

  getActivityFeed: (): Promise<ActivityFeedEvent[]> =>
    Promise.resolve(buildActivityFeed()),

  getBehavioralAnomalies: (): Promise<BehavioralAnomaly[]> =>
    Promise.resolve(buildAnomalies()),

  dismissAnomaly: (id: string): void => {
    // In real app: PATCH /api/anomalies/:id/dismiss
    console.log('[citizenIntelligenceService] dismissed anomaly', id)
  },

  getBenefits: (): Promise<BenefitScheme[]> =>
    Promise.resolve(buildBenefits()),

  markBenefitApplied: (id: string): void => {
    console.log('[citizenIntelligenceService] benefit applied', id)
  },

  getDataFootprint: (): Promise<DataFootprintField[]> =>
    Promise.resolve(buildDataFootprint()),

  getLoginHeatmap: (): Promise<LoginHeatmapPoint[]> =>
    Promise.resolve(buildLoginHeatmap()),
}
