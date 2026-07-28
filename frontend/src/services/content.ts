import { http } from './http'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { LessonMeta, Module } from '@/src/types/progress'

const MOCK_MODULE_1_ID = 'mock-module-1'
const MOCK_MODULE_2_ID = 'mock-module-2'
const MOCK_MODULE_3_ID = 'mock-module-3'

/** Catálogo mock: mismos títulos y recompensas que los seeds reales. */
const MOCK_MODULES: Module[] = [
  { id: MOCK_MODULE_1_ID, title: 'Módulo 1: Introducción', description: 'Primeros pasos en lengua de señas.', order: 1 },
  { id: MOCK_MODULE_2_ID, title: 'Módulo 2: Presentaciones', description: 'Formá tus primeras frases, reconocé nombres y mantené una conversación.', order: 2 },
  // Sembrado pero sin lecciones, igual que en la DB: queda bloqueado y corta
  // la cadena de desbloqueo (un módulo vacío nunca cuenta como completo).
  { id: MOCK_MODULE_3_ID, title: 'Módulo 3', description: 'Próximamente.', order: 3 },
]

const MOCK_LESSONS: LessonMeta[] = [
  { id: 'mock-lesson-1', module_id: MOCK_MODULE_1_ID, title: 'Presentarte', description: null, lesson_number: 1, content_key: 'm1-l1', xp_reward: 15, points_perfect: 100, points_retry: 50, order: 1 },
  { id: 'mock-lesson-2', module_id: MOCK_MODULE_1_ID, title: '¿Cómo te sentís?', description: null, lesson_number: 2, content_key: 'm1-l2', xp_reward: 15, points_perfect: 100, points_retry: 50, order: 2 },
  { id: 'mock-lesson-3', module_id: MOCK_MODULE_1_ID, title: 'Desafío', description: null, lesson_number: 3, content_key: 'm1-l3', xp_reward: 20, points_perfect: 150, points_retry: 75, order: 3 },
  { id: 'mock-lesson-4', module_id: MOCK_MODULE_1_ID, title: 'Cortesía', description: null, lesson_number: 4, content_key: 'm1-l4', xp_reward: 25, points_perfect: 200, points_retry: 100, order: 4 },
  { id: 'mock-lesson-5', module_id: MOCK_MODULE_1_ID, title: 'Conversar', description: null, lesson_number: 5, content_key: 'm1-l5', xp_reward: 25, points_perfect: 250, points_retry: 125, order: 5 },

  { id: 'mock-lesson-6', module_id: MOCK_MODULE_2_ID, title: 'Presentaciones', description: null, lesson_number: 1, content_key: 'm2-l1', xp_reward: 15, points_perfect: 100, points_retry: 50, order: 1 },
  { id: 'mock-lesson-7', module_id: MOCK_MODULE_2_ID, title: 'Nombres', description: null, lesson_number: 2, content_key: 'm2-l2', xp_reward: 15, points_perfect: 100, points_retry: 50, order: 2 },
  { id: 'mock-lesson-8', module_id: MOCK_MODULE_2_ID, title: 'Preguntar', description: null, lesson_number: 3, content_key: 'm2-l3', xp_reward: 20, points_perfect: 150, points_retry: 75, order: 3 },
  { id: 'mock-lesson-9', module_id: MOCK_MODULE_2_ID, title: 'Objetos', description: null, lesson_number: 4, content_key: 'm2-l4', xp_reward: 25, points_perfect: 200, points_retry: 100, order: 4 },
  { id: 'mock-lesson-10', module_id: MOCK_MODULE_2_ID, title: 'Conversar', description: null, lesson_number: 5, content_key: 'm2-l5', xp_reward: 25, points_perfect: 250, points_retry: 125, order: 5 },
]

export async function getModules(): Promise<Module[]> {
  if (USE_MOCK_AUTH) return MOCK_MODULES

  const { data } = await http.get<{ data: Module[] }>('/modules')
  return data.data
}

export async function getModuleLessons(moduleId: string): Promise<LessonMeta[]> {
  if (USE_MOCK_AUTH) return MOCK_LESSONS.filter((l) => l.module_id === moduleId)

  const { data } = await http.get<{ data: LessonMeta[] }>(`/modules/${moduleId}/lessons`)
  return data.data
}

/**
 * Todas las lecciones, de todos los módulos. El home la usa para saber cuántas
 * tiene cada uno y desbloquear el siguiente al completarse el anterior.
 */
export async function getAllLessons(): Promise<LessonMeta[]> {
  if (USE_MOCK_AUTH) return MOCK_LESSONS

  const { data } = await http.get<{ data: LessonMeta[] }>('/lessons')
  return data.data
}
