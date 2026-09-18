import React from 'react'
import { ShieldCheck, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CiviqOneCardQrProps {
  value?: string
  size?: number
  isProtected?: boolean
  variant?: 'compact' | 'full'
  className?: string
}

export const CiviqOneCardQr: React.FC<CiviqOneCardQrProps> = ({
  value = 'SAMAGRA-DEMO-VERIFY-2048',
  size = 120,
  isProtected = false,
  variant = 'full',
  className,
}) => {
  // Deterministic SVG QR Matrix generation based on string value
  // Generates 21x21 version 1 QR layout with standard corner locator patterns
  const generateMatrix = (seedStr: string) => {
    const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false))

    // Helper: Mark 7x7 Finder Pattern with 1px white separation
    const markFinderPattern = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[startRow + r][startCol + c] = true
          }
        }
      }
    }

    // Top-Left Finder
    markFinderPattern(0, 0)
    // Top-Right Finder
    markFinderPattern(0, 14)
    // Bottom-Left Finder
    markFinderPattern(14, 0)

    // Timing patterns
    for (let i = 8; i < 13; i++) {
      matrix[6][i] = i % 2 === 0
      matrix[i][6] = i % 2 === 0
    }

    // Center alignment point
    matrix[14][14] = true
    matrix[14][15] = true
    matrix[15][14] = true
    matrix[15][15] = true

    // Deterministic Pseudo-Random Fill for data area based on string
    let hash = 0
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i)
      hash |= 0
    }

    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        // Skip finder zones
        const inTopLeft = r < 8 && c < 8
        const inTopRight = r < 8 && c > 12
        const inBottomLeft = r > 12 && c < 8
        const inTiming = r === 6 || c === 6

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
          const bit = Math.sin((r * 21 + c + Math.abs(hash)) * 0.95)
          matrix[r][c] = bit > 0.05
        }
      }
    }

    return matrix
  }

  const matrix = React.useMemo(() => generateMatrix(value), [value])

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'relative w-9 h-9 rounded-lg p-1 bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700/60 shadow-sm flex items-center justify-center overflow-hidden',
          className
        )}
      >
        <svg viewBox="0 0 21 21" className="w-full h-full text-slate-900 dark:text-white" fill="currentColor">
          {matrix.map((row, r) =>
            row.map((active, c) =>
              active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" rx="0.2" /> : null
            )
          )}
        </svg>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative rounded-2xl p-3 bg-white/95 dark:bg-slate-900/90 border border-black/5 dark:border-white/15 shadow-md flex flex-col items-center justify-center overflow-hidden transition-all',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 21 21"
        className={cn(
          'w-full h-full text-slate-950 dark:text-slate-50 transition-all duration-300',
          isProtected ? 'blur-sm opacity-25 scale-95' : 'blur-0 opacity-100 scale-100'
        )}
        fill="currentColor"
      >
        {matrix.map((row, r) =>
          row.map((active, c) =>
            active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" rx="0.25" /> : null
          )
        )}
      </svg>

      {/* Center Shield Emblem */}
      {!isProtected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-900 shadow-sm border border-black/10 dark:border-white/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#6B4EFF]" />
          </div>
        </div>
      )}

      {/* Protected View Mask Overlay (Section 30) */}
      {isProtected && (
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center text-center p-2 rounded-2xl animate-in fade-in duration-200">
          <Lock className="w-5 h-5 text-primary mb-1 stroke-[2.5]" />
          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-foreground">
            Protected
          </span>
          <span className="text-[8px] text-muted-foreground font-mono">Tap unmask</span>
        </div>
      )}
    </div>
  )
}
