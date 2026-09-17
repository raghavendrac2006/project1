import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Moon,
  Sun,
  LogOut,
  Landmark,
  ShieldCheck,
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
import { governmentService } from '@/services/government.service'

interface GovernmentHeaderProps {
  onToggleMobileMenu: () => void
  onOpenCommandPalette: () => void
}

export function GovernmentHeader({ onToggleMobileMenu, onOpenCommandPalette }: GovernmentHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const session = civicStorage.getGovSession()

  const handleLogout = async () => {
    await governmentService.logout()
    navigate(ROUTES.GOVERNMENT.LOGIN)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 sm:px-6 transition-colors">
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

        {/* Isolated Government Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 h-10 w-48 sm:w-72 lg:w-96 px-3.5 rounded-xl border border-input bg-muted/40 hover:bg-muted/70 text-xs text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring group"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="truncate">Search schemes, case dossiers, verification...</span>
          <span className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border/80 rounded text-muted-foreground">
            ⌘K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Department Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              title="Switch Government Department Desk"
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-mono">{session?.department.code || 'GOV-DESK'}</span>
              <span className="hidden xl:inline text-[11px] text-muted-foreground font-normal truncate max-w-[160px]">
                · {session?.department.name}
              </span>
              <span className="text-[10px] text-muted-foreground ml-0.5">▼</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <DropdownMenuLabel className="pb-1.5">
              <span className="text-xs font-bold text-foreground block">Select Department Desk</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Isolated statutory jurisdiction & scheme catalog
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {civicStorage.getGovDepartments().map((dept) => {
              const isCurrent = session?.department.id === dept.id
              return (
                <DropdownMenuItem
                  key={dept.id}
                  onClick={async () => {
                    await governmentService.switchDepartment(dept.id)
                    window.location.reload()
                  }}
                  className={`cursor-pointer p-2 rounded-lg flex flex-col items-start gap-0.5 ${
                    isCurrent ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold' : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate">{dept.name}</span>
                    <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0 ml-1">
                      {dept.code}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    {dept.officerDesignation || dept.ministry}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    SLA: {dept.avgSlaDays || 4}d · Compliance: {dept.complianceRate || 98}%
                  </span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.official.avatar} alt={session?.official.name || 'Officer'} />
                <AvatarFallback>{session?.official.name?.slice(0, 2) || 'GO'}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block pr-1">
                <p className="text-xs font-bold text-foreground leading-none">{session?.official.name || 'Rajiv Patel'}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  {session?.official.role || 'COMMISSIONER'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <p className="text-xs font-bold text-foreground">{session?.official.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{session?.official.email}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                {session?.department.name}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                Badge: {session?.official.badgeId}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.GOVERNMENT.SERVICES)} className="cursor-pointer text-xs">
              {session?.department.code} Services Catalog
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.GOVERNMENT.REPORTS)} className="cursor-pointer text-xs">
              Department Reports
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.GOVERNMENT.SETTINGS)} className="cursor-pointer text-xs">
              Cryptographic Officer Keys
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-600 dark:text-rose-400 cursor-pointer text-xs">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out of Government Portal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
