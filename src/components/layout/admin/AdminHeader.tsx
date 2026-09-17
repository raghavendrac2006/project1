import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/services/admin.service'
import type { AdminSessionData } from '@/services/storage'
import { ROUTES } from '@/constants/routes'
import {
  Menu,
  Search,
  LogOut,
  ShieldAlert,
  Bell,
  Sun,
  Moon,
  Activity,
  Server
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/hooks'

interface AdminHeaderProps {
  onToggleMobileMenu: () => void
  onOpenCommandPalette: () => void
}

export function AdminHeader({
  onToggleMobileMenu,
  onOpenCommandPalette,
}: AdminHeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [session, setSession] = useState<AdminSessionData | null>(null)

  useEffect(() => {
    async function loadSession() {
      const data = await adminService.getSession()
      setSession(data)
    }
    loadSession()
  }, [])

  const handleLogout = async () => {
    await adminService.logout()
    navigate(ROUTES.ADMIN.LOGIN)
  }

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left items: Mobile toggle + Quick search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Command Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs text-muted-foreground transition-colors w-48 sm:w-64"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Root search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Node status badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
          <Server className="w-3.5 h-3.5" />
          <span>Root Node 01</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Admin profile & Logout */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-foreground block">
              {session?.user.name || 'Chief Administrator'}
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold block">
              SUPER_ADMIN
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 px-2.5 h-8"
            title="Lock Console & Logout"
          >
            <LogOut className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Lock Console</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
