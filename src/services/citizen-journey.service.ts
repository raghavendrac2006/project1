/**
 * citizen-journey.service.ts
 * Builds the citizen's complete civic timeline from all data sources.
 */

import { civicStorage } from './storage'
import type { CivicMilestone } from '@/types'

function buildTimeline(): CivicMilestone[] {
  const milestones: CivicMilestone[] = []

  // Identity milestone
  const identity = civicStorage.getIdentity()
  if (identity) {
    milestones.push({
      id: 'ms_identity',
      date: identity.issueDate,
      title: 'Digital Identity Issued',
      description: `Your CIVIQONE Sovereign Digital ID was issued and biometric verification completed. Verification level: ${identity.status}.`,
      type: 'identity',
      icon: '🪪',
      isHighlight: true,
    })
  }

  // Documents
  const docs = civicStorage.getDocuments()
  docs.slice(0, 3).forEach((doc, i) => {
    milestones.push({
      id: `ms_doc_${i}`,
      date: doc.issueDate,
      title: `${doc.title} Uploaded`,
      description: `${doc.title} was added to your Document Vault and marked as ${doc.verificationStatus}.`,
      type: 'document',
      icon: '📄',
      isHighlight: doc.verificationStatus === 'verified',
    })
  })

  // Applications
  const apps = civicStorage.getApplications()
  apps.forEach((app, i) => {
    milestones.push({
      id: `ms_app_${i}`,
      date: app.submittedAt,
      title: `Applied: ${app.serviceName}`,
      description: `Application ${app.applicationNumber} submitted to ${app.department}. Current status: ${app.status.replace('_', ' ')}.`,
      type: 'service',
      icon: '📋',
      isHighlight: app.status === 'completed',
    })
  })

  // Consent grants
  const grants = civicStorage.getAccessGrants()
  grants.slice(0, 4).forEach((g, i) => {
    milestones.push({
      id: `ms_grant_${i}`,
      date: g.grantedAt,
      title: `Data Access Authorized`,
      description: `You authorized ${g.organizationName} to access ${g.authorizedFields.length} data fields for: ${g.purpose.slice(0, 80)}…`,
      type: 'consent',
      icon: '🔑',
      isHighlight: false,
    })
  })

  // Payments
  const payments = civicStorage.getPayments()
  payments.filter((p) => p.status === 'paid').slice(0, 2).forEach((p, i) => {
    milestones.push({
      id: `ms_pay_${i}`,
      date: p.paidDate || p.dueDate,
      title: 'Civic Due Settled',
      description: `₹${p.amount.toLocaleString()} paid for ${p.title}. Receipt: ${p.receiptNumber || 'Pending'}.`,
      type: 'payment',
      icon: '💳',
      isHighlight: false,
    })
  })

  // Family
  const family = civicStorage.getFamilyMembers()
  if (family.length > 0) {
    milestones.push({
      id: 'ms_family',
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Family Profile Linked',
      description: `${family.length} family member${family.length > 1 ? 's' : ''} added to your CIVIQONE Family Vault.`,
      type: 'family',
      icon: '👨‍👩‍👧',
      isHighlight: false,
    })
  }

  // Security milestone
  milestones.push({
    id: 'ms_security',
    date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Biometric 2FA Activated',
    description: 'Hardware security key and biometric second-factor authentication enabled on your account.',
    type: 'security',
    icon: '🔐',
    isHighlight: true,
  })

  // Sort newest first
  return milestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const citizenJourneyService = {
  getTimeline: (): Promise<CivicMilestone[]> => Promise.resolve(buildTimeline()),
}
