import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { RichCards } from './RichCards'
import { useToast } from '@/hooks'
import { cn } from '@/lib/utils'
import type { AssistantMessage, SupportedLanguage } from '@/types'

interface ChatMessageBubbleProps {
  message: AssistantMessage
  currentLanguage: SupportedLanguage
  onCardAction?: (action: string, payload?: any) => void
}

export function ChatMessageBubble({
  message,
  currentLanguage,
  onCardAction,
}: ChatMessageBubbleProps) {
  const isAssistant = message.sender === 'assistant'
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Copied to Clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio Unavailable', 'Speech synthesis is not supported on this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.content)

    // Match BCP-47 language tag
    const langMap: Record<SupportedLanguage, string> = {
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

    utterance.lang = langMap[message.language || currentLanguage] || 'en-IN'
    utterance.rate = 0.95 // slightly slower for statutory clarity
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed) {
            return <div key={idx} className="h-1" />
          }

          // Section header with icons (📌, 📋, 💰, ⏱️, 🚀, ⚠️, 💡)
          const isHeader = /^(📌|📋|💰|⏱️|🚀|⚠️|💡)/.test(trimmed)
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)

          // Parse **bold** parts
          const parts = line.split(/(\*\*[^*]+\*\*)/g)
          const parsedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <span key={pIdx} className="font-semibold text-foreground">
                  {part.slice(2, -2)}
                </span>
              )
            }
            return part
          })

          if (isHeader) {
            return (
              <div
                key={idx}
                className="mt-2.5 pt-1 font-semibold text-xs sm:text-[12.5px] text-foreground tracking-tight flex items-baseline gap-1"
              >
                {parsedLine}
              </div>
            )
          }

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2 text-xs text-foreground/90">
                <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                <div className="flex-1">{parsedLine}</div>
              </div>
            )
          }

          return (
            <p key={idx} className="text-xs sm:text-[12.5px] text-foreground/90 break-words">
              {parsedLine}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[88%] sm:max-w-[82%]',
        isAssistant ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'
      )}
    >
      {/* Avatar Icon */}
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm text-xs font-bold',
          isAssistant
            ? 'bg-gradient-to-tr from-primary via-sky-600 to-blue-500 text-white'
            : 'bg-muted text-foreground border border-border'
        )}
      >
        {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
      </div>

      {/* Message Content Body */}
      <div className="space-y-1.5 min-w-0">
        <div
          className={cn(
            'p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed select-text shadow-subtle',
            isAssistant
              ? 'bg-card border border-border/80 text-foreground rounded-tl-sm'
              : 'bg-primary text-primary-foreground font-medium rounded-tr-sm'
          )}
        >
          {/* Escalation alert badge */}
          {isAssistant && message.isEscalated && (
            <div className="mb-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10.5px] font-semibold text-amber-700 dark:text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Priority Statutory Review / Human Officer Escalation</span>
            </div>
          )}

          {/* Render formatted message content */}
          {renderFormattedContent(message.content)}

          {/* Render Rich Card if available */}
          {isAssistant && message.cardType && message.cardData && (
            <RichCards
              type={message.cardType}
              data={message.cardData}
              onAction={onCardAction}
            />
          )}

          {/* Suggested Actions within bubble */}
          {isAssistant && message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap gap-1.5">
              {message.suggestedActions.map((act, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (act.targetUrl) navigate(act.targetUrl)
                    onCardAction?.('action', act)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-colors cursor-pointer"
                >
                  <span>{act.label}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Time & Action Tools */}
        <div
          className={cn(
            'flex items-center gap-2 text-[10px] text-muted-foreground px-1',
            isAssistant ? 'justify-start' : 'justify-end'
          )}
        >
          <span>{message.timestamp}</span>
          {isAssistant && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopy}
                className="hover:text-foreground transition-colors p-0.5"
                title="Copy response"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={handleSpeak}
                className={cn('hover:text-foreground transition-colors p-0.5', isSpeaking && 'text-primary animate-pulse')}
                title={isSpeaking ? 'Stop speech' : 'Listen aloud'}
              >
                {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-500" /> : <Volume2 className="w-3 h-3" />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
