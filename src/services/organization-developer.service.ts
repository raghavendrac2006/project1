/**
 * organization-developer.service.ts
 * B2B Developer API keys, Webhooks management, and real-time event simulation.
 */

import type { ApiKeyItem, WebhookEndpoint, WebhookDeliveryLog } from '@/types'
import { realtimeBus } from './eventBus'

const STORAGE_KEYS = {
  API_KEYS: 'civiq_org_api_keys',
  WEBHOOKS: 'civiq_org_webhooks',
  DELIVERY_LOGS: 'civiq_org_delivery_logs',
}

const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key_prod_01',
    name: 'Production Core Underwriting Service',
    keyPrefix: 'civ_live_8f7b...9a41',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'active',
    scopes: ['applications:read', 'applications:write', 'zkp:verify', 'citizens:inspect'],
    environment: 'production',
  },
  {
    id: 'key_sbx_02',
    name: 'Staging CI/CD Verification Engine',
    keyPrefix: 'civ_test_12c4...aa82',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    scopes: ['applications:read', 'zkp:verify'],
    environment: 'sandbox',
  },
]

const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh_ep_01',
    url: 'https://api.hdfcbank.com/civiq/webhooks/v2',
    description: 'Core LOS sync on application approvals and status transitions',
    events: ['application.status_changed', 'zkp.proof_verified', 'consent.revoked'],
    status: 'active',
    secretPrefix: 'whsec_99a8b...12',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'wh_ep_02',
    url: 'https://fraud-shield.internal.org/hooks/civiq-alert',
    description: 'Fraud & risk anomaly broadcast queue',
    events: ['anomaly.detected', 'compliance.purge_completed'],
    status: 'active',
    secretPrefix: 'whsec_77e2c...44',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
]

const INITIAL_LOGS: WebhookDeliveryLog[] = [
  {
    id: 'log_dlv_01',
    endpointId: 'wh_ep_01',
    endpointUrl: 'https://api.hdfcbank.com/civiq/webhooks/v2',
    event: 'application.status_changed',
    status: 'success',
    statusCode: 200,
    latencyMs: 142,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    payloadSnippet: '{"event":"application.status_changed","applicationId":"APP-2026-9921","status":"APPROVED"}',
    responseSnippet: '{"acknowledged":true,"syncId":"sync_hdfc_88319"}',
    signatureHeader: 't=1773738291,v1=9f82c40ba12e45778...',
  },
  {
    id: 'log_dlv_02',
    endpointId: 'wh_ep_02',
    endpointUrl: 'https://fraud-shield.internal.org/hooks/civiq-alert',
    event: 'anomaly.detected',
    status: 'success',
    statusCode: 202,
    latencyMs: 98,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    payloadSnippet: '{"event":"anomaly.detected","severity":"warning","signalId":"sig_9918"}',
    responseSnippet: '{"queued":true,"queuePos":4}',
    signatureHeader: 't=1773736311,v1=12a7bc4009ef3211...',
  },
]

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export const organizationDeveloperService = {
  getApiKeys: async (): Promise<ApiKeyItem[]> => {
    return getStored(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS)
  },

  createApiKey: async (
    name: string,
    environment: 'production' | 'sandbox',
    scopes: string[]
  ): Promise<ApiKeyItem & { secret: string }> => {
    const keys = getStored(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS)
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const secret = `civ_${environment === 'production' ? 'live' : 'test'}_${randomHex}`
    const keyPrefix = `${secret.slice(0, 12)}...${secret.slice(-4)}`

    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name,
      keyPrefix,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      status: 'active',
      scopes: scopes.length ? scopes : ['applications:read'],
      environment,
    }

    const updated = [newKey, ...keys]
    setStored(STORAGE_KEYS.API_KEYS, updated)

    return { ...newKey, secret }
  },

  revokeApiKey: async (id: string): Promise<ApiKeyItem> => {
    const keys = getStored(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS)
    const updated = keys.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    setStored(STORAGE_KEYS.API_KEYS, updated)
    const found = updated.find((k) => k.id === id)!
    return found
  },

  getWebhookEndpoints: async (): Promise<WebhookEndpoint[]> => {
    return getStored(STORAGE_KEYS.WEBHOOKS, INITIAL_WEBHOOKS)
  },

  createWebhookEndpoint: async (url: string, description: string, events: string[]): Promise<WebhookEndpoint> => {
    const endpoints = getStored(STORAGE_KEYS.WEBHOOKS, INITIAL_WEBHOOKS)
    const secretPrefix = `whsec_${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`
    const newEp: WebhookEndpoint = {
      id: `wh_ep_${Date.now()}`,
      url,
      description,
      events: events.length ? events : ['application.status_changed'],
      status: 'active',
      secretPrefix,
      createdAt: new Date().toISOString(),
      lastDeliveryAt: null,
    }
    const updated = [newEp, ...endpoints]
    setStored(STORAGE_KEYS.WEBHOOKS, updated)
    return newEp
  },

  deleteWebhookEndpoint: async (id: string): Promise<void> => {
    const endpoints = getStored(STORAGE_KEYS.WEBHOOKS, INITIAL_WEBHOOKS)
    const updated = endpoints.filter((e) => e.id !== id)
    setStored(STORAGE_KEYS.WEBHOOKS, updated)
  },

  getDeliveryLogs: async (): Promise<WebhookDeliveryLog[]> => {
    return getStored(STORAGE_KEYS.DELIVERY_LOGS, INITIAL_LOGS)
  },

  sendTestWebhook: async (endpointId: string, event: string): Promise<WebhookDeliveryLog> => {
    const endpoints = getStored(STORAGE_KEYS.WEBHOOKS, INITIAL_WEBHOOKS)
    const ep = endpoints.find((e) => e.id === endpointId) || endpoints[0]

    // Simulate network latency
    const latency = Math.floor(Math.random() * 160) + 60
    await new Promise((r) => setTimeout(r, latency))

    const isSuccess = Math.random() > 0.05
    const statusCode = isSuccess ? 200 : 502
    const sig = `t=${Math.floor(Date.now() / 1000)},v1=${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

    const log: WebhookDeliveryLog = {
      id: `log_${Date.now()}`,
      endpointId: ep?.id || 'manual_test',
      endpointUrl: ep?.url || 'https://api.internal.org/webhook',
      event,
      status: isSuccess ? 'success' : 'failure',
      statusCode,
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      payloadSnippet: JSON.stringify({
        event,
        id: `evt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        testMode: true,
        data: { testReferenceId: 'SIM-90921', status: 'DISPATCHED' },
      }),
      responseSnippet: isSuccess
        ? JSON.stringify({ success: true, processedAt: new Date().toISOString() })
        : JSON.stringify({ error: 'Endpoint returned 502 Bad Gateway' }),
      signatureHeader: sig,
    }

    const logs = getStored(STORAGE_KEYS.DELIVERY_LOGS, INITIAL_LOGS)
    setStored(STORAGE_KEYS.DELIVERY_LOGS, [log, ...logs.slice(0, 49)])

    // Update endpoint lastDeliveryAt
    if (ep) {
      const updatedEndpoints = endpoints.map((e) =>
        e.id === ep.id ? { ...e, lastDeliveryAt: new Date().toISOString() } : e
      )
      setStored(STORAGE_KEYS.WEBHOOKS, updatedEndpoints)
    }

    // Publish event bus alert
    realtimeBus.publish('NOTIFICATION_TRIGGERED' as any, {
      title: `Webhook Dispatched: ${event}`,
      category: 'system',
      url: ep?.url,
      status: log.status,
    })

    return log
  },
}
