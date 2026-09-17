import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  ShieldAlert,
  Baby,
  Calendar,
  FileText,
  Briefcase,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StepUpAuthenticationModal } from '@/components/auth/StepUpAuthenticationModal'
import { familyService } from '@/services/family.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { DelegatedPermission } from '@/types'

export function FamilyMemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [pendingPermissions, setPendingPermissions] = useState<DelegatedPermission[]>([])

  const member = useMemo(() => {
    const list = civicStorage.getFamilyMembers()
    return list.find((m) => m.id === memberId)
  }, [memberId])

  const memberDocs = useMemo(() => {
    if (!memberId) return []
    const all = civicStorage.getDocuments()
    return all.filter((d) => d.owner === 'family_member' && d.ownerId === memberId)
  }, [memberId])

  if (!member) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Family Member Not Found</h2>
        <Button onClick={() => navigate(ROUTES.APP.FAMILY)} variant="outline" size="sm">
          Return to Family Hub
        </Button>
      </div>
    )
  }

  const allAvailablePermissions: { id: DelegatedPermission; title: string; desc: string }[] = [
    {
      id: 'VIEW_PROFILE',
      title: 'View Sovereign Profile',
      desc: 'Access basic identity attributes, date of birth, and residency status.',
    },
    {
      id: 'VIEW_DOCUMENTS',
      title: 'Inspect Vaulted Records',
      desc: 'View and download identity cards, birth certificates, and credentials.',
    },
    {
      id: 'SUBMIT_SERVICE',
      title: 'Apply for Civic Services',
      desc: 'Submit statutory applications, scheme claims, and admissions on their behalf.',
    },
    {
      id: 'MANAGE_APPLICATIONS',
      title: 'Track & Manage Applications',
      desc: 'Respond to queries, upload requested documents, and verify timelines.',
    },
    {
      id: 'VIEW_NOTIFICATIONS',
      title: 'Statutory Alerts & Notices',
      desc: 'Receive critical governmental reminders and expiry alerts.',
    },
    {
      id: 'SHARE_AUTHORIZED_PROOF',
      title: 'Generate Verifiable Proofs',
      desc: 'Dispatch zero-knowledge cryptographic proofs to vetted institutions.',
    },
  ]

  const handleTogglePermission = (permId: DelegatedPermission) => {
    let updated: DelegatedPermission[]
    if (member.delegatedPermissions.includes(permId)) {
      updated = member.delegatedPermissions.filter((p) => p !== permId)
    } else {
      updated = [...member.delegatedPermissions, permId]
    }
    setPendingPermissions(updated)
    setStepUpOpen(true)
  }

  const handleConfirmDelegation = async () => {
    try {
      await familyService.updateDelegation(member.id, pendingPermissions, 'active')
      toast.success('Delegated Authority Updated', `Operational permissions synchronized for ${member.fullName}.`)
      // Trigger UI refresh
      window.location.reload()
    } catch {
      toast.error('Error', 'Failed to update delegated permissions.')
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate(ROUTES.APP.FAMILY)}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Family Hub
        </Button>
      </div>

      {/* Member Hero Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={member.avatar}
            alt={member.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-border shrink-0 shadow-md"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase">
                {member.relationship}
              </span>
              {member.isMinor ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Baby className="w-3.5 h-3.5" /> Minor Dependent (Guardian Managed)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                  Adult Member (Consensual Delegation)
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
              {member.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-mono">
              DOB: {member.dateOfBirth} • National ID: {member.nationalIdMasked}
            </p>
          </div>
        </div>

        {/* Quick Action: Apply as Member */}
        <div className="shrink-0">
          <Button
            onClick={() => navigate(`/app/services?applicant=${member.id}`)}
            size="md"
            className="text-xs font-bold rounded-xl shadow-sm gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Apply for Service for {member.fullName.split(' ')[0]}
          </Button>
        </div>
      </div>

      {/* 2-Column Grid: Delegated Authorities & Vault Documents */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Delegated Authority Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Operational Delegations</CardTitle>
                  <CardDescription className="text-xs">
                    Statutory powers granted to you on behalf of {member.fullName}
                  </CardDescription>
                </div>
                <Badge variant="verified" size="sm">
                  Active Legal Proxy
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {allAvailablePermissions.map((perm) => {
                const isGranted = member.delegatedPermissions.includes(perm.id)
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4',
                      isGranted
                        ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                        : 'border-border bg-card hover:bg-muted/40'
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={cn(
                            'w-4 h-4 shrink-0',
                            isGranted ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <h4 className="text-xs font-bold text-foreground">{perm.title}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 ml-6 leading-relaxed">
                        {perm.desc}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0',
                        isGranted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isGranted ? 'Granted' : 'Revoked'}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Associated Vault Documents & Records */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Vault Records for {member.fullName.split(' ')[0]}</CardTitle>
                  <CardDescription className="text-xs">
                    Encrypted certificates owned by this family member
                  </CardDescription>
                </div>
                <Button
                  onClick={() => navigate(ROUTES.APP.DOCUMENTS)}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary font-semibold p-0 h-auto"
                >
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {memberDocs.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">No Records Uploaded</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Upload birth certificates or medical cards in the Document Vault.
                  </p>
                </div>
              ) : (
                memberDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/app/documents/${doc.id}`)}
                    className="p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          #{doc.documentNumber}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Guardianship Status Notice */}
          <Card className="border-border bg-muted/30">
            <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> Statutory Protection
              </span>
              <p className="leading-relaxed">
                Actions performed under delegated authority are cryptographically logged with your citizen signature. Dependents retain statutory rights to audit all historical submissions upon reaching adulthood.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step-Up Authentication Modal */}
      <StepUpAuthenticationModal
        isOpen={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        actionName={`Update Delegated Authority for ${member.fullName}`}
        onSuccess={handleConfirmDelegation}
      />
    </div>
  )
}
