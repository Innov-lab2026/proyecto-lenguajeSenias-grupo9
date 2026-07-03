import { useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase'
import { saveToken, saveUser } from '@/src/lib/storage'
import { useSessionStore } from '@/src/store/sessionStore'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { User } from '@/src/types/user'

// Cierra sesiones de auth pendientes al recargar la pestaña (recomendado por Expo en web).
WebBrowser.maybeCompleteAuthSession()

/** Mapea el usuario de Supabase (Google) al modelo interno de la app. */
function toGoogleUser(user: SupabaseAuthUser): User {
  const metadata = user.user_metadata ?? {}
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : undefined
  const [firstFromFullName, ...restFromFullName] = fullName?.split(' ') ?? []

  const firstName =
    firstFromFullName || (typeof metadata.given_name === 'string' ? metadata.given_name : undefined)
  const lastName =
    restFromFullName.length > 0
      ? restFromFullName.join(' ')
      : typeof metadata.family_name === 'string'
        ? metadata.family_name
        : undefined

  return {
    id: user.id,
    email: user.email ?? '',
    firstName,
    lastName,
  }
}

/**
 * Login/registro con Google vía Supabase (OAuth + PKCE).
 * Funciona en web directo (popup); en nativo el redirect por scheme requiere
 * un development build (no funciona en Expo Go).
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setSession = useSessionStore((s) => s.setSession)

  const signInWithGoogle = async () => {
    if (USE_MOCK_AUTH) {
      setError('El login con Google no está disponible en modo mock.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const redirectTo = makeRedirectUri({ scheme: 'frontend' })

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (oauthError) throw oauthError
      if (!data.url) throw new Error('No se pudo iniciar el flujo de Google.')

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type !== 'success') return // cancelado por el usuario, sin error

      const code = new URL(result.url).searchParams.get('code')
      if (!code) throw new Error('El proveedor no devolvió un código válido.')

      const { data: sessionData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError
      if (!sessionData.session) throw new Error('No se pudo iniciar sesión con Google.')

      const user = toGoogleUser(sessionData.session.user)
      const token = sessionData.session.access_token

      await saveToken(token)
      await saveUser(user)
      setSession(user, token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.')
    } finally {
      setIsLoading(false)
    }
  }

  return { signInWithGoogle, isLoading, error }
}
