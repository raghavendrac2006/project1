import { civicStorage } from './storage'
import { aiAgentService } from './ai-agent.service'
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
        { label: 'Lodge Citizen Grievance', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
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

    // Process message through Senior AI Agent Engine
    const assistantMsg = await aiAgentService.processMessage(userText, lang)

    // Simulate streaming effect if callback provided
    if (onChunk) {
      const words = assistantMsg.content.split(' ')
      let accumulated = ''
      for (const word of words) {
        accumulated += (accumulated ? ' ' : '') + word
        onChunk(accumulated)
        await new Promise((r) => setTimeout(r, 18))
      }
    } else {
      await new Promise((r) => setTimeout(r, 350))
    }

    civicStorage.saveAssistantMessages([...updatedWithUser, assistantMsg])
    return assistantMsg
  },

  async clearHistory(lang: SupportedLanguage): Promise<void> {
    civicStorage.saveAssistantMessages([])
    await this.getMessages(lang)
  },
}
