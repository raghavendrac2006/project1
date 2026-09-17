import React, { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import type { Organization } from '@/types'
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Award,
  MoreVertical,
  ExternalLink,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
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

export function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const orgs = await adminService.getOrganizations()
      setOrganizations(orgs)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleUpdateStatus = async (id: string, status: Organization['verificationStatus']) => {
    await adminService.updateOrganizationStatus(id, status)
    const orgs = await adminService.getOrganizations()
    setOrganizations(orgs)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.cin && org.cin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      org.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || org.verificationStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Partner Organization Vetting & Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vet corporate entities, issue data-sharing covenants, and enforce civic compliance standards.
          </p>
        </div>

        <Button className="bg-purple-600 hover:bg-purple-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Onboard New Entity
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations by name or Corporate Identification Number (CIN)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Verification States</option>
          <option value="verified">Verified & Covenanted</option>
          <option value="pending">Pending Vetting</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Organizations Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization Name</TableHead>
              <TableHead>Type & CIN</TableHead>
              <TableHead>Official Contact</TableHead>
              <TableHead>Services Offered</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead className="text-right">Governance Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground text-sm block">
                        {org.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {org.website}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-foreground block">
                    {org.type || org.category}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {org.cin || org.registrationNumber}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {org.contactEmail}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-foreground">
                    {org.servicesCount ?? 2} Active Services
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      org.verificationStatus === 'verified'
                        ? 'success'
                        : org.verificationStatus === 'suspended'
                        ? 'destructive'
                        : 'warning'
                    }
                    className="capitalize text-[11px]"
                  >
                    {org.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {org.verificationStatus !== 'verified' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(org.id, 'verified')}
                        className="h-7 text-xs border-emerald-600/40 text-emerald-600 hover:bg-emerald-500/10"
                      >
                        Approve License
                      </Button>
                    )}
                    {org.verificationStatus !== 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(org.id, 'suspended')}
                        className="h-7 text-xs border-rose-600/40 text-rose-600 hover:bg-rose-500/10"
                      >
                        Suspend License
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
