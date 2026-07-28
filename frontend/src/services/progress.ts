import { http } from './http'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { CompleteLessonResult, CompletedLesson, UserStats } from '@/src/types/progress'

const MOCK_USER_ID = 'mock-user-id'

/** Progreso mock: arranca en cero, como un usuario recién registrado. */
let mockStats: UserStats = {
  user_id: MOCK_USER_ID,
  total_xp: 0,
  total_points: 0,
  total_signs: 0,
  updated_at: new Date().toISOString(),
}
const mockCompleted: CompletedLesson[] = []

/**
 * Acredita recompensas sobre el progreso mock. Vive acá porque `mockStats` es
 * la fuente del mock de `getStats`, pero también la usa el abecedario
 * (`services/alphabet.ts`): completar una letra mueve los mismos contadores.
 * Reasigna (spread) en vez de mutar, para que React Query vea el cambio.
 */
export function creditMockStats(xp: number, points: number, signs: number) {
  mockStats = {
    ...mockStats,
    total_xp: mockStats.total_xp + xp,
    total_points: mockStats.total_points + points,
    total_signs: mockStats.total_signs + signs,
  }
}

export async function getStats(): Promise<UserStats> {
  if (USE_MOCK_AUTH) return mockStats

  const { data } = await http.get<{ data: UserStats | null }>('/stats')
  // El trigger de alta siempre crea la fila, pero por las dudas no propagamos
  // null: un usuario sin fila es indistinguible de uno en cero.
  return (
    data.data ?? {
      user_id: '',
      total_xp: 0,
      total_points: 0,
      total_signs: 0,
      updated_at: '',
    }
  )
}

export async function getCompletedLessons(): Promise<CompletedLesson[]> {
  // Copia nueva, no la referencia de mockCompleted: como completeLesson()
  // muta ese array in-place (push), devolver la misma referencia hace que
  // React Query (y la memoización automática de React Compiler) lo vean
  // "sin cambios" entre refetches, aunque el contenido sí cambió — eso
  // dejaba la isla siguiente sin desbloquear hasta recargar. mockStats no
  // tenía este problema porque se reasigna (spread) en vez de mutarse.
  if (USE_MOCK_AUTH) return [...mockCompleted]

  const { data } = await http.get<{ data: CompletedLesson[] }>('/lessons/completed')
  return data.data
}

export async function completeLesson(lessonId: string, isPerfect: boolean): Promise<CompleteLessonResult> {
  if (USE_MOCK_AUTH) {
    const already = mockCompleted.some((c) => c.lesson_id === lessonId)
    if (already) {
      return {
        success: false,
        message: 'Lesson already completed',
        earned_xp: 0,
        earned_points: 0,
        earned_signs: 0,
        earned_achievements: [],
      }
    }

    // Montos fijos en mock: no hay catálogo de lecciones real contra el que calcularlos.
    const earnedXp = 15
    const earnedPoints = isPerfect ? 100 : 50
    const earnedSigns = 1

    mockCompleted.push({
      user_id: MOCK_USER_ID,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      is_perfect: isPerfect,
      earned_xp: earnedXp,
      earned_points: earnedPoints,
    })
    creditMockStats(earnedXp, earnedPoints, earnedSigns)

    return {
      success: true,
      earned_xp: earnedXp,
      earned_points: earnedPoints,
      earned_signs: earnedSigns,
      earned_achievements: [],
    }
  }

  const { data } = await http.post<{ data: CompleteLessonResult }>(`/lessons/${lessonId}/complete`, {
    is_perfect: isPerfect,
  })
  return data.data
}
