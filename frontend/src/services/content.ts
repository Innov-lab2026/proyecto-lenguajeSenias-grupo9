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
  { id: MOCK_MODULE_3_ID, title: 'Módulo 3: Familia', description: 'Aprendé las señas para presentar a tu familia.', order: 3 },
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

// Catálogo de videos (ver local/VIDEOS_DB.md — GET /api/videos). Espejo del
// dataset real, con los MISMOS ids: LESSON_CONTENT referencia videos por id y
// el resolver (utils/lessonVideos.ts) los busca acá en modo mock. Si estos ids
// no coinciden con los reales, las lecciones se quedan sin video.
// Se omite la fila duplicada de "E" (dos ids, mismo video) — un find() por
// título devolvería la primera igual.
const MOCK_VIDEOS: Video[] = [
  { id: '98a77b16-89f4-45d7-bf63-c8af598a3e52', title: 'A', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451800/A_mzgoa6.mp4', signs_reward: 1, created_at: '2026-07-28T04:13:12.776007+00:00' },
  { id: 'cfdb8fa9-64f4-4439-91b1-0787e1ca2686', title: 'B', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451800/B_xwzric.mp4', signs_reward: 1, created_at: '2026-07-28T04:34:18.935682+00:00' },
  { id: '3c53e25d-4253-4aa6-96c2-79fc4d5d69c2', title: 'C', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451777/C_x2ct8j.mp4', signs_reward: 1, created_at: '2026-07-28T04:20:30.67792+00:00' },
  { id: 'e3d9df89-bf50-40bb-90f7-634ecdd0f13c', title: 'CH', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451784/CH_k6mygv.mp4', signs_reward: 1, created_at: '2026-07-28T04:31:55.527202+00:00' },
  { id: '5c515a04-ba69-4947-94ee-e21ab76f65e7', title: 'D', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451805/D_bjmpin.mp4', signs_reward: 1, created_at: '2026-07-28T04:21:35.433666+00:00' },
  { id: 'cdeb443a-d684-4b1a-aea8-71589d8aeea4', title: 'E', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451767/E_xnstjc.mp4', signs_reward: 1, created_at: '2026-07-28T04:22:07.329029+00:00' },
  { id: 'ecbeadd0-5862-4e2e-ac4a-9782e22b062c', title: 'F', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451777/F_nnoga4.mp4', signs_reward: 1, created_at: '2026-07-28T04:37:26.364357+00:00' },
  { id: '9a018c45-3268-49d1-874b-2a1bef2599fd', title: 'G', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451767/G_ch2eer.mp4', signs_reward: 1, created_at: '2026-07-28T04:34:45.859404+00:00' },
  { id: '79e46eb0-7a6c-417c-8d97-a591fed1e15d', title: 'H', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451769/H_gjbwzl.mp4', signs_reward: 1, created_at: '2026-07-28T04:35:06.655434+00:00' },
  { id: '250df441-6667-4212-a9d3-069d44fd7a6d', title: 'I', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451791/I_mab7ne.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:03.850139+00:00' },
  { id: 'c431ecbb-1d9d-4ccc-8fd2-3ef5ed0a2dbc', title: 'J', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451803/J_ugh4mh.mp4', signs_reward: 1, created_at: '2026-07-28T04:37:45.56276+00:00' },
  { id: 'b966716a-8b60-4f19-a6df-6d09b19fa24d', title: 'K', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451772/K_fqeww3.mp4', signs_reward: 1, created_at: '2026-07-28T04:36:55.702024+00:00' },
  { id: '482c73cd-3896-443a-9e99-6ca308407915', title: 'L', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451780/L_d0ziok.mp4', signs_reward: 1, created_at: '2026-07-28T04:38:10.999702+00:00' },
  { id: 'ddcd136b-8ea4-40fb-ab22-2cbeda446bfc', title: 'LL', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451792/LL_gcafzy.mp4', signs_reward: 1, created_at: '2026-07-28T04:26:09.064358+00:00' },
  { id: '097483d6-5d34-496b-aff5-b09120cd0dc2', title: 'M', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451793/M_uh3e0h.mp4', signs_reward: 1, created_at: '2026-07-28T04:24:28.186369+00:00' },
  { id: '78625811-c7fd-4b29-be26-7163ab7d99c2', title: 'N', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451779/N_ngeune.mp4', signs_reward: 1, created_at: '2026-07-28T04:28:37.875503+00:00' },
  { id: '4548969c-e60c-41aa-aa49-0e6a5592ce28', title: 'Ñ', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451794/%C3%91_v02oqr.mp4', signs_reward: 1, created_at: '2026-07-28T04:28:06.057497+00:00' },
  { id: 'dfdeedaf-7229-4551-a6e7-e66fef62fd72', title: 'O', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451772/O_ql3eto.mp4', signs_reward: 1, created_at: '2026-07-28T04:26:22.420478+00:00' },
  { id: 'beb74dcc-82e6-46fd-9704-602046510fd2', title: 'P', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451774/P_yxhets.mp4', signs_reward: 1, created_at: '2026-07-28T04:28:20.932078+00:00' },
  { id: '02c77aea-cdcd-4734-8d6c-48bf597abe46', title: 'Q', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451775/Q_hhzfck.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:20.019132+00:00' },
  { id: '3125e1fd-ecc6-41d8-a125-f0cd9ffe2643', title: 'R', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451786/R_zlynzz.mp4', signs_reward: 1, created_at: '2026-07-28T04:32:17.180709+00:00' },
  { id: '8829b338-1e0a-4aaa-a054-140b242cce00', title: 'RR', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451782/RR_y5k2uh.mp4', signs_reward: 1, created_at: '2026-07-28T04:31:26.728574+00:00' },
  { id: '61383650-bfb5-4c35-a398-82c714de9228', title: 'S', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451766/S_gsfbjc.mp4', signs_reward: 1, created_at: '2026-07-28T04:33:52.985669+00:00' },
  { id: '341397b9-0b3a-47dc-bf1f-2330dcc0130e', title: 'T', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451787/T_zk58pc.mp4', signs_reward: 1, created_at: '2026-07-28T04:30:15.147627+00:00' },
  { id: '0922fed1-d636-4e12-96d6-49bb2279addc', title: 'U', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451796/U_ihhho5.mp4', signs_reward: 1, created_at: '2026-07-28T04:32:08.358532+00:00' },
  { id: '8c4d9d8b-2a3c-4d4d-8f7b-2d9d7e1b4a6f', title: 'V', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451789/V_b76lmx.mp4', signs_reward: 1, created_at: '2026-07-28T04:18:21.959652+00:00' },
  { id: '13959d81-423e-4730-a646-d17ed0dd9d8e', title: 'W', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451782/W_ebrz5s.mp4', signs_reward: 1, created_at: '2026-07-28T04:30:24.489682+00:00' },
  { id: 'b8dd4763-1e70-46cf-bae5-664edcd876b1', title: 'X', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451765/X_wxqupo.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:59.221193+00:00' },
  { id: '35456997-17bd-4da6-b22c-50cbccaa69ed', title: 'Y', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451783/Y_vpyzts.mp4', signs_reward: 1, created_at: '2026-07-29T18:37:03.768153+00:00' },
  { id: '05d38366-ce86-4682-b395-eccc1cd53b96', title: 'Z', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451768/Z_uwmrmw.mp4', signs_reward: 1, created_at: '2026-07-28T04:29:47.480276+00:00' },
  { id: '44f6d9e2-aace-4343-b405-5d684d0a0956', title: 'Cómo_te_llamás_incorrecto', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451547/C%C3%B3mo_te_llam%C3%A1s_incorrecto_ejercicio_siguiente_nldrka.mp4', signs_reward: 1, created_at: '2026-07-28T05:10:11.526981+00:00' },
  { id: '9fefc7d1-a029-4e14-be2e-f6cb74978b81', title: 'LUZ', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451552/Luz_xjfs0d.mp4', signs_reward: 1, created_at: '2026-07-28T05:10:41.359408+00:00' },
  { id: '046db8db-ad6d-4383-8323-22e6d497d81d', title: 'HOLA ¿COMO ESTAS?', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451546/Hola_c%C3%B3mo_est%C3%A1s_jbvgjl.mp4', signs_reward: 1, created_at: '2026-07-28T05:11:28.534599+00:00' },
  { id: '73c7aa0a-cd20-4fd3-a565-f8192eb93f28', title: 'CASA', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451559/Casa_wnqpu2.mp4', signs_reward: 1, created_at: '2026-07-28T05:11:44.726824+00:00' },
  { id: 'ad415ec9-c78f-4704-8396-be1497ed357d', title: 'Cómo_te_llamás_correcto', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451557/C%C3%B3mo_te_llam%C3%A1s_correcto_ej_siguiente_y4hnzv.mp4', signs_reward: 1, created_at: '2026-07-28T05:12:46.356462+00:00' },
  { id: '507226b9-e46f-48a3-b990-0e6ddc8262df', title: 'MASOMENOS', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451565/M%C3%A1s_o_menos_cg0dbb.mp4', signs_reward: 1, created_at: '2026-07-28T05:13:02.93262+00:00' },
  { id: '5d9a8a93-2748-47b4-a85e-3d1b53392143', title: 'BIEN', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451547/Bien_fo2fj1.mp4', signs_reward: 1, created_at: '2026-07-28T05:13:14.22214+00:00' },
  { id: '02284bfc-88a6-421c-9e2f-407412570ea2', title: 'MAL', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451539/Mal_wpqlm5.mp4', signs_reward: 1, created_at: '2026-07-28T05:13:34.743005+00:00' },
  { id: '44436173-1589-4754-9825-cdbd4f42c9e2', title: 'PORFAVOR', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451538/Por_favor_hlpxst.mp4', signs_reward: 1, created_at: '2026-07-28T05:13:49.731146+00:00' },
  { id: '2f6b0774-5fd5-4d37-add2-d90a92fd619a', title: 'GRACIAS', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451529/Gracias_u8lwdx.mp4', signs_reward: 1, created_at: '2026-07-28T05:14:18.703803+00:00' },
  { id: '7596b015-ea12-4de2-9108-5fd8d6658489', title: 'MI NOMBRE ES ANA', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451537/Mi_nombre_es_Ana_ilxyje.mp4', signs_reward: 1, created_at: '2026-07-28T05:14:38.336399+00:00' },
  { id: 'fc1abd05-093b-4a70-9523-971efeeb3d86', title: 'PERDON', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451568/Perd%C3%B3n_zz0yko.mp4', signs_reward: 1, created_at: '2026-07-28T05:14:51.354238+00:00' },
  { id: '5aec4513-41e7-4eaa-98ed-1bf57afea740', title: 'ANA', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451553/Ana_qmthzk.mp4', signs_reward: 1, created_at: '2026-07-28T05:15:07.091079+00:00' },
  { id: 'cbbe8104-cb03-4965-8b19-3bd1ed9c1f1e', title: 'SOL', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451556/Sol_eeecya.mp4', signs_reward: 1, created_at: '2026-07-28T05:15:27.079325+00:00' },
  { id: '12801b9a-0dda-45dc-a41c-ce1cf88d0234', title: 'KAI', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451555/Kai_rvrbye.mp4', signs_reward: 1, created_at: '2026-07-28T05:15:45.329843+00:00' },
  { id: 'd0cb6486-11c2-4e67-93d9-659c95fbef37', title: 'TELEFONO', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451544/Telefono_gmfl78.mp4', signs_reward: 1, created_at: '2026-07-29T19:41:39.323296+00:00' },
  { id: '1c059eb0-2983-4452-ba65-46a058166303', title: 'Me_prestás_un_teléfono_por_favor', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451550/Me_prest%C3%A1s_un_tel%C3%A9fono_por_favor_swerrv.mp4', signs_reward: 1, created_at: '2026-07-29T19:53:58.795945+00:00' },
  { id: '4035fa27-40d0-484d-847e-aad6b03c6621', title: 'Como_te_llamas', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451531/C%C3%B3mo_te_llam%C3%A1s_gr5aq6.mp4', signs_reward: 1, created_at: '2026-07-30T23:12:48.76143+00:00' },
  { id: '9b72d4ff-1a7e-4646-87de-a03dc72bf2df', title: 'COMO ESTAS', url: 'https://res.cloudinary.com/qvourcmn/video/upload/v1785451531/C%C3%B3mo_est%C3%A1s_wzgsag.mp4', signs_reward: 1, created_at: '2026-07-30T23:48:23.720674+00:00' },
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
