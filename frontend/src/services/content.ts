import { http } from './http'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { LessonMeta, Module } from '@/src/types/progress'

const MOCK_MODULE_ID = 'mock-module-1'

/** Catálogo mock: mismo contenido y recompensas que el seed real (Módulo 1). */
const MOCK_MODULES: Module[] = [
  { id: MOCK_MODULE_ID, title: 'Módulo 1: Introducción', description: 'Primeros pasos en lengua de señas.', order: 1 },
]

const MOCK_LESSONS: LessonMeta[] = [
  { id: 'mock-lesson-1', module_id: MOCK_MODULE_ID, title: 'Saludos', description: null, lesson_number: 1, xp_reward: 15, points_perfect: 100, points_retry: 50, order: 1 },
  { id: 'mock-lesson-2', module_id: MOCK_MODULE_ID, title: 'Posesivos', description: null, lesson_number: 2, xp_reward: 15, points_perfect: 100, points_retry: 50, order: 2 },
  { id: 'mock-lesson-3', module_id: MOCK_MODULE_ID, title: 'Identidad', description: null, lesson_number: 3, xp_reward: 20, points_perfect: 150, points_retry: 75, order: 3 },
  { id: 'mock-lesson-4', module_id: MOCK_MODULE_ID, title: 'Cortesía', description: null, lesson_number: 4, xp_reward: 25, points_perfect: 200, points_retry: 100, order: 4 },
  { id: 'mock-lesson-5', module_id: MOCK_MODULE_ID, title: 'Conversación', description: null, lesson_number: 5, xp_reward: 25, points_perfect: 250, points_retry: 125, order: 5 },
]

export async function getModules(): Promise<Module[]> {
  if (USE_MOCK_AUTH) return MOCK_MODULES

  const { data } = await http.get<{ data: Module[] }>('/modules')
  return data.data
}

export async function getModuleLessons(moduleId: string): Promise<LessonMeta[]> {
  if (USE_MOCK_AUTH) return MOCK_LESSONS

  const { data } = await http.get<{ data: LessonMeta[] }>(`/modules/${moduleId}/lessons`)
  return data.data
}
