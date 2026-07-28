import { http } from './http'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { LessonMeta, Module, Video } from '@/src/types/progress'

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

// Videos del abecedario (ver local/VIDEOS_DB.md — GET /api/videos). Mismo
// dataset que el real: son URLs públicas de Cloudinary, sirve tanto para el
// modo mock como para probar el abecedario sin depender del backend.
// Faltan Y (nunca se grabó) y los duplicados de E (se grabó dos veces con el
// mismo title; se deja sólo el primero, igual que haría un find() real).
const MOCK_VIDEOS: Video[] = [
  { id: 'v-a', title: 'A', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210844/VID_20260726_154834-00.00.01.455-00.00.04.120-seg01_n7q7yz.mp4', signs_reward: 1, created_at: '2026-07-28T04:13:12.776007+00:00' },
  { id: 'v-b', title: 'B', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210843/VID_20260726_154834-00.00.05.182-00.00.06.913-seg02_yxhisn.mp4', signs_reward: 1, created_at: '2026-07-28T04:34:18.935682+00:00' },
  { id: 'v-c', title: 'C', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210843/VID_20260726_154834-00.00.07.360-00.00.10.419-seg03_v3jvdt.mp4', signs_reward: 1, created_at: '2026-07-28T04:20:30.67792+00:00' },
  { id: 'v-ch', title: 'CH', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210852/VID_20260726_154834-00.00.10.931-00.00.14.321-seg04_txdcqn.mp4', signs_reward: 1, created_at: '2026-07-28T04:31:55.527202+00:00' },
  { id: 'v-d', title: 'D', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210839/VID_20260726_154834-00.00.14.831-00.00.18.178-seg05_xs0kri.mp4', signs_reward: 1, created_at: '2026-07-28T04:21:35.433666+00:00' },
  { id: 'v-e', title: 'E', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210835/VID_20260726_154834-00.00.18.526-00.00.21.806-seg06_vuugxt.mp4', signs_reward: 1, created_at: '2026-07-28T04:36:33.529862+00:00' },
  { id: 'v-f', title: 'F', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210832/VID_20260726_154834-00.00.22.239-00.00.25.690-seg07_ocsme3.mp4', signs_reward: 1, created_at: '2026-07-28T04:37:26.364357+00:00' },
  { id: 'v-g', title: 'G', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210843/VID_20260726_154834-00.00.26.139-00.00.29.291-seg08_mmikb0.mp4', signs_reward: 1, created_at: '2026-07-28T04:34:45.859404+00:00' },
  { id: 'v-h', title: 'H', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210842/VID_20260726_154834-00.00.29.754-00.00.33.211-seg09_vcu8fz.mp4', signs_reward: 1, created_at: '2026-07-28T04:35:06.655434+00:00' },
  { id: 'v-i', title: 'I', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210868/VID_20260726_154834-00.01.45.428-00.01.48.186-seg30_ebwoe9.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:03.850139+00:00' },
  { id: 'v-j', title: 'J', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210831/VID_20260726_154834-00.00.36.911-00.00.40.003-seg11_lotcc6.mp4', signs_reward: 1, created_at: '2026-07-28T04:37:45.56276+00:00' },
  { id: 'v-k', title: 'K', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210833/VID_20260726_154834-00.00.40.347-00.00.43.902-seg12_hqtauy.mp4', signs_reward: 1, created_at: '2026-07-28T04:36:55.702024+00:00' },
  { id: 'v-l', title: 'L', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210828/VID_20260726_154834-00.00.44.471-00.00.47.743-seg13_yqs20g.mp4', signs_reward: 1, created_at: '2026-07-28T04:38:10.999702+00:00' },
  { id: 'v-ll', title: 'LL', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210879/VID_20260726_154834-00.00.48.056-00.00.51.209-seg14_u92xrd.mp4', signs_reward: 1, created_at: '2026-07-28T04:26:09.064358+00:00' },
  { id: 'v-m', title: 'M', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210883/VID_20260726_154834-00.00.51.702-00.00.54.838-seg15_ogy3rn.mp4', signs_reward: 1, created_at: '2026-07-28T04:24:28.186369+00:00' },
  { id: 'v-n', title: 'N', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210872/VID_20260726_154834-00.00.55.105-00.00.58.511-seg16_iwpl3d.mp4', signs_reward: 1, created_at: '2026-07-28T04:28:37.875503+00:00' },
  { id: 'v-ny', title: 'Ñ', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210875/VID_20260726_154834-00.00.58.780-00.01.02.291-seg17_ruzus9.mp4', signs_reward: 1, created_at: '2026-07-28T04:28:06.057497+00:00' },
  { id: 'v-o', title: 'O', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210875/VID_20260726_154834-00.01.02.607-00.01.05.622-seg18_xvx3gc.mp4', signs_reward: 1, created_at: '2026-07-28T04:26:22.420478+00:00' },
  { id: 'v-p', title: 'P', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210873/VID_20260726_154834-00.01.05.905-00.01.09.225-seg19_ad8jrf.mp4', signs_reward: 1, created_at: '2026-07-28T04:28:20.932078+00:00' },
  { id: 'v-q', title: 'Q', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210868/VID_20260726_154834-00.01.09.610-00.01.12.763-seg20_sj3xnj.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:20.019132+00:00' },
  { id: 'v-r', title: 'R', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210850/VID_20260726_154834-00.01.16.856-00.01.20.099-seg22_ebghgi.mp4', signs_reward: 1, created_at: '2026-07-28T04:32:17.180709+00:00' },
  { id: 'v-rr', title: 'RR', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210853/VID_20260726_154834-00.01.20.486-00.01.23.278-seg23_oxdlwv.mp4', signs_reward: 1, created_at: '2026-07-28T04:31:26.728574+00:00' },
  { id: 'v-s', title: 'S', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210848/VID_20260726_154834-00.01.24.059-00.01.27.447-seg24_aq2uqi.mp4', signs_reward: 1, created_at: '2026-07-28T04:33:52.985669+00:00' },
  { id: 'v-t', title: 'T', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210863/VID_20260726_154834-00.01.27.791-00.01.30.705-seg25_tvzhyv.mp4', signs_reward: 1, created_at: '2026-07-28T04:30:15.147627+00:00' },
  { id: 'v-u', title: 'U', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210851/VID_20260726_154834-00.01.31.106-00.01.34.055-seg26_yecxat.mp4', signs_reward: 1, created_at: '2026-07-28T04:32:08.358532+00:00' },
  { id: 'v-v', title: 'V', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210854/VID_20260726_154834-00.01.34.623-00.01.37.865-seg27_hvoltk.mp4', signs_reward: 1, created_at: '2026-07-28T04:18:21.959652+00:00' },
  { id: 'v-w', title: 'W', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210861/VID_20260726_154834-00.01.38.554-00.01.41.526-seg28_ohw6qh.mp4', signs_reward: 1, created_at: '2026-07-28T04:30:24.489682+00:00' },
  { id: 'v-x', title: 'X', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210865/VID_20260726_154834-00.01.41.861-00.01.44.812-seg29_dmrvuz.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:59.221193+00:00' },
  { id: 'v-z', title: 'Z', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785210868/VID_20260726_154834-00.01.49.251-00.01.51.831-seg31_mtxjp0.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:47.480276+00:00' },
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

/**
 * Catálogo completo de videos (señas individuales + abecedario). El
 * abecedario busca ahí el video cuyo `title` coincide con la letra.
 */
export async function getVideos(): Promise<Video[]> {
  if (USE_MOCK_AUTH) return MOCK_VIDEOS

  const { data } = await http.get<{ data: Video[] }>('/videos')
  return data.data
}
