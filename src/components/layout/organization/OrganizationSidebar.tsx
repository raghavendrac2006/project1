import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Lock,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sliders,
  FileCheck,
  ShieldAlert,
  FileText,
  ClipboardCheck,
  BrainCircuit,
  Star,
  Cpu,
  Code,
  Scale,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { civicStorage } from '@/services/storage'

interface OrganizationSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { label: 'Operational Dashboard', path: ROUTES.ORGANIZATION.DASHBOARD, icon: LayoutDashboard },
      { label: 'Service Management', path: ROUTES.ORGANIZATION.SERVICES, icon: Briefcase },
      { label: 'Applications Queue', path: ROUTES.ORGANIZATION.APPLICATIONS, icon: Layers },
      { label: 'Data Access Requests', path: ROUTES.ORGANIZATION.ACCESS_REQUESTS, icon: Lock },
      { label: 'Authorized Citizens', path: ROUTES.ORGANIZATION.CITIZENS, icon: Users },
      { label: 'Verified Documents', path: ROUTES.ORGANIZATION.DOCUMENTS, icon: FileCheck },
    ],
  },
  {
    title: 'Intelligence & Governance',
    items: [
      { label: 'Zero-Knowledge Studio', path: ROUTES.ORGANIZATION.ZKP_STUDIO, icon: Cpu },
      { label: 'DPDP Compliance & Purge', path: ROUTES.ORGANIZATION.COMPLIANCE, icon: Scale },
      { label: 'Trust Center', path: ROUTES.ORGANIZATION.TRUST, icon: Star },
      { label: 'Policy Engine', path: ROUTES.ORGANIZATION.POLICIES, icon: FileText },
      { label: 'Consent Receipts', path: ROUTES.ORGANIZATION.RECEIPTS, icon: ClipboardCheck },
      { label: 'Operational Intelligence', path: ROUTES.ORGANIZATION.INTELLIGENCE, icon: BrainCircuit },
      { label: 'Security Events', path: ROUTES.ORGANIZATION.SECURITY_EVENTS, icon: ShieldAlert },
    ],
  },
  {
    title: 'Developers & Governance',
    items: [
      { label: 'Developer & Webhooks', path: ROUTES.ORGANIZATION.DEVELOPERS, icon: Code },
      { label: 'Team Members', path: ROUTES.ORGANIZATION.MEMBERS, icon: Users },
      { label: 'Roles & Permissions', path: ROUTES.ORGANIZATION.ROLES, icon: Sliders },
      { label: 'Operational Analytics', path: ROUTES.ORGANIZATION.ANALYTICS, icon: BarChart3 },
      { label: 'Security Audit Log', path: ROUTES.ORGANIZATION.AUDIT_LOG, icon: ShieldCheck },
    ],
  },
  {
    title: 'Organization',
    items: [
      { label: 'Organization Settings', path: ROUTES.ORGANIZATION.SETTINGS, icon: Settings },
    ],
  },
]

export function OrganizationSidebar({ collapsed, onToggleCollapse }: OrganizationSidebarProps) {
  const session = civicStorage.getOrgSession()
  const orgName = session?.organization.name || 'Apex Health & Life Insurers'

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 select-none z-30 h-screen sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        'flex h-16 items-center border-b border-border/80 shrink-0 transition-all select-none',
        collapsed ? 'justify-center px-2 relative' : 'justify-between px-4'
      )}>
        <Link to={ROUTES.ROOT} className={cn('flex items-center group', collapsed ? 'justify-center' : 'gap-3 overflow-hidden')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 dark:bg-card/95 p-1 border border-emerald-500/25 shadow-sm group-hover:scale-105 transition-transform">
            <img src="/civiqone-icon.png" alt="CiviQone" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display text-sm font-black tracking-tight text-foreground truncate flex items-center leading-none">
                <span>Civi<span className="text-[#E11D48]">Q</span>one</span>
                <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ml-1.5">ORG</span>
              </span>
              <span className="text-[9.5px] font-semibold text-muted-foreground uppercase tracking-wider truncate mt-1">
                Organization Portal
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className={cn(
            'rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors',
            collapsed
              ? 'absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-card shadow-md z-40'
              : 'h-7 w-7'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {/* Section label — hide when collapsed */}
            {!collapsed && (
              <p className="px-2 mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 relative',
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-bold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed ? 'justify-center px-2' : 'gap-3'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105',
                            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Organization Badge Footer */}
      <div className="p-3 border-t border-border/80 shrink-0">
        <div
          className={cn(
            'flex items-center rounded-xl border border-emerald-500/25 bg-emerald-500/5 transition-all',
            collapsed ? 'p-2 justify-center' : 'p-3 gap-2.5'
          )}
        >
          <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
            🏢
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-foreground truncate">
                {orgName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                Verified Civic Partner
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
