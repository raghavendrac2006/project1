import React, { useState, useEffect } from 'react'
import { Users, Plus, ShieldCheck, Mail, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { organizationService } from '@/services/organization.service'
import type { OrganizationMember } from '@/types'

export function OrganizationMembersPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([])

  useEffect(() => {
    async function load() {
      const list = await organizationService.getMembers()
      setMembers(list)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Team Members & Access
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organization staff, role allocations, and verification privileges.
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.avatar} alt={m.name} />
                      <AvatarFallback>{m.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono">
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {m.lastActive}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
