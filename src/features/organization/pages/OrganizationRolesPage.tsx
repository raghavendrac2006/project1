import React from 'react'
import { Sliders, ShieldCheck, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table'

export function OrganizationRolesPage() {
  const permissions = [
    { key: 'SERVICES_VIEW', label: 'View Service Catalog' },
    { key: 'SERVICES_CREATE', label: 'Create Draft Services' },
    { key: 'SERVICES_PUBLISH', label: 'Publish to Citizen Marketplace' },
    { key: 'APPLICATIONS_VIEW', label: 'Inspect Application Dossiers' },
    { key: 'APPLICATIONS_PROCESS', label: 'Approve / Reject Determinations' },
    { key: 'CITIZEN_VIEW_AUTHORIZED', label: 'View Consented Citizen Attributes' },
    { key: 'CITIZEN_ACCESS_REQUEST', label: 'Dispatch Data Consent Requests' },
    { key: 'MEMBERS_MANAGE', label: 'Manage Team Roles & Access' },
    { key: 'ANALYTICS_VIEW', label: 'View Operational Analytics' },
    { key: 'AUDIT_LOG_VIEW', label: 'Inspect Security Audit Log' },
  ]

  const roles = [
    {
      name: 'OWNER / ADMIN',
      perms: ['SERVICES_VIEW', 'SERVICES_CREATE', 'SERVICES_PUBLISH', 'APPLICATIONS_VIEW', 'APPLICATIONS_PROCESS', 'CITIZEN_VIEW_AUTHORIZED', 'CITIZEN_ACCESS_REQUEST', 'MEMBERS_MANAGE', 'ANALYTICS_VIEW', 'AUDIT_LOG_VIEW'],
    },
    {
      name: 'SERVICE_MANAGER',
      perms: ['SERVICES_VIEW', 'SERVICES_CREATE', 'SERVICES_PUBLISH', 'APPLICATIONS_VIEW', 'ANALYTICS_VIEW'],
    },
    {
      name: 'VERIFICATION_OFFICER',
      perms: ['APPLICATIONS_VIEW', 'APPLICATIONS_PROCESS', 'CITIZEN_VIEW_AUTHORIZED', 'CITIZEN_ACCESS_REQUEST', 'AUDIT_LOG_VIEW'],
    },
    {
      name: 'ANALYST',
      perms: ['SERVICES_VIEW', 'APPLICATIONS_VIEW', 'ANALYTICS_VIEW', 'AUDIT_LOG_VIEW'],
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Roles & Permissions Matrix
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Role-Based Access Control (RBAC) governance governing organization staff capabilities.
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Permission Scope</TableHead>
                {roles.map((r) => (
                  <TableHead key={r.name} className="text-center">{r.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="text-xs font-semibold text-foreground">
                    <div>{p.label}</div>
                    <span className="text-[10px] font-mono text-muted-foreground">{p.key}</span>
                  </TableCell>
                  {roles.map((r) => {
                    const has = r.perms.includes(p.key)
                    return (
                      <TableCell key={r.name} className="text-center">
                        {has ? (
                          <span className="inline-flex h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 rounded-full bg-muted text-muted-foreground items-center justify-center mx-auto opacity-40">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
