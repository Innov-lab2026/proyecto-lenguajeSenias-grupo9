import { supabase } from '../config/supabaseClient'

export const getUserProgressService = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

export const updateProgressService = async (
  userId: string, 
  moduleId: string, 
  completedIslands?: number, 
  xpGain?: number, 
  starsGain?: number
) => {
  // Primero intentamos obtener el progreso actual para este módulo
  const { data: current, error: fetchError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(fetchError.message)
  }

  if (current) {
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        completed_islands: completedIslands !== undefined ? Math.max(current.completed_islands, completedIslands) : current.completed_islands,
        total_xp: current.total_xp + (xpGain ?? 0),
        total_stars: current.total_stars + (starsGain ?? 0),
        last_updated: new Date()
      })
      .eq('id', current.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  } else {
    // Si no existe, lo creamos
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        module_id: moduleId,
        completed_islands: completedIslands ?? 0,
        total_xp: xpGain ?? 0,
        total_stars: starsGain ?? 0
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}
