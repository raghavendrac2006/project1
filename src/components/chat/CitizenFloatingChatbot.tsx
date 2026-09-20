import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Sparkles,
  Mic,
  Radio,
  Minimize2,
  Maximize2,
  Headphones,
  ExternalLink,
  ChevronDown,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  Car,
  CreditCard,
  Wheat,
  HeartPulse,
  FileText,
  Heart,
  Building2,
  Scale,
  Globe,
  Check,
} from 'lucide-react'
import { AIAvatarVisualizer, type AvatarState } from './AIAvatarVisualizer'
import { ChatMessageBubble } from './ChatMessageBubble'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useLanguage, useToast, useSpeechRecognition } from '@/hooks'
import { assistantService } from '@/services/assistant.service'
import { supportService } from '@/services/support.service'
import { SUPPORTED_LANGUAGES, CIVIC_ASSISTANT_CONTENT } from '@/constants/languages'
import { cn } from '@/lib/utils'
import type { AssistantMessage, SupportedLanguage } from '@/types'

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

interface CivicCategory {
  id: string
  label: string
  emoji: string
  icon: React.ComponentType<{ className?: string }>
  query: string
}

const CIVIC_CATEGORIES: CivicCategory[] = [
  { id: 'transport', label: 'Transport & DL', emoji: '🚗', icon: Car, query: 'How do I apply for a Driving License and book RTO test slot?' },
  { id: 'aadhaar', label: 'Aadhaar Updates', emoji: '🆔', icon: CreditCard, query: 'How to update mobile number and address in Aadhaar?' },
  { id: 'ration', label: 'Ration Card', emoji: '🌾', icon: Wheat, query: 'How to apply for new Ration Card under NFSA?' },
  { id: 'health', label: 'Ayushman PMJAY', emoji: '🏥', icon: HeartPulse, query: 'How to check eligibility and download Ayushman Bharat PMJAY card?' },
  { id: 'certificates', label: 'Caste & Income', emoji: '📜', icon: FileText, query: 'What documents are required for Caste and Income Certificate?' },
  { id: 'marriage', label: 'Marriage Reg.', emoji: '💍', icon: Heart, query: 'What is the procedure for registering marriage?' },
  { id: 'epfo', label: 'PF & Pension', emoji: '🏢', icon: Building2, query: 'How to apply for EPFO PF withdrawal and check claim status?' },
  { id: 'grievance', label: 'File Grievance', emoji: '⚖️', icon: Scale, query: 'How to lodge a grievance complaint against civic delay?' },
]

export function CitizenFloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLiveOfficerMode, setIsLiveOfficerMode] = useState(false)

  const [autoSpeak, setAutoSpeak] = useState(() => {
    return localStorage.getItem('civiqone_auto_speak_v1') === 'true'
  })
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const r = localStorage.getItem('civiqone_speech_rate_v1')
    return r ? parseFloat(r) : 0.95
  })
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')

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
      if (avatarState === 'listening' || avatarState === 'thinking') {
        setAvatarState('idle')
      }
    }
  }, [isListening, isTyping, avatarState])

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
  }, [isOpen, isLiveOfficerMode, toast])

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
      {/* ── SLEEK, NON-INTRUSIVE FLOATING ACTION BUTTON (FAB) ── */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 h-14 pl-3.5 pr-4 rounded-full bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            title="Open CiviqOne Civic AI Assistant"
            aria-label="Open AI Assistant"
          >
            <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/15 backdrop-blur-md">
              <Bot className="w-5 h-5 text-white transition-transform group-hover:rotate-12" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-primary" />
            </span>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight tracking-tight flex items-center gap-1">
                <span>CiviqAI</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </span>
              <span className="text-[10px] text-white/80 font-medium leading-none">
                {currentLanguageDetails.nativeName}
              </span>
            </div>
          </button>
        </motion.div>
      )}

      {/* ── STREAMLINED CHAT CONSOLE ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={cn(
              'fixed z-50 flex flex-col bg-card border border-border/90 rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-200',
              isExpanded
                ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[640px] h-[680px] max-h-[92vh]'
                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[86vh]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-border/80 bg-muted/40 rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <AIAvatarVisualizer state={avatarState} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                      CiviqOne Civic AI
                    </h3>
                    <Badge variant={isLiveOfficerMode ? 'warning' : 'verified'} size="sm" className="shrink-0 text-[10px] py-0 px-1.5">
                      {isLiveOfficerMode ? 'Officer Desk' : 'AI Copilot'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {isLiveOfficerMode ? 'Live Officer Desk Connected' : `Active in ${currentLanguageDetails.name}`}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                {/* Language Selector Dropdown with Cross-Platform Emoji Support */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-muted/70 hover:bg-muted border border-border text-[11px] font-semibold text-foreground rounded-lg py-1 px-2 cursor-pointer outline-none transition-colors"
                      title="Switch Language"
                    >
                      <Globe className="w-3 h-3 text-primary shrink-0" />
                      <span className="font-emoji text-xs select-none">{currentLanguageDetails.flag}</span>
                      <span className="truncate max-w-[56px]">{currentLanguageDetails.nativeName}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 ml-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 max-h-64 overflow-y-auto">
                    <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Select Language
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <DropdownMenuItem
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={cn(
                          'flex items-center justify-between text-xs cursor-pointer py-1.5',
                          language === l.code && 'font-bold text-primary bg-primary/10'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-emoji text-sm select-none">{l.flag}</span>
                          <span className="font-medium">{l.nativeName}</span>
                          <span className="text-[10px] text-muted-foreground">({l.name})</span>
                        </div>
                        {language === l.code && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Audio Narration Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAutoSpeak}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  title={autoSpeak ? 'Mute automatic voice narration' : 'Enable voice narration'}
                >
                  {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
                </Button>

                {/* More Options Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      title="More Options"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Assistant Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setIsLiveOfficerMode(!isLiveOfficerMode)
                        toast.info(
                          isLiveOfficerMode ? 'AI Agent Active' : 'Live Officer Mode',
                          isLiveOfficerMode ? 'Switched to AI guidance.' : 'Connected to Grievance Redressal Officer desk.'
                        )
                      }}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <Headphones className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isLiveOfficerMode ? 'Switch to AI Copilot' : 'Connect Live Officer'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={cycleSpeechRate}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speech Pace: {speechRate}x</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleClear}
                      className="flex items-center gap-2 cursor-pointer text-xs text-rose-600 focus:text-rose-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Conversation</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        navigate('/app/support')
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Customer Care Hub</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Expand / Restore Size Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                  title={isExpanded ? 'Restore window size' : 'Expand window size'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Close chat console (Esc)"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div className="px-3 py-2 border-b border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1 select-none">
                <Sparkles className="w-2.5 h-2.5 text-primary" /> Topics:
              </span>
              {CIVIC_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSendMessage(cat.query)}
                    className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border border-border/80 bg-card hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-foreground transition-all duration-150 cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-xs group"
                  >
                    <span className="font-emoji text-xs leading-none select-none shrink-0" aria-hidden="true">
                      {cat.emoji}
                    </span>
                    <IconComponent className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Live Officer Active Status Banner */}
            {isLiveOfficerMode && (
              <div className="bg-amber-500/15 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-semibold">Officer Vikramaditya Rao Desk</span>
                </div>
                <button
                  onClick={() => {
                    navigate('/app/support?tab=live')
                    setIsOpen(false)
                  }}
                  className="text-[10.5px] font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  Full Desk <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
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
                      setIsOpen(false)
                    }
                    if (action === 'navigate' && typeof payload === 'string') {
                      navigate(payload)
                      setIsOpen(false)
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

            {/* Quick Suggestions Bar */}
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
            <div className="p-3 border-t border-border/80 bg-card rounded-b-3xl shrink-0 space-y-1.5">
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
                  {autoSpeak ? 'Voice Narration On' : 'Text Mode'} • {speechRate}x
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
      </AnimatePresence>
    </>
  )
}
