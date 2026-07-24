import { create } from 'zustand'
import type { User } from '@/src/types/user'

/**
 * Estado de la sesión:
 *  - "loading": al iniciar la app, mientras se hidrata desde el storage.
 *  - "authenticated" / "unauthenticated": resultado de la hidratación / acciones.
 *
 * El store guarda la sesión: user + access token + refresh token + expiración.
 * Los datos remotos (lessons, stats, etc.) viven en TanStack Query, no acá.
 *
 * Nota: `clearSession` limpia SÓLO la memoria. El borrado del storage vive en
 * `services/session.ts#signOut`, para que tanto el logout explícito como el
 * cierre forzado por refresh fallido pasen por el mismo lugar.
 */
type Status = 'loading' | 'authenticated' | 'unauthenticated'

/** Tokens que acompañan a una sesión autenticada (opcionales por compatibilidad). */
interface SessionTokens {
  refreshToken?: string | null
  /** Epoch (segundos) de expiración del access token. */
  expiresAt?: number | null
}

interface SessionState {
  user: User | null
  token: string | null
  refreshToken: string | null
  expiresAt: number | null
  status: Status
  setSession: (user: User, token: string, tokens?: SessionTokens) => void
  /** Actualiza sólo el usuario (ej. tras editar el perfil) sin tocar los tokens. */
  updateUser: (user: User) => void
  /** Actualiza sólo los tokens (tras un refresh) sin tocar el usuario. */
  updateTokens: (token: string, refreshToken: string, expiresAt: number | null) => void
  clearSession: () => void
  setStatus: (status: Status) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  status: 'loading',
  setSession: (user, token, tokens) =>
    set({
      user,
      token,
      refreshToken: tokens?.refreshToken ?? null,
      expiresAt: tokens?.expiresAt ?? null,
      status: 'authenticated',
    }),
  updateUser: (user) => set({ user }),
  updateTokens: (token, refreshToken, expiresAt) => set({ token, refreshToken, expiresAt }),
  clearSession: () =>
    set({ user: null, token: null, refreshToken: null, expiresAt: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}))
