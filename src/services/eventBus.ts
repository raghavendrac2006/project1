export type RealtimeEventType =
  | 'CONSENT_REVOKED'
  | 'CONSENT_GRANTED'
  | 'PRIVACY_LOCKDOWN'
  | 'SERVICE_PUBLISHED_CHANGED'
  | 'ACCESS_REQUEST_CREATED'
  | 'APPLICATION_STATUS_UPDATED'
  | 'CITIZEN_ACTION_COMPLETED'
  | 'CREDENTIAL_PROOF_GENERATED'
  | 'FAMILY_MEMBER_ADDED'
  | 'FAMILY_DELEGATION_UPDATED'
  | 'DEVICE_REMOVED'
  | 'SESSION_REVOKED'
  | 'ALL_REMOTE_SESSIONS_REVOKED'
  | 'NOTIFICATION_TRIGGERED'
  | 'WEBHOOK_DISPATCHED'
  | 'DATA_PURGE_EXECUTED'

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType
  payload?: T
  timestamp: string
}

type EventCallback<T = any> = (event: RealtimeEvent<T>) => void

class RealtimeEventBus {
  private channel: BroadcastChannel | null = null
  private listeners: Map<RealtimeEventType, Set<EventCallback>> = new Map()

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('civiqone_realtime_events')
        this.channel.onmessage = (messageEvent) => {
          const data: RealtimeEvent = messageEvent.data
          this.notifyLocal(data)
        }
      } catch (e) {
        console.warn('BroadcastChannel not available, falling back to window storage events', e)
      }
    }

    // Storage event fallback for cross-tab sync in older/restricted environments
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if ((e.key === 'civiqone_realtime_sync' || e.key === 'civiqone_realtime_sync') && e.newValue) {
          try {
            const data: RealtimeEvent = JSON.parse(e.newValue)
            this.notifyLocal(data)
          } catch {
            // Ignore parse errors
          }
        }
      })
    }
  }

  emit<T = any>(type: RealtimeEventType, payload?: T) {
    const event: RealtimeEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    }

    // Notify local listeners
    this.notifyLocal(event)

    // Broadcast across tabs
    if (this.channel) {
      try {
        this.channel.postMessage(event)
      } catch (e) {
        console.warn('Failed to postMessage on BroadcastChannel', e)
      }
    }

    // Storage event trigger for cross-tab sync
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('civiqone_realtime_sync', JSON.stringify(event))
      } catch {
        // storage quota or private mode
      }
    }
  }

  publish<T = any>(type: RealtimeEventType, payload?: T) {
    this.emit(type, payload)
  }

  subscribe<T = any>(type: RealtimeEventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    const callbacks = this.listeners.get(type)!
    callbacks.add(callback)

    // Return unsubscribe cleanup function
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(type)
      }
    }
  }

  private notifyLocal(event: RealtimeEvent) {
    const callbacks = this.listeners.get(event.type)
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(event)
        } catch (err) {
          console.error('Error in realtime event subscriber', err)
        }
      })
    }
  }
}

export const realtimeBus = new RealtimeEventBus()
