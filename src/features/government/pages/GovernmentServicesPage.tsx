import React, { useState, useEffect } from 'react'
import { governmentService } from '@/services/government.service'
import type { CivicService, GovSessionData } from '@/types'
import {
  Landmark,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldAlert,
  FileText,
  ExternalLink
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

export function GovernmentServicesPage() {
  const [session, setSession] = useState<GovSessionData | null>(null)
  const [services, setServices] = useState<CivicService[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const sess = await governmentService.getSession()
      setSession(sess)
      const data = await governmentService.getServices()
      setServices(data)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === 'all' || srv.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" />
            Statutory Schemes & Civic Services
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Departmental catalog for {session.department.name} ({session.department.code}).
          </p>
        </div>

        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Gazette New Scheme
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schemes by name, department, or gazette code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Service Categories</option>
            <option value="transport">Transport & RTO</option>
            <option value="revenue">Revenue & Land Records</option>
            <option value="utilities">Civic Infrastructure & Utilities</option>
            <option value="welfare">Social Welfare & Subsidies</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheme / Service Name</TableHead>
              <TableHead>Ministry / Department</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Statutory SLA</TableHead>
              <TableHead>Official Fee</TableHead>
              <TableHead>Jurisdiction</TableHead>
              <TableHead className="text-right">Catalog Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((srv) => (
              <TableRow key={srv.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground text-sm block">
                      {srv.title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {srv.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium text-foreground">
                  {srv.department}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-xs">
                    {srv.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {srv.processingTimeDays ? `${srv.processingTimeDays} Days` : srv.processingTime}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-foreground">
                    {(srv.fees ?? srv.governmentFee) === 0 ? 'Free' : `₹${srv.fees ?? srv.governmentFee}`}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    State of Karnataka
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    Active Gazette
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
