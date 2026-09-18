import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Settings,
  Languages,
  Check,
  Lock,
  Type,
  Contrast,
  LifeBuoy,
  SlidersHorizontal,
} from 'lucide-react'
import { useAuth, useTheme, useLanguage, useAccessibility } from '@/hooks'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
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
import { civicStorage } from '@/services/storage'

interface HeaderProps {
  onToggleMobileMenu: () => void
  onOpenCommandPalette: () => void
  onLockSession?: () => void
}

export function Header({
  onToggleMobileMenu,
  onOpenCommandPalette,
  onLockSession,
}: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, currentLanguageDetails } = useLanguage()
  const { fontScale, cycleFontScale, highContrast, toggleHighContrast } = useAccessibility()
  const navigate = useNavigate()

  const [notifications] = useState(() => civicStorage.getNotifications())
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.AUTH.LOGIN)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 sm:px-6 transition-colors gpu-accelerated">
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

        {/* Global Search Bar (Trigger for Command Palette) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 h-10 w-48 sm:w-72 lg:w-96 px-3.5 rounded-xl border border-input bg-muted/40 hover:bg-muted/70 text-xs text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring group"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="truncate">Search services, documents, apps...</span>
          <span className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border/80 rounded text-muted-foreground">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: Controls & Citizen Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Select regional language"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden md:inline font-medium">{currentLanguageDetails.nativeName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SUPPORTED_LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="flex items-center justify-between text-xs cursor-pointer py-2"
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <div>
                    <p className="font-semibold text-foreground">{lang.nativeName}</p>
                    <p className="text-[10px] text-muted-foreground">{lang.name}</p>
                  </div>
                </div>
                {language === lang.code && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark / Light Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </Button>

        {/* Accessibility & Privacy Preferences Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 text-muted-foreground hover:text-foreground',
                (highContrast || fontScale !== 'normal') && 'text-primary bg-primary/10'
              )}
              title="Accessibility & Privacy Preferences"
              aria-label="Accessibility & Privacy Preferences"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Accessibility & Safety
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Font Scale Option */}
            <div className="flex items-center justify-between px-2 py-1.5 text-xs">
              <span className="flex items-center gap-2 font-medium">
                <Type className="w-4 h-4 text-muted-foreground" />
                Text Size
              </span>
              <button
                type="button"
                onClick={cycleFontScale}
                className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono font-bold hover:bg-muted/80 text-foreground cursor-pointer"
                title="Click to cycle size"
              >
                {fontScale === 'normal' ? 'Standard (A)' : fontScale === 'large' ? 'Large (A+)' : 'Largest (A++)'}
              </button>
            </div>

            {/* High Contrast Option */}
            <div className="flex items-center justify-between px-2 py-1.5 text-xs">
              <span className="flex items-center gap-2 font-medium">
                <Contrast className="w-4 h-4 text-muted-foreground" />
                High Contrast
              </span>
              <button
                type="button"
                onClick={toggleHighContrast}
                className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-semibold cursor-pointer transition-colors',
                  highContrast ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {highContrast ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Instant Privacy Lock */}
            {onLockSession && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLockSession}
                  className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock Privacy Session</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Customer Care & Grievance Redressal Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(ROUTES.APP.SUPPORT)}
          title="Citizen Customer Care & Grievance Redressal"
          aria-label="Customer Care & Support"
        >
          <LifeBuoy className="w-4 h-4" />
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate(ROUTES.APP.NOTIFICATIONS)}
                className="text-xs text-primary hover:underline font-medium"
              >
                View all
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border/40">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.actionUrl) navigate(notif.actionUrl)
                  }}
                  className={`p-3.5 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notif.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border/80 mx-1 hidden sm:block" />

        {/* Citizen Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name || 'Citizen'} />
                <AvatarFallback>{user?.name?.slice(0, 2) || 'CS'}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block pr-1">
                <p className="text-xs font-bold text-foreground leading-none">{user?.name || 'Rajesh Sharma'}</p>
                <p className="text-[10px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Sovereign ID Verified
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-bold text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                {user?.verificationLevel}
              </div>
            </div>
            <DropdownMenuItem onClick={() => navigate(ROUTES.APP.PROFILE)} className="cursor-pointer">
              <UserIcon className="w-4 h-4 mr-2" />
              Citizen Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.APP.IDENTITY)} className="cursor-pointer">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Digital Smart Card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.APP.SETTINGS)} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Security & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-rose-600 dark:text-rose-400 cursor-pointer focus:text-rose-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
