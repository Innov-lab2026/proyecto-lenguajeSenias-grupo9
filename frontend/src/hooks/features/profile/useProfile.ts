import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/src/services/profile'
import { useSessionStore } from '@/src/store/sessionStore'

/** Perfil remoto del usuario autenticado (país/género/fecha, para el gate de perfil incompleto). */
export function useProfile() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: status === 'authenticated',
    // Acotamos reintentos para que un backend caído falle rápido y muestre el
    // estado de error del gate en vez de dejar la pantalla en blanco reintentando.
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}
