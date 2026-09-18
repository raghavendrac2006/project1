import { useState, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Breadcrumbs } from './Breadcrumbs'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { CitizenFloatingChatbot } from '@/components/chat'
import { PageLoader } from '@/components/feedback/PageLoader'
import { SessionLockOverlay } from '@/components/shared/SessionLockOverlay'
import { useInactivityLock } from '@/hooks'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const { isLocked, lockSession, unlockSession } = useInactivityLock()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Drawer */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileMenu={() => setMobileNavOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onLockSession={lockSession}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Breadcrumbs />
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Global Citizen Multilingual AI Chatbot & Care Assistant */}
      <CitizenFloatingChatbot />

      {/* Inactivity Privacy Lock Overlay */}
      <SessionLockOverlay
        isLocked={isLocked}
        onUnlock={unlockSession}
      />
    </div>
  )
}
