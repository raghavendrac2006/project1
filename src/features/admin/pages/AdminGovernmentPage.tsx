import React, { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import type { GovernmentDepartment } from '@/types'
import {
  Landmark,
  Search,
  CheckCircle2,
  Server,
  Building,
  Key,
  Plus,
  Activity,
  Cpu
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

export function AdminGovernmentPage() {
  const [departments, setDepartments] = useState<GovernmentDepartment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await adminService.getDepartments()
      setDepartments(data)
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

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="w-6 h-6 text-purple-600" />
            Government Department Nodes & Gateways
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sovereign public sector connectors, ministry API integrations, and statutory gazette nodes.
          </p>
        </div>

        <Button className="bg-purple-600 hover:bg-purple-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Link New Department Gateway
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search department by name or official code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <div
            key={dept.id}
            className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-[10px] bg-muted">
                  {dept.code}
                </Badge>
                <Badge variant="success" className="text-[10px]">
                  Online & Linked
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {dept.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Jurisdiction: State of Karnataka (E-Governance Division)
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nodal Officer:</span>
                  <span className="font-semibold text-foreground">{dept.nodalOfficer || dept.contactOfficer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway Protocol:</span>
                  <span className="font-mono text-foreground">NeSDA-REST/mTLS</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                Latency: 14ms
              </span>
              <Button size="sm" variant="outline" className="h-7 text-xs border-purple-600/30 text-purple-600 dark:text-purple-400">
                Ping Node
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
