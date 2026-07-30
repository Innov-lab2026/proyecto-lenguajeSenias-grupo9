import { useQuery } from '@tanstack/react-query'
import { getMyStickers } from '@/src/services/gamification'
import { useSessionStore } from '@/src/store/sessionStore'

/** Stickers que el usuario ya compró. */
export function useMyStickers() {
  const status = useSessionStore((s) => s.status)

  return useQuery({
    queryKey: ['my-stickers'],
    queryFn: getMyStickers,
    enabled: status === 'authenticated',
  })
}
