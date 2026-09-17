import React, { useState, useEffect } from 'react'
import { civicStorage } from '@/services/storage'
import type { CivicService } from '@/types'
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Landmark,
  Building2,
  Lock,
  Power
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

export function AdminServicesPage() {
  const [services, setServices] = useState<CivicService[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [providerFilter, setProviderFilter] = useState<'all' | 'government' | 'organization'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = civicStorage.getAllMarketplaceServices()
    setServices(data)
    setLoading(false)
  }, [])

  const handleTogglePublish = (id: string) => {
    const updated = services.map((s) => {
      if (s.id === id) {
        const next = !s.isPublished
        return { ...s, isPublished: next }
      }
      return s
    })
    setServices(updated)
    // persist
    const orgServices = updated.filter((s) => s.providerType === 'organization')
    civicStorage.saveOrgServices(orgServices)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (srv.providerName && srv.providerName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesProvider =
      providerFilter === 'all' || srv.providerType === providerFilter
    return matchesSearch && matchesProvider
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600" />
            Global Civic Services Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Omnichannel catalog spanning statutory government public services and verified private partner civic schemes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search global services by title, provider, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value as any)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Provider Types</option>
          <option value="government">🏛️ Government Statutory</option>
          <option value="organization">🏢 Verified Organizations</option>
        </select>
      </div>

      {/* Services Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Provider Type & Entity</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Statutory Turnaround</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Marketplace Status</TableHead>
              <TableHead className="text-right">Governance Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((srv) => (
              <TableRow key={srv.id}>
                <TableCell>
                  <div>
                    <span className="font-semibold text-foreground text-sm block">
                      {srv.title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {srv.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {srv.providerType === 'government' ? (
                      <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    )}
                    <span className="text-xs font-medium text-foreground">
                      {srv.providerName || srv.department}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-xs">
                    {srv.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-foreground">
                    {srv.processingTimeDays ? `${srv.processingTimeDays} Days` : srv.processingTime}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-foreground">
                    {(srv.fees ?? srv.governmentFee) === 0 ? 'Free' : `₹${srv.fees ?? srv.governmentFee}`}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={srv.isPublished !== false ? 'success' : 'secondary'}
                    className="text-[11px]"
                  >
                    {srv.isPublished !== false ? 'Published' : 'Hidden'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {srv.providerType === 'organization' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublish(srv.id)}
                      className={`h-7 text-xs ${
                        srv.isPublished !== false
                          ? 'text-rose-600 border-rose-500/30 hover:bg-rose-500/10'
                          : 'text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10'
                      }`}
                    >
                      <Power className="w-3 h-3 mr-1" />
                      {srv.isPublished !== false ? 'Take Offline' : 'Publish'}
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Statutory Gazette
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
