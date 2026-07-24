import { useEffect } from 'react'
import { getRefreshToken, getToken, getUser, saveRefreshToken, saveToken } from '@/src/lib/storage'
import { refreshSession, signOut } from '@/src/services/session'
import { useSessionStore } from '@/src/store/sessionStore'
import { getTokenExpiry, isExpired } from '@/src/utils/jwt'

/**
 * Restaura la sesión al iniciar la app.
 *
 * Si el access token está vencido, intenta renovarlo ANTES de marcar la sesión
 * como autenticada (refresh proactivo): evita montar las pantallas protegidas
 * con un token muerto y disparar un 401 innecesario contra el backend. Si el
 * refresh también falla (o no hay refresh token), la sesión se cierra por
 * completo — el guard de rutas redirige a login.
 */
export function useSessionHydration() {
  const setSession = useSessionStore((s) => s.setSession)
  const clearSession = useSessionStore((s) => s.clearSession)

  useEffect(() => {
    let active = true

    void (async () => {
      const [token, refreshToken, user] = await Promise.all([getToken(), getRefreshToken(), getUser()])
      if (!active) return

      if (!token || !user) {
        // Estado parcial/ausente: limpiamos storage para evitar inconsistencias.
        if (token || refreshToken || user) {
          await signOut()
        } else {
          clearSession()
        }
        return
      }

      if (!isExpired(token)) {
        setSession(user, token, { refreshToken, expiresAt: getTokenExpiry(token) })
        return
      }

      if (!refreshToken) {
        await signOut()
        return
      }

      try {
        const refreshed = await refreshSession(refreshToken)
        await Promise.all([saveToken(refreshed.token), saveRefreshToken(refreshed.refreshToken)])
        setSession(user, refreshed.token, {
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
        })
      } catch {
        await signOut()
      }
    })()

    return () => {
      active = false
    }
  }, [setSession, clearSession])
}
