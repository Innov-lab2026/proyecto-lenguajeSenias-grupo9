import { create } from 'zustand'
import { getItem, setItem } from '@/src/lib/storage'

interface RewardsState {
  unlockedStickerIds: string[]
  unlockSticker: (id: string) => void
  loadUnlockedStickers: () => Promise<void>
}

const STORAGE_KEY = 'unlockedStickers_v2'
const DEFAULT_UNLOCKED: string[] = []

/** Store Zustand para persistir los stickers desbloqueados por el usuario. */
export const useRewardsStore = create<RewardsState>((set, get) => ({
  unlockedStickerIds: DEFAULT_UNLOCKED,
  unlockSticker: (id) => {
    set((state) => {
      if (state.unlockedStickerIds.includes(id)) return state
      const nextList = [...state.unlockedStickerIds, id]
      setItem(STORAGE_KEY, JSON.stringify(nextList)).catch(console.error)
      return { unlockedStickerIds: nextList }
    })
  },
  loadUnlockedStickers: async () => {
    try {
      const raw = await getItem(STORAGE_KEY)
      if (raw) {
        set({ unlockedStickerIds: JSON.parse(raw) })
      } else {
        // Inicializar con los stickers por defecto si no hay datos guardados
        await setItem(STORAGE_KEY, JSON.stringify(DEFAULT_UNLOCKED))
        set({ unlockedStickerIds: DEFAULT_UNLOCKED })
      }
    } catch (e) {
      console.error('[rewardsStore] no se pudieron cargar los stickers:', e)
    }
  },
}))
