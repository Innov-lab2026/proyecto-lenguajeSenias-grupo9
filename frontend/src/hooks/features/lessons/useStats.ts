import { useQuery } from '@tanstack/react-query'
import { getStats } from '@/src/services/progress'
import { useSessionStore } from '@/src/store/sessionStore'

/** XP / puntos / señas del usuario. Se invalida al completar una lección (useCompleteLesson). */
export function useStats() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    enabled: status === 'authenticated',
  })
}
