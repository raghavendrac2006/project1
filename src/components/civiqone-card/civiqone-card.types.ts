export type CiviqOneCardStatus =
  | 'verified'
  | 'pending'
  | 'expired'
  | 'locked'
  | 'restricted'
  | 'protected'

export interface CiviqOneCardData {
  displayName: string
  maskedCitizenId: string
  rawCitizenId?: string
  verificationStatus: CiviqOneCardStatus
  verificationReference: string
  lastVerifiedAt: string
  credentialCount: number
  activeShares: number
  photoUrl?: string
  phoneVerified?: boolean
  emailVerified?: boolean
  mfaEnabled?: boolean
  dateOfBirth?: string
  bloodGroup?: string
  digitalSignature?: string
  expiryDate?: string
}

export interface CiviqOneCardProps {
  data?: CiviqOneCardData
  flipped?: boolean
  onFlip?: (isFlipped: boolean) => void
  onVerify?: () => void
  onShareProof?: () => void
  onViewCredentials?: () => void
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  showActions?: boolean
  className?: string
  privacyMode?: boolean
  onTogglePrivacyMode?: () => void
}
