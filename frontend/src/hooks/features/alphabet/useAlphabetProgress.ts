import { useQuery } from '@tanstack/react-query'
import { getAlphabetProgress } from '@/src/services/alphabet'
import { useSessionStore } from '@/src/store/sessionStore'

/**
 * Letras del abecedario ya completadas. Alimenta el estado "vista" de la
 * grilla — antes eso vivía en un array en memoria y se perdía en cada recarga.
 */
export function useAlphabetProgress() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['alphabet-progress'],
    queryFn: getAlphabetProgress,
    enabled: status === 'authenticated',
  })
}
