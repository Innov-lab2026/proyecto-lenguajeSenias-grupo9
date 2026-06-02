import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { removeToken } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'

/**
 * Cierre de sesión (100% client-side por ahora: no hay endpoint /logout).
 * Limpia token persistido, estado de sesión y cache de queries, y vuelve a login.
 */
export function useLogout() {
  const clearSession = useSessionStore((s) => s.clearSession)
  const queryClient = useQueryClient()

  return async () => {
    await removeToken()
    clearSession()
    queryClient.clear()
    router.replace('/login')
  }
}
