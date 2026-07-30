import { http } from './http'
import { creditMockStats, getStats } from './progress'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { PurchaseStickerResult, Sticker, UserSticker } from '@/src/types/gamification'

const MOCK_USER_ID = 'mock-user-id'

/** Catálogo mock: mismos nombres/tiers/precios que el seed real. */
const MOCK_STICKERS: Sticker[] = [
  { id: 'mock-sticker-1', name: 'Bien', tier: 'Básico', price: 300, image_url: null, created_at: '2026-07-24T00:00:03+00:00' },
  { id: 'mock-sticker-2', name: 'LSA', tier: 'Básico', price: 300, image_url: null, created_at: '2026-07-24T00:00:03+00:00' },
  { id: 'mock-sticker-3', name: 'Baile', tier: 'Estándar', price: 600, image_url: null, created_at: '2026-07-24T00:00:03+00:00' },
  { id: 'mock-sticker-4', name: 'ABC', tier: 'Estándar', price: 600, image_url: null, created_at: '2026-07-24T00:00:03+00:00' },
  { id: 'mock-sticker-5', name: 'Mate', tier: 'Premium', price: 1200, image_url: null, created_at: '2026-07-24T00:00:03+00:00' },
  { id: 'mock-sticker-6', name: 'Empanada', tier: 'Premium', price: 1200, image_url: null, created_at: '2026-07-24T00:00:03+00:00' },
  { id: 'mock-sticker-7', name: 'Seña', tier: 'Premium', price: 1200, image_url: null, created_at: '2026-07-24T00:00:03+00:00' },
]

const mockOwned: UserSticker[] = []

export async function getStickers(): Promise<Sticker[]> {
  if (USE_MOCK_AUTH) return MOCK_STICKERS

  const { data } = await http.get<{ data: Sticker[] }>('/stickers')
  return data.data
}

export async function getMyStickers(): Promise<UserSticker[]> {
  // Copia nueva, no la referencia: purchaseSticker() muta mockOwned in-place
  // (push), y devolver la misma referencia hace que React Query lo vea "sin
  // cambios" entre refetches (mismo problema ya resuelto en progress.ts/alphabet.ts).
  if (USE_MOCK_AUTH) return [...mockOwned]

  const { data } = await http.get<{ data: UserSticker[] }>('/stickers/mine')
  return data.data
}

/**
 * Compra un sticker. La recompensa/costo lo valida y persiste el server (RPC
 * `purchase_sticker`): descuenta `total_points`, registra la propiedad, y
 * rechaza saldo insuficiente o compra duplicada — todo en una transacción.
 *
 * El mock replica esa misma validación (saldo insuficiente / ya comprado)
 * contra `mockStats`, para que probar sin backend no permita comprar gratis.
 */
export async function purchaseSticker(stickerId: string): Promise<PurchaseStickerResult> {
  if (USE_MOCK_AUTH) {
    const already = mockOwned.some((o) => o.sticker_id === stickerId)
    if (already) {
      return { success: false, message: 'Sticker already owned' }
    }

    const sticker = MOCK_STICKERS.find((s) => s.id === stickerId)
    if (!sticker) {
      return { success: false, message: 'Sticker not found' }
    }

    const stats = await getStats()
    if (stats.total_points < sticker.price) {
      return {
        success: false,
        message: 'Not enough points',
        required: sticker.price,
        available: stats.total_points,
      }
    }

    creditMockStats(0, -sticker.price, 0)
    mockOwned.push({
      user_id: MOCK_USER_ID,
      sticker_id: stickerId,
      purchased_at: new Date().toISOString(),
      stickers: sticker,
    })

    return {
      success: true,
      spent_points: sticker.price,
      remaining_points: stats.total_points - sticker.price,
    }
  }

  const { data } = await http.post<{ data: PurchaseStickerResult }>(`/stickers/${stickerId}/purchase`)
  return data.data
}
