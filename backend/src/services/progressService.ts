import { supabaseAdmin } from '../config/supabaseClient'

export const getUserStatsService = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export const getCompletedLessonsService = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('user_lessons_completed')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

interface CompleteLessonResult {
  success: boolean
  message?: string
  earned_xp: number
  earned_points: number
  earned_signs: number
}

/**
 * Llama a la RPC `complete_user_lesson`, que calcula la recompensa y registra
 * todo (lección completada, señas nuevas, stats) en una sola transacción del
 * lado de la base. `p_user_id` va explícito porque este cliente es
 * `supabaseAdmin` (service_role) — no hay JWT de usuario del cual la base
 * pueda leer `auth.uid()`. El EXECUTE de la RPC está restringido a
 * service_role (ver la migración), así que sólo este servicio puede llamarla.
 */
export const completeLessonService = async (
  userId: string,
  lessonId: string,
  isPerfect: boolean,
): Promise<CompleteLessonResult> => {
  const { data, error } = await supabaseAdmin.rpc('complete_user_lesson', {
    p_lesson_id: lessonId,
    p_user_id: userId,
    p_is_perfect: isPerfect,
  })

  if (error) throw new Error(error.message)
  return data as CompleteLessonResult
}

interface GrantedAchievement {
  id: string
  name: string
}

/** Logros recién otorgados tras completar una lección (ver evaluate_achievements). */
export const evaluateAchievementsService = async (userId: string): Promise<GrantedAchievement[]> => {
  const { data, error } = await supabaseAdmin.rpc('evaluate_achievements', { p_user_id: userId })
  if (error) throw new Error(error.message)
  return (data ?? []) as GrantedAchievement[]
}
