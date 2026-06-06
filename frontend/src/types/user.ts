/**
 * Shape (parcial) del usuario que devuelve Supabase Auth a través del backend.
 * Sólo declaramos los campos que la app consume.
 */
export interface SupabaseUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

/** Usuario normalizado para uso interno de la app. */
export interface User {
  id: string
  email: string
  name?: string
}

/** Normaliza el usuario de Supabase al modelo interno. */
export const toUser = (u: SupabaseUser): User => ({
  id: u.id,
  email: u.email,
  name: u.user_metadata?.full_name,
})
