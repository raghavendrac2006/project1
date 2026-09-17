import { ShieldCheck } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ripple */}
        <div className="absolute w-16 h-16 rounded-2xl bg-primary/20 animate-ping opacity-50" />
        
        {/* Center icon badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-sky-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
          <ShieldCheck className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-1.5 max-w-xs">
        <p className="font-display text-sm font-semibold text-foreground tracking-tight">
          Loading Civic Workspace
        </p>
        <p className="text-xs text-muted-foreground">
          Decrypting credentials and initializing sovereign session...
        </p>
      </div>

      {/* Shimmer skeleton bars */}
      <div className="w-48 space-y-2 pt-2">
        <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  )
}
