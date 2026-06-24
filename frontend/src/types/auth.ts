import type { AuthUser } from './user'

export const GENDER_VALUES = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'] as const
export type Gender = (typeof GENDER_VALUES)[number]

/**
 * Valor de género que espera el backend.
 * TODO(backend): confirmar los valores canónicos / constraint de `profiles.gender`.
 * Por ahora se alinea al ejemplo de swagger ("Femenino", "Masculino", ...).
 */
export const GENDER_API_VALUE: Record<Gender, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiero no decir',
}

export interface LoginRequest {
  email: string
  password: string
}

/** Body de POST /api/auth/register. Fechas en ISO YYYY-MM-DD. */
export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  birth_date: string
  gender: string
}

/** POST /api/auth/login → user plano + session con el access token. */
export interface LoginResponse {
  message: string
  user: AuthUser
  session: {
    access_token: string
    expires_in: number
  }
}

/** POST /api/auth/register → sin token (confirmación por email). */
export interface RegisterResponse {
  message: string
  user: AuthUser & { birth_date?: string; gender?: string }
}
