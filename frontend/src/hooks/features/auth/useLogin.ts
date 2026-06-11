import { useMutation } from '@tanstack/react-query'
import { login } from '@/src/services/auth'
import { saveToken, saveUser } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'
import { toUser } from '@/src/types/user'
import type { LoginRequest } from '@/src/types/auth'

interface LoginArgs {
  payload: LoginRequest
  /**
   * "Recordarme en este equipo": si es true persiste token + user en storage
   * (la sesión sobrevive al cerrar la app); si es false, la sesión vive sólo
   * en memoria y se pierde al cerrar.
   */
  rememberMe: boolean
}

/**
 * Login con email + password. En éxito hidrata la sesión (y la persiste según
 * `rememberMe`). La navegación la resuelve el guard de rutas al pasar a "authenticated".
 */
export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: ({ payload }: LoginArgs) => login(payload),
    onSuccess: async ({ user, token }, { rememberMe }) => {
      const normalized = toUser(user)
      if (rememberMe) {
        await saveToken(token)
        await saveUser(normalized)
      }
      setSession(normalized, token)
    },
  })
}
