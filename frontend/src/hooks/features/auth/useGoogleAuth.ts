import { useState } from 'react'
import { useRouter } from 'expo-router'
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
  const router = useRouter()

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
      if (!data.url) throw new Error('signInWithOAuth no devolvió la URL de autorización')

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

      // El usuario cerró el popup/navegador: no es un error, no se muestra nada.
      if (result.type === 'cancel' || result.type === 'dismiss') return

      if (result.type !== 'success') {
        console.error('[useGoogleAuth] resultado inesperado del navegador:', result)
        throw new Error(`el navegador devolvió un resultado inesperado: ${result.type}`)
      }

      const returnUrl = new URL(result.url)
      const code = returnUrl.searchParams.get('code')
      if (!code) {
        // Cuando el proveedor rechaza el flujo, el detalle viaja en la URL de retorno.
        const providerError =
          returnUrl.searchParams.get('error_description') ?? returnUrl.searchParams.get('error')
        throw new Error(providerError ?? 'la URL de retorno no incluye el código de autorización')
      }

      const { data: sessionData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError
      if (!sessionData.session) throw new Error('el intercambio de código no devolvió una sesión')

      const user = toGoogleUser(sessionData.session.user)
      const token = sessionData.session.access_token

      await saveToken(token)
      await saveUser(user)
      setSession(user, token)
      router.replace('/home')
    } catch (err) {
      // Detalle técnico a consola (para desarrollo); al usuario, un mensaje genérico
      // accionable — los errores de Supabase/Google vienen en inglés y no le sirven.
      console.error('[useGoogleAuth] falló el login con Google:', err)
      setError('Ocurrió un error. Intentá de nuevo más tarde o probá con otro método.')
    } finally {
      setIsLoading(false)
    }
  }

  return { signInWithGoogle, isLoading, error }
}
