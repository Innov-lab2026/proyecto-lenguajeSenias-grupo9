import { useQueryClient } from '@tanstack/react-query'
import { signOut } from '@/src/services/session'

/**
 * Cierre de sesión. Delega en `signOut`, que limpia storage (token, user,
 * refresh), estado en memoria y cache de queries — el mismo camino que usa el
 * cierre forzado cuando el refresh falla. El guard de rutas redirige a login al
 * pasar a "unauthenticated".
 */
export function useLogout() {
  const queryClient = useQueryClient()
  return () => signOut(queryClient)
}
