import { useQuery } from '@tanstack/react-query'
import { getAllLessons } from '@/src/services/content'
import { useSessionStore } from '@/src/store/sessionStore'

/**
 * Catálogo completo de lecciones (todos los módulos). El home lo cruza con
 * `useCompletedLessons` para saber qué módulos están completos y desbloquear
 * el siguiente. Reemplaza a `useModuleLessons` en el home: con el catálogo
 * entero en memoria, filtrar por módulo es local.
 */
export function useAllLessons() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['lessons'],
    queryFn: getAllLessons,
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000,
  })
}
