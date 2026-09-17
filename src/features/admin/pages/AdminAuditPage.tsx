import React, { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import type { AuditEvent } from '@/types'
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Download,
  Layers
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

export function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [workspaceFilter, setWorkspaceFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await adminService.getAuditStream()
      setEvents(data)
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

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesWorkspace =
      workspaceFilter === 'all' || e.workspace === workspaceFilter
    return matchesSearch && matchesWorkspace
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            Global Cross-Portal Security & Consent Audit Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete cryptographic audit trail of every login, consent grant, data access, and departmental endorsement across all workspaces.
          </p>
        </div>

        <Button variant="outline" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export Ledger (JSON-LD)
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search audit log by action, actor, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={workspaceFilter}
          onChange={(e) => setWorkspaceFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Workspaces</option>
          <option value="citizen">Citizen Portal</option>
          <option value="organization">Organization Portal</option>
          <option value="government">Government Portal</option>
          <option value="admin">Super Admin Console</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Portal Workspace</TableHead>
              <TableHead>Actor / User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action Logged</TableHead>
              <TableHead>Resource Target</TableHead>
              <TableHead>Client IP</TableHead>
              <TableHead className="text-right">Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((evt) => (
              <TableRow key={evt.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(evt.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {evt.workspace}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground text-sm">
                  {evt.actor}
                </TableCell>
                <TableCell className="text-[10px] font-mono text-muted-foreground">
                  {evt.role}
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {evt.action}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {evt.resource}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {evt.ipAddress}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={evt.status === 'success' ? 'success' : 'destructive'}
                    className="capitalize text-[11px]"
                  >
                    {evt.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
