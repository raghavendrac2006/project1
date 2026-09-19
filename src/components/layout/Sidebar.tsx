import { useState, useEffect, useMemo } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Shield,
  FileText,
  Briefcase,
  Layers,
  CreditCard,
  Bot,
  Bell,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Lock,
  Zap,
  Users,
  KeyRound,
  Sparkles,
  Database,
  Compass,
  LifeBuoy,
  Cloud,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks'
import { actionService } from '@/services/action.service'
import { realtimeBus } from '@/services/eventBus'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth()
  const [pendingActionsCount, setPendingActionsCount] = useState(0)

  useEffect(() => {
    actionService.getPendingCount().then(setPendingActionsCount)

    const unsubscribe = realtimeBus.subscribe('CITIZEN_ACTION_COMPLETED', () => {
      actionService.getPendingCount().then(setPendingActionsCount)
    })

    const handleStorage = () => {
      actionService.getPendingCount().then(setPendingActionsCount)
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      unsubscribe()
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', path: ROUTES.APP.DASHBOARD, icon: LayoutDashboard },
      {
        label: 'Action Center',
        path: ROUTES.APP.ACTIONS,
        icon: Zap,
        badge: pendingActionsCount > 0 ? pendingActionsCount : undefined,
      },
      { label: 'Civic Identity', path: ROUTES.APP.IDENTITY, icon: Shield },
      { label: 'Family Hub', path: ROUTES.APP.FAMILY, icon: Users },
      { label: 'Document Vault', path: ROUTES.APP.DOCUMENTS, icon: FileText },
      { label: 'Civic Services', path: ROUTES.APP.SERVICES, icon: Briefcase },
      { label: 'Applications', path: ROUTES.APP.APPLICATIONS, icon: Layers },
      { label: 'Government Benefits', path: ROUTES.APP.BENEFITS, icon: Sparkles },
      { label: 'Data Footprint', path: ROUTES.APP.DATA_DASHBOARD, icon: Database },
      { label: 'Civic Journey', path: ROUTES.APP.JOURNEY, icon: Compass },
      { label: 'Privacy & Consent', path: ROUTES.APP.PRIVACY, icon: Lock },
      { label: 'Security Center', path: ROUTES.APP.SECURITY, icon: KeyRound },
      { label: 'Civic Payments', path: ROUTES.APP.PAYMENTS, icon: CreditCard },
      { label: 'CiviqOne AI', path: ROUTES.APP.ASSISTANT, icon: Bot, isHighlighted: true },
      { label: 'Customer Care', path: ROUTES.APP.SUPPORT, icon: LifeBuoy },
      { label: 'Notifications', path: ROUTES.APP.NOTIFICATIONS, icon: Bell },
      { label: 'Settings', path: ROUTES.APP.SETTINGS, icon: Settings },
    ],
    [pendingActionsCount]
  )

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out select-none z-30 h-screen sticky top-0 gpu-accelerated',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        'flex h-16 items-center border-b border-border/80 transition-all select-none',
        collapsed ? 'justify-center px-2 relative' : 'justify-between px-4'
      )}>
        <Link to={ROUTES.ROOT} className={cn('flex items-center group', collapsed ? 'justify-center' : 'gap-3 overflow-hidden')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 dark:bg-card/95 p-1 border border-border/70 shadow-sm group-hover:scale-105 transition-transform">
            <img src="/civiqone-icon.png" alt="CiviQone" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display text-base font-black tracking-tight text-foreground block leading-none">
                Civi<span className="text-[#E11D48]">Q</span>one
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground tracking-wide mt-1 truncate">
                Citizens for a Better Tomorrow
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
                    ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed ? 'justify-center px-2' : 'gap-3'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                      isActive ? 'text-primary-foreground' : item.isHighlighted ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {item.badge !== undefined && !collapsed && (
                    <span
                      className={cn(
                        'ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.badge !== undefined && collapsed && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-card" />
                  )}
                  {item.isHighlighted && !isActive && !collapsed && !item.badge && (
                    <span className="ml-auto text-[9px] font-extrabold tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 uppercase">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Citizen Sovereign Badge Footer */}
      <div className="p-3 border-t border-border/80">
        <div
          className={cn(
            'flex items-center rounded-xl border border-emerald-500/25 bg-emerald-500/5 transition-all',
            collapsed ? 'p-2 justify-center' : 'p-3 gap-2.5'
          )}
        >
          <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-foreground truncate">
                {user?.name || 'Citizen Verified'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                Level 3 Biometric ID
              </span>
            </div>
          )}
        </div>

        {/* AWS Cloud Credits Infrastructure Badge */}
        {!collapsed ? (
          <div className="mt-2.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Cloud className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-medium text-foreground/80">AWS Cloud Credits</span>
            </div>
            <span className="px-1.5 py-0.5 font-mono text-[9px] font-bold rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
        ) : (
          <div className="mt-2 flex justify-center" title="Powered by AWS Cloud Credits">
            <Cloud className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>
    </aside>
  )
}
