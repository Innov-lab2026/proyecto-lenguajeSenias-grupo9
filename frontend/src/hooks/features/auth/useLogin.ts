import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { login } from '@/src/services/auth'
import { saveRefreshToken, saveToken, saveUser } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'
import { getTokenExpiry } from '@/src/utils/jwt'
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
  const router = useRouter()

  return useMutation({
    mutationFn: ({ payload }: LoginArgs) => login(payload),
    onSuccess: async ({ user, session }, { rememberMe }) => {
      const normalized = toUser(user)
      const token = session.access_token
      const refreshToken = session.refresh_token
      // `exp` del JWT como fuente autoritativa; `expires_in` como respaldo.
      const expiresAt = getTokenExpiry(token) ?? Math.floor(Date.now() / 1000) + session.expires_in
      if (rememberMe) {
        await saveToken(token)
        await saveRefreshToken(refreshToken)
        await saveUser(normalized)
      }
      setSession(normalized, token, { refreshToken, expiresAt })
      router.replace('/home')
    },
  })
}
