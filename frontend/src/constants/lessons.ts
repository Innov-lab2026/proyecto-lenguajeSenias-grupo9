/** Columna de la lección: mobile-first a ancho completo, acotada y centrada en desktop. */
export const LESSON_SHELL = 'mx-auto w-full max-w-5xl'

/** XP otorgado al completar cada step (por índice), haya o no errores en el camino. */
export const XP_POR_STEP = [15, 15, 20, 25, 25, 25, 25, 25, 25, 25]

/** Puntos si el step se resolvió sin ningún error. */
export const PUNTOS_SIN_ERRORES = [100, 100, 150, 200, 250, 250, 250, 250, 250, 250]

/** Puntos si el step se resolvió pero hubo al menos un error en el camino. */
export const PUNTOS_CON_ERRORES = [50, 50, 75, 100, 125, 125, 125, 125, 125, 125]

/**
 * Señas que se acreditan al completar cada lección (por índice de lección).
 * A diferencia del XP/puntos, no varía según si hubo errores en el camino:
 * las señas enseñadas son las mesmas, haya costado o no acertar el ejercicio.
 */
export const SEÑAS_POR_STEP = [2, 2, 1, 3, 4, 4, 3, 1, 3, 3]

/**
 * Configuración personalizada de la pantalla de resumen por lección.
 * - title / subtitle: textos principales de felicitación.
 * - unlockLabel: texto que aparece debajo del candado.
 * - footerBg: color de fondo de la zona inferior (por defecto celeste).
 */
export interface LessonSummaryConfig {
  title: string
  subtitle: string
  unlockLabel: string
  /** Color de fondo de la sección inferior. Por defecto '#67AEF5'. */
  footerBg?: string
}

export const LESSON_SUMMARY_CONFIG: Record<string, LessonSummaryConfig> = {
  '1': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste tu primera lección',
    unlockLabel: 'Nivel 2\ndesbloqueado',
  },
  '2': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 2',
    unlockLabel: 'Nivel 3\ndesbloqueado',
  },
  '3': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 3',
    unlockLabel: 'Nivel 4\ndesbloqueado',
  },
  '4': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 4',
    unlockLabel: 'Nivel 5\ndesbloqueado',
  },
  '5': {
    title: '¡Excelente trabalho!',
    subtitle: 'Completaste módulo 1.',
    unlockLabel: '¡Módulo 2\ndesbloqueado!',
    footerBg: '#3B7DD8',
  },
  '6': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 6',
    unlockLabel: 'Nivel 7\ndesbloqueado',
  },
  '7': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 7',
    unlockLabel: 'Nivel 8\ndesbloqueado',
  },
  '8': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 8',
    unlockLabel: 'Nivel 9\ndesbloqueado',
  },
  '9': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 9',
    unlockLabel: 'Nivel 10\ndesbloqueado',
  },
  '10': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste nivel 10',
    unlockLabel: 'Módulo 3\ndesbloqueado',
    footerBg: '#3B7DD8',
  },
}
