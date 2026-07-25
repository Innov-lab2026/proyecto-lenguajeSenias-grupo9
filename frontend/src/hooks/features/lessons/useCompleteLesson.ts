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
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, isPerfect }: CompleteLessonArgs) => completeLesson(lessonId, isPerfect),
    onSuccess: (result) => {
      if (!result.success) return
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['completed-lessons'] })
    },
  })
}
