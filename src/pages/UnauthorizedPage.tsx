import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-elevation text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
          403 Restricted
        </span>
        <h1 className="text-2xl font-bold font-display tracking-tight text-foreground mt-1">
          Access Restricted
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
          Your current citizen clearance tier does not have authorization to inspect this confidential department registry.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto gap-2"
            onClick={() => navigate(ROUTES.APP.DASHBOARD)}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
