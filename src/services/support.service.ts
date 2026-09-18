import { civicStorage } from './storage'
import { realtimeBus } from './eventBus'
import type {
  CustomerCareTicket,
  GrievanceCategory,
  GrievanceUrgency,
  GrievanceStatus,
  LiveChatSession,
  LiveChatMessage,
  CivicHelpline,
  KnowledgeFaqItem,
  SupportedLanguage,
} from '@/types'

export interface SupportMetrics {
  totalTickets: number
  activeTickets: number
  investigatingTickets: number
  resolvedTickets: number
  slaComplianceRate: number
  avgResolutionHours: number
}

export interface NewGrievancePayload {
  category: GrievanceCategory
  department: string
  subject: string
  description: string
  urgency: GrievanceUrgency
  relatedApplicationId?: string
  statutoryScheme?: string
}

export const supportService = {
  // ── Ticket Operations ──
  async getTickets(): Promise<CustomerCareTicket[]> {
    return civicStorage.getTickets()
  },

  async getTicketById(id: string): Promise<CustomerCareTicket | undefined> {
    return civicStorage.getTicketById(id)
  },

  async getMetrics(): Promise<SupportMetrics> {
    const tickets = civicStorage.getTickets()
    const total = tickets.length
    const active = tickets.filter((t) => t.status === 'lodged' || t.status === 'assigned' || t.status === 'action_proposed').length
    const investigating = tickets.filter((t) => t.status === 'investigating').length
    const resolved = tickets.filter((t) => t.status === 'resolved').length

    return {
      totalTickets: total,
      activeTickets: active,
      investigatingTickets: investigating,
      resolvedTickets: resolved,
      slaComplianceRate: 99.4,
      avgResolutionHours: 18.5,
    }
  },

  async lodgeGrievance(payload: NewGrievancePayload): Promise<CustomerCareTicket> {
    const user = civicStorage.getUser()
    const now = new Date()

    // SLA calculation based on statutory urgency
    let slaHours = 48
    if (payload.urgency === 'critical_statutory') {
      slaHours = 24
    } else if (payload.urgency === 'urgent') {
      slaHours = 36
    } else {
      slaHours = 72
    }

    const deadline = new Date(now.getTime() + slaHours * 3600000).toISOString()
    const stateCode = user.state.substring(0, 2).toUpperCase() || 'IN'
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const ticketNumber = `CGRN-2026-${stateCode}-${randomNum}`

    const newTicket = civicStorage.createTicket({
      ticketNumber,
      citizenId: user.id,
      citizenName: user.name,
      category: payload.category,
      department: payload.department,
      subject: payload.subject,
      description: payload.description,
      urgency: payload.urgency,
      status: 'lodged',
      slaHours,
      slaDeadline: deadline,
      slaRemainingHours: slaHours,
      relatedApplicationId: payload.relatedApplicationId,
      statutoryScheme: payload.statutoryScheme || 'Citizen Charter & Statutory Grievance Redressal Act',
      nodalOfficer: {
        name: 'Officer K. Ramanathan',
        designation: 'Nodal Public Grievance Officer',
        department: payload.department,
        phone: '1905 (Toll-Free Extension 4)',
        email: `grievance.${payload.category}@nic.in`,
        badge: 'Statutory Redressal Officer - Level 2',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    })

    // Create immediate confirmation notification
    const notifs = civicStorage.getNotifications()
    notifs.unshift({
      id: `notif_grv_${Date.now()}`,
      title: `Grievance #${newTicket.ticketNumber} Registered`,
      message: `Your statutory grievance for ${payload.department} has been lodged. Reference: ${newTicket.ticketNumber}. Statutory SLA guarantee: ${slaHours} Hours.`,
      category: 'civic',
      priority: 'high',
      isRead: false,
      createdAt: now.toISOString(),
      actionUrl: '/app/support?tab=tickets',
      actionLabel: 'Track Grievance',
    })
    civicStorage.saveNotifications(notifs)

    return newTicket
  },

  async escalateGrievance(ticketId: string, reason: string): Promise<CustomerCareTicket | undefined> {
    return civicStorage.updateTicketStatus(
      ticketId,
      'escalated',
      `Escalated to First Appellate Authority (Directorate Level) under Citizen Charter. Reason: ${reason}`
    )
  },

  // ── Live Officer Chat Operations ──
  async getLiveSession(): Promise<LiveChatSession> {
    return civicStorage.getLiveChatSession()
  },

  async sendLiveMessage(text: string): Promise<LiveChatMessage> {
    const session = civicStorage.getLiveChatSession()
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const citizenMsg: LiveChatMessage = {
      id: `msg_cit_${Date.now()}`,
      sender: 'citizen',
      senderName: 'You (Aarav Mehta)',
      text,
      timestamp: nowTime,
    }

    session.messages.push(citizenMsg)
    civicStorage.saveLiveChatSession(session)

    // Simulate realistic officer reply after a short delay
    setTimeout(() => {
      const currentSession = civicStorage.getLiveChatSession()
      const lower = text.toLowerCase()
      let replyText = `Thank you for the update, Aarav ji. I am verifying this with the ${currentSession.officerDepartment} database right now. Your statutory record is in order.`

      if (lower.includes('license') || lower.includes('driving') || lower.includes('rto')) {
        replyText = `I have pulled up your Driving License application (#KA-RTO-2026-992140). The re-uploaded utility bill is now marked verified on our terminal. The smart card dispatch authorization will be completed within 24 hours.`
      } else if (lower.includes('mutation') || lower.includes('property') || lower.includes('khata')) {
        replyText = `Regarding your E-Khata Mutation (#KA-REV-2026-004812), the statutory public notice stage ends on 29 September 2026. If no disputes are entered, the digital title certificate will be stamped and auto-issued to your vault.`
      } else if (lower.includes('tax') || lower.includes('payment') || lower.includes('bill')) {
        replyText = `I have flagged your payment ledger for audit reconciliation with the treasury accounts department. A revised receipt reflecting the rebate will be generated shortly.`
      } else if (lower.includes('callback') || lower.includes('call') || lower.includes('phone')) {
        replyText = `Certainly. I have logged an expedited telephone callback request on your registered mobile (9845012345). A senior duty officer will call you within 15 minutes.`
      }

      const officerMsg: LiveChatMessage = {
        id: `msg_off_${Date.now()}`,
        sender: 'officer',
        senderName: currentSession.officerName,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      currentSession.messages.push(officerMsg)
      civicStorage.saveLiveChatSession(currentSession)
    }, 1200)

    return citizenMsg
  },

  async requestCallback(phone: string, preferredTime: string, notes?: string): Promise<{ success: boolean; reference: string }> {
    const ref = `CB-2026-${Math.floor(10000 + Math.random() * 90000)}`
    const notifs = civicStorage.getNotifications()
    notifs.unshift({
      id: `notif_cb_${Date.now()}`,
      title: `Callback Scheduled: Ref #${ref}`,
      message: `A Citizen Care Officer will call ${phone} around ${preferredTime}. Nodal Desk: Centralized Citizen Grievance Cell.`,
      category: 'civic',
      priority: 'medium',
      isRead: false,
      createdAt: new Date().toISOString(),
    })
    civicStorage.saveNotifications(notifs)
    return { success: true, reference: ref }
  },

  // ── Helplines & Knowledge FAQs ──
  getHelplines(): CivicHelpline[] {
    return civicStorage.getHelplines()
  },

  getFAQs(language: SupportedLanguage = 'en', search?: string): KnowledgeFaqItem[] {
    const faqs = civicStorage.getKnowledgeFaqs()
    if (!search?.trim()) return faqs

    const q = search.toLowerCase()
    return faqs.filter((item) => {
      const question = (item.question[language] || item.question.en).toLowerCase()
      const answer = (item.answer[language] || item.answer.en).toLowerCase()
      const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q))
      return question.includes(q) || answer.includes(q) || matchesTags
    })
  },
}
