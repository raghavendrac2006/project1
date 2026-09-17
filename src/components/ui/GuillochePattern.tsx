import { cn } from '@/lib/utils'

interface GuillochePatternProps {
  className?: string
  color?: string
  opacity?: number
}

export function GuillochePattern({
  className,
  color = '#38BDF8',
  opacity = 0.12,
}: GuillochePatternProps) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none overflow-hidden select-none', className)}
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 500"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="guillocheWave"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Spirograph rosette curves */}
            <path
              d="M 0,60 Q 30,10 60,60 T 120,60 M 0,60 Q 30,110 60,60 T 120,60"
              fill="none"
              stroke={color}
              strokeWidth="0.75"
            />
            <path
              d="M 60,0 Q 10,30 60,60 T 60,120 M 60,0 Q 110,30 60,60 T 60,120"
              fill="none"
              stroke={color}
              strokeWidth="0.75"
            />
            <circle
              cx="60"
              cy="60"
              r="24"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <circle
              cx="60"
              cy="60"
              r="38"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          </pattern>

          <pattern
            id="microprintGrid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0,20 L 40,20 M 20,0 L 20,40"
              fill="none"
              stroke={color}
              strokeWidth="0.3"
            />
          </pattern>
        </defs>

        {/* Base fine microprint grid */}
        <rect width="100%" height="100%" fill="url(#microprintGrid)" />

        {/* Main guilloche rosettes */}
        <rect width="100%" height="100%" fill="url(#guillocheWave)" />

        {/* Geometric central sovereign crest circle */}
        <circle cx="400" cy="250" r="180" fill="none" stroke={color} strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="400" cy="250" r="120" fill="none" stroke={color} strokeWidth="0.8" />
        <circle cx="400" cy="250" r="60" fill="none" stroke={color} strokeWidth="0.6" strokeDasharray="3 3" />
      </svg>
    </div>
  )
}
