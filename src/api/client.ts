import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { resolveMock } from './mock/resolver'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// Offline/demo mode: when enabled, requests are served from the local mock
// layer so the app works with no backend (e.g. the public hackathon demo).
// Forced on by VITE_OFFLINE_MODE=true, otherwise auto-enabled as a fallback
// whenever the backend is unreachable (network error / timeout).
const FORCE_OFFLINE = import.meta.env.VITE_OFFLINE_MODE === 'true'

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Keep a handle to the default adapter so we can delegate to the real network.
const defaultAdapter = apiClient.defaults.adapter

function isConnectionError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  // No HTTP response means the server was unreachable (DNS, CORS-less host,
  // connection refused, timeout, etc.).
  return !error.response
}

// Custom adapter: serve mock data when offline is forced, or transparently fall
// back to mock data when the backend cannot be reached.
apiClient.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  if (FORCE_OFFLINE) {
    const mock = resolveMock(config)
    if (mock) return mock
  }

  try {
    const adapter =
      typeof defaultAdapter === 'function'
        ? defaultAdapter
        : axios.getAdapter(defaultAdapter)
    return await adapter(config)
  } catch (error) {
    if (isConnectionError(error)) {
      const mock = resolveMock(config)
      if (mock) return mock
    }
    throw error
  }
}

// ── Request interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 token refresh ───────────────────────────
let isRefreshing = false
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
        const newToken: string = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
