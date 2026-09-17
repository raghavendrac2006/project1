import React from 'react'
import { NavLink } from 'react-router-dom'
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
      <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-purple-950/40 border border-purple-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                CIVIQONE
              </span>
              <span className="text-[10px] font-mono text-purple-400 font-semibold tracking-wider uppercase block">
                Super Admin Console
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600 flex items-center justify-center text-white shadow-md border border-purple-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
