import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeLesson } from '@/src/services/progress'

interface CompleteLessonArgs {
  lessonId: string
  isPerfect: boolean
}

/**
 * Completa una lección. La recompensa la calcula y persiste el server (no el
 * cliente) — este hook sólo dispara la request y refresca lo que depende de
 * ella. Si el servidor dice `success: false` (ej. ya estaba completada) no
 * invalida nada: no hubo cambio real que reflejar.
 *
 * `['stats']` NO se invalida acá a propósito: useStats no define staleTime,
 * así que ya refetchea solo en cada mount. Si invalidáramos, el HUD de la
 * propia lección (que tiene la query montada) refetchearía al instante y el
 * home volvería a montar con el valor final ya en caché — sin delta que
 * animar (StatItem sólo anima si `value` sube después de montado). Dejar que
 * el mount natural del home dispare su propio refetch preserva la animación.
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, isPerfect }: CompleteLessonArgs) => completeLesson(lessonId, isPerfect),
    onSuccess: (result) => {
      if (!result.success) return
      queryClient.invalidateQueries({ queryKey: ['completed-lessons'] })
    },
  })
}
