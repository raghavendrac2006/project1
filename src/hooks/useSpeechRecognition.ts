import { useState, useEffect, useRef, useCallback } from 'react'
import type { SupportedLanguage } from '@/types'

// Map portal language codes to BCP 47 locales for speech recognition
const LANG_TO_LOCALE: Record<SupportedLanguage, string> = {
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

interface SpeechRecognitionOptions {
  language?: SupportedLanguage
  onResult?: (text: string) => void
  onError?: (err: string) => void
}

export function useSpeechRecognition({
  language = 'en',
  onResult,
  onError,
}: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [hasSupport, setHasSupport] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use ref to keep recognition instance
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setHasSupport(true)
    } else {
      setHasSupport(false)
    }
  }, [])

  const startListening = useCallback(() => {
    setError(null)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      setError(msg)
      onError?.(msg)
      return
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition()
      recognition.lang = LANG_TO_LOCALE[language] || 'en-IN'
      recognition.interimResults = true
      recognition.continuous = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        let currentTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i]
          if (item[0]) {
            currentTranscript += item[0].transcript
          }
        }
        setTranscript(currentTranscript)

        const lastResult = event.results[event.results.length - 1]
        if (lastResult && lastResult.isFinal) {
          const trimmed = currentTranscript.trim()
          if (trimmed) {
            onResult?.(trimmed)
          }
        }
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event.error !== 'no-speech') {
          const errText = `Voice input error: ${event.error}`
          setError(errText)
          onError?.(errText)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setIsListening(false)
      const errText = err instanceof Error ? err.message : 'Failed to start microphone'
      setError(errText)
      onError?.(errText)
    }
  }, [language, onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  return {
    isListening,
    transcript,
    hasSupport,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
