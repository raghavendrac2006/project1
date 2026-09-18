import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Sparkles,
  Languages,
  Mic,
  Radio,
  Minimize2,
  Maximize2,
  Trash2,
  Headphones,
  ExternalLink,
  ChevronDown,
  Volume2,
  VolumeX,
  GripHorizontal,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react'
import { AIAvatarVisualizer, type AvatarState } from './AIAvatarVisualizer'
import { RadialSatelliteMenu } from './RadialSatelliteMenu'
import { ProactiveCivicBubble } from './ProactiveCivicBubble'
import { QuadrantDockController } from './QuadrantDockController'
import { ChatMessageBubble } from './ChatMessageBubble'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useLanguage, useToast, useSpeechRecognition } from '@/hooks'
import { assistantService } from '@/services/assistant.service'
import { supportService } from '@/services/support.service'
import { SUPPORTED_LANGUAGES, CIVIC_ASSISTANT_CONTENT } from '@/constants/languages'
import { cn } from '@/lib/utils'
import type { AssistantMessage, SupportedLanguage, CompanionDockPosition } from '@/types'

const LANG_BCP47: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
}

const CIVIC_CATEGORIES = [
  { id: 'transport', label: '🚗 Transport & DL', query: 'How do I apply for a Driving License and book RTO test slot?' },
  { id: 'aadhaar', label: '🆔 Aadhaar Updates', query: 'How to update mobile number and address in Aadhaar?' },
  { id: 'ration', label: '🌾 Ration Card', query: 'How to apply for new Ration Card under NFSA?' },
  { id: 'health', label: '🏥 Ayushman (PMJAY)', query: 'How to check eligibility and download Ayushman Bharat PMJAY card?' },
  { id: 'certificates', label: '📜 Caste & Income', query: 'What documents are required for Caste and Income Certificate?' },
  { id: 'marriage', label: '💍 Marriage Reg.', query: 'What is the procedure for registering marriage?' },
  { id: 'epfo', label: '🏢 PF / Pension', query: 'How to apply for EPFO PF withdrawal and check claim status?' },
  { id: 'grievance', label: '⚖️ File Grievance', query: 'How to lodge a grievance complaint against civic delay?' },
]

export function CitizenFloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLiveOfficerMode, setIsLiveOfficerMode] = useState(false)

  // Satellite Menu & Drag Physics
  const [satelliteOpen, setSatelliteOpen] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(() => {
    return localStorage.getItem('civiqone_auto_speak_v1') === 'true'
  })
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const r = localStorage.getItem('civiqone_speech_rate_v1')
    return r ? parseFloat(r) : 0.95
  })
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')

  // Dynamic Page Movement & Quadrant Docking
  const [dockPosition, setDockPosition] = useState<CompanionDockPosition>(() => {
    return (localStorage.getItem('civiqone_bot_dock_pos') as CompanionDockPosition) || 'bottom-right'
  })
  const [followScroll, setFollowScroll] = useState<boolean>(() => {
    return localStorage.getItem('civiqone_bot_follow_scroll') !== 'false'
  })
  const [dockControllerOpen, setDockControllerOpen] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)

  // Scroll listener for dynamic buoyancy
  useEffect(() => {
    if (!followScroll) {
      setScrollOffset(0)
      return
    }
    const handleScroll = () => {
      const offset = (window.scrollY % 32) - 16
      setScrollOffset(offset)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [followScroll])

  // Listen for Escape key to easily back out or close chat
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLiveOfficerMode) {
          setIsLiveOfficerMode(false)
          toast.info('Returned to AI Copilot', 'Automated statutory assistant active.')
        } else {
          setIsOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLiveOfficerMode])

  const handleSelectDockPosition = (pos: CompanionDockPosition) => {
    setDockPosition(pos)
    localStorage.setItem('civiqone_bot_dock_pos', pos)
    toast.success('Repositioned', `Companion docked to ${pos.replace('-', ' ').toUpperCase()}`)
  }

  const handleToggleFollowScroll = () => {
    const next = !followScroll
    setFollowScroll(next)
    localStorage.setItem('civiqone_bot_follow_scroll', String(next))
    toast.info(
      next ? 'Follow-Scroll Enabled' : 'Follow-Scroll Disabled',
      next ? 'Companion glides dynamically with page scroll.' : 'Companion position fixed.'
    )
  }

  const handleRoamGuide = () => {
    const targetEl =
      document.querySelector('[data-tour="active-item"]') ||
      document.querySelector('main h1') ||
      document.querySelector('main')

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      targetEl.classList.add('ring-4', 'ring-primary/40', 'ring-offset-2', 'transition-all', 'duration-500')
      setTimeout(() => {
        targetEl.classList.remove('ring-4', 'ring-primary/40', 'ring-offset-2')
      }, 4000)
    }

    const tip =
      language === 'hi'
        ? 'मैंने इस पृष्ठ के मुख्य अनुभाग को केंद्रित किया है। आप आवेदन की समीक्षा कर सकते हैं।'
        : language === 'te'
        ? 'ఈ పేజీలోని ముఖ్య విభాగాన్ని కేంద్రీకరించాను. వివరాలు పరిశీలించవచ్చు.'
        : 'I navigated to and highlighted the primary focus area on this page!'

    toast.info('Page Guided', tip)
    if (autoSpeak) {
      speakText(tip)
    }
  }

  const getDockPositionClasses = (pos: CompanionDockPosition): string => {
    switch (pos) {
      case 'bottom-left':
        return 'bottom-8 left-8 sm:left-24'
      case 'top-right':
        return 'top-20 right-8'
      case 'top-left':
        return 'top-20 left-8 sm:left-24'
      case 'center-float':
        return 'top-1/2 right-6 -translate-y-1/2'
      case 'bottom-right':
      default:
        return 'bottom-8 right-8'
    }
  }

  const { language, setLanguage, currentLanguageDetails } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Voice speech-to-text
  const { isListening, hasSupport, startListening, stopListening } = useSpeechRecognition({
    language,
    onResult: (spoken) => {
      setInputText((prev) => (prev ? `${prev} ${spoken}` : spoken))
      toast.info('Voice Input Captured', `Recognized in ${currentLanguageDetails.name}`)
    },
    onError: (err) => {
      toast.error('Microphone Error', err)
      setAvatarState('idle')
    },
  })

  // Synchronize listening state with avatar
  useEffect(() => {
    if (isListening) {
      setAvatarState('listening')
    } else if (isTyping) {
      setAvatarState('thinking')
    } else {
      // Return to idle if not speaking
      if (avatarState === 'listening' || avatarState === 'thinking') {
        setAvatarState('idle')
      }
    }
  }, [isListening, isTyping])

  // Native Audio Speech Synthesis Helper
  const speakText = (text: string, lang = language) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LANG_BCP47[lang] || 'en-IN'
    utterance.rate = speechRate

    utterance.onstart = () => {
      setAvatarState('speaking')
    }
    utterance.onend = () => {
      setAvatarState('idle')
    }
    utterance.onerror = () => {
      setAvatarState('idle')
    }

    window.speechSynthesis.speak(utterance)
  }

  // Load chat messages
  useEffect(() => {
    async function load() {
      const history = await assistantService.getMessages(language)
      setMessages(history)
    }
    load()
  }, [language, isOpen])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Don't render floating companion if user is on full-screen assistant
  if (location.pathname === '/app/assistant') {
    return null
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText
    if (!text.trim() || isTyping) return

    setInputText('')
    setIsTyping(true)
    setAvatarState('thinking')

    try {
      if (isLiveOfficerMode) {
        await supportService.sendLiveMessage(text)
        const userMsg: AssistantMessage = {
          id: `msg_user_${Date.now()}`,
          sender: 'user',
          content: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
        }
        setMessages((prev) => [...prev, userMsg])

        setTimeout(() => {
          const officerMsg: AssistantMessage = {
            id: `msg_asst_${Date.now()}`,
            sender: 'assistant',
            content: `[Officer Vikramaditya Rao]: Received your inquiry regarding "${text}". I have cross-verified your records. Priority clearance initiated.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language,
            cardType: 'officer',
            cardData: {
              officerName: 'Vikramaditya Rao',
              designation: 'Senior Grievance Redressal Officer',
              department: 'Citizen Assistance Desk',
              status: 'Connected Live',
              queueWaitTime: 'Instant',
              targetUrl: '/app/support?tab=live',
            },
          }
          setMessages((prev) => [...prev, officerMsg])
          setIsTyping(false)
          setAvatarState('idle')

          if (autoSpeak) {
            speakText(officerMsg.content)
          }
        }, 1200)
      } else {
        const assistantResponse = await assistantService.sendMessage(text, language)
        setMessages((prev) => [...prev, assistantResponse])
        setIsTyping(false)

        if (autoSpeak) {
          speakText(assistantResponse.content)
        } else {
          setAvatarState('idle')
        }
      }
    } catch {
      toast.error('Civic Agent Error', 'Could not process query. Please try again.')
      setIsTyping(false)
      setAvatarState('idle')
    }
  }

  const handleClear = async () => {
    await assistantService.clearHistory(language)
    const fresh = await assistantService.getMessages(language)
    setMessages(fresh)
    toast.info('Conversation Reset')
  }

  const toggleAutoSpeak = () => {
    const next = !autoSpeak
    setAutoSpeak(next)
    localStorage.setItem('civiqone_auto_speak_v1', String(next))
    toast.info(
      next ? 'Auto-Voice Enabled' : 'Auto-Voice Muted',
      next ? `AI will speak answers aloud in ${currentLanguageDetails.name}.` : 'Audio narration paused.'
    )
    if (next) {
      speakText(`Voice mode active. Speaking in ${currentLanguageDetails.name}`)
    } else {
      window.speechSynthesis?.cancel()
      setAvatarState('idle')
    }
  }

  const cycleSpeechRate = () => {
    const rates = [0.8, 1.0, 1.25]
    const nextRate = rates[(rates.indexOf(speechRate) + 1) % rates.length] || 1.0
    setSpeechRate(nextRate)
    localStorage.setItem('civiqone_speech_rate_v1', String(nextRate))
    toast.info('Speech Rate', `Voice speed set to ${nextRate}x`)
  }

  const currentPreset = CIVIC_ASSISTANT_CONTENT[language] || CIVIC_ASSISTANT_CONTENT.en

  return (
    <>
      {/* ── DYNAMIC MOVING COMPANION (DRAGGABLE ACROSS ENTIRE VIEWPORT & DOCKABLE) ── */}
      {!isOpen && (
        <motion.div
          key={dockPosition}
          drag
          dragMomentum={false}
          dragElastic={0.15}
          dragConstraints={{
            top: 70,
            left: 20,
            right: window.innerWidth - 80,
            bottom: window.innerHeight - 80,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: followScroll ? [scrollOffset, scrollOffset - 6, scrollOffset] : [0, -6, 0],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 3.5,
              ease: 'easeInOut',
            },
          }}
          className={cn(
            'fixed z-50 flex items-center justify-center select-none touch-none cursor-grab active:cursor-grabbing transition-all duration-500',
            getDockPositionClasses(dockPosition)
          )}
          style={{ x: 0 }}
        >
          {/* Proactive Contextual Speech Bubble (Route-Aware) */}
          <ProactiveCivicBubble
            language={language}
            onSelectPrompt={(text) => {
              setIsOpen(true)
              setTimeout(() => handleSendMessage(text), 200)
            }}
            onSpeakText={(text) => speakText(text)}
          />

          {/* Radial Satellite Bloom Menu (Surrounds the Avatar) */}
          <RadialSatelliteMenu
            isOpen={satelliteOpen}
            isListening={isListening}
            autoSpeak={autoSpeak}
            currentLanguage={language}
            onToggleMic={() => {
              if (isListening) {
                stopListening()
              } else {
                startListening()
              }
            }}
            onToggleAutoSpeak={toggleAutoSpeak}
            onSelectLanguage={(lang) => {
              setLanguage(lang)
              toast.success('Language Switched', `Active: ${lang.toUpperCase()}`)
            }}
            onConnectOfficer={() => {
              navigate('/app/support?tab=live')
              setSatelliteOpen(false)
            }}
            onOpenChat={() => {
              setIsOpen(true)
              setSatelliteOpen(false)
            }}
          />

          {/* Expressive Visual Avatar Body with Dynamic Dock Controller */}
          <div className="relative">
            <AIAvatarVisualizer
              state={avatarState}
              size="md"
              onClick={() => {
                setSatelliteOpen(!satelliteOpen)
              }}
            />

            {/* Dynamic Quadrant Dock Controller (Allows 1-Click Corner Snapping) */}
            <div className="absolute -top-3 -right-3 z-20">
              <QuadrantDockController
                currentPosition={dockPosition}
                onSelectPosition={handleSelectDockPosition}
                followScroll={followScroll}
                onToggleFollowScroll={handleToggleFollowScroll}
                onRoamGuide={handleRoamGuide}
                isOpen={dockControllerOpen}
                onToggleOpen={() => setDockControllerOpen(!dockControllerOpen)}
              />
            </div>

            {/* Quick Action Double-Click / Mini Pill */}
            <button
              onClick={() => setIsOpen(true)}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-[9px] font-mono font-bold text-foreground hover:bg-muted whitespace-nowrap cursor-pointer transition-colors"
              title="Click to open full chat console"
            >
              CiviqAI • {currentLanguageDetails.nativeName}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── EXPANDED FULL COPILOT CONSOLE (DRAGGABLE ANYWHERE ACROSS PAGE) ── */}
      {isOpen && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={{
            top: 20,
            left: 20,
            right: window.innerWidth - 380,
            bottom: window.innerHeight - 300,
          }}
          className={cn(
            'fixed z-50 flex flex-col bg-card border border-border/90 rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in zoom-in-95',
            isExpanded
              ? 'inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[640px] md:h-[720px] max-h-[92vh]'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[88vh]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-border/80 bg-muted/40 rounded-t-3xl shrink-0 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2 min-w-0">
              {/* Back button to close modal or return from Live Officer */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isLiveOfficerMode) {
                    setIsLiveOfficerMode(false)
                    toast.info('Returned to AI Copilot', 'Automated statutory assistant active.')
                  } else {
                    setIsOpen(false)
                  }
                }}
                className="h-8 w-8 rounded-lg text-foreground hover:bg-muted shrink-0 cursor-pointer"
                title={isLiveOfficerMode ? 'Back to AI Copilot' : 'Back to Portal Page (Esc)'}
                aria-label="Back to portal page"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <span title="Drag to reposition chat anywhere" className="hidden sm:inline-flex cursor-grab active:cursor-grabbing">
                <GripHorizontal className="w-4 h-4 text-muted-foreground/60 shrink-0" />
              </span>
              <AIAvatarVisualizer state={avatarState} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    CiviqOne Civic AI Agent
                  </h3>
                  <Badge variant={isLiveOfficerMode ? 'warning' : 'verified'} size="sm" className="shrink-0">
                    {isLiveOfficerMode ? 'Live Officer' : '9 Regional'}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  {isLiveOfficerMode ? 'Officer Vikramaditya Rao Desk' : 'Statutory copilot & multi-lingual speech agent'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              {/* Language Selector Dropdown */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="bg-muted/70 hover:bg-muted border border-border text-[11px] font-semibold text-foreground rounded-lg py-1 pl-2 pr-5 cursor-pointer outline-none transition-colors appearance-none"
                  title="Switch Language"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.nativeName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Auto-Speak Toggle */}
              <Button
                variant={autoSpeak ? 'primary' : 'ghost'}
                size="icon"
                onClick={toggleAutoSpeak}
                className="h-8 w-8 rounded-lg"
                title={autoSpeak ? 'Mute automatic voice' : 'Enable automatic voice narration'}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-emerald-300" /> : <VolumeX className="w-3.5 h-3.5" />}
              </Button>

              {/* Speech Pace button */}
              <button
                type="button"
                onClick={cycleSpeechRate}
                className="h-8 px-1.5 rounded-lg text-[10px] font-mono font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Cycle speech speed (0.8x / 1.0x / 1.25x)"
              >
                {speechRate}x
              </button>

              {/* Live Officer Mode Switcher */}
              <Button
                variant={isLiveOfficerMode ? 'primary' : 'ghost'}
                size="icon"
                onClick={() => {
                  setIsLiveOfficerMode(!isLiveOfficerMode)
                  toast.info(
                    isLiveOfficerMode ? 'AI Agent Active' : 'Live Officer Mode',
                    isLiveOfficerMode ? 'Switched to automated AI guidance.' : 'Connected to Grievance Redressal Officer desk.'
                  )
                }}
                className="h-8 w-8 rounded-lg"
                title={isLiveOfficerMode ? 'Switch back to AI' : 'Escalate to Live Officer'}
              >
                <Headphones className={cn('w-4 h-4', isLiveOfficerMode && 'text-amber-300')} />
              </Button>

              {/* Clear */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Clear messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>

              {/* Expand / Minimize */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Close chat (Back to page)"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Civic Services Quick Discovery Tray */}
          <div className="px-3 py-2 border-b border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1">
              <Sparkles className="w-2.5 h-2.5 text-primary" /> Topics:
            </span>
            {CIVIC_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSendMessage(cat.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium border border-border/80 bg-card hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer shrink-0"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active Live Officer Status Header Banner */}
          {isLiveOfficerMode && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-semibold">Live Officer Desk: Officer Vikramaditya Rao</span>
              </div>
              <button
                onClick={() => navigate('/app/support?tab=live')}
                className="text-[10.5px] font-bold underline flex items-center gap-1 cursor-pointer"
              >
                Full Console <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 overscroll-contain">
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                currentLanguage={language}
                onCardAction={(action, payload) => {
                  if (action === 'connect_officer') {
                    setIsLiveOfficerMode(true)
                  }
                  if (action === 'auto_file_grievance' && payload) {
                    sessionStorage.setItem('civiqone_prefill_grievance', JSON.stringify(payload))
                    navigate('/app/support?tab=lodge')
                  }
                  if (action === 'navigate' && typeof payload === 'string') {
                    navigate(payload)
                  }
                }}
              />
            ))}

            {isTyping && (
              <div className="flex gap-2 mr-auto items-center">
                <AIAvatarVisualizer state="thinking" size="sm" />
                <div className="p-2.5 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-1.5 shadow-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-mono ml-1">Analyzing statutory records...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick In-Chat Navigation Action Bar */}
          <div className="px-3 py-1.5 bg-muted/30 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
            <button
              type="button"
              onClick={() => {
                if (isLiveOfficerMode) {
                  setIsLiveOfficerMode(false)
                  toast.info('Returned to AI Copilot')
                } else {
                  setIsOpen(false)
                }
              }}
              className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              title="Return to portal page view"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isLiveOfficerMode ? '← Back to AI Copilot' : '← Back to Portal'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLiveOfficerMode(!isLiveOfficerMode)
                  toast.info(
                    isLiveOfficerMode ? 'AI Agent Active' : 'Live Officer Mode',
                    isLiveOfficerMode ? 'Switched to AI guidance.' : 'Connected to Grievance Redressal Officer desk.'
                  )
                }}
                className={cn(
                  'inline-flex items-center gap-1 font-medium transition-colors cursor-pointer',
                  isLiveOfficerMode ? 'text-amber-500 font-semibold' : 'hover:text-amber-500'
                )}
                title="Connect to human officer"
              >
                <Headphones className="w-3 h-3 text-amber-500" />
                <span>{isLiveOfficerMode ? 'Live Desk' : 'Officer Desk'}</span>
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-border/60 bg-muted/20 shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-primary" /> Suggestions:
            </span>
            {currentPreset.suggestions.slice(0, 4).map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug.text)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg border border-border/80 bg-card hover:bg-muted text-[11px] text-foreground font-medium transition-colors cursor-pointer"
              >
                {sug.text}
              </button>
            ))}
          </div>

          {/* Active Speech Recognition Banner */}
          {isListening && (
            <div className="px-3 py-1.5 bg-rose-500/10 border-t border-rose-500/25 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 shrink-0">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span className="font-semibold text-[11px]">
                  Listening in {currentLanguageDetails.nativeName}... Speak clearly
                </span>
              </div>
              <button
                onClick={stopListening}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 border-t border-border/80 bg-card rounded-b-3xl shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-1.5 bg-muted/40 border border-input rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-ring transition-all"
            >
              {hasSupport && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer',
                    isListening
                      ? 'bg-rose-500 text-white shadow-md animate-pulse'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  title={isListening ? 'Stop listening' : `Voice input (${currentLanguageDetails.nativeName})`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isLiveOfficerMode
                    ? 'Message Officer Vikramaditya Rao...'
                    : `Ask in ${currentLanguageDetails.nativeName} or English...`
                }
                className="flex-1 bg-transparent px-2 text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />

              <Button
                type="submit"
                size="sm"
                disabled={!inputText.trim() || isTyping}
                className="h-8 px-3 rounded-xl text-xs font-semibold gap-1 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </Button>
            </form>

            {/* Footer status & link */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {autoSpeak ? 'Auto-Voice Active' : 'Text Mode'} • {speechRate}x
              </span>
              <button
                type="button"
                onClick={() => {
                  navigate('/app/support')
                  setIsOpen(false)
                }}
                className="hover:text-primary underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Customer Care Hub</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
