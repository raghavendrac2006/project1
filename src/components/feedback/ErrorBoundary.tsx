import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in SAMAGRA component tree:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-elevation text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
              Something went wrong
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
              SAMAGRA encountered an unexpected exception while rendering this view. Your session data and digital credentials remain securely protected.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-auto gap-2"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto gap-2"
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.href = '/app/dashboard'
                }}
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
