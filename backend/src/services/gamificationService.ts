import { supabaseAdmin } from '../config/supabaseClient'

export const getMyStickersService = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('user_stickers')
    .select('*, stickers(*)')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

export const getMyAchievementsService = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

interface PurchaseStickerResult {
  success: boolean
  message?: string
  spent_points?: number
  remaining_points?: number
  required?: number
  available?: number
}

/** Descuenta puntos y registra la propiedad vía RPC (ver §6.1 del plan: mismo
 * patrón de p_user_id explícito + EXECUTE restringido a service_role). */
export const purchaseStickerService = async (
  userId: string,
  stickerId: string,
): Promise<PurchaseStickerResult> => {
  const { data, error } = await supabaseAdmin.rpc('purchase_sticker', {
    p_user_id: userId,
    p_sticker_id: stickerId,
  })

  if (error) throw new Error(error.message)
  return data as PurchaseStickerResult
}
