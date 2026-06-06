import { create } from 'zustand'
import type { User } from '@/src/types/user'

/**
 * Estado de la sesión:
 *  - "loading": al iniciar la app, mientras se hidrata desde el storage.
 *  - "authenticated" / "unauthenticated": resultado de la hidratación / acciones.
 *
 * El store guarda SÓLO la sesión (user + token). Los datos remotos (lessons,
 * stats, etc.) viven en TanStack Query, no acá.
 */
type Status = 'loading' | 'authenticated' | 'unauthenticated'

interface SessionState {
  user: User | null
  token: string | null
  status: Status
  setSession: (user: User, token: string) => void
  clearSession: () => void
  setStatus: (status: Status) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  status: 'loading',
  setSession: (user, token) => set({ user, token, status: 'authenticated' }),
  clearSession: () => set({ user: null, token: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}))
