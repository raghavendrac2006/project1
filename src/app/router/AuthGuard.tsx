import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import { Shield, Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow mb-4 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Verifying citizen security credentials...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}
