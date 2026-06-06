import { useEffect } from 'react'
import { getToken, getUser, removeToken, removeUser } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'

/**
 * Restaura la sesión al iniciar la app.
 * Sin GET /me, confiamos en el token + user persistidos; si el token está vencido,
 * el primer request dará 401 y el interceptor limpiará la sesión.
 */
export function useSessionHydration() {
  const setSession = useSessionStore((s) => s.setSession)
  const clearSession = useSessionStore((s) => s.clearSession)

  useEffect(() => {
    let active = true

    void (async () => {
      const [token, user] = await Promise.all([getToken(), getUser()])
      if (!active) return

      if (token && user) {
        setSession(user, token)
        // TODO(backend): validar el token con GET /me cuando exista.
      } else {
        // Estado parcial/ausente: limpiamos para evitar inconsistencias.
        if (token || user) {
          await Promise.all([removeToken(), removeUser()])
        }
        clearSession()
      }
    })()

    return () => {
      active = false
    }
  }, [setSession, clearSession])
}
