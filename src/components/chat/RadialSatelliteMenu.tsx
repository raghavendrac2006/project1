import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Volume2,
  VolumeX,
  Languages,
  Headphones,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import { cn } from '@/lib/utils'
import type { SupportedLanguage } from '@/types'

interface RadialSatelliteMenuProps {
  isOpen: boolean
  isListening: boolean
  autoSpeak: boolean
  currentLanguage: SupportedLanguage
  onToggleMic: () => void
  onToggleAutoSpeak: () => void
  onSelectLanguage: (lang: SupportedLanguage) => void
  onConnectOfficer: () => void
  onOpenChat: () => void
  onCloseMenu?: () => void
}

export function RadialSatelliteMenu({
  isOpen,
  isListening,
  autoSpeak,
  currentLanguage,
  onToggleMic,
  onToggleAutoSpeak,
  onSelectLanguage,
  onConnectOfficer,
  onOpenChat,
}: RadialSatelliteMenuProps) {
  const [langPickerOpen, setLangPickerOpen] = React.useState(false)

  // 5 orbital positions around the avatar (arc from top to left)
  // Distance: ~80px radius
  const satellites = [
    {
      id: 'mic',
      label: isListening ? 'Stop Voice' : 'Speak Voice',
      icon: <Mic className={cn('w-4 h-4', isListening && 'animate-bounce text-rose-500')} />,
      active: isListening,
      activeClass: 'bg-rose-500 text-white ring-2 ring-rose-400 animate-pulse',
      onClick: onToggleMic,
      // Angle ~ -90deg (straight up)
      x: 0,
      y: -78,
    },
    {
      id: 'autospeak',
      label: autoSpeak ? 'Auto-Speak: ON' : 'Auto-Speak: OFF',
      icon: autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />,
      active: autoSpeak,
      activeClass: 'bg-emerald-600 text-white ring-2 ring-emerald-400',
      onClick: onToggleAutoSpeak,
      // Angle ~ -50deg (up-left)
      x: -56,
      y: -56,
    },
    {
      id: 'language',
      label: 'Change Language',
      icon: <Languages className="w-4 h-4 text-sky-400" />,
      active: langPickerOpen,
      activeClass: 'bg-sky-600 text-white ring-2 ring-sky-400',
      onClick: () => setLangPickerOpen(!langPickerOpen),
      // Angle ~ 0deg (straight left)
      x: -78,
      y: 0,
    },
    {
      id: 'officer',
      label: 'Live Officer Handoff',
      icon: <Headphones className="w-4 h-4 text-amber-400" />,
      active: false,
      activeClass: 'bg-amber-600 text-white',
      onClick: onConnectOfficer,
      // Angle ~ 40deg (down-left)
      x: -60,
      y: 56,
    },
    {
      id: 'chat',
      label: 'Open Chat Console',
      icon: <MessageSquare className="w-4 h-4 text-primary" />,
      active: false,
      activeClass: 'bg-primary text-white',
      onClick: onOpenChat,
      // Angle ~ 85deg (down)
      x: 0,
      y: 78,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Orbital Satellites */}
          {satellites.map((sat, index) => (
            <motion.div
              key={sat.id}
              initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, x: sat.x, y: sat.y }}
              exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 24,
                delay: index * 0.04,
              }}
              className="absolute top-1/2 left-1/2 -mt-4 -ml-4 pointer-events-auto"
            >
              <button
                type="button"
                onClick={sat.onClick}
                className={cn(
                  'w-8 h-8 rounded-full border border-border/90 bg-card/95 backdrop-blur-md text-foreground flex items-center justify-center shadow-lg hover:scale-115 active:scale-95 transition-all cursor-pointer group relative',
                  sat.active ? sat.activeClass : 'hover:bg-muted hover:border-primary/50'
                )}
                title={sat.label}
              >
                {sat.icon}

                {/* Tooltip on hover */}
                <span className="absolute right-full mr-2 px-2 py-0.5 rounded-md bg-foreground text-background text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                  {sat.label}
                </span>
              </button>
            </motion.div>
          ))}

          {/* Sub-menu: Language Quick Dial Overlay */}
          {langPickerOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: -140, y: -80 }}
              animate={{ opacity: 1, scale: 1, x: -140, y: -80 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute top-1/2 left-1/2 w-44 p-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl space-y-1 pointer-events-auto z-30"
            >
              <div className="px-2 py-1 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Select Language:
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5 no-scrollbar">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang.code)
                      setLangPickerOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left',
                      currentLanguage === lang.code
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {lang.code.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
