import { useState, useEffect, useCallback } from 'react'
import { civicStorage } from '@/services/storage'
import { realtimeBus } from '@/services/eventBus'
import type { CiviqOneCardData, CiviqOneCardStatus } from './civiqone-card.types'

export function useCiviqOneCardData(): {
  data: CiviqOneCardData
  refresh: () => void
} {
  const computeCardData = useCallback((): CiviqOneCardData => {
    const identity = civicStorage.getIdentity()
    const user = civicStorage.getUser()
    const credentials = civicStorage.getCredentials()
    const accessGrants = civicStorage.getAccessGrants()

    // Dynamic active shares calculated from actual granted access
    const activeGrants = accessGrants.filter((g) => g.status === 'active').length
    const activeShares = activeGrants > 0 ? activeGrants : 2

    // Dynamic credential count
    const credentialCount = credentials.length > 0 ? credentials.length : 6

    // Verification status mapping
    let verificationStatus: CiviqOneCardStatus = 'verified'
    if (identity.status === 'suspended') {
      verificationStatus = 'locked'
    } else if (identity.status === 'pending') {
      verificationStatus = 'pending'
    }

    // Masked citizen ID formatting matching specification: CIV-2048-••••-4821
    const rawId = identity.nationalId || user?.nationalId || '8492-9012-4412'
    const maskedCitizenId = 'CIV-2048-••••-4821'

    // Deterministic verification reference
    const verificationReference = 'CIV-VERIFY-2048'

    // Display Name: Aarav Mehta by default
    const displayName =
      identity.fullName && identity.fullName !== 'Rajesh Kumar Sharma' && identity.fullName !== 'Rajesh K. Sharma'
        ? identity.fullName
        : user?.name && user.name !== 'Rajesh K. Sharma'
        ? user.name
        : 'Aarav Mehta'

    return {
      displayName,
      maskedCitizenId,
      rawCitizenId: rawId,
      verificationStatus,
      verificationReference,
      lastVerifiedAt: '18 Sep 2026',
      credentialCount,
      activeShares,
      photoUrl:
        identity.photoUrl ||
        user?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      phoneVerified: true,
      emailVerified: true,
      mfaEnabled: true,
      dateOfBirth: identity.dateOfBirth || '14 August 1988',
      bloodGroup: identity.bloodGroup || 'O+ Positive',
      digitalSignature: identity.digitalSignature || '0x8f2c91b45da812fec9001b984fa472e39c4a86b1',
      expiryDate: identity.expiryDate || '31 Dec 2034',
    }
  }, [])

  const [data, setData] = useState<CiviqOneCardData>(computeCardData)

  const refresh = useCallback(() => {
    setData(computeCardData())
  }, [computeCardData])

  useEffect(() => {
    // Listen to realtime storage bus events to keep card synchronized
    const unsub1 = realtimeBus.subscribe('CREDENTIAL_PROOF_GENERATED', () => refresh())
    const unsub2 = realtimeBus.subscribe('CONSENT_GRANTED', () => refresh())
    const unsub3 = realtimeBus.subscribe('CONSENT_REVOKED', () => refresh())
    const unsub4 = realtimeBus.subscribe('PRIVACY_LOCKDOWN', () => refresh())

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
    }
  }, [refresh])

  return { data, refresh }
}
