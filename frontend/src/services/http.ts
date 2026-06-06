import axios from 'axios'
import { useSessionStore } from '@/src/store/sessionStore'

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

// Response: ante un 401 limpiamos la sesión (gancho para refresh token a futuro).
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useSessionStore.getState().clearSession()
      // TODO(backend): renovar con refresh token cuando exista el endpoint.
    }
    return Promise.reject(error)
  },
)

/** Extrae un mensaje de error legible de la respuesta del backend ({ error: string }). */
export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error. Intentá de nuevo.'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.message ?? fallback
  }
  return fallback
}
