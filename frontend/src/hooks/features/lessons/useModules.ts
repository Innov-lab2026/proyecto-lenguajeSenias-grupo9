import { useQuery } from '@tanstack/react-query'
import { getModules } from '@/src/services/content'
import { useSessionStore } from '@/src/store/sessionStore'

/** Catálogo de módulos (hoy sólo el Módulo 1 está sembrado). */
export function useModules() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000,
  })
}
