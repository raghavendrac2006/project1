import React, { useState, useEffect } from 'react'
import { auditService } from '@/services/audit.service'
import type { AuditEvent } from '@/types'
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileCheck2,
  Lock
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

export function GovernmentAuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await auditService.getEventsByWorkspace('government')
      setEvents(data)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const filteredEvents = events.filter((e) => {
    return (
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resource.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            Sovereign Official Audit Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tamper-evident statutory record of all departmental actions, endorsements, and identity verifications.
          </p>
        </div>

        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 text-xs">
          <Lock className="w-3.5 h-3.5 mr-1" />
          SHA-256 Ledger Immutability Active
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter audit events by action, officer, or case file..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Events Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Official / Actor</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Resource</TableHead>
              <TableHead>Secure Node IP</TableHead>
              <TableHead className="text-right">Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((evt) => (
              <TableRow key={evt.id}>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {new Date(evt.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium text-foreground text-sm">
                  {evt.actor}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    {evt.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {evt.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {evt.resource}
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
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
