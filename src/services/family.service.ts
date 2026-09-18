import { civicStorage } from './storage'
import { realtimeBus } from './eventBus'
import type { FamilyMember, DelegatedPermission, CivicDocument } from '@/types'

export const familyService = {
  async getFamilyMembers(): Promise<FamilyMember[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return civicStorage.getFamilyMembers()
  },

  async getFamilyMemberById(id: string): Promise<FamilyMember | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const members = civicStorage.getFamilyMembers()
    return members.find((m) => m.id === id)
  },

  async addFamilyMember(memberData: Omit<FamilyMember, 'id' | 'addedAt'>): Promise<FamilyMember> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const member = civicStorage.addFamilyMember(memberData)

    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: 'Rajesh K. Sharma',
      actorId: 'usr_civiqone_99182',
      role: 'CITIZEN',
      action: 'ADDED_FAMILY_MEMBER',
      resource: `${member.fullName || member.name || 'Member'} (${member.relationship || member.relation || 'Relative'})`,
      ipAddress: '14.139.128.9',
      status: 'success',
      metadata: { relationship: member.relationship || member.relation || 'Relative', isMinor: String(member.isMinor) },
    })

    realtimeBus.emit('FAMILY_MEMBER_ADDED', { memberId: member.id, name: member.fullName || member.name || 'Member' })
    return member
  },

  async updateDelegation(
    id: string,
    permissions: DelegatedPermission[],
    status: FamilyMember['delegationStatus'],
    delegatedUntil?: string
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const members = civicStorage.getFamilyMembers()
    const member = members.find((m) => m.id === id)
    if (!member) throw new Error('Family member not found')

    const updated = members.map((m) =>
      m.id === id
        ? {
            ...m,
            delegatedPermissions: permissions,
            delegationStatus: status,
            delegatedUntil: delegatedUntil || m.delegatedUntil,
          }
        : m
    )
    civicStorage.saveFamilyMembers(updated)

    civicStorage.addAuditEvent({
      workspace: 'citizen',
      actor: 'Rajesh K. Sharma',
      actorId: 'usr_civiqone_99182',
      role: 'CITIZEN',
      action: 'UPDATED_DELEGATED_AUTHORITY',
      resource: `${member.fullName} (${member.relationship})`,
      ipAddress: '14.139.128.9',
      status: 'success',
      metadata: { permissions: permissions.join(', '), status },
    })

    realtimeBus.emit('FAMILY_DELEGATION_UPDATED', { memberId: id, permissions, status })
  },

  async getFamilyDocuments(memberId: string): Promise<CivicDocument[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const allDocs = civicStorage.getDocuments()
    return allDocs.filter((d) => d.owner === 'family_member' && d.ownerId === memberId)
  },
}
