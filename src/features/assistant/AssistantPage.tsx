import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Volume2,
  Trash2,
  Languages,
  User,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast, useLanguage } from '@/hooks'
import { assistantService } from '@/services/assistant.service'
import { SUPPORTED_LANGUAGES, CIVIC_ASSISTANT_CONTENT } from '@/constants/languages'
import type { AssistantMessage, SupportedLanguage } from '@/types'

export function AssistantPage() {
  const { language, setLanguage, currentLanguageDetails } = useLanguage()
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const navigate = useNavigate()

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

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to Clipboard')
  }

  const handleSpeak = (content: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.lang = language === 'en' ? 'en-IN' : language
      window.speechSynthesis.speak(utterance)
      toast.info('Audio Playback', 'Reading message aloud.')
    } else {
      toast.error('Speech Unavailable', 'Your browser does not support speech synthesis.')
    }
  }

  const preset = CIVIC_ASSISTANT_CONTENT[language] || CIVIC_ASSISTANT_CONTENT.en

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto space-y-4">
      {/* Assistant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card shadow-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-primary to-sky-500 text-white flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-bold text-foreground">
                CIVIQONE Intelligent Civic Copilot
              </h1>
              <Badge variant="verified" size="sm">
                Active AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Autonomous statutory guidance grounded in official government frameworks
            </p>
          </div>
        </div>

        {/* Controls: Language Selector & Clear */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            <Languages className="w-3.5 h-3.5 text-muted-foreground ml-2" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-semibold text-foreground outline-none pr-2 pl-1 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-subtle">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant'
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-subtle ${
                  isAssistant ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-card border border-border text-foreground shadow-subtle rounded-tl-sm'
                      : 'bg-primary text-primary-foreground shadow-sm rounded-tr-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Actions inside assistant bubbles */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (act.targetUrl) navigate(act.targetUrl)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-colors"
                        >
                          <span>{act.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bubble footer actions */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-muted-foreground ${
                    isAssistant ? 'justify-start pl-1' : 'justify-end pr-1'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isAssistant && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="hover:text-foreground transition-colors"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="hover:text-foreground transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex gap-3 mr-auto max-w-md items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="p-3.5 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-2 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-mono text-[11px]">Synthesizing civic intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> Suggestions:
        </span>
        {preset.suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sug.text)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-colors"
          >
            {sug.text}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2 bg-card border border-input rounded-2xl p-2 shadow-subtle focus-within:ring-2 focus-within:ring-ring"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask CIVIQONE AI in ${currentLanguageDetails.nativeName} or English...`}
            className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputText.trim() || isTyping}
            className="h-9 px-4 gap-1.5 rounded-xl font-semibold shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
