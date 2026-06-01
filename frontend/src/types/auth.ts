import type { SupabaseUser } from './user'

export interface LoginRequest {
  email: string
  password: string
}

/**
 * El backend actual exige `full_name`. Lo mantenemos opcional acá: la UI sólo
 * envía email + password (decisión de diseño) y, mientras backend no lo haga
 * opcional, se completa con un workaround temporal en el service.
 */
export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
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
