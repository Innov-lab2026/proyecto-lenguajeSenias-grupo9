import { supabaseAdmin } from '../config/supabaseClient'

export const getModulesService = async () => {
  const { data, error } = await supabaseAdmin
    .from('modules')
    .select('*')
    .order('order', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export const getModuleLessonsService = async (moduleId: string) => {
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export const getVideosService = async () => {
  const { data, error } = await supabaseAdmin
    .from('videos')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export const getStickersService = async () => {
  const { data, error } = await supabaseAdmin
    .from('stickers')
    .select('*')
    .order('price', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export const getAchievementsService = async () => {
  const { data, error } = await supabaseAdmin
    .from('achievements')
    .select('*')
    .order('requirement_count', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}
