import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  Landmark,
  Layers,
  Users,
  FileCheck2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Cpu,
  KeyRound
} from 'lucide-react'

interface AdminSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const navItems = [
    {
      label: 'Control Console',
      to: ROUTES.ADMIN.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: 'Organizations',
      to: ROUTES.ADMIN.ORGANIZATIONS,
      icon: Building2,
      badge: 'Vetting',
    },
    {
      label: 'Government Nodes',
      to: ROUTES.ADMIN.GOVERNMENT,
      icon: Landmark,
    },
    {
      label: 'Global Services',
      to: ROUTES.ADMIN.SERVICES,
      icon: Layers,
    },
    {
      label: 'Citizen Directory',
      to: ROUTES.ADMIN.USERS,
      icon: Users,
    },
    {
      label: 'Global Audit Log',
      to: ROUTES.ADMIN.AUDIT,
      icon: Shield,
    },
    {
      label: 'Platform Settings',
      to: ROUTES.ADMIN.SETTINGS,
      icon: Settings,
    },
  ]

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-all duration-300 relative z-20 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-slate-800 transition-all select-none ${
        collapsed ? 'justify-center px-2 relative' : 'justify-between px-4'
      }`}>
        <Link to={ROUTES.ROOT} className={`flex items-center group ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-10 h-10 rounded-xl bg-white/95 p-1 border border-purple-500/30 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
            <img src="/civiqone-icon.png" alt="CiviQone" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-none font-display">
                Civi<span className="text-[#E11D48]">Q</span>one
              </span>
              <span className="text-[9.5px] font-mono text-purple-400 font-semibold tracking-wider uppercase block mt-1">
                Super Admin Console
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className={`rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center justify-center border border-slate-800 ${
            collapsed
              ? 'absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-slate-900 shadow-md z-40'
              : 'h-7 w-7 p-1.5'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Global Status Banner */}
      {!collapsed && (
        <div className="mx-4 my-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-medium">Platform Infrastructure:</span>
          <span className="text-emerald-400 font-semibold ml-auto font-mono">NOMINAL</span>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0 text-purple-400" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center justify-center font-bold text-xs">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-200 block truncate">
                Chief Administrator
              </span>
              <span className="text-[10px] text-purple-400 font-mono block">
                ROOT_PRIVILEGE
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
