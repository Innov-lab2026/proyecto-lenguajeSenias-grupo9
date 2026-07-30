/** Fila de `public.stickers` (catálogo completo, `GET /api/stickers`). */
export interface Sticker {
  id: string
  name: string
  tier: 'Básico' | 'Estándar' | 'Premium'
  price: number
  image_url: string | null
  created_at: string
}

/** Fila de `public.user_stickers` con el sticker embebido (`GET /api/stickers/mine`). */
export interface UserSticker {
  user_id: string
  sticker_id: string
  purchased_at: string
  stickers: Sticker
}

/** Resultado de `POST /api/stickers/:id/purchase` (RPC `purchase_sticker`). */
export interface PurchaseStickerResult {
  success: boolean
  message?: string
  spent_points?: number
  remaining_points?: number
  required?: number
  available?: number
}
