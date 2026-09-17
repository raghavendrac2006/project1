import type { AnomalySignal, SLAForecast, AccessFrequencyPoint, OrgSecurityEvent, OffboardingTask } from '@/types'

// ─── Mock Anomaly Signals ──────────────────────────────────────────────────
const MOCK_ANOMALIES: AnomalySignal[] = [
  {
    id: 'anm_001',
    title: 'Unusual off-hours data access detected',
    description:
      'Staff member Rajan Mehta (VERIFICATION_OFFICER) performed 14 citizen profile queries between 02:00–04:00 IST — 8× above their daily average.',
    severity: 'critical',
    detectedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    affectedCitizenCount: 14,
    category: 'access_pattern',
    isResolved: false,
  },
  {
    id: 'anm_002',
    title: 'Consent field scope exceeded in 3 access requests',
    description:
      'Three access requests for "Credit Risk Lite" service requested `drivingLicense` — a field not listed in the active policy template for this service.',
    severity: 'warning',
    detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    affectedCitizenCount: 3,
    category: 'consent_deviation',
    isResolved: false,
  },
  {
    id: 'anm_003',
    title: 'SLA breach: 2 applications exceeded 5-day threshold',
    description:
      'Applications APP-2024-00017 and APP-2024-00023 have remained in `under_review` status for 6 days, breaching the 5-day SLA target.',
    severity: 'warning',
    detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    affectedCitizenCount: 2,
    category: 'sla_breach',
    isResolved: true,
    resolvedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'anm_004',
    title: 'New staff account created without onboarding audit',
    description:
      'Member `mem_07` (Anjali Rao, SUPPORT) was added to the organization but no onboarding audit trail was recorded within the required 24-hour window.',
    severity: 'info',
    detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    affectedCitizenCount: 0,
    category: 'staff_activity',
    isResolved: true,
    resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── Mock SLA Forecasts ────────────────────────────────────────────────────
const MOCK_SLA_FORECASTS: SLAForecast[] = [
  {
    serviceId: 'srv_org_001',
    serviceName: 'Health Insurance Claim',
    currentAvgDays: 3.4,
    targetDays: 5.0,
    forecastDays: 2.8,
    trend: 'improving',
    confidence: 87,
  },
  {
    serviceId: 'srv_org_002',
    serviceName: 'Personal Loan Pre-Approval',
    currentAvgDays: 4.9,
    targetDays: 4.0,
    forecastDays: 5.3,
    trend: 'degrading',
    confidence: 74,
  },
  {
    serviceId: 'srv_org_003',
    serviceName: 'Motor Insurance Renewal',
    currentAvgDays: 1.2,
    targetDays: 2.0,
    forecastDays: 1.2,
    trend: 'stable',
    confidence: 95,
  },
  {
    serviceId: 'srv_org_004',
    serviceName: 'Life Insurance Policy Issuance',
    currentAvgDays: 6.1,
    targetDays: 5.0,
    forecastDays: 4.8,
    trend: 'improving',
    confidence: 68,
  },
]

// ─── Mock Access Frequency (heat map rows: Mon–Sun, 0–23h) ─────────────────
function buildAccessFrequency(): AccessFrequencyPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const points: AccessFrequencyPoint[] = []
  const peakHours = [9, 10, 11, 14, 15, 16]
  days.forEach((day, di) => {
    for (let h = 0; h < 24; h++) {
      const isWeekday = di < 5
      const isPeak = peakHours.includes(h)
      const base = isWeekday && isPeak ? Math.floor(Math.random() * 20) + 12 : Math.floor(Math.random() * 5)
      const count = base
      const normalizedLevel = count === 0 ? 0 : count < 5 ? 1 : count < 12 ? 2 : count < 20 ? 3 : 4
      points.push({ hour: h, dayLabel: day, count, normalizedLevel })
    }
  })
  return points
}

// ─── Mock Security Events ──────────────────────────────────────────────────
const MOCK_SECURITY_EVENTS: OrgSecurityEvent[] = [
  {
    id: 'sec_001',
    category: 'anomalous_query',
    title: 'Bulk citizen data query attempt',
    description:
      'Staff member attempted to export more than 50 citizen records simultaneously via the Citizens page — bulk export is not permitted.',
    severity: 'high',
    actor: 'Rajan Mehta',
    actorRole: 'VERIFICATION_OFFICER',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.52',
    outcome: 'blocked',
    metadata: { recordsAttempted: '54', endpoint: '/organization/citizens' },
  },
  {
    id: 'sec_002',
    category: 'policy_violation',
    title: 'Access request sent for deprecated policy template',
    description:
      'An access request was issued using Policy Template v1.1 (deprecated June 2024). All requests must use the current active policy version.',
    severity: 'medium',
    actor: 'Anika Sharma',
    actorRole: 'APPLICATION_OFFICER',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.45',
    outcome: 'flagged',
    metadata: { policyId: 'pol_v1.1', requestId: 'req_089' },
  },
  {
    id: 'sec_003',
    category: 'staff_offboarding',
    title: 'Offboarding initiated for inactive member',
    description:
      'Member Kiran Bose (READ_ONLY) has not logged in for 45 days. Offboarding checklist automatically triggered per security policy.',
    severity: 'low',
    actor: 'System (Auto-trigger)',
    actorRole: 'SYSTEM',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: 'system',
    outcome: 'flagged',
  },
  {
    id: 'sec_004',
    category: 'unauthorized_access',
    title: 'Login attempt from unrecognized IP',
    description:
      'Three failed login attempts from IP 45.33.32.156 (Fremont, US) for account priya.kapoor@apexhealth.in. Account temporarily locked.',
    severity: 'critical',
    actor: 'Unknown (IP: 45.33.32.156)',
    actorRole: 'UNKNOWN',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    ipAddress: '45.33.32.156',
    outcome: 'blocked',
    metadata: { attempts: '3', accountLocked: 'true', location: 'Fremont, US' },
  },
  {
    id: 'sec_005',
    category: 'privilege_escalation',
    title: 'Role elevation request — SUPPORT → VERIFICATION_OFFICER',
    description:
      'Anjali Rao (SUPPORT) submitted a role elevation request to VERIFICATION_OFFICER. Pending ADMIN approval.',
    severity: 'medium',
    actor: 'Anjali Rao',
    actorRole: 'SUPPORT',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.47',
    outcome: 'flagged',
  },
]

// ─── Mock Offboarding Tasks ─────────────────────────────────────────────────
const MOCK_OFFBOARDING_TASKS: OffboardingTask[] = [
  {
    id: 'ob_001',
    memberId: 'mem_06',
    memberName: 'Kiran Bose',
    memberRole: 'READ_ONLY',
    task: 'Revoke all active session tokens',
    status: 'completed',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ob_002',
    memberId: 'mem_06',
    memberName: 'Kiran Bose',
    memberRole: 'READ_ONLY',
    task: 'Transfer open case ownership',
    status: 'pending',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ob_003',
    memberId: 'mem_06',
    memberName: 'Kiran Bose',
    memberRole: 'READ_ONLY',
    task: 'Remove from IRDAI data processor registry',
    status: 'overdue',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ob_004',
    memberId: 'mem_06',
    memberName: 'Kiran Bose',
    memberRole: 'READ_ONLY',
    task: 'Archive personal audit log export',
    status: 'pending',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── Application Readiness Checklist ───────────────────────────────────────
export interface ReadinessCheck {
  label: string
  description: string
  status: 'pass' | 'warning' | 'fail'
}

const MOCK_READINESS_CHECKS: ReadinessCheck[] = [
  { label: 'Active consent policy templates', description: 'All services linked to an active policy', status: 'warning' },
  { label: 'SLA targets configured', description: '4/4 services have SLA targets set', status: 'pass' },
  { label: 'Staff offboarding clear', description: '1 offboarding checklist has overdue tasks', status: 'fail' },
  { label: 'Anomaly signals resolved', description: '2 of 4 signals unresolved', status: 'warning' },
  { label: 'Data retention declarations filed', description: 'All policies have retention days set', status: 'pass' },
  { label: 'Security events reviewed', description: '2 events in "flagged" state pending review', status: 'warning' },
]

// ─── Service exports ───────────────────────────────────────────────────────
export const organizationIntelligenceService = {
  async getAnomalySignals(): Promise<AnomalySignal[]> {
    await new Promise((r) => setTimeout(r, 150))
    return MOCK_ANOMALIES
  },

  async getSLAForecasts(): Promise<SLAForecast[]> {
    await new Promise((r) => setTimeout(r, 100))
    return MOCK_SLA_FORECASTS
  },

  async getAccessFrequency(): Promise<AccessFrequencyPoint[]> {
    await new Promise((r) => setTimeout(r, 100))
    return buildAccessFrequency()
  },

  async getSecurityEvents(): Promise<OrgSecurityEvent[]> {
    await new Promise((r) => setTimeout(r, 120))
    return MOCK_SECURITY_EVENTS
  },

  async getOffboardingTasks(): Promise<OffboardingTask[]> {
    await new Promise((r) => setTimeout(r, 80))
    return MOCK_OFFBOARDING_TASKS
  },

  async getReadinessChecks(): Promise<ReadinessCheck[]> {
    await new Promise((r) => setTimeout(r, 80))
    return MOCK_READINESS_CHECKS
  },

  async resolveAnomaly(id: string): Promise<void> {
    const a = MOCK_ANOMALIES.find((x) => x.id === id)
    if (a) {
      a.isResolved = true
      a.resolvedAt = new Date().toISOString()
    }
  },
}
