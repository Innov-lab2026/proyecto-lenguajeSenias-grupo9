import { useQuery } from '@tanstack/react-query'
import { getCompletedLessons } from '@/src/services/progress'
import { useSessionStore } from '@/src/store/sessionStore'

/** Lecciones completadas del usuario. Alimenta `completedIslands` por módulo en el home. */
export function useCompletedLessons() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['completed-lessons'],
    queryFn: getCompletedLessons,
    enabled: status === 'authenticated',
  })
}
