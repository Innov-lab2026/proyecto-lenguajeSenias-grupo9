import { useMutation } from '@tanstack/react-query'
import { login } from '@/src/services/auth'
import { saveToken, saveUser } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'
import { toUser } from '@/src/types/user'

/**
 * Login con email + password. En éxito persiste token + user e hidrata la sesión.
 * La navegación a la app la resuelve el guard de rutas al pasar a "authenticated".
 */
export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: login,
    onSuccess: async ({ user, token }) => {
      const normalized = toUser(user)
      await saveToken(token)
      await saveUser(normalized)
      setSession(normalized, token)
    },
  })
}
