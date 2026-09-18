import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'app')

  if (pathnames.length === 0) return null

  const breadcrumbNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    actions: 'Action Center',
    identity: 'Civic Identity',
    family: 'Family Hub',
    documents: 'Document Vault',
    services: 'Civic Services',
    applications: 'Applications Tracker',
    benefits: 'Government Benefits',
    data: 'Data Footprint',
    journey: 'Civic Journey',
    privacy: 'Privacy & Consent',
    security: 'Security Center',
    payments: 'Civic Payments',
    assistant: 'SAMAGRA AI',
    notifications: 'Notifications',
    profile: 'Citizen Profile',
    settings: 'Settings & Security',
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <Link
        to={ROUTES.APP.DASHBOARD}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/app/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const displayName = breadcrumbNameMap[value] || (value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' '))

        return (
          <div key={to} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[200px]" aria-current="page">
                {displayName}
              </span>
            ) : (
              <Link to={to} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                {displayName}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
