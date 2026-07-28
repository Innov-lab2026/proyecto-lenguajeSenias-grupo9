import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeAlphabetLetter } from '@/src/services/alphabet'

/**
 * Marca una letra del abecedario como vista. La recompensa (5 XP / 20 puntos /
 * 1 seña) la calcula y persiste el server, no el cliente.
 *
 * Es idempotente del lado del server: revisitar una letra devuelve
 * `success: false` y no acredita de nuevo — por eso ahí no se invalida nada,
 * no hubo cambio real que reflejar.
 *
 * `['stats']` NO se invalida acá, por el mismo motivo que en useCompleteLesson:
 * useStats no define staleTime y ya refetchea al montar. Invalidar dejaría al
 * home con el valor final en caché antes de montar, sin delta que animar.
 */
export function useCompleteLetter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (letter: string) => completeAlphabetLetter(letter),
    onSuccess: (result) => {
      if (!result.success) return
      queryClient.invalidateQueries({ queryKey: ['alphabet-progress'] })
    },
  })
}
