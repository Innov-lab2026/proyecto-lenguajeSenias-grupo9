/** Fila de `public.modules`. */
export interface Module {
  id: string
  title: string
  description: string | null
  order: number
}

/** Fila de `public.lessons`. */
export interface LessonMeta {
  id: string
  module_id: string
  title: string
  description: string | null
  /** 1 a 5: la isla dentro del módulo (no confundir con `order`). */
  lesson_number: number
  /**
   * Clave con la que el frontend busca el contenido del ejercicio en
   * `LESSON_CONTENT` (`m<módulo>-l<lección>`). Nullable: un módulo puede estar
   * sembrado sin contenido todavía.
   */
  content_key: string | null
  xp_reward: number
  points_perfect: number
  points_retry: number
  order: number
}

/**
 * Fila de `public.videos`. El abecedario matchea por `title` (una letra,
 * ej. "A") contra `letter`; las lecciones referencian por `id` desde
 * `lesson_signs`, no por este tipo.
 */
export interface Video {
  id: string
  title: string
  url: string
  signs_reward: number
  created_at: string
}

/** Fila de `public.user_stats`. */
export interface UserStats {
  user_id: string
  total_xp: number
  total_points: number
  total_signs: number
  updated_at: string
}

/** Fila de `public.user_lessons_completed`. */
export interface CompletedLesson {
  user_id: string
  lesson_id: string
  completed_at: string
  is_perfect: boolean
  earned_xp: number
  earned_points: number
}

/** Fila de `public.user_alphabet_progress`. */
export interface AlphabetLetterProgress {
  user_id: string
  /** Puede tener más de un carácter: CH, LL y RR son letras propias del abecedario LSA. */
  letter: string
  completed_at: string
  earned_xp: number
  earned_points: number
  earned_signs: number
}

/** Respuesta de `POST /api/alphabet/:letter/complete`. */
export interface CompleteLetterResult {
  success: boolean
  /** Presente cuando `success` es false (ej. "Letter already completed"). */
  message?: string
  earned_xp: number
  earned_points: number
  earned_signs: number
}

export interface EarnedAchievement {
  id: string
  name: string
}

/** Respuesta de `POST /api/lessons/:id/complete`. */
export interface CompleteLessonResult {
  success: boolean
  /** Presente cuando `success` es false (ej. "Lesson already completed"). */
  message?: string
  earned_xp: number
  earned_points: number
  earned_signs: number
  /** Logros recién otorgados en esta llamada (no el historial completo). */
  earned_achievements: EarnedAchievement[]
}
