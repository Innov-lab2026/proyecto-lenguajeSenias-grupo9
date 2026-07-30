import { useQuery } from '@tanstack/react-query'
import { getStickers } from '@/src/services/gamification'
import { useSessionStore } from '@/src/store/sessionStore'

/** Catálogo completo de stickers (nombre, tier, precio). No depende del usuario. */
export function useStickers() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['stickers'],
    queryFn: getStickers,
    enabled: status === 'authenticated',
  })
}
