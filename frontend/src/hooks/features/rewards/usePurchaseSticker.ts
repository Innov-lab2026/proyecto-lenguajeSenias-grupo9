import { useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseSticker } from '@/src/services/gamification'

/**
 * Compra un sticker. A diferencia de completar una lección/letra, acá SÍ se
 * invalida `['stats']`: gastar puntos es una baja, y `StatItem` sólo anima
 * subidas — no hay ninguna animación de "+N" que proteger retrasando el
 * refetch, así que conviene reflejar el saldo real al toque.
 */
export function usePurchaseSticker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stickerId: string) => purchaseSticker(stickerId),
    onSuccess: (result) => {
      if (!result.success) return
      queryClient.invalidateQueries({ queryKey: ['my-stickers'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
