import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js'

interface AuthErrorResponse {
  status: number
  message: string
}

interface ResolveAuthErrorOptions {
  /** Prefijo del log de errores inesperados (500), para ubicar el endpoint en consola. */
  logLabel: string
  /** Status a usar cuando Supabase rechaza el pedido (401 en login, 400 en el resto). */
  apiErrorStatus: number
  /** Mensajes propios por `error.code` de Supabase; si no matchea ninguno, se usa `fallbackMessage`. */
  messageByCode?: Record<string, string>
  fallbackMessage: string
}

/**
 * Traduce un error de Supabase Auth a una respuesta propia, en vez de reenviar
 * `error.message` (viene en inglés, tal cual lo devuelve la API de Supabase).
 * Distingue una falla real de credenciales/input de una caída del servicio
 * (503) — antes ambas devolvían el mismo status, así que un outage de
 * Supabase se veía igual que un typo de contraseña.
 */
function resolveAuthError(error: unknown, options: ResolveAuthErrorOptions): AuthErrorResponse {
  if (isAuthRetryableFetchError(error)) {
    return { status: 503, message: 'No pudimos conectarnos al servicio. Intentá de nuevo en unos minutos.' }
  }
  if (isAuthApiError(error)) {
    const message = (error.code && options.messageByCode?.[error.code]) || options.fallbackMessage
    return { status: options.apiErrorStatus, message }
  }
  console.error(`[${options.logLabel}] error inesperado:`, error)
  return { status: 500, message: 'Ocurrió un error inesperado. Intentá de nuevo más tarde.' }
}

export const resolveLoginError = (error: unknown): AuthErrorResponse =>
  resolveAuthError(error, {
    logLabel: 'login',
    apiErrorStatus: 401,
    fallbackMessage: 'Email o contraseña incorrectos.',
    messageByCode: {
      invalid_credentials: 'Email o contraseña incorrectos.',
      email_not_confirmed: 'Tenés que confirmar tu email antes de iniciar sesión.',
    },
  })

export const resolveRegisterError = (error: unknown): AuthErrorResponse =>
  resolveAuthError(error, {
    logLabel: 'register',
    apiErrorStatus: 400,
    fallbackMessage: 'No pudimos completar el registro. Revisá los datos e intentá de nuevo.',
    messageByCode: {
      user_already_exists: 'Ya existe una cuenta con ese email.',
      email_exists: 'Ya existe una cuenta con ese email.',
      weak_password: 'La contraseña es demasiado débil.',
    },
  })

export const resolveUpdateCredentialsError = (error: unknown): AuthErrorResponse =>
  resolveAuthError(error, {
    logLabel: 'updateCredentials',
    apiErrorStatus: 400,
    fallbackMessage: 'No pudimos actualizar tus datos. Intentá de nuevo.',
    messageByCode: {
      user_already_exists: 'Ese email ya está en uso por otra cuenta.',
      email_exists: 'Ese email ya está en uso por otra cuenta.',
      weak_password: 'La contraseña es demasiado débil.',
    },
  })

export const resolveDeleteAccountError = (error: unknown): AuthErrorResponse =>
  resolveAuthError(error, {
    logLabel: 'deleteAccount',
    apiErrorStatus: 400,
    fallbackMessage: 'No pudimos eliminar la cuenta. Intentá de nuevo.',
  })
