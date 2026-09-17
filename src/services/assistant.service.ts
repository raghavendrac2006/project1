import { civicStorage } from './storage'
import { CIVIC_ASSISTANT_CONTENT } from '@/constants/languages'
import type { AssistantMessage, SupportedLanguage } from '@/types'

export const assistantService = {
  async getMessages(lang: SupportedLanguage): Promise<AssistantMessage[]> {
    const stored = civicStorage.getAssistantMessages()
    if (stored.length > 0) return stored

    // Initial greeting if empty
    const initialPreset = CIVIC_ASSISTANT_CONTENT[lang] || CIVIC_ASSISTANT_CONTENT.en
    const initialMessage: AssistantMessage = {
      id: `msg_welcome_${Date.now()}`,
      sender: 'assistant',
      content: initialPreset.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: lang,
      suggestedActions: [
        { label: 'Renew Driving License', action: 'navigate', targetUrl: '/app/applications/app_991' },
        { label: 'Check Property Mutation', action: 'navigate', targetUrl: '/app/applications/app_992' },
        { label: 'Explore Civic Services', action: 'navigate', targetUrl: '/app/services' },
      ],
    }
    civicStorage.saveAssistantMessages([initialMessage])
    return [initialMessage]
  },

  async sendMessage(
    userText: string,
    lang: SupportedLanguage,
    onChunk?: (chunk: string) => void
  ): Promise<AssistantMessage> {
    const history = civicStorage.getAssistantMessages()
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: AssistantMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: now,
      language: lang,
    }

    const updatedWithUser = [...history, userMsg]
    civicStorage.saveAssistantMessages(updatedWithUser)

    // Determine relevant response from preset or fallback intelligent answer
    const preset = CIVIC_ASSISTANT_CONTENT[lang] || CIVIC_ASSISTANT_CONTENT.en
    const lower = userText.toLowerCase()

    let matchedKey: string | undefined
    if (lower.includes('license') || lower.includes('driving') || lower.includes('రవాణా') || lower.includes('உரிமம்') || lower.includes('ಡ್ರೈವಿಂಗ್') || lower.includes('ലൈസൻസ്')) {
      matchedKey = 'dl_renewal'
    } else if (lower.includes('mutation') || lower.includes('property') || lower.includes('khata') || lower.includes('ఆస్తి') || lower.includes('சொத்து') || lower.includes('ಖಾತಾ') || lower.includes('വസ്തു')) {
      matchedKey = 'check_mutation'
    } else if (lower.includes('solar') || lower.includes('surya') || lower.includes('ಸೌರ') || lower.includes('சோலார்') || lower.includes('సౌర') || lower.includes('സോളാർ')) {
      matchedKey = 'solar_subsidy'
    } else if (lower.includes('expir') || lower.includes('valid') || lower.includes('కాలం') || lower.includes('காலாவதி') || lower.includes('ಅವಧಿ') || lower.includes('കാലഹരണ')) {
      matchedKey = 'view_expiring'
    }

    const responseTemplate = matchedKey && preset.mockAnswers[matchedKey]
      ? preset.mockAnswers[matchedKey]
      : {
          answer: lang === 'en'
            ? `I searched the CIVIQONE Central Repository for "${userText}". All your linked documents and biometric credentials are fully protected under Digital Citizen Vault specifications. You can verify your active applications or explore all 40+ statutory services directly from the left navigation.`
            : `CIVIQONE డిజిటల్ సివిక్ రిపోజిటరీలో మీ ప్రశ్న కోసం వెతికాము. మీ అన్ని ధృవీకరణ వివరాలు సురక్షితంగా ఉన్నాయి. మీరు సేవల విభాగం నుండి మరిన్ని వివరాలు పొందవచ్చు.`,
          actions: [
            { label: 'Browse All Services', action: 'navigate', targetUrl: '/app/services' },
            { label: 'View Digital Identity', action: 'navigate', targetUrl: '/app/identity' },
          ],
        }

    // Simulate streaming effect if callback provided
    if (onChunk) {
      const words = responseTemplate.answer.split(' ')
      let accumulated = ''
      for (const word of words) {
        accumulated += (accumulated ? ' ' : '') + word
        onChunk(accumulated)
        await new Promise((r) => setTimeout(r, 20))
      }
    } else {
      await new Promise((r) => setTimeout(r, 400))
    }

    const assistantMsg: AssistantMessage = {
      id: `msg_asst_${Date.now()}`,
      sender: 'assistant',
      content: responseTemplate.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: responseTemplate.actions,
      language: lang,
    }

    civicStorage.saveAssistantMessages([...updatedWithUser, assistantMsg])
    return assistantMsg
  },

  async clearHistory(lang: SupportedLanguage): Promise<void> {
    civicStorage.saveAssistantMessages([])
    await this.getMessages(lang)
  },
}
