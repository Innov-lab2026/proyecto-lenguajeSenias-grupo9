import { create } from 'zustand'
import { getItem, setItem } from '@/src/lib/storage'

export interface FavoriteItem {
  id: string
  type: 'lesson' | 'letter'
  title: string
  videoUrl?: string
  moduleNumber?: number
  contentKey?: string
  letter?: string
}

interface FavoritesState {
  items: FavoriteItem[]
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (item: FavoriteItem) => void
  loadFavorites: () => Promise<void>
}

const STORAGE_KEY = 'userFavorites'

/** Store Zustand para manejar favoritos de lecciones y letras con persistencia local. */
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  addFavorite: (item) => {
    set((state) => {
      if (state.items.some((i) => i.id === item.id)) return state
      const nextItems = [...state.items, item]
      setItem(STORAGE_KEY, JSON.stringify(nextItems)).catch(console.error)
      return { items: nextItems }
    })
  },
  removeFavorite: (id) => {
    set((state) => {
      const nextItems = state.items.filter((i) => i.id !== id)
      setItem(STORAGE_KEY, JSON.stringify(nextItems)).catch(console.error)
      return { items: nextItems }
    })
  },
  isFavorite: (id) => {
    return get().items.some((i) => i.id === id)
  },
  toggleFavorite: (item) => {
    const exists = get().isFavorite(item.id)
    if (exists) {
      get().removeFavorite(item.id)
    } else {
      get().addFavorite(item)
    }
  },
  loadFavorites: async () => {
    try {
      const raw = await getItem(STORAGE_KEY)
      if (raw) {
        set({ items: JSON.parse(raw) })
      }
    } catch (e) {
      console.error('[favoritesStore] no se pudieron cargar los favoritos:', e)
    }
  },
}))
