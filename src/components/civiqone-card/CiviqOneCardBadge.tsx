import React from 'react'
import { Check, Clock, AlertTriangle, Lock, ShieldCheck } from 'lucide-react'
import type { CiviqOneCardStatus } from './civiqone-card.types'
import { cn } from '@/lib/utils'

interface CiviqOneCardBadgeProps {
  status: CiviqOneCardStatus
  className?: string
}

export const CiviqOneCardBadge: React.FC<CiviqOneCardBadgeProps> = ({ status, className }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: Check,
          label: 'VERIFIED',
          containerClass:
            'bg-violet-500/10 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-500/25 dark:border-violet-700/40 shadow-[0_2px_10px_rgba(139,92,246,0.15)] ring-1 ring-white/50 dark:ring-violet-400/10',
          dotClass: 'bg-violet-600 dark:bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]',
        }
      case 'pending':
        return {
          icon: Clock,
          label: 'PENDING',
          containerClass:
            'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-[0_2px_8px_rgba(245,158,11,0.15)]',
          dotClass: 'bg-amber-500 shadow-[0_0_8px_#F59E0B]',
        }
      case 'expired':
        return {
          icon: AlertTriangle,
          label: 'EXPIRED',
          containerClass:
            'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-[0_2px_8px_rgba(244,63,94,0.15)]',
          dotClass: 'bg-rose-500 shadow-[0_0_8px_#F43F5E]',
        }
      case 'protected':
        return {
          icon: ShieldCheck,
          label: 'PROTECTED VIEW',
          containerClass:
            'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35 shadow-[0_2px_8px_rgba(245,158,11,0.15)]',
          dotClass: 'bg-amber-500 shadow-[0_0_8px_#F59E0B]',
        }
      case 'locked':
      case 'restricted':
      default:
        return {
          icon: Lock,
          label: 'LOCKED',
          containerClass:
            'bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30 shadow-[0_2px_8px_rgba(100,116,139,0.15)]',
          dotClass: 'bg-slate-500 shadow-[0_0_8px_#64748B]',
        }
    }
  }

  const { icon: Icon, label, containerClass, dotClass } = getBadgeConfig()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold tracking-wider uppercase border backdrop-blur-md transition-all select-none',
        containerClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse shrink-0', dotClass)} />
      <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>{label}</span>
    </div>
  )
}
