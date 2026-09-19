import { civicStorage } from './storage'

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number
  success: boolean
}

export interface ApiClientConfig {
  baseUrl: string
  useMockFallback: boolean
  timeoutMs: number
}

const getEnvConfig = (): ApiClientConfig => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1'
  const useMockFallback = import.meta.env.VITE_USE_MOCK !== 'false'
  const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000
  return { baseUrl, useMockFallback, timeoutMs }
}

class ApiClient {
  private config: ApiClientConfig

  constructor() {
    this.config = getEnvConfig()
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    }

    const token = civicStorage.getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackFn?: () => Promise<T> | T
  ): Promise<T> {
    // If no live remote backend is explicitly configured via VITE_API_BASE_URL, use fallback immediately
    const hasLiveBackend = Boolean(
      import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost')
    )
    if (!hasLiveBackend && fallbackFn) {
      return Promise.resolve(fallbackFn())
    }

    const url = `${this.config.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`
        if (errorData) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((item: unknown) => {
              if (typeof item === 'object' && item !== null && 'msg' in item) {
                return (item as { msg: string }).msg
              }
              return String(item)
            }).join(', ')
          } else if (typeof errorData.message === 'string') {
            errorMessage = errorData.message
          }
        }
        throw new Error(errorMessage)
      }

      const json = await response.json()
      return json.data !== undefined ? json.data : json
    } catch (error) {
      clearTimeout(timer)

      // If backend call fails and a fallback mock provider exists, execute fallback
      if (fallbackFn) {
        console.warn(`[ApiClient] Live backend request to '${url}' failed (${(error as Error).message}). Executing mock fallback provider.`)
        return Promise.resolve(fallbackFn())
      }

      throw error
    }
  }

  async get<T>(endpoint: string, fallbackFn?: () => Promise<T> | T): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, fallbackFn)
  }

  async post<T>(endpoint: string, body?: unknown, fallbackFn?: () => Promise<T> | T): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'POST', body: body ? JSON.stringify(body) : undefined },
      fallbackFn
    )
  }

  async put<T>(endpoint: string, body?: unknown, fallbackFn?: () => Promise<T> | T): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'PUT', body: body ? JSON.stringify(body) : undefined },
      fallbackFn
    )
  }

  async patch<T>(endpoint: string, body?: unknown, fallbackFn?: () => Promise<T> | T): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'PATCH', body: body ? JSON.stringify(body) : undefined },
      fallbackFn
    )
  }

  async delete<T>(endpoint: string, fallbackFn?: () => Promise<T> | T): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, fallbackFn)
  }
}

export const apiClient = new ApiClient()
