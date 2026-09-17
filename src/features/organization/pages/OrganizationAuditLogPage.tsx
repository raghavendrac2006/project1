import React, { useState, useEffect } from 'react'
import { ShieldCheck, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { auditService } from '@/services/audit.service'
import type { AuditEvent } from '@/types'

export function OrganizationAuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function load() {
      const list = await auditService.getEventsByWorkspace('organization')
      setEvents(list)
    }
    load()
  }, [])

  const filtered = events.filter(
    (e) =>
      e.actor.toLowerCase().includes(query.toLowerCase()) ||
      e.action.toLowerCase().includes(query.toLowerCase()) ||
      e.resource.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Security & Access Audit Log
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Immutable forensic log of all staff profile queries, determinations, and consent operations.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by actor, action, or resource..."
          className="pl-9 h-9 text-xs"
        />
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor & Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>Origin IP</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-foreground">
                    <div>{e.actor}</div>
                    <span className="text-[10px] text-muted-foreground font-mono">{e.role}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-primary font-semibold">
                    {e.action}
                  </TableCell>
                  <TableCell className="text-xs text-foreground max-w-xs truncate">
                    {e.resource}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {e.ipAddress}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      {e.status}
                    </Badge>
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
