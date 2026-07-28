import { useQuery } from '@tanstack/react-query'
import { getVideos } from '@/src/services/content'
import { useSessionStore } from '@/src/store/sessionStore'

/**
 * Catálogo completo de videos. El abecedario lo usa para encontrar, por
 * `title`, el video de cada letra — no hay un endpoint por-letra, son pocos
 * videos y ya se pedían enteros para las lecciones (useAllLessons sigue el
 * mismo patrón).
 */
export function useVideos() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['videos'],
    queryFn: getVideos,
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000,
  })
}
