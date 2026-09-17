import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileText,
  Layers,
  Calendar,
  Lock,
  Plus,
  ChevronRight,
  Heart,
  Baby,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { familyService } from '@/services/family.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { FamilyMember, DelegatedPermission } from '@/types'

export function FamilyDashboardPage() {
  const [members, setMembers] = useState<FamilyMember[]>(() => civicStorage.getFamilyMembers())
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Spouse')
  const [dateOfBirth, setDateOfBirth] = useState('1994-06-15')
  const [gender, setGender] = useState<FamilyMember['gender']>('Female')
  const [isGuardianManaged, setIsGuardianManaged] = useState(false)

  const toast = useToast()
  const navigate = useNavigate()

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Missing Name', 'Please enter full legal name.')
      return
    }

    setIsSubmitting(true)
    try {
      // Calculate isMinor
      const birthYear = new Date(dateOfBirth).getFullYear()
      const currentYear = new Date().getFullYear()
      const isMinor = currentYear - birthYear < 18

      const defaultPermissions: DelegatedPermission[] = isMinor
        ? [
            'VIEW_PROFILE',
            'VIEW_DOCUMENTS',
            'MANAGE_APPLICATIONS',
            'SUBMIT_SERVICE',
            'VIEW_NOTIFICATIONS',
            'SHARE_AUTHORIZED_PROOF',
          ]
        : ['VIEW_PROFILE', 'VIEW_DOCUMENTS', 'SUBMIT_SERVICE']

      const newMember = await familyService.addFamilyMember({
        fullName,
        relationship,
        dateOfBirth,
        gender,
        isMinor,
        isGuardianManaged: isMinor || isGuardianManaged,
        delegationStatus: 'active',
        delegatedPermissions: defaultPermissions,
        documentsCount: 0,
        activeApplicationsCount: 0,
        nationalIdMasked: '•••• •••• ' + Math.floor(1000 + Math.random() * 9000),
        avatar: ` ? '1517841905240-472988babdf9' : '1534528741775-53994a69daeb'}?fit=crop&w=256&h=256&q=80`,
      })

      setMembers(civicStorage.getFamilyMembers())
      setAddModalOpen(false)
      setFullName('')
      toast.success('Family Member Registered', `${newMember.fullName} added with delegated civic authority.`)
    } catch {
      toast.error('Error', 'Could not register family member.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card via-card to-indigo-500/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Family Civic Unit
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Family & Delegated Authority Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage dependents, minor children, and elderly parents. Exercise legally separated delegated authority for statutory applications, admissions, and healthcare records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => navigate(ROUTES.APP.FAMILY_DELEGATION)}
            variant="outline"
            size="sm"
            className="text-xs font-bold rounded-xl"
          >
            Delegation Matrix
          </Button>

          <Button
            onClick={() => setAddModalOpen(true)}
            size="sm"
            className="text-xs font-bold rounded-xl shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Family Member
          </Button>
        </div>
      </div>

      {/* Info Callout: Separation of Relationship vs Delegation */}
      <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Legal Notice:</strong> Family relationships are strictly separated from operational authority. Adult members retain sovereign revocation rights over their delegated permissions.
          </span>
        </span>
        <Link
          to={ROUTES.APP.FAMILY_DELEGATION}
          className="text-primary font-bold hover:underline shrink-0 hidden sm:inline"
        >
          Review Delegations →
        </Link>
      </div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => navigate(`/app/family/${member.id}`)}
            className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    {member.relationship}
                  </span>
                  {member.isMinor ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Baby className="w-3 h-3" /> Minor Dependent
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                      Adult
                    </span>
                  )}
                </div>

                <Badge variant="verified" size="sm">
                  {member.delegationStatus === 'active' ? 'Authorized' : 'Pending'}
                </Badge>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3.5">
                <img
                  src={member.avatar}
                  alt={member.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
                />
                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {member.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    DOB: {member.dateOfBirth} • {member.nationalIdMasked}
                  </p>
                </div>
              </div>

              {/* Delegated Authorities Summary */}
              <div className="mt-4 pt-3 border-t border-border/60 text-xs space-y-2">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider block">
                  Active Delegations ({member.delegatedPermissions.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {member.delegatedPermissions.slice(0, 3).map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-foreground font-medium"
                    >
                      {perm.replace('_', ' ')}
                    </span>
                  ))}
                  {member.delegatedPermissions.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground font-bold">
                      +{member.delegatedPermissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {member.documentsCount} Vault Docs
              </span>

              <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Inspect <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Family Member Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserPlus className="w-5 h-5 text-primary" />
              Register Family Member
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a spouse, minor child, or dependent parent to your sovereign household unit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMember} className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kavita Sharma"
                required
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as FamilyMember['relationship'])}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child (Minor/Adult)</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Dependent">Dependent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as FamilyMember['gender'])}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Minors (under 18) are automatically placed under legal guardian custody.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Add to Family Unit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

