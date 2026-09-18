import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileText,
  Briefcase,
  Layers,
  User,
  Settings,
  Bot,
  CreditCard,
  Bell,
  Sparkles,
  ShieldCheck,
  Lock,
  Building2,
  Users,
  BarChart3,
  Landmark,
  CheckCircle2,
  Sliders,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import type { WorkspaceType } from '@/types'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace?: WorkspaceType
}

export function CommandPalette({ open, onOpenChange, workspace = 'citizen' }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (workspace === 'organization') {
      const orgNav = [
        { id: 'org-dash', title: 'Operational Dashboard', category: 'Navigation', icon: <Layers className="w-4 h-4" />, url: ROUTES.ORGANIZATION.DASHBOARD },
        { id: 'org-srv', title: 'Services Management', category: 'Navigation', icon: <Briefcase className="w-4 h-4" />, url: ROUTES.ORGANIZATION.SERVICES },
        { id: 'org-app', title: 'Application Processing', category: 'Navigation', icon: <FileText className="w-4 h-4" />, url: ROUTES.ORGANIZATION.APPLICATIONS },
        { id: 'org-req', title: 'Citizen Data Access Requests', category: 'Navigation', icon: <Lock className="w-4 h-4" />, url: ROUTES.ORGANIZATION.ACCESS_REQUESTS },
        { id: 'org-ctz', title: 'Authorized Citizens Directory', category: 'Navigation', icon: <Users className="w-4 h-4" />, url: ROUTES.ORGANIZATION.CITIZENS },
        { id: 'org-mem', title: 'Team Members & Access', category: 'Navigation', icon: <Users className="w-4 h-4" />, url: ROUTES.ORGANIZATION.MEMBERS },
        { id: 'org-rol', title: 'Roles & Permissions Matrix', category: 'Navigation', icon: <Sliders className="w-4 h-4" />, url: ROUTES.ORGANIZATION.ROLES },
        { id: 'org-ana', title: 'Operational Analytics', category: 'Navigation', icon: <BarChart3 className="w-4 h-4" />, url: ROUTES.ORGANIZATION.ANALYTICS },
        { id: 'org-aud', title: 'Security Audit Log', category: 'Navigation', icon: <ShieldCheck className="w-4 h-4" />, url: ROUTES.ORGANIZATION.AUDIT_LOG },
        { id: 'org-set', title: 'Organization Settings', category: 'Navigation', icon: <Settings className="w-4 h-4" />, url: ROUTES.ORGANIZATION.SETTINGS },
      ]

      const orgServices = civicStorage.getOrgServices().map((s) => ({
        id: `org-srv-${s.id}`,
        title: s.title,
        category: 'Services',
        description: `${s.isPublished ? 'Published' : 'Draft'} • ${s.processingTime}`,
        icon: <Briefcase className="w-4 h-4 text-blue-500" />,
        url: ROUTES.ORGANIZATION.SERVICES,
      }))

      const orgRequests = civicStorage.getConsentRequests().map((r) => ({
        id: `org-req-${r.id}`,
        title: `Access Request: ${r.citizenName}`,
        category: 'Access Requests',
        description: `${r.purpose} • Status: ${r.status.toUpperCase()}`,
        icon: <Lock className="w-4 h-4 text-amber-500" />,
        url: ROUTES.ORGANIZATION.ACCESS_REQUESTS,
      }))

      const all = [...orgNav, ...orgServices, ...orgRequests]
      if (!q) return all.slice(0, 8)
      return all
        .filter((item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))
        .slice(0, 10)
    }

    if (workspace === 'government') {
      const govNav = [
        { id: 'gov-dash', title: 'Department Dashboard', category: 'Navigation', icon: <Layers className="w-4 h-4" />, url: ROUTES.GOVERNMENT.DASHBOARD },
        { id: 'gov-srv', title: 'Civic Scheme & Services Catalog', category: 'Navigation', icon: <Briefcase className="w-4 h-4" />, url: ROUTES.GOVERNMENT.SERVICES },
        { id: 'gov-app', title: 'Application Processing Ledger', category: 'Navigation', icon: <FileText className="w-4 h-4" />, url: ROUTES.GOVERNMENT.APPLICATIONS },
        { id: 'gov-ver', title: 'Biometric & Document Verification Queue', category: 'Navigation', icon: <CheckCircle2 className="w-4 h-4" />, url: ROUTES.GOVERNMENT.VERIFICATION },
        { id: 'gov-ctz', title: 'Citizen Case Records', category: 'Navigation', icon: <Users className="w-4 h-4" />, url: ROUTES.GOVERNMENT.CITIZENS },
        { id: 'gov-rep', title: 'Departmental Pendency Reports', category: 'Navigation', icon: <BarChart3 className="w-4 h-4" />, url: ROUTES.GOVERNMENT.REPORTS },
        { id: 'gov-aud', title: 'Official Government Audit Ledger', category: 'Navigation', icon: <ShieldCheck className="w-4 h-4" />, url: ROUTES.GOVERNMENT.AUDIT_LOG },
        { id: 'gov-set', title: 'Department Configuration', category: 'Navigation', icon: <Settings className="w-4 h-4" />, url: ROUTES.GOVERNMENT.SETTINGS },
      ]

      const govServices = civicStorage.getServices().map((s) => ({
        id: `gov-srv-${s.id}`,
        title: s.title,
        category: 'Schemes',
        description: `${s.department} • ₹${s.governmentFee}`,
        icon: <Landmark className="w-4 h-4 text-emerald-500" />,
        url: ROUTES.GOVERNMENT.SERVICES,
      }))

      const all = [...govNav, ...govServices]
      if (!q) return all.slice(0, 8)
      return all
        .filter((item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))
        .slice(0, 10)
    }

    if (workspace === 'admin') {
      const adminNav = [
        { id: 'adm-dash', title: 'System Telemetry Dashboard', category: 'Navigation', icon: <Layers className="w-4 h-4" />, url: ROUTES.ADMIN.DASHBOARD },
        { id: 'adm-usr', title: 'User & Citizen Directory', category: 'Navigation', icon: <Users className="w-4 h-4" />, url: ROUTES.ADMIN.USERS },
        { id: 'adm-org', title: 'Partner Organizations & Vetting', category: 'Navigation', icon: <Building2 className="w-4 h-4" />, url: ROUTES.ADMIN.ORGANIZATIONS },
        { id: 'adm-gov', title: 'Government Department Integrations', category: 'Navigation', icon: <Landmark className="w-4 h-4" />, url: ROUTES.ADMIN.GOVERNMENT },
        { id: 'adm-srv', title: 'Ecosystem Master Services', category: 'Navigation', icon: <Briefcase className="w-4 h-4" />, url: ROUTES.ADMIN.SERVICES },
        { id: 'adm-aud', title: 'Global Platform Security Audit', category: 'Navigation', icon: <ShieldCheck className="w-4 h-4" />, url: ROUTES.ADMIN.AUDIT },
        { id: 'adm-set', title: 'Platform Security Settings', category: 'Navigation', icon: <Settings className="w-4 h-4" />, url: ROUTES.ADMIN.SETTINGS },
      ]

      const all = [...adminNav]
      if (!q) return all.slice(0, 8)
      return all
        .filter((item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))
        .slice(0, 10)
    }

    // Default: Citizen Workspace (Strictly isolated from internal portals!)
    const citizenNav = [
      { id: 'nav-dash', title: 'Dashboard', category: 'Navigation', icon: <Layers className="w-4 h-4" />, url: ROUTES.APP.DASHBOARD },
      { id: 'nav-id', title: 'Civic Identity & Smart Card', category: 'Navigation', icon: <User className="w-4 h-4" />, url: ROUTES.APP.IDENTITY },
      { id: 'nav-docs', title: 'Document Vault', category: 'Navigation', icon: <FileText className="w-4 h-4" />, url: ROUTES.APP.DOCUMENTS },
      { id: 'nav-srv', title: 'Civic Services Directory', category: 'Navigation', icon: <Briefcase className="w-4 h-4" />, url: ROUTES.APP.SERVICES },
      { id: 'nav-app', title: 'Applications Tracker', category: 'Navigation', icon: <Layers className="w-4 h-4" />, url: ROUTES.APP.APPLICATIONS },
      { id: 'nav-prv', title: 'Privacy & Data Consent Center', category: 'Navigation', icon: <Lock className="w-4 h-4" />, url: ROUTES.APP.PRIVACY },
      { id: 'nav-ai', title: 'CiviqOne AI Assistant', category: 'Navigation', icon: <Bot className="w-4 h-4" />, url: ROUTES.APP.ASSISTANT },
      { id: 'nav-pay', title: 'Civic Payments & Dues', category: 'Navigation', icon: <CreditCard className="w-4 h-4" />, url: ROUTES.APP.PAYMENTS },
      { id: 'nav-notif', title: 'Notification Center', category: 'Navigation', icon: <Bell className="w-4 h-4" />, url: ROUTES.APP.NOTIFICATIONS },
      { id: 'nav-set', title: 'Security & Account Settings', category: 'Navigation', icon: <Settings className="w-4 h-4" />, url: ROUTES.APP.SETTINGS },
    ]

    const serviceItems = civicStorage.getAllMarketplaceServices().map((s) => ({
      id: `srv-${s.id}`,
      title: s.title,
      category: s.providerType === 'organization' ? 'Private Services' : 'Government Services',
      description: `${s.providerName || s.department} • ${s.processingTime}`,
      icon: <Briefcase className="w-4 h-4 text-blue-500" />,
      url: ROUTES.APP.SERVICES,
    }))

    const docItems = civicStorage.getDocuments().map((d) => ({
      id: `doc-${d.id}`,
      title: d.title,
      category: 'Documents',
      description: `${d.issuer} • ${d.fileType}`,
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      url: ROUTES.APP.DOCUMENTS,
    }))

    const appItems = civicStorage.getApplications().map((a) => ({
      id: `app-${a.id}`,
      title: `${a.serviceName} (${a.applicationNumber})`,
      category: 'Applications',
      description: `Status: ${a.status.replace('_', ' ').toUpperCase()}`,
      icon: <Layers className="w-4 h-4 text-purple-500" />,
      url: `/app/applications/${a.id}`,
    }))

    const all = [...citizenNav, ...serviceItems, ...docItems, ...appItems]
    if (!q) return all.slice(0, 8)

    return all
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          ('description' in item && item.description?.toLowerCase().includes(q))
      )
      .slice(0, 10)
  }, [query, workspace])

  const handleSelect = (url: string) => {
    onOpenChange(false)
    setQuery('')
    navigate(url)
  }

  const getPlaceholder = () => {
    switch (workspace) {
      case 'organization':
        return 'Search applications, services, access requests, members...'
      case 'government':
        return 'Search citizen cases, official schemes, verification queue...'
      case 'admin':
        return 'Search platform metrics, organizations, departments, users...'
      default:
        return 'Search services, documents, applications...'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden rounded-2xl border-border bg-card shadow-2xl">
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className="h-14 w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground border border-border rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No matching records found in this workspace.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm hover:bg-muted/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-card shrink-0 transition-colors">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-foreground truncate">{item.title}</p>
                      {'description' in item && item.description && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 text-[11px] text-muted-foreground border-t border-border">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {workspace.toUpperCase()} Workspace Central Index
          </span>
          <span className="flex items-center gap-2">
            <span>Use ↑↓ to navigate</span>
            <span>↵ to select</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
