import React, { useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { ToastContext, type ToastItem, type ToastType } from './contexts'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, type = 'info', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
      const item: ToastItem = { id, title, description, type, duration }
      setToasts((prev) => [...prev, item])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    [dismiss]
  )

  const success = useCallback((title: string, description?: string) => toast({ title, description, type: 'success' }), [toast])
  const error = useCallback((title: string, description?: string) => toast({ title, description, type: 'error', duration: 6000 }), [toast])
  const warning = useCallback((title: string, description?: string) => toast({ title, description, type: 'warning' }), [toast])
  const info = useCallback((title: string, description?: string) => toast({ title, description, type: 'info' }), [toast])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />
    }
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl shadow-elevation bg-card border border-border/80 text-card-foreground transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-start gap-3">
              {getIcon(t.type)}
              <div>
                <h4 className="text-sm font-semibold leading-none">{t.title}</h4>
                {t.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
