// CiviQone official brand loader

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ripple */}
        <div className="absolute w-16 h-16 rounded-2xl bg-primary/20 animate-ping opacity-50" />
        
        {/* Center icon badge */}
        <div className="relative w-16 h-16 rounded-2xl bg-white/95 dark:bg-card/95 p-2 flex items-center justify-center border border-border/70 shadow-lg shadow-primary/20">
          <img src="/civiqone-icon.png" alt="CiviQone" className="h-full w-full object-contain animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-1.5 max-w-xs">
        <p className="font-display text-sm font-bold text-foreground tracking-tight">
          Loading Civi<span className="text-[#E11D48]">Q</span>one Workspace
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
