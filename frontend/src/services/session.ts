import type { QueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/lib/supabase'
import { removeRefreshToken, removeToken, removeUser } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'

/** Resultado de renovar la sesión: sólo tokens (el usuario no cambia en un refresh). */
export interface RefreshedSession {
  token: string
  refreshToken: string
  /** Epoch (segundos) de expiración del nuevo access token, o null si no vino. */
  expiresAt: number | null
}

/**
 * Renueva la sesión a partir del refresh token. Fuente única, reusada por la
 * hidratación (refresh proactivo) y por el interceptor 401 (refresh reactivo).
 *
 * ⚠️ Supabase ROTA el refresh token: cada llamada invalida el anterior y
 * devuelve uno nuevo. El llamador DEBE persistir el `refreshToken` devuelto; si
 * reusa el viejo, la próxima renovación falla.
 */
export async function refreshSession(refreshToken: string): Promise<RefreshedSession> {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  if (error || !data.session) throw error ?? new Error('El refresh no devolvió una sesión')

  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? null,
  }
}

/**
 * Cierre de sesión unificado: limpia storage (token, user, refresh), el estado
 * en memoria y la cache de queries. Lo usan tanto el logout explícito como el
 * cierre forzado cuando el refresh falla, para que ningún token muerto sobreviva
 * a una recarga.
 */
export async function signOut(queryClient?: QueryClient): Promise<void> {
  await Promise.all([removeToken(), removeUser(), removeRefreshToken()])
  useSessionStore.getState().clearSession()
  queryClient?.clear()
}
