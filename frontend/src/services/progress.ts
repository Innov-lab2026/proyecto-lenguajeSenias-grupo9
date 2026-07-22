import { http } from './http'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { HomeModule } from '@/src/types/home'

export interface UserProgress {
  module_id: string
  completed_islands: number
  total_xp: number
  total_stars: number
}

/** Progreso mock para desarrollo sin backend. */
const MOCK_PROGRESS: UserProgress[] = [
  { module_id: 'alfabeto-1', completed_islands: 2, total_xp: 300, total_stars: 45 },
  { module_id: 'numeros-1', completed_islands: 0, total_xp: 0, total_stars: 0 },
]

export async function getUserProgress(): Promise<UserProgress[]> {
  if (USE_MOCK_AUTH) {
    return MOCK_PROGRESS
  }

  const { data } = await http.get<{ data: UserProgress[] }>('/progress')
  return data.data
}

export interface UpdateProgressPayload {
  module_id: string
  completed_islands?: number
  xp_gain?: number
  stars_gain?: number
}

export async function updateProgress(payload: UpdateProgressPayload): Promise<UserProgress> {
  if (USE_MOCK_AUTH) {
    const existing = MOCK_PROGRESS.find(p => p.module_id === payload.module_id)
    if (existing) {
      if (payload.completed_islands !== undefined) {
        existing.completed_islands = Math.max(existing.completed_islands, payload.completed_islands)
      }
      existing.total_xp += payload.xp_gain ?? 0
      existing.total_stars += payload.stars_gain ?? 0
      return existing
    }
    const newEntry = {
      module_id: payload.module_id,
      completed_islands: payload.completed_islands ?? 0,
      total_xp: payload.xp_gain ?? 0,
      total_stars: payload.stars_gain ?? 0
    }
    MOCK_PROGRESS.push(newEntry)
    return newEntry
  }

  const { data } = await http.post<{ data: UserProgress }>('/progress', payload)
  return data.data
}
