import React from 'react'
import { Bot, Mic, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface AIAvatarVisualizerProps {
  state: AvatarState
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export function AIAvatarVisualizer({
  state,
  size = 'md',
  className,
  onClick,
}: AIAvatarVisualizerProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl flex items-center justify-center cursor-pointer select-none transition-all duration-300 group',
        sizeClasses[size],
        className
      )}
    >
      {/* ── 1. BACKGROUND GLOW & PULSE HALO ── */}
      {state === 'idle' && (
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 opacity-80 blur-sm group-hover:blur-md transition-all animate-pulse" />
      )}

      {state === 'listening' && (
        <>
          <span className="absolute -inset-2 rounded-3xl bg-rose-500/30 animate-ping" />
          <span className="absolute -inset-1 rounded-2xl bg-rose-500/50 blur-sm" />
        </>
      )}

      {state === 'thinking' && (
        <span className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-purple-500 to-primary animate-spin opacity-75 blur-sm" />
      )}

      {state === 'speaking' && (
        <span className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-sky-400 via-primary to-emerald-400 opacity-85 blur-md animate-pulse" />
      )}

      {/* ── 2. CORE AVATAR BODY ── */}
      <div
        className={cn(
          'relative w-full h-full rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-xl border transition-all duration-300',
          state === 'idle' && 'bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 border-white/20 text-white',
          state === 'listening' && 'bg-gradient-to-tr from-rose-600 to-pink-600 border-rose-300/40 text-white animate-pulse',
          state === 'thinking' && 'bg-gradient-to-tr from-indigo-800 via-purple-700 to-primary border-purple-300/40 text-white',
          state === 'speaking' && 'bg-gradient-to-tr from-blue-700 via-primary to-sky-500 border-sky-300/40 text-white'
        )}
      >
        {/* State-Specific Interior Display */}
        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center relative">
            <Bot className={cn(iconSizes[size], 'transition-transform group-hover:scale-110')} />
            {/* Soft optic indicator */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-primary shadow-sm" />
          </div>
        )}

        {state === 'listening' && (
          <div className="flex flex-col items-center justify-center relative">
            <Mic className={cn(iconSizes[size], 'animate-bounce text-white')} />
            <span className="absolute -bottom-1 text-[8px] font-black uppercase tracking-wider bg-rose-900/60 px-1 rounded text-white font-mono">
              REC
            </span>
          </div>
        )}

        {state === 'thinking' && (
          <div className="flex flex-col items-center justify-center relative">
            <Sparkles className={cn(iconSizes[size], 'animate-spin [animation-duration:3s] text-amber-300')} />
            {/* Orbiting particles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute animate-ping" />
            </div>
          </div>
        )}

        {state === 'speaking' && (
          <div className="flex flex-col items-center justify-center h-full w-full px-2">
            {/* Real-time Dynamic Audio Frequency Equalizer Bars */}
            <div className="flex items-end justify-center gap-0.5 sm:gap-1 h-6 w-full">
              <span className="w-1 bg-white rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_alternate] h-3" />
              <span className="w-1 bg-sky-200 rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_alternate] h-5 [animation-delay:0.15s]" />
              <span className="w-1 bg-white rounded-full animate-[equalizer_0.5s_ease-in-out_infinite_alternate] h-6 [animation-delay:0.3s]" />
              <span className="w-1 bg-sky-200 rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_alternate] h-4 [animation-delay:0.1s]" />
              <span className="w-1 bg-white rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_alternate] h-2 [animation-delay:0.25s]" />
            </div>
          </div>
        )}
      </div>

      {/* Online Status Beacon */}
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-10">
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            state === 'listening'
              ? 'bg-rose-400'
              : state === 'speaking'
              ? 'bg-sky-400'
              : 'bg-emerald-400'
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-background',
            state === 'listening'
              ? 'bg-rose-500'
              : state === 'speaking'
              ? 'bg-sky-400'
              : 'bg-emerald-500'
          )}
        />
      </span>
    </div>
  )
}
