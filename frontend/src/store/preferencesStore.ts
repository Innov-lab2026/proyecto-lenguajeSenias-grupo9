import { create } from 'zustand'
import { getItem, setItem } from '@/src/lib/storage'

interface PreferencesState {
  isMuted: boolean
  setIsMuted: (isMuted: boolean) => void
  loadPreferences: () => Promise<void>
}

const STORAGE_KEY = 'userPreferences'

/** Store Zustand para persistir las preferencias del usuario (cross-platform). */
export const usePreferencesStore = create<PreferencesState>((set) => ({
  isMuted: false,
  setIsMuted: (isMuted) => {
    set({ isMuted })
    setItem(STORAGE_KEY, JSON.stringify({ isMuted })).catch(console.error)
  },
  loadPreferences: async () => {
    try {
      const raw = await getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        set({ isMuted: !!parsed.isMuted })
      }
    } catch (e) {
      console.error('[preferencesStore] no se pudieron cargar las preferencias:', e)
    }
  },
}))
