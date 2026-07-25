import { useQuery } from '@tanstack/react-query'
import { getModuleLessons } from '@/src/services/content'
import { useSessionStore } from '@/src/store/sessionStore'

/** Lecciones (islas) de un módulo, ordenadas por `lesson_number` en el service consumidor. */
export function useModuleLessons(moduleId: string | undefined) {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['module-lessons', moduleId],
    queryFn: () => getModuleLessons(moduleId as string),
    enabled: status === 'authenticated' && Boolean(moduleId),
    staleTime: 5 * 60 * 1000,
  })
}
