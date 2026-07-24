import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getToken, saveRefreshToken, saveToken } from '@/src/lib/storage'
import { refreshSession, signOut } from '@/src/services/session'
import { useSessionStore } from '@/src/store/sessionStore'
import { USE_MOCK_AUTH } from '@/src/constants/env'

/**
 * Instancia central de Axios.
 * El backend Express monta las rutas bajo `/api`, por eso lo agregamos al baseURL.
 */
export const http = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true, // habilitar SOLO si web pasa a cookie httpOnly
})

// Request: agrega el Bearer token desde el store (fuente en memoria, rápida).
http.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  /** Marca que esta request ya se reintentó una vez tras un refresh. */
  _retry?: boolean
}

/**
 * Refresco compartido entre requests concurrentes (single-flight): si varias
 * piden refrescar a la vez, todas esperan la MISMA llamada en vez de disparar
 * N refreshes. Es necesario porque Supabase ROTA el refresh token en cada uso
 * — refrescar en paralelo invalidaría el token que usa la otra llamada.
 */
let refreshPromise: Promise<string> | null = null

async function performRefresh(): Promise<string> {
  const currentRefreshToken = useSessionStore.getState().refreshToken
  if (!currentRefreshToken) throw new Error('No hay refresh token disponible')

  const refreshed = await refreshSession(currentRefreshToken)
  useSessionStore.getState().updateTokens(refreshed.token, refreshed.refreshToken, refreshed.expiresAt)

  // Sólo persistimos si la sesión ya vivía en storage (login con "recordarme" o Google).
  const persistedToken = await getToken()
  if (persistedToken) {
    await saveToken(refreshed.token)
    await saveRefreshToken(refreshed.refreshToken)
  }

  return refreshed.token
}

// Response: ante un 401, intenta refrescar la sesión UNA vez y reintenta la
// request original con el token nuevo. Si no hay refresh token, si el refresh
// falla, o si la request YA era un reintento post-refresh, cierra la sesión.
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined

    if (error.response?.status !== 401 || !config) {
      return Promise.reject(error)
    }

    // El reintento post-refresh también dio 401: la sesión no se pudo recuperar.
    if (config._retry) {
      await signOut()
      return Promise.reject(error)
    }

    // Modo mock: no hay refresh real que intentar (no debería llegar acá, ya
    // que los servicios mockeados nunca llaman a `http`; es red de seguridad).
    if (USE_MOCK_AUTH) {
      return Promise.reject(error)
    }

    try {
      refreshPromise ??= performRefresh().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise

      config._retry = true
      config.headers.Authorization = `Bearer ${newToken}`
      return http(config)
    } catch {
      await signOut()
      return Promise.reject(error)
    }
  },
)

/** Extrae un mensaje de error legible de la respuesta del backend ({ error: string }). */
export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error. Intentá de nuevo.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data?.error === 'string') return data.error
    if (typeof error.message === 'string' && error.message) return error.message
  }
  return fallback
}
