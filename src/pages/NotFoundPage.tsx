import { useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-elevation text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/80 text-muted-foreground flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-primary" />
        </div>
        <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
          404 Error
        </span>
        <h1 className="text-2xl font-bold font-display tracking-tight text-foreground mt-1">
          Civic Record Not Found
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
          The civic registry or document route you requested does not exist or has been relocated within the Central Directory.
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
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
