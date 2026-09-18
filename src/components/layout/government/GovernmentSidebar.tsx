import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  CheckCircle2,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Landmark,
  FileCheck,
  Bell,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { civicStorage } from '@/services/storage'

interface GovernmentSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function GovernmentSidebar({ collapsed, onToggleCollapse }: GovernmentSidebarProps) {
  const session = civicStorage.getGovSession()
  const deptName = session?.department.name || 'Ministry of Road Transport & Highways'

  const navItems = [
    { label: 'Department Dashboard', path: ROUTES.GOVERNMENT.DASHBOARD, icon: LayoutDashboard },
    { label: 'Civic Schemes & Services', path: ROUTES.GOVERNMENT.SERVICES, icon: Briefcase },
    { label: 'Applications Ledger', path: ROUTES.GOVERNMENT.APPLICATIONS, icon: Layers },
    { label: 'Verification Desk', path: ROUTES.GOVERNMENT.VERIFICATION, icon: CheckCircle2 },
    { label: 'Citizen Case Records', path: ROUTES.GOVERNMENT.CITIZENS, icon: Users },
    { label: 'Official Gazettes & Docs', path: ROUTES.GOVERNMENT.DOCUMENTS, icon: FileCheck },
    { label: 'Citizen Notifications', path: ROUTES.GOVERNMENT.NOTIFICATIONS, icon: Bell },
    { label: 'Pendency & SLA Reports', path: ROUTES.GOVERNMENT.REPORTS, icon: BarChart3 },
    { label: 'Official Audit Ledger', path: ROUTES.GOVERNMENT.AUDIT_LOG, icon: ShieldCheck },
    { label: 'Department Settings', path: ROUTES.GOVERNMENT.SETTINGS, icon: Settings },
  ]

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 select-none z-30 h-screen sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-800 via-indigo-700 to-sky-600 text-white shadow-md">
            <Landmark className="h-5 w-5 fill-white/20" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display text-sm font-extrabold tracking-tight text-foreground truncate flex items-center gap-1.5">
                CiviqOne<span className="text-blue-500 font-black">GOV</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Sovereign Portal
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {navItems.map((item) => {
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
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed ? 'justify-center px-2' : 'gap-3'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Government Badge Footer */}
      <div className="p-3 border-t border-border/80">
        <div
          className={cn(
            'flex items-center rounded-xl border border-blue-500/25 bg-blue-500/5 transition-all',
            collapsed ? 'p-2 justify-center' : 'p-3 gap-2.5'
          )}
        >
          <div className="h-7 w-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
            🏛️
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-foreground truncate">
                {deptName}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                Sovereign Civic Registry
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
