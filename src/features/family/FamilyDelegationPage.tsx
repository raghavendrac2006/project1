import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Lock,
  Baby,
  ChevronRight,
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
import type { DelegatedPermission, FamilyMember } from '@/types'

export function FamilyDelegationPage() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<FamilyMember[]>(() => civicStorage.getFamilyMembers())
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null)
  const [pendingPerm, setPendingPerm] = useState<DelegatedPermission | null>(null)
  const toast = useToast()

  const permissionsList: { id: DelegatedPermission; label: string }[] = [
    { id: 'VIEW_PROFILE', label: 'View Profile' },
    { id: 'VIEW_DOCUMENTS', label: 'View Documents' },
    { id: 'SUBMIT_SERVICE', label: 'Apply Services' },
    { id: 'MANAGE_APPLICATIONS', label: 'Manage Applications' },
    { id: 'VIEW_NOTIFICATIONS', label: 'Notifications' },
    { id: 'SHARE_AUTHORIZED_PROOF', label: 'Share ZKP Proof' },
  ]

  const handleToggleCell = (memberId: string, permId: DelegatedPermission) => {
    setPendingMemberId(memberId)
    setPendingPerm(permId)
    setStepUpOpen(true)
  }

  const handleConfirmToggle = async () => {
    if (!pendingMemberId || !pendingPerm) return
    const targetMember = members.find((m) => m.id === pendingMemberId)
    if (!targetMember) return

    let updated: DelegatedPermission[]
    if (targetMember.delegatedPermissions.includes(pendingPerm)) {
      updated = targetMember.delegatedPermissions.filter((p) => p !== pendingPerm)
      toast.info('Authority Revoked', `Revoked ${pendingPerm} for ${targetMember.fullName}.`)
    } else {
      updated = [...targetMember.delegatedPermissions, pendingPerm]
      toast.success('Authority Granted', `Granted ${pendingPerm} for ${targetMember.fullName}.`)
    }

    await familyService.updateDelegation(pendingMemberId, updated, 'active')
    setMembers(civicStorage.getFamilyMembers())
    setPendingMemberId(null)
    setPendingPerm(null)
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
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

      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card to-indigo-500/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Legal Authorization Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Family Delegated Authority Matrix
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Granular legal authorization permissions granted to you across your household unit. All delegation grants and modifications are cryptographically audited.
          </p>
        </div>

        <Badge variant="verified" size="md">
          <ShieldCheck className="w-4 h-4 mr-1.5" /> Legally Enforceable Proxy
        </Badge>
      </div>

      {/* Cross-Household Delegation Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4 min-w-[200px]">Family Member</th>
                <th className="py-3.5 px-3 text-center">Relationship</th>
                {permissionsList.map((perm) => (
                  <th key={perm.id} className="py-3.5 px-3 text-center font-mono">
                    {perm.label}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="font-bold text-foreground">{member.fullName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {member.nationalIdMasked}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground">
                      {member.relationship}
                    </span>
                  </td>

                  {permissionsList.map((perm) => {
                    const hasPerm = member.delegatedPermissions.includes(perm.id)
                    return (
                      <td key={perm.id} className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleCell(member.id, perm.id)}
                          className={cn(
                            'p-1 rounded-lg transition-transform hover:scale-110',
                            hasPerm ? 'text-primary' : 'text-muted-foreground/30 hover:text-muted-foreground'
                          )}
                          title={`${hasPerm ? 'Revoke' : 'Grant'} ${perm.label} for ${member.fullName}`}
                        >
                          {hasPerm ? (
                            <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 mx-auto text-muted-foreground/40" />
                          )}
                        </button>
                      </td>
                    )
                  })}

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/app/family/${member.id}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Configure <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delegation Principles Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Baby className="w-4 h-4 text-purple-600" />
              Guardianship over Minors
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Minor children remain automatically under statutory guardian custody until 18 years of age. All civil applications, vaccinations, and educational proofs are executed with guardian digital signature.
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Adult Sovereign Revocability
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Adult household members (spouse, elder parents) retain sole sovereign power to revoke any individual permission at any time through their personal CiviqOne portal terminal.
          </CardContent>
        </Card>
      </div>

      {/* Step-Up Authentication Modal */}
      <StepUpAuthenticationModal
        isOpen={stepUpOpen}
        onClose={() => {
          setStepUpOpen(false)
          setPendingMemberId(null)
          setPendingPerm(null)
        }}
        actionName="Modify Statutory Delegation Authority"
        onSuccess={handleConfirmToggle}
      />
    </div>
  )
}
