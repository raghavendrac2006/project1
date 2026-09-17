import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/constants/routes'

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.APP.DASHBOARD} replace />
  }

  return <>{children}</>
}
