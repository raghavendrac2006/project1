import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  Building2,
  Calendar,
  Printer,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { organizationService, type CitizenAuthorizedProfile } from '@/services/organization.service'
import { realtimeBus } from '@/services/eventBus'
import { useToast } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import type { ConsentField } from '@/types'

export function OrganizationCitizenDetailPage() {
  const { citizenId } = useParams<{ citizenId: string }>()
  const navigate = useNavigate()
  const { toast, success, warning } = useToast()

  const [profile, setProfile] = useState<CitizenAuthorizedProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Request Additional Access Dialog
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [additionalPurpose, setAdditionalPurpose] = useState('Supplemental eligibility verification')
  const [selectedExtraFields, setSelectedExtraFields] = useState<ConsentField[]>(['email', 'address'])

  // Dossier Export Modal
  const [dossierModalOpen, setDossierModalOpen] = useState(false)

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await organizationService.getCitizenAuthorizedProfile(citizenId || 'usr_samagra_99182')
      setProfile(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()

    // Real-time synchronization: listen for citizen revocations or lockdowns
    const unsubRevoked = realtimeBus.subscribe('CONSENT_REVOKED', (payload) => {
      loadProfile()
      warning(
        'Access Revoked by Citizen',
        'The citizen updated their privacy consent. Certain profile fields have been immediately re-encrypted and masked.'
      )
    })

    const unsubLockdown = realtimeBus.subscribe('PRIVACY_LOCKDOWN', () => {
      loadProfile()
      warning(
        'Emergency Privacy Lockdown Active',
        'Citizen triggered sovereign lockdown. All external tokens have been severed.'
      )
    })

    const unsubGranted = realtimeBus.subscribe('CONSENT_GRANTED', () => {
      loadProfile()
      success('Consent Granted', 'Citizen approved your requested data access fields.')
    })

    return () => {
      unsubRevoked()
      unsubLockdown()
      unsubGranted()
    }
  }, [citizenId])

  const handleOpenRequestForField = (field: ConsentField) => {
    setSelectedExtraFields([field])
    setAdditionalPurpose(`Mandatory verification requirement for field: ${field}`)
    setRequestModalOpen(true)
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    await organizationService.createAccessRequest({
      organizationId: 'org_apex_health',
      organizationName: 'Apex Health & Life Insurers',
      organizationLogo: '',
      purpose: additionalPurpose,
      requestedFields: selectedExtraFields,
      requestedDocuments: ['Address Proof'],
      durationDays: 30,
      citizenId: profile.citizenId,
      citizenName: profile.fullName,
    })

    success(
      'Access Request Transmitted',
      `Citizen will receive a notification to review and authorize requested fields.`
    )
    setRequestModalOpen(false)
  }

  if (loading || !profile) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading citizen profile with cryptographic access bounds...
      </div>
    )
  }

  const authorizedFieldsCount = Object.values(profile.fields).filter((f) => f.status === 'authorized').length
  const totalFieldsCount = Object.values(profile.fields).length
  const consentPercentage = Math.round((authorizedFieldsCount / totalFieldsCount) * 100)

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.ORGANIZATION.CITIZENS)}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Citizens Directory
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDossierModalOpen(true)}
            className="text-xs gap-1.5 border-border"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            Export Dossier
          </Button>

          <Badge
            variant="outline"
            className={`text-xs px-3 py-1 uppercase font-bold ${
              profile.grantStatus === 'active'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : profile.grantStatus === 'revoked'
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Grant Status: {profile.grantStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Revocation Alert Banner if Citizen Revoked or Locked down */}
      {profile.grantStatus === 'revoked' && (
        <div className="p-4 rounded-xl border-2 border-rose-500/40 bg-rose-500/10 text-rose-950 dark:text-rose-200 flex items-start gap-3.5 animate-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm">Citizen Consent Revoked / Expired</h4>
            <p className="mt-1 leading-relaxed opacity-90">
              The citizen or sovereign privacy watchdog has terminated authorization tokens for your organization. All personal attributes have been dynamically re-encrypted and masked (`••••••••`). Any downstream operations requiring this data must submit a fresh access request.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Shield HUD Banner */}
      <div className="p-5 rounded-2xl border border-primary/20 bg-card/90 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Token Protocol</p>
            <p className="text-xs font-bold text-foreground">AES-256-GCM Sovereign Enclave</p>
            <p className="text-[10px] text-muted-foreground font-mono">ID: TKN-{profile.citizenId.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Consented Attributes:</span>
            <span className="font-bold text-foreground font-mono">{authorizedFieldsCount} of {totalFieldsCount} ({consentPercentage}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${consentPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-emerald-500/5 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero Global Sharing Enforced
          </Badge>
        </div>
      </div>

      {/* Citizen Sovereign Identity Card */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Citizen ID: {profile.citizenId}</span>
            <Badge variant="secondary" className="text-[9px]">Level 3 Biometric Sovereign</Badge>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display">
            {profile.fullName}
          </h1>
          {profile.grantExpiry && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Access authorization expires on: <strong>{new Date(profile.grantExpiry).toLocaleDateString()}</strong>
            </p>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setRequestModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          Request Additional Data
        </Button>
      </div>

      {/* Data Protection Protocol Notice */}
      <div className="p-4 rounded-xl border border-border bg-muted/40 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Cryptographic Access Boundary:</strong> Below is the comprehensive field-level authorization manifest for this citizen. Unconsented fields (e.g. permanent address, national Aadhaar, financial records) are completely locked and cannot be queried by your organization without an explicit citizen consent approval.
        </p>
      </div>

      {/* Field-Level Access States */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Field-Level Access Manifest</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Granular authorization status per personal data attribute.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {authorizedFieldsCount} Authorized
          </Badge>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Object.values(profile.fields).map((item) => {
              const isAuth = item.status === 'authorized'
              const isRevoked = item.status === 'revoked'
              return (
                <div
                  key={item.field}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isAuth
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isRevoked
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-border/70 bg-card'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </span>
                      {isAuth ? (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Authorized
                        </Badge>
                      ) : isRevoked ? (
                        <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold gap-1">
                          <XCircle className="w-2.5 h-2.5" /> Revoked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground border-border font-bold gap-1">
                          <Lock className="w-2.5 h-2.5" /> Not Authorized
                        </Badge>
                      )}
                    </div>

                    {isAuth ? (
                      <p className="text-xs font-bold text-foreground font-mono truncate">
                        {item.value}
                      </p>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono tracking-widest text-muted-foreground/60">••••••••••••••••</span>
                        <span className="text-[10px] text-muted-foreground/80 italic">Redacted</span>
                      </div>
                    )}
                  </div>

                  {!isAuth && (
                    <div className="mt-3 pt-2.5 border-t border-border/50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenRequestForField(item.field)}
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        Request Access
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Supporting Documents Access Status */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">Authorized Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-2.5">
          {profile.documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card text-xs">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground">{doc.name}</span>
              </div>
              {doc.status === 'authorized' ? (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                  ✓ Authorized & Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border font-bold">
                  🔒 Document Not Consented
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Request Additional Data Modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Request Supplemental Data Access</DialogTitle>
            <DialogDescription className="text-xs">
              Submit a formal request to <strong>{profile.fullName}</strong>. The citizen will review each field individually before granting access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendRequest} className="space-y-4 my-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Operational Purpose</label>
              <textarea
                value={additionalPurpose}
                onChange={(e) => setAdditionalPurpose(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-foreground">Select Unconsented Fields Needed:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['email', 'address', 'income', 'panNumber', 'nationalId', 'drivingLicense'] as ConsentField[]).map((f) => {
                  const isChecked = selectedExtraFields.includes(f)
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setSelectedExtraFields((prev) =>
                          isChecked ? prev.filter((x) => x !== f) : [...prev, f]
                        )
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                        isChecked ? 'border-primary bg-primary/5 font-bold text-foreground' : 'border-border text-muted-foreground'
                      }`}
                    >
                      <span className="capitalize">{f}</span>
                      <span>{isChecked ? '✓' : '+'}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Dispatch to Citizen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Export Authorized Dossier Dialog */}
      <Dialog open={dossierModalOpen} onOpenChange={setDossierModalOpen}>
        <DialogContent className="max-w-xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Official Sanitized Record
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground">ID: CIT-{profile.citizenId.slice(-6).toUpperCase()}</span>
            </div>
            <DialogTitle className="text-lg font-bold">Authorized Citizen Verification Dossier</DialogTitle>
            <DialogDescription className="text-xs">
              Cryptographically verified extract containing only citizen-consented attributes. Redacted attributes omitted under statutory privacy standards.
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 p-5 rounded-xl border border-border bg-card space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-border/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{profile.fullName}</h3>
                <p className="text-[11px] text-muted-foreground">Citizen Identifier: {profile.citizenId}</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {profile.grantStatus.toUpperCase()}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-1">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground mb-2">
                Consented Attribute Data
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(profile.fields)
                  .filter((f) => f.status === 'authorized')
                  .map((f) => (
                    <div key={f.field} className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">{f.label}</span>
                      <span className="font-bold text-foreground font-mono">{f.value}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/60 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Zero-Knowledge Verification Hash:</span>
              <span className="font-mono text-foreground font-semibold">0x9942a7...c81e</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setDossierModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.print()
              }}
              className="gap-1.5 font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

