import type { Lesson, LessonStep } from '@/src/types/lessons'
import type { Video } from '@/src/types/progress'

/**
 * Convierte los `videoId` de un step en URLs concretas, buscándolas en el
 * catálogo de `GET /api/videos`.
 *
 * Por qué existe: `LESSON_CONTENT` referencia videos por id, no por URL. Los
 * ids son estables entre resubidas de Cloudinary; las URLs no — la resubida del
 * 30/07 cambió las 50 URLs del catálogo sin tocar un solo id, y dejó 12 de 15
 * URLs hardcodeadas apuntando a archivos borrados (local/VIDEOS_DB.md §4).
 *
 * Los steps cuyo contenido todavía no está definido siguen trayendo `videoUrl`
 * literal (los genéricos VIDEO_1/2, sin equivalente en la DB): si ya viene una
 * URL, se respeta y no se pisa.
 *
 * Un id que no está en el catálogo se resuelve a `undefined`, no a string vacío:
 * el step queda como "sin video" y la pantalla degrada igual que siempre, en vez
 * de intentar reproducir una URL rota.
 */
export function resolveStepVideos(step: LessonStep, videosById: Map<string, Video>): LessonStep {
  const resolved: LessonStep = { ...step }

  if (step.videoId) {
    resolved.videoUrl = step.videoUrl ?? videosById.get(step.videoId)?.url
  }

  if (step.videoIds) {
    const entries = Object.entries(step.videoIds)
      .map(([option, id]) => [option, videosById.get(id)?.url] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] != null)

    resolved.videoUrls = { ...step.videoUrls, ...Object.fromEntries(entries) }
  }

  if (step.videoSequenceIds) {
    resolved.videoSequenceUrls = step.videoSequenceIds
      .map((id) => videosById.get(id)?.url)
      .filter((url): url is string => url != null)
  }

  if (step.pairs) {
    resolved.pairs = step.pairs.map((pair) => ({
      ...pair,
      videoUrl: pair.videoUrl ?? (pair.videoId ? videosById.get(pair.videoId)?.url : undefined),
    }))
  }

  return resolved
}

/** Aplica `resolveStepVideos` a todos los steps de una lección. */
export function resolveLessonVideos(lesson: Lesson, videos: Video[] | undefined): Lesson {
  if (!videos?.length) return lesson

  const videosById = new Map(videos.map((v) => [v.id, v]))
  return { ...lesson, steps: lesson.steps.map((step) => resolveStepVideos(step, videosById)) }
}
