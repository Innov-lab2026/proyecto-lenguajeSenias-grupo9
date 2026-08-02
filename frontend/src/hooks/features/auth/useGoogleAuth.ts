import { useState } from 'react'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase'
import { saveRefreshToken, saveToken, saveUser } from '@/src/lib/storage'
import { getTokenExpiry } from '@/src/utils/jwt'
import { useSessionStore } from '@/src/store/sessionStore'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { User } from '@/src/types/user'

// Cierra sesiones de auth pendientes al recargar la pestaña (recomendado por Expo en web).
WebBrowser.maybeCompleteAuthSession()

/** Causas de fallo con mensaje propio; todo lo demás cae en `unknown`. */
type GoogleAuthFailure =
  | 'cancelled'
  | 'in-progress'
  | 'network'
  | 'expired'
  | 'session-save'
  | 'unknown'

/**
 * Los errores de Supabase/Google vienen en inglés y con detalle técnico, así
 * que al usuario se le muestra un texto propio. Lo importante es que el consejo
 * coincida con la causa: decirle "probá con otro método" a quien apretó
 * "Cancelar" en la pantalla de Google no le sirve de nada.
 */
const MESSAGE_BY_FAILURE: Record<GoogleAuthFailure, string> = {
  cancelled: 'Cancelaste el ingreso con Google. Podés volver a intentarlo cuando quieras.',
  'in-progress': 'Ya hay una ventana de ingreso abierta. Cerrala y volvé a intentar.',
  network: 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.',
  expired: 'La ventana de ingreso caducó. Volvé a intentarlo.',
  'session-save':
    'Entraste con Google, pero no pudimos guardar la sesión en este dispositivo. Intentá de nuevo.',
  unknown: 'Ocurrió un error. Intentá de nuevo más tarde o probá con otro método.',
}

/** Error con la causa ya identificada, para que el `catch` no tenga que adivinarla. */
class GoogleAuthError extends Error {
  reason: GoogleAuthFailure

  constructor(reason: GoogleAuthFailure, message: string) {
    super(message)
    this.name = 'GoogleAuthError'
    this.reason = reason
  }
}

/** Fallos de red: supabase-js los envuelve y en web llegan como TypeError de fetch. */
function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  if (err.name === 'AuthRetryableFetchError') return true

  const message = err.message.toLowerCase()
  return (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('networkerror')
  )
}

function resolveFailure(err: unknown): GoogleAuthFailure {
  if (err instanceof GoogleAuthError) return err.reason
  if (isNetworkError(err)) return 'network'
  return 'unknown'
}

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

      // Quedó otra sesión de auth abierta (típico al tocar dos veces el botón).
      if (result.type === 'locked') {
        throw new GoogleAuthError('in-progress', 'ya hay otra sesión de auth en curso')
      }

      if (result.type !== 'success') {
        console.error('[useGoogleAuth] resultado inesperado del navegador:', result)
        throw new Error(`el navegador devolvió un resultado inesperado: ${result.type}`)
      }

      const returnUrl = new URL(result.url)
      const code = returnUrl.searchParams.get('code')
      if (!code) {
        // Cuando el proveedor rechaza el flujo, el detalle viaja en la URL de retorno.
        const providerErrorCode = returnUrl.searchParams.get('error')
        const providerError =
          returnUrl.searchParams.get('error_description') ?? providerErrorCode

        // `access_denied` es el usuario rechazando el permiso en la pantalla de
        // Google, no una falla de la app. También lo devuelve Google cuando la
        // app está en modo prueba y la cuenta no está habilitada como tester.
        if (providerErrorCode === 'access_denied') {
          throw new GoogleAuthError('cancelled', providerError ?? 'el usuario rechazó el permiso')
        }

        throw new Error(providerError ?? 'la URL de retorno no incluye el código de autorización')
      }

      const { data: sessionData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        if (isNetworkError(exchangeError)) throw exchangeError
        // Acá el motivo casi siempre es que el código ya no sirve: se perdió el
        // code_verifier de PKCE (el flujo terminó en otro origen o se limpió el
        // storage), el código ya se usó, o caducó por demorar en la pantalla de
        // Google. En todos esos casos el consejo útil es reintentar de cero.
        throw new GoogleAuthError('expired', exchangeError.message)
      }
      if (!sessionData.session) throw new Error('el intercambio de código no devolvió una sesión')

      const user = toGoogleUser(sessionData.session.user)
      const token = sessionData.session.access_token
      const refreshToken = sessionData.session.refresh_token
      // Supabase ya da el epoch de expiración; el `exp` del JWT es el respaldo.
      const expiresAt = sessionData.session.expires_at ?? getTokenExpiry(token)

      // Se distingue del resto a propósito: acá la autenticación con Google YA
      // salió bien y lo que falla es persistirla (SecureStore en nativo,
      // localStorage lleno o bloqueado en web). Sin un mensaje propio, el
      // usuario ve un error genérico después de haber entrado sin problemas.
      try {
        await saveToken(token)
        await saveRefreshToken(refreshToken)
        await saveUser(user)
      } catch (storageError) {
        throw new GoogleAuthError(
          'session-save',
          `no se pudo persistir la sesión: ${String(storageError)}`,
        )
      }

      setSession(user, token, { refreshToken, expiresAt })
      router.replace('/home')
    } catch (err) {
      // El detalle técnico va a consola (para desarrollo); al usuario se le
      // muestra el mensaje que corresponde a la causa.
      console.error('[useGoogleAuth] falló el login con Google:', err)
      setError(MESSAGE_BY_FAILURE[resolveFailure(err)])
    } finally {
      setIsLoading(false)
    }
  }

  return { signInWithGoogle, isLoading, error }
}
