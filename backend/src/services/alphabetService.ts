import { supabaseAdmin } from '../config/supabaseClient'

export const getAlphabetProgressService = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('user_alphabet_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

interface CompleteLetterResult {
  success: boolean
  message?: string
  earned_xp?: number
  earned_points?: number
  earned_signs?: number
}

/**
 * Llama a la RPC `complete_alphabet_letter` — mismo patrón que
 * `completeLessonService`: `p_user_id` explícito porque este cliente es
 * `supabaseAdmin` (service_role), y el EXECUTE de la RPC está restringido a
 * service_role en la migración.
 */
export const completeAlphabetLetterService = async (
  userId: string,
  letter: string,
): Promise<CompleteLetterResult> => {
  const { data, error } = await supabaseAdmin.rpc('complete_alphabet_letter', {
    p_letter: letter,
    p_user_id: userId,
  })

  if (error) throw new Error(error.message)
  return data as CompleteLetterResult
}
