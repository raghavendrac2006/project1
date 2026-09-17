import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Moon,
  Sun,
  LogOut,
  Building2,
  ShieldCheck,
  Bell,
} from 'lucide-react'
import { useTheme } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { civicStorage } from '@/services/storage'
import { organizationService } from '@/services/organization.service'

interface OrganizationHeaderProps {
  onToggleMobileMenu: () => void
  onOpenCommandPalette: () => void
}

export function OrganizationHeader({ onToggleMobileMenu, onOpenCommandPalette }: OrganizationHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const session = civicStorage.getOrgSession()

  const handleLogout = async () => {
    await organizationService.logout()
    navigate(ROUTES.ORGANIZATION.LOGIN)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 sm:px-6 transition-colors">
      {/* Left: Mobile hamburger & Search trigger */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </Button>

        {/* Global Search Bar scoped to Organization assets */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 h-10 w-48 sm:w-72 lg:w-96 px-3.5 rounded-xl border border-input bg-muted/40 hover:bg-muted/70 text-xs text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring group"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="truncate">Search apps, citizens, access requests...</span>
          <span className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border/80 rounded text-muted-foreground">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: Controls & Member Profile */}
      <div className="flex items-center gap-2">
        {/* Workspace Identifier Badge */}
        <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 px-2.5 py-1 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
          <Building2 className="w-3.5 h-3.5" />
          <span>{session?.organization.name || 'Organization Workspace'}</span>
        </Badge>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </Button>

        <div className="h-5 w-px bg-border/80 mx-1 hidden sm:block" />

        {/* Staff Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.member.avatar} alt={session?.member.name || 'Staff'} />
                <AvatarFallback>{session?.member.name?.slice(0, 2) || 'OS'}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block pr-1">
                <p className="text-xs font-bold text-foreground leading-none">{session?.member.name || 'Sarah Jenkins'}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  {session?.member.role || 'VERIFICATION_OFFICER'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <p className="text-xs font-bold text-foreground">{session?.member.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{session?.member.email}</p>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                Role: {session?.member.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.ORGANIZATION.PROFILE)} className="cursor-pointer text-xs">
              <Building2 className="w-4 h-4 mr-2" />
              Organization Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.ORGANIZATION.ROLES)} className="cursor-pointer text-xs">
              <ShieldCheck className="w-4 h-4 mr-2" />
              My Permissions & Scope
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.ORGANIZATION.SETTINGS)} className="cursor-pointer text-xs">
              Settings & API Keys
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-600 dark:text-rose-400 cursor-pointer text-xs">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out of Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
