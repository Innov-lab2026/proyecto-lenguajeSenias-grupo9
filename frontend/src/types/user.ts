/**
 * Usuario tal como lo devuelve el backend en login/registro
 * (shape plano: ya viene normalizado desde el endpoint).
 */
export interface AuthUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

/** Usuario normalizado para uso interno de la app. */
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

/** Normaliza el usuario del backend al modelo interno. */
export const toUser = (u: AuthUser): User => ({
  id: u.id,
  email: u.email,
  firstName: u.first_name,
  lastName: u.last_name,
})
