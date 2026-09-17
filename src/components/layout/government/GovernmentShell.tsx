import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { GovernmentSidebar } from './GovernmentSidebar'
import { GovernmentHeader } from './GovernmentHeader'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export function GovernmentShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Government Desktop Sovereign Sidebar */}
      <GovernmentSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Official Working Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <GovernmentHeader
          onToggleMobileMenu={() => setMobileNavOpen(!mobileNavOpen)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Sovereign Workspace-isolated Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        workspace="government"
      />
    </div>
  )
}
