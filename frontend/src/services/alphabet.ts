import { http } from './http'
import { creditMockStats } from './progress'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { AlphabetLetterProgress, CompleteLetterResult } from '@/src/types/progress'

const MOCK_USER_ID = 'mock-user-id'

// Mismos montos que la RPC `complete_alphabet_letter` (fijos, no dependen de
// la letra). El server sigue siendo la fuente de verdad; esto es sólo para que
// el modo mock se comporte igual.
const LETTER_XP = 5
const LETTER_POINTS = 20
const LETTER_SIGNS = 1

const mockProgress: AlphabetLetterProgress[] = []

export async function getAlphabetProgress(): Promise<AlphabetLetterProgress[]> {
  // Copia nueva, no la referencia: completeAlphabetLetter() muta este array
  // in-place, y devolver la misma referencia hace que React Query lo vea "sin
  // cambios" entre refetches (mismo problema que getCompletedLessons).
  if (USE_MOCK_AUTH) return [...mockProgress]

  const { data } = await http.get<{ data: AlphabetLetterProgress[] }>('/alphabet/progress')
  return data.data
}

/**
 * Marca una letra como completada. La recompensa la calcula y persiste el
 * server. Es idempotente: si la letra ya estaba, devuelve `success: false` con
 * un mensaje en vez de acreditar de nuevo.
 */
export async function completeAlphabetLetter(letter: string): Promise<CompleteLetterResult> {
  if (USE_MOCK_AUTH) {
    const already = mockProgress.some((p) => p.letter === letter)
    if (already) {
      return {
        success: false,
        message: 'Letter already completed',
        earned_xp: 0,
        earned_points: 0,
        earned_signs: 0,
      }
    }

    mockProgress.push({
      user_id: MOCK_USER_ID,
      letter,
      completed_at: new Date().toISOString(),
      earned_xp: LETTER_XP,
      earned_points: LETTER_POINTS,
      earned_signs: LETTER_SIGNS,
    })
    creditMockStats(LETTER_XP, LETTER_POINTS, LETTER_SIGNS)

    return {
      success: true,
      earned_xp: LETTER_XP,
      earned_points: LETTER_POINTS,
      earned_signs: LETTER_SIGNS,
    }
  }

  // encodeURIComponent por la Ñ: va en el path, no en el body.
  const { data } = await http.post<{ data: CompleteLetterResult }>(
    `/alphabet/${encodeURIComponent(letter)}/complete`,
  )
  return data.data
}
