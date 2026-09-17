import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { OrganizationSidebar } from './OrganizationSidebar'
import { OrganizationHeader } from './OrganizationHeader'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export function OrganizationShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Organization Desktop Sidebar */}
      <OrganizationSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Operational Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <OrganizationHeader
          onToggleMobileMenu={() => setMobileNavOpen(!mobileNavOpen)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Workspace-isolated Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        workspace="organization"
      />
    </div>
  )
}
