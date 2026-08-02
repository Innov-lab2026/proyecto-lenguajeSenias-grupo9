/** Columna de la lección: mobile-first a ancho completo, acotada y centrada en desktop. */
export const LESSON_SHELL = 'mx-auto w-full max-w-xl'

/**
 * Lecciones (islas) por módulo. Define hasta qué número hay "siguiente nivel"
 * que desbloquear al terminar una lección. Espeja ISLANDS_PER_MODULE del home.
 */
export const LESSONS_POR_MODULO = 5

/**
 * Textos de la pantalla de resumen, por `lessons.content_key`.
 * Todo opcional: lo que no se define cae al texto por defecto del componente.
 */
export interface LessonSummaryConfig {
  title?: string
  subtitle?: string
  /** Reemplaza el "Nivel N desbloqueado" por defecto (ej. al cerrar un módulo). */
  unlockLabel?: string
  /** Fondo de la franja inferior. Por defecto, el celeste de `LessonSummary`. */
  footerBg?: string
}

/** Azul oscuro para las lecciones que cierran un módulo. */
const FOOTER_BG_CIERRE = '#1F2937'

export const LESSON_SUMMARY_CONFIG: Record<string, LessonSummaryConfig> = {
  'm1-l1': { title: '¡Excelente trabajo!', subtitle: 'Completaste tu primera lección' },
  'm1-l2': { title: '¡Excelente trabajo!', subtitle: 'Completaste el nivel 2' },
  'm1-l3': { title: '¡Excelente trabajo!', subtitle: 'Completaste el nivel 3' },
  'm1-l4': { title: '¡Excelente trabajo!', subtitle: 'Completaste el nivel 4' },
  'm1-l5': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste el Módulo 1',
    unlockLabel: '¡Módulo 2\ndesbloqueado!',
    footerBg: FOOTER_BG_CIERRE,
  },

  // El nivel es ABSOLUTO, no la posición dentro del módulo: `(módulo - 1) * 5 +
  // lección`, igual que el "Nivel N desbloqueado" del pie y el que muestra el
  // home. El módulo 2 va del 6 al 10.
  'm2-l1': { title: '¡Excelente trabajo!', subtitle: 'Completaste el nivel 6' },
  'm2-l2': { title: '¡Excelente trabajo!', subtitle: 'Completaste el nivel 7' },
  'm2-l3': { title: '¡Excelente trabajo!', subtitle: 'Completaste el nivel 8' },
  'm2-l4': { title: '¡Excelente trabajo!', subtitle: 'Completaste el nivel 9' },
  'm2-l5': {
    title: '¡Excelente trabajo!',
    subtitle: 'Completaste el Módulo 2',
    // Sin "Módulo 3 desbloqueado": ese módulo sigue bloqueado hasta que tenga
    // lecciones sembradas.
    unlockLabel: '¡Completaste el\nMódulo 2!',
    footerBg: FOOTER_BG_CIERRE,
  },
}

/** Mensaje de acierto de la pantalla de feedback, por `lessons.content_key`. */
export interface LessonPositiveFeedback {
  title: string
  hintTitle: string
  hintText: string
}

export const LESSON_POSITIVE_FEEDBACK: Record<string, LessonPositiveFeedback> = {
  'm1-l1': {
    title: '¡Muy bien!\nCada acierto te acerca a comunicarte en LSA.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Las expresiones faciales ayudan a dar significado a las señas.',
  },
  'm1-l2': {
    title: '¡Muy bien!\nSeguí así.',
    hintTitle: '¿Sabías que...?',
    hintText: 'En LSA, una misma respuesta puede variar levemente según la región o el contexto, pero siempre conserva su significado.',
  },
  'm1-l3': {
    title: '¡Excelente!\nEstás reforzando lo que aprendiste.',
    hintTitle: '¿Sabías que...?',
    hintText: 'La práctica constante es la mejor forma de recordar nuevas señas y reconocerlas con mayor facilidad.',
  },
  'm1-l4': {
    title: '¡Excelente!\nRelacionaste todas las señas correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Las expresiones de cortesía fortalecen la comunicación y demuestran respeto hacia los demás.',
  },
  'm1-l5': {
    title: '¡Bien hecho!\nCompletaste la conversación correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Combinar señas en una conversación te ayuda a comunicarte de forma más natural en LSA.',
  },
  'm2-l1': {
    title: '¡Excelente!\nFormaste la pregunta correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'El orden de las señas puede variar, pero el contexto y la expresión ayudan a comprender el mensaje.',
  },
  'm2-l2': {
    title: '¡Excelente!\nReconociste el nombre correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'En LSA, los nombres propios suelen deletrearse usando el alfabeto manual.',
  },
  'm2-l3': {
    title: '¡Excelente!\nIdentificaste la seña correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Las preguntas permiten iniciar y mantener una conversación en LSA.',
  },
  'm2-l4': {
    title: '¡Excelente!\nFormaste la palabra correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Aprender palabras de uso cotidiano te ayuda a comunicarte con mayor fluidez en LSA.\n\n📖 ¿Querés seguir practicando? Podés consultar el ABC desde el menú de la aplicación.',
  },
  'm2-l5': {
    title: '¡Excelente!\nCompletaste la conversación correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Combinar palabras y frases en contexto te ayuda a comunicarte con mayor naturalidad en LSA.',
  },
}
