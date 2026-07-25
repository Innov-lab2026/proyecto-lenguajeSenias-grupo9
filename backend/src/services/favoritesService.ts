import { supabaseAdmin } from '../config/supabaseClient'

export type FavorableType = 'video' | 'letter'

export const getFavoritesService = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

export const addFavoriteService = async (
  userId: string,
  favorableType: FavorableType,
  favorableId: string,
) => {
  const { data, error } = await supabaseAdmin
    .from('user_favorites')
    .insert({ user_id: userId, favorable_type: favorableType, favorable_id: favorableId })
    .select()
    .single()

  if (error) {
    // 23505 = unique_violation: ya era favorito, no es un error real.
    if (error.code === '23505') return null
    throw new Error(error.message)
  }
  return data
}

export const removeFavoriteService = async (
  userId: string,
  favorableType: FavorableType,
  favorableId: string,
) => {
  const { error } = await supabaseAdmin
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('favorable_type', favorableType)
    .eq('favorable_id', favorableId)

  if (error) throw new Error(error.message)
}
