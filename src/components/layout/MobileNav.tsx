import { NavLink } from 'react-router-dom'
import {
  X,
  Shield,
  LayoutDashboard,
  FileText,
  Briefcase,
  Layers,
  CreditCard,
  Bot,
  Bell,
  Settings,
  ShieldCheck,
  Lock,
  Zap,
  Users,
  KeyRound,
  Sparkles,
  Database,
  Compass,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { user } = useAuth()

  const navItems = [
    { label: 'Dashboard', path: ROUTES.APP.DASHBOARD, icon: LayoutDashboard },
    { label: 'Action Center', path: ROUTES.APP.ACTIONS, icon: Zap },
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
    { label: 'CIVIQONE AI', path: ROUTES.APP.ASSISTANT, icon: Bot, isHighlighted: true },
    { label: 'Notifications', path: ROUTES.APP.NOTIFICATIONS, icon: Bell },
    { label: 'Settings', path: ROUTES.APP.SETTINGS, icon: Settings },
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col justify-between p-4 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white shadow-md">
                <Shield className="h-5 w-5 fill-white/20" />
              </div>
              <div>
                <span className="font-display text-base font-extrabold text-foreground">
                  CIVIQ<span className="text-primary">ONE</span>
                </span>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Civic OS Mobile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                  {item.isHighlighted && (
                    <span className="ml-auto text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      AI
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Card footer */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/60">
            <div className="h-9 w-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Citizen'}</p>
              <p className="text-[10px] text-emerald-500 font-semibold">Verified Citizen ID</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
