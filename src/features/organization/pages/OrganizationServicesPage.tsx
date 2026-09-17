import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  Plus,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { organizationService } from '@/services/organization.service'
import { useToast } from '@/hooks'
import type { CivicService, ConsentField } from '@/types'

export function OrganizationServicesPage() {
  const { toast, success } = useToast()
  const [services, setServices] = useState<CivicService[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // New service form
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CivicService['category']>('taxes_finance')
  const [description, setDescription] = useState('')
  const [processingTime, setProcessingTime] = useState('3-5 Business Days')
  const [fee, setFee] = useState<number>(0)
  const [eligibility, setEligibility] = useState('Active verified citizen\nAadhaar or PAN verified')
  const [documents, setDocuments] = useState('Identity Proof\nIncome Certificate')
  const [selectedFields, setSelectedFields] = useState<ConsentField[]>(['fullName', 'dateOfBirth', 'phone'])

  const loadServices = async () => {
    const list = await organizationService.getServices()
    setServices(list)
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleTogglePublish = async (service: CivicService) => {
    const updated = await organizationService.togglePublish(service.id)
    if (updated) {
      if (updated.isPublished) {
        success('Service Published', `${service.title} is now discoverable in the Citizen Marketplace.`)
      } else {
        toast({
          title: 'Service Unpublished',
          description: `${service.title} has been withdrawn to draft state.`,
          type: 'info',
        })
      }
      await loadServices()
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    await organizationService.createService({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      department: 'Apex Health & Life Insurers',
      category,
      description,
      processingTime,
      governmentFee: Number(fee),
      eligibility: eligibility.split('\n').filter((x) => x.trim()),
      requiredDocuments: documents.split('\n').filter((x) => x.trim()),
      popular: false,
      recommended: true,
      providerType: 'organization',
      providerName: 'Apex Health & Life Insurers',
      providerId: 'org_apex_health',
      verificationBadge: 'Verified Healthcare Partner',
      isPublished: true,
      dataFieldsRequired: selectedFields,
    })

    success('Service Created', `${title} has been added to your service portfolio and published.`)
    setCreateDialogOpen(false)
    setTitle('')
    setDescription('')
    await loadServices()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Organization Services Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure programs, requirements, and publish them into the sovereign Citizen Services Marketplace.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv) => (
          <Card key={srv.id} className="flex flex-col justify-between border-border shadow-sm hover:border-emerald-500/50 transition-all">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    srv.isPublished
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  }`}
                >
                  {srv.isPublished ? '● Published to Citizens' : '○ Draft / Unpublished'}
                </Badge>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{srv.category.replace('_', ' ')}</span>
              </div>
              <CardTitle className="text-base font-bold text-foreground leading-snug">{srv.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {srv.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  SLA: <strong>{srv.processingTime}</strong>
                </span>
                <span className="flex items-center gap-1 text-foreground font-bold">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                  {srv.governmentFee === 0 ? 'Free' : `₹${srv.governmentFee}`}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Requested Citizen Fields:
                </span>
                <div className="flex flex-wrap gap-1">
                  {(srv.dataFieldsRequired || ['fullName', 'phone']).map((f) => (
                    <span key={f} className="text-[10px] bg-card border border-border px-2 py-0.5 rounded text-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(srv)}
                  className={`text-xs h-8 px-3 gap-1.5 ${
                    srv.isPublished
                      ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                      : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {srv.isPublished ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Publish Live
                    </>
                  )}
                </Button>

                <span className="text-[11px] text-muted-foreground">
                  {srv.isPublished ? 'Live in Marketplace' : 'Hidden from Citizens'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Service Dialog with Split-Screen Live Marketplace Preview */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Marketplace Studio
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground">WYSIWYG Live Preview</span>
            </div>
            <DialogTitle className="text-lg font-bold">Create & Publish Civic Service</DialogTitle>
            <DialogDescription className="text-xs">
              Configure program attributes and observe the real-time card representation rendered to citizens.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-2">
            {/* Column 1: Configuration Form */}
            <form onSubmit={handleCreateService} id="create-service-form" className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Service Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Citizen Medical Portability"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs text-foreground outline-none"
                  >
                    <option value="taxes_finance">Revenue & Finance</option>
                    <option value="transport_driving">Transport & Commute</option>
                    <option value="education_skills">Education & Skills</option>
                    <option value="welfare_schemes">Welfare & Subsidies</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Turnaround SLA</label>
                  <Input
                    value={processingTime}
                    onChange={(e) => setProcessingTime(e.target.value)}
                    placeholder="e.g. 2-3 Business Days"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Program Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of coverage and benefits..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Eligibility Criteria (one per line)</label>
                <textarea
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Required Documents (one per line)</label>
                <textarea
                  value={documents}
                  onChange={(e) => setDocuments(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground outline-none resize-none"
                />
              </div>
            </form>

            {/* Column 2: Live Marketplace Card Preview */}
            <div className="flex flex-col justify-between border-l border-border/70 pl-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-primary" /> Live Citizen Card Preview
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                    60fps Synchronized
                  </Badge>
                </div>

                {/* Card Preview Container */}
                <div className="p-5 rounded-2xl border-2 border-primary/30 bg-card shadow-md space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold gap-1"
                    >
                      <Briefcase className="w-3 h-3" />
                      Private Service • Verified Partner
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">PROV-ORG-99</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {title.trim() || 'Service Title Preview'}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      Apex Health & Life Insurers
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {description.trim() || 'Your service description entered on the left will immediately render here exactly as citizens will view it.'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/60">
                    <span className="truncate">
                      Upfront Data: {documents.split('\n').filter((x) => x.trim()).length} credentials required
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600">Encrypted</span>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      {processingTime}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-foreground">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                      Free
                    </span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs pointer-events-none opacity-80">
                      Details & Eligibility
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1 text-xs font-bold pointer-events-none opacity-80">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-service-form"
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Publish to Citizen Marketplace
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
