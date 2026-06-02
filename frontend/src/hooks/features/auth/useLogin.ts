import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { login } from '@/src/services/auth'
import { saveToken } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'
import { toUser } from '@/src/types/user'

/** Login con email + password. En éxito persiste el token, hidrata la sesión y entra a la app. */
export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: login,
    onSuccess: async ({ user, token }) => {
      await saveToken(token)
      setSession(toUser(user), token)
      router.replace('/')
    },
  })
}
