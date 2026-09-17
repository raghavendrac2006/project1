import React, { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import type { User } from '@/types'
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  Award
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await adminService.getUsers()
      setUsers(data)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Citizen Identity & System Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global identity registry managed under National Data Protection standards.
          </p>
        </div>

        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 px-3 py-1 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Aadhaar eKYC Tier-3 Enforced
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search citizen directory by name, email, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Citizen / User Name</TableHead>
              <TableHead>Email Contact</TableHead>
              <TableHead>National ID Hash</TableHead>
              <TableHead>Verification Tier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Security Trust Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                    <div>
                      <span className="font-semibold text-foreground text-sm block">
                        {u.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Joined {u.memberSince}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell className="text-xs font-mono text-foreground">
                  {u.nationalId}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {u.verificationLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {u.city}, {u.state}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {u.securityScore}/100
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
