import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, ShieldCheck, Lock, Eye, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import type { AccessGrant } from '@/types'

export function OrganizationCitizensPage() {
  const navigate = useNavigate()
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setGrants(civicStorage.getAccessGrants())
  }, [])

  const filtered = grants.filter(
    (g) =>
      g.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Authorized Citizens Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Citizens who have granted active, expiring, or historical data access to your organization.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by citizen name or purpose..."
          className="pl-9 h-9 text-xs"
        />
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citizen Name</TableHead>
                <TableHead>Authorization Scope</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Grant Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((grant) => (
                <TableRow key={grant.id}>
                  <TableCell className="text-xs font-bold text-foreground">
                    {grant.citizenName}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="font-mono text-primary font-semibold">{grant.authorizedFields.length} Fields</span> authorized
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {grant.serviceName || grant.purpose}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${
                        grant.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : grant.status === 'expiring_soon'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      }`}
                    >
                      {grant.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(grant.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.ORGANIZATION.CITIZEN_DETAIL(grant.citizenId))}
                      className="text-xs h-7 px-3 text-primary hover:bg-primary/5 gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Inspect Profile
                    </Button>
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
