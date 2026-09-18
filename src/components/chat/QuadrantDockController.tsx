import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Move,
  Compass,
  Sparkles,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Crosshair,
  Scroll,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompanionDockPosition } from '@/types'

interface QuadrantDockControllerProps {
  currentPosition: CompanionDockPosition
  onSelectPosition: (position: CompanionDockPosition) => void
  followScroll: boolean
  onToggleFollowScroll: () => void
  onRoamGuide: () => void
  isOpen: boolean
  onToggleOpen: () => void
}

export function QuadrantDockController({
  currentPosition,
  onSelectPosition,
  followScroll,
  onToggleFollowScroll,
  onRoamGuide,
  isOpen,
  onToggleOpen,
}: QuadrantDockControllerProps) {
  const dockOptions: { id: CompanionDockPosition; label: string; icon: React.ReactNode }[] = [
    { id: 'top-left', label: 'Top Left', icon: <ArrowUpLeft className="w-3.5 h-3.5" /> },
    { id: 'top-right', label: 'Top Right', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
    { id: 'center-float', label: 'Floating Rail', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: 'bottom-left', label: 'Bottom Left', icon: <ArrowDownLeft className="w-3.5 h-3.5" /> },
    { id: 'bottom-right', label: 'Bottom Right', icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="relative">
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={onToggleOpen}
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border shadow-md transition-all cursor-pointer',
          isOpen
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card/90 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
        )}
        title="Reposition chatbot dynamically on page"
      >
        <Move className="w-3.5 h-3.5" />
      </button>

      {/* Expanded Quick-Position Dock Bar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-9 right-0 z-50 p-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl space-y-2 min-w-[210px]"
          >
            <div className="flex items-center justify-between pb-1 border-b border-border/60">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Compass className="w-3 h-3 text-primary" /> Dynamic Movement
              </span>
              <span className="text-[9px] font-mono text-primary font-bold">Full Page</span>
            </div>

            {/* 5-Position Grid */}
            <div className="grid grid-cols-5 gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
              {dockOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelectPosition(opt.id)
                    onToggleOpen()
                  }}
                  className={cn(
                    'p-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer text-xs',
                    currentPosition === opt.id
                      ? 'bg-primary text-primary-foreground shadow-sm font-bold scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              ))}
            </div>

            {/* Feature Toggles */}
            <div className="space-y-1 pt-0.5">
              {/* Follow Scroll Mode */}
              <button
                type="button"
                onClick={onToggleFollowScroll}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors border cursor-pointer',
                  followScroll
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted/40 hover:bg-muted border-border/60 text-muted-foreground'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5" />
                  <span>Follow Scroll Mode</span>
                </span>
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    followScroll ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'
                  )}
                />
              </button>

              {/* Roam & Guide on this Page */}
              <button
                type="button"
                onClick={() => {
                  onRoamGuide()
                  onToggleOpen()
                }}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guide Me On This Page</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
