import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Languages,
  Mic,
  Radio,
  Download,
  LifeBuoy,
  ChevronDown,
  ShieldCheck,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble'
import { useToast, useLanguage, useSpeechRecognition } from '@/hooks'
import { assistantService } from '@/services/assistant.service'
import { SUPPORTED_LANGUAGES, CIVIC_ASSISTANT_CONTENT } from '@/constants/languages'
import { cn } from '@/lib/utils'
import type { AssistantMessage, SupportedLanguage } from '@/types'

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  applications: [
    'What is the current status of my Driving License renewal?',
    'Check status of my E-Khata property mutation',
    'How to expedite statutory application processing?',
  ],
  grievances: [
    'How do I file a statutory grievance against civic delay?',
    'Escalate an unresolved complaint under the Citizen Charter',
    'Check status of my previous grievance ticket',
  ],
  services: [
    'Check eligibility for PM Surya Ghar Solar Subsidy',
    'What documents are required for Caste and Income Certificate?',
    'How to apply for Ayushman Bharat PMJAY golden card?',
  ],
  officer: [
    'Connect me to Senior Grievance Redressal Officer Vikramaditya Rao',
    'Request immediate official phone callback from Department Desk',
    'What are the nodal officer timings for citizen hearings?',
  ],
}

export function AssistantPage() {
  const { language, setLanguage, currentLanguageDetails } = useLanguage()
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | 'applications' | 'grievances' | 'services' | 'officer'>('all')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const navigate = useNavigate()

  const {
    isListening,
    hasSupport,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    language,
    onResult: (spoken) => {
      setInputText((prev) => (prev ? `${prev} ${spoken}` : spoken))
      toast.info('Voice Input Captured', `Transcribed in ${currentLanguageDetails.name}`)
    },
    onError: (err) => {
      toast.error('Microphone Notice', err)
    },
  })

  useEffect(() => {
    async function loadMessages() {
      const history = await assistantService.getMessages(language)
      setMessages(history)
    }
    loadMessages()
  }, [language])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText
    if (!text.trim() || isTyping) return

    setInputText('')
    setIsTyping(true)

    try {
      const assistantResponse = await assistantService.sendMessage(text, language)
      setMessages((prev) => [...prev, assistantResponse])
    } catch {
      toast.error('Assistant Error', 'Could not process query. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleClear = async () => {
    await assistantService.clearHistory(language)
    const fresh = await assistantService.getMessages(language)
    setMessages(fresh)
    toast.info('Conversation Cleared')
  }

  const handleExportTranscript = () => {
    const transcriptText = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.content}`)
      .join('\n\n')
    const blob = new Blob([transcriptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `civiqone-ai-transcript-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Transcript Exported', 'Downloaded as text document.')
  }

  const preset = CIVIC_ASSISTANT_CONTENT[language] || CIVIC_ASSISTANT_CONTENT.en

  const displayedSuggestions = useMemo(() => {
    if (activeCategory !== 'all' && CATEGORY_SUGGESTIONS[activeCategory]) {
      return CATEGORY_SUGGESTIONS[activeCategory].map((text) => ({ text }))
    }
    return preset.suggestions
  }, [activeCategory, preset.suggestions])

  const displayedMessages = useMemo(() => {
    if (activeCategory === 'all') return messages
    if (activeCategory === 'applications') {
      return messages.filter(
        (m) =>
          m.cardType === 'application' ||
          m.content.toLowerCase().includes('application') ||
          m.content.toLowerCase().includes('status')
      )
    }
    if (activeCategory === 'grievances') {
      return messages.filter(
        (m) =>
          m.cardType === 'grievance' ||
          m.content.toLowerCase().includes('grievance') ||
          m.content.toLowerCase().includes('complaint')
      )
    }
    if (activeCategory === 'services') {
      return messages.filter(
        (m) =>
          m.cardType === 'service' ||
          m.content.toLowerCase().includes('scheme') ||
          m.content.toLowerCase().includes('subsidy') ||
          m.content.toLowerCase().includes('service')
      )
    }
    if (activeCategory === 'officer') {
      return messages.filter(
        (m) =>
          m.cardType === 'officer' ||
          m.content.toLowerCase().includes('officer') ||
          m.content.toLowerCase().includes('desk')
      )
    }
    return messages
  }, [messages, activeCategory])

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto space-y-3">
      {/* ── Assistant Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl border border-border bg-card shadow-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-primary to-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-lg font-bold text-foreground">
                CiviqOne Intelligent Civic AI Agent
              </h1>
              <Badge variant="verified" size="sm">
                9 Regional Languages
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Autonomous statutory guidance, grievance assistance & document intelligence grounded in government frameworks
            </p>
          </div>
        </div>

        {/* Controls: Language Selector, Customer Care link, Export & Clear */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Support Hub Shortcut */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/support')}
            className="h-9 px-3 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-primary" />
            <span>Support Hub</span>
          </Button>

          {/* Language Dropdown */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-muted/70 hover:bg-muted border border-border text-xs font-semibold text-foreground rounded-xl py-2 pl-3 pr-7 cursor-pointer outline-none transition-colors appearance-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportTranscript}
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl"
            title="Export conversation transcript"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Mode Switcher Filter Bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 px-1">
        {[
          { id: 'all', label: 'All Civic Inquiries' },
          { id: 'applications', label: 'Application Tracking' },
          { id: 'grievances', label: 'Grievance & Redressal' },
          { id: 'services', label: 'Welfare Schemes & Subsidies' },
          { id: 'officer', label: 'Live Officer Escalation' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer',
              activeCategory === cat.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/70'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Messages Scroll Area ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 rounded-3xl border border-border bg-card/60 backdrop-blur-sm shadow-subtle">
        {displayedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">No queries in this category yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Choose a suggested topic below or type your inquiry to get instant statutory assistance.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {displayedSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug.text)}
                  className="px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/15 text-xs text-primary font-medium transition-colors cursor-pointer"
                >
                  {sug.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          displayedMessages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              currentLanguage={language}
              onCardAction={(action, payload) => {
                if (action === 'connect_officer') {
                  navigate('/app/support?tab=live')
                }
                if (action === 'navigate' && typeof payload === 'string') {
                  navigate(payload)
                }
              }}
            />
          ))
        )}

        {isTyping && (
          <div className="flex gap-3 mr-auto max-w-md items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-2 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-mono text-[11px]">Synthesizing civic intelligence across databases...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompt Chips ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0 px-1">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> Suggestions:
        </span>
        {displayedSuggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sug.text)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-colors cursor-pointer"
          >
            {sug.text}
          </button>
        ))}
      </div>

      {/* ── Input Box ── */}
      <div className="relative shrink-0 space-y-2">
        {/* Active Speech Recognition Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs animate-in fade-in slide-in-from-bottom-1 duration-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="font-semibold">
                Listening in {currentLanguageDetails.nativeName} ({currentLanguageDetails.name})... Speak clearly
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 transition-colors"
            >
              Done Speaking
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2 bg-card border border-input rounded-2xl p-2 shadow-subtle focus-within:ring-2 focus-within:ring-ring transition-all"
        >
          {/* Voice Microphone Input Button */}
          {hasSupport && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                isListening
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title={isListening ? 'Stop listening' : `Speak in ${currentLanguageDetails.nativeName}`}
            >
              {isListening ? <Radio className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask CiviqOne AI in ${currentLanguageDetails.nativeName} or English (e.g. check my driving license status, file complaint, solar subsidy)...`}
            className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />

          <Button
            type="submit"
            size="sm"
            disabled={!inputText.trim() || isTyping}
            className="h-10 px-5 gap-1.5 rounded-xl font-semibold shrink-0 shadow-md shadow-primary/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
