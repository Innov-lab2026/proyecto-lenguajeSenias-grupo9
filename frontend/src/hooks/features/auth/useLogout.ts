import { useQueryClient } from '@tanstack/react-query'
import { removeToken, removeUser } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'

/**
 * Cierre de sesión (100% client-side por ahora: no hay endpoint /logout).
 * Limpia token + user persistidos, estado de sesión y cache de queries.
 * El guard de rutas redirige a login al pasar a "unauthenticated".
 */
export function useLogout() {
  const clearSession = useSessionStore((s) => s.clearSession)
  const queryClient = useQueryClient()

  return async () => {
    await removeToken()
    await removeUser()
    clearSession()
    queryClient.clear()
  }
}
