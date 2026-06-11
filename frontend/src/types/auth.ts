import type { SupabaseUser } from './user'

export const GENDER_VALUES = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'] as const
export type Gender = (typeof GENDER_VALUES)[number]

export interface LoginRequest {
  email: string
  password: string
}

/**
 * Contrato asumido del registro (el endpoint con estos campos aún no está
 * implementado en el backend). Fechas en ISO YYYY-MM-DD.
 */
export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  birth_date: string
  gender: Gender
  /**
   * Compatibilidad con el backend actual, que exige `full_name`.
   * TODO(backend): quitar cuando el endpoint migre al contrato nuevo.
   */
  full_name: string
}

/** POST /api/auth/login → token en el body. */
export interface LoginResponse {
  message: string
  user: SupabaseUser
  token: string
}

/** POST /api/auth/register → sin token (confirmación por email). */
export interface RegisterResponse {
  message: string
  user: SupabaseUser
}
