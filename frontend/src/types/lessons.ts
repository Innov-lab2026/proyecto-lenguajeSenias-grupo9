export type StepType = 'content' | 'quiz' | 'matching' | 'dialogue' | 'composition'

export interface DialogueLine {
  speaker: string
  text: string // Use [blank] for gaps
}

export interface LessonStep {
  id: string
  type: StepType
  videoUrl?: string
  options?: string[]
  videoUrls?: Record<string, string>
  pairs?: { videoUrl: string, word: string }[]
  dialogue?: DialogueLine[]
  question?: string
  correctAnswer?: string
  tip?: string
  contentTitle?: string
  /** Plantilla del step `composition`: la frase a armar, con `[blank]` por hueco. */
  sentence?: string
}

/** Estado del ejercicio "matching" (relacionar video con palabra). */
export interface MatchingState {
  selectedVideo: string | null
  selectedWord: string | null
  completedPairs: Set<string>
  attempts: Record<string, 'correct' | 'incorrect' | null>
  shuffledWords: string[]
}

/**
 * Contenido del ejercicio de una lección. La economía (xp/puntos) y el orden
 * viven en la DB (`public.lessons`); acá sólo está lo que se muestra.
 *
 * `title`/`description` duplican las columnas homónimas de la DB porque la
 * pantalla de lección todavía no recibe la `LessonMeta` completa (sólo llegan
 * id, lesson_number y points_retry por query param). Si se cambian acá, hay
 * que cambiarlas también en la migración correspondiente.
 */
export interface Lesson {
  title: string
  description: string
  steps: LessonStep[]
}

const VIDEO_1 = 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4'
const VIDEO_2 = 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4'
const VIDEO_3 = 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4'

// Videos reales (ver local/VIDEOS_DB.md — GET /api/videos). Sólo las lecciones
// cuyo contenido coincide sin ambigüedad con lo grabado; el resto sigue en
// VIDEO_1/2/3 hasta confirmar guion (diálogos) o señas faltantes (De nada,
// Teléfono) — ver el hilo de PR sobre esto.
const VIDEO_COMO_ESTAS = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214492/VID_20260726_155230-00.00.00.466-00.00.06.478-seg01_hor4kh.mp4'
const VIDEO_COMO_TE_LLAMAS = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214505/VID_20260726_155230-00.01.18.450-00.01.24.862-seg14_rmkyqz.mp4'
// Misma seña hecha mal a propósito: la usa m2-l3 para el ejercicio de
// "identificá cuál está bien hecha" (antes un placeholder 'Como1'/'Como2').
const VIDEO_COMO_TE_LLAMAS_INCORRECTO = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214505/VID_20260726_155230-00.01.28.277-00.01.32.084-seg15_qxcpbm.mp4'
const VIDEO_BIEN = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214474/VID_20260726_155230-00.00.11.237-00.00.15.033-seg03_mjhzaz.mp4'
const VIDEO_MAS_O_MENOS = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214478/VID_20260726_155230-00.00.19.459-00.00.24.377-seg05_yirqu0.mp4'
const VIDEO_MAL = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214472/VID_20260726_155230-00.00.15.559-00.00.18.797-seg04_wow4xu.mp4'
const VIDEO_KAI = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214409/VID_20260726_155230-00.01.11.158-00.01.16.498-seg13_pvsour.mp4'
const VIDEO_SOL = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214410/VID_20260726_155230-00.01.05.533-00.01.10.603-seg12_p2mg7x.mp4'
const VIDEO_ANA = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214416/VID_20260726_155230-00.00.59.863-00.01.04.906-seg11_c9s9zb.mp4'
const VIDEO_POR_FAVOR = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214453/VID_20260726_155230-00.00.31.629-00.00.35.987-seg07_eysb5j.mp4'
const VIDEO_GRACIAS = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214438/VID_20260726_155230-00.00.36.904-00.00.41.327-seg08_orgzi5.mp4'
// No hay video de "De nada" grabado — la lección usa "Perdón" en su lugar.
const VIDEO_PERDON = 'https://res.cloudinary.com/qvourcmn/video/upload/v1785214430/VID_20260726_155230-00.00.42.167-00.00.48.992-seg09_hehejq.mp4'

/**
 * Contenido de cada lección, indexado por `lessons.content_key` de la DB
 * (`m<módulo>-l<lección>`). No se indexa por `lesson_number` porque ese número
 * es 1-5 DENTRO de cada módulo: con más de un módulo sembrado dejaría de
 * identificar unívocamente una lección.
 */
export const LESSON_CONTENT: Record<string, Lesson> = {
  // ─────────────────────────── MÓDULO 1 ───────────────────────────
  'm1-l1': {
    title: 'Presentarte',
    description: 'Aprendé las señas para comenzar una conversación.',
    steps: [
      {
        id: 'm1-l1-content-1',
        type: 'content',
        contentTitle: '¿Cómo estás?',
        videoUrl: VIDEO_COMO_ESTAS,
      },
      {
        id: 'm1-l1-content-2',
        type: 'content',
        contentTitle: '¿Cómo te llamás?',
        videoUrl: VIDEO_COMO_TE_LLAMAS,
      },
      {
        id: 'm1-l1-quiz',
        type: 'quiz',
        question: 'Seleccioná el video que representa la seña: "¿Cómo te llamás?"',
        options: ['¿Cómo estás?', '¿Cómo te llamás?'],
        videoUrls: {
          '¿Cómo estás?': VIDEO_COMO_ESTAS,
          '¿Cómo te llamás?': VIDEO_COMO_TE_LLAMAS,
        },
        correctAnswer: '¿Cómo te llamás?',
        tip: 'Observá la posición y el movimiento de las manos antes de responder.',
      },
    ],
  },

  'm1-l2': {
    title: '¿Cómo te sentís?',
    description: 'Expresá tu estado de ánimo con señas básicas.',
    steps: [
      {
        id: 'm1-l2-content-interactive',
        type: 'content',
        contentTitle: 'Observá las siguientes 3 palabras para continuar.',
        options: ['Bien', 'Más o menos', 'Mal'],
        videoUrls: {
          'Bien': VIDEO_BIEN,
          'Más o menos': VIDEO_MAS_O_MENOS,
          'Mal': VIDEO_MAL,
        },
      },
      {
        id: 'm1-l2-quiz',
        type: 'quiz',
        question: '¿Qué palabra representa esta seña?',
        videoUrl: VIDEO_BIEN,
        options: ['Bien', 'Más o menos', 'Mal'],
        correctAnswer: 'Bien',
        tip: 'Observá la posición y el movimiento de las manos antes de responder.',
      },
    ],
  },

  'm1-l3': {
    title: 'Desafío',
    description: '¡Demostrá lo que ya aprendiste!',
    steps: [
      {
        id: 'm1-l3-quiz',
        type: 'quiz',
        question: '¿Cuál de estos videos representa "Más o menos"?',
        options: ['¿Cómo estás?', '¿Cómo te llamás?', 'Bien', 'Más o menos'],
        videoUrls: {
          '¿Cómo estás?': VIDEO_COMO_ESTAS,
          '¿Cómo te llamás?': VIDEO_COMO_TE_LLAMAS,
          'Bien': VIDEO_BIEN,
          'Más o menos': VIDEO_MAS_O_MENOS,
        },
        correctAnswer: 'Más o menos',
        tip: 'Observá la posición y el movimiento de las manos antes de responder.',
      },
    ],
  },

  'm1-l4': {
    title: 'Cortesía',
    description: 'Aprendé expresiones para comunicarte con respeto.',
    steps: [
      {
        id: 'm1-l4-content-interactive',
        type: 'content',
        contentTitle: 'Observá las siguientes 3 palabras para continuar.',
        options: ['Por favor', 'Gracias', 'Perdón'],
        videoUrls: {
          'Por favor': VIDEO_POR_FAVOR,
          'Gracias': VIDEO_GRACIAS,
          'Perdón': VIDEO_PERDON,
        },
      },
      {
        id: 'm1-l4-matching',
        type: 'matching',
        question: 'Uní cada video con la palabra correcta.',
        pairs: [
          { videoUrl: VIDEO_POR_FAVOR, word: 'Por favor' },
          { videoUrl: VIDEO_GRACIAS, word: 'Gracias' },
          { videoUrl: VIDEO_PERDON, word: 'Perdón' },
        ],
      },
    ],
  },

  'm1-l5': {
    title: 'Conversar',
    description: 'Combiná las señas aprendidas para mantener una conversación.',
    steps: [
      {
        id: 'm1-l5-content-1',
        type: 'content',
        contentTitle: 'Conversar',
        videoUrl: VIDEO_1,
      },
      {
        id: 'm1-l5-dialogue',
        type: 'dialogue',
        question: 'Completá la conversación arrastrando cada palabra a su lugar.',
        videoUrl: VIDEO_2,
        options: ['¿cómo te llamás?', 'Bien', 'De nada', 'Adiós', 'Por favor'],
        dialogue: [
          { speaker: 'Ana', text: 'Hola, [blank].' },
          { speaker: 'Juan', text: 'Hola, soy Juan. ¿Y vos?' },
          { speaker: 'Ana', text: 'Ana. ¿Cómo estás?' },
          { speaker: 'Juan', text: '[blank], gracias.' },
          { speaker: 'Ana', text: '[blank].' },
        ],
        // Las respuestas van en el orden en que aparecen los [blank].
        correctAnswer: '¿cómo te llamás?|Bien|De nada',
      },
    ],
  },

  // ─────────────────────────── MÓDULO 2 ───────────────────────────
  'm2-l1': {
    title: 'Presentaciones',
    description: 'Aprendé a formar tus primeras frases en LSA.',
    steps: [
      {
        id: 'm2-l1-composition',
        type: 'composition',
        question: 'Formá la pregunta arrastrando cada palabra a su lugar',
        videoUrl: VIDEO_1,
        options: ['apellido', 'dirección', 'Cuál', 'nombre', 'tu', 'edad', 'es'],
        sentence: '¿ [blank] [blank] [blank] [blank] ?',
        correctAnswer: '¿Cuál es tu nombre?',
      },
    ],
  },

  'm2-l2': {
    title: 'Nombres',
    description: 'Aprendé a reconocer nombres deletreados en LSA.',
    steps: [
      {
        id: 'm2-l2-content-interactive',
        type: 'content',
        contentTitle: 'Observá los siguientes nombres.',
        options: ['Kai', 'Sol', 'Ana'],
        videoUrls: {
          'Kai': VIDEO_KAI,
          'Sol': VIDEO_SOL,
          'Ana': VIDEO_ANA,
        },
      },
      {
        id: 'm2-l2-quiz',
        type: 'quiz',
        question: '¿Qué nombre representa esta seña?',
        videoUrl: VIDEO_KAI,
        options: ['Kai', 'Sol', 'Ana'],
        correctAnswer: 'Kai',
        tip: 'Podés consultar el ABC desde el menú de la aplicación. ¡Practicá tu nombre!',
      },
    ],
  },

  'm2-l3': {
    title: 'Preguntar',
    description: 'Aprendé a preguntar el nombre de otra persona.',
    steps: [
      {
        id: 'm2-l3-content-interactive',
        type: 'content',
        contentTitle: 'Observá la siguiente seña.\n¿Cómo te llamás?',
        videoUrl: VIDEO_COMO_TE_LLAMAS,
      },
      {
        id: 'm2-l3-quiz',
        type: 'quiz',
        // Sin videoUrl propio: dos opciones = grilla de dos videos (una bien
        // hecha, otra mal a propósito), no un video único + botones de texto —
        // el objetivo es que el usuario compare las señas, no lea etiquetas.
        question: 'Seleccioná el video donde la seña "¿Cómo te llamás?" está bien hecha.',
        options: ['Opción A', 'Opción B'],
        videoUrls: {
          'Opción A': VIDEO_COMO_TE_LLAMAS,
          'Opción B': VIDEO_COMO_TE_LLAMAS_INCORRECTO,
        },
        correctAnswer: 'Opción A',
        tip: 'Podés consultar el ABC desde el menú de la aplicación. ¡Practicá tu nombre!',
      },
    ],
  },

  'm2-l4': {
    title: 'Objetos',
    description: 'Aprendé nuevas palabras de uso cotidiano.',
    steps: [
      {
        id: 'm2-l4-content-interactive',
        type: 'content',
        contentTitle: 'Observá las siguientes señas.',
        options: ['Luz', 'Casa', 'Teléfono'],
        videoUrls: {
          'Luz': VIDEO_2,
          'Casa': VIDEO_3,
          'Teléfono': VIDEO_3,
        },
      },
      {
        id: 'm2-l4-composition',
        type: 'composition',
        question: '¿Qué palabra representa esta seña?\nOrdená las letras para formar la palabra correcta.',
        videoUrl: VIDEO_1,
        options: ['o', 'é', 't', 'l', 'a', 'n', 'e', 'c', 'o', 'f'],
        sentence: '[blank] [blank] [blank] [blank] [blank] [blank] [blank] [blank]',
        correctAnswer: 'teléfono',
      },
    ],
  },

  'm2-l5': {
    title: 'Conversar',
    description: 'Combiná las frases aprendidas para mantener una conversación.',
    steps: [
      {
        id: 'm2-l5-content-1',
        type: 'content',
        contentTitle: 'Conversar',
        videoUrl: VIDEO_1,
      },
      {
        id: 'm2-l5-dialogue',
        type: 'dialogue',
        question: 'Completá la conversación arrastrando cada palabra a su lugar.',
        videoUrl: VIDEO_2,
        options: ['Hola, ¿cómo te llamás?', 'Hola, ¿cómo estás?', 'teléfono', 'Gracias', 'Luz', 'Adiós'],
        dialogue: [
          { speaker: 'Ana', text: '[blank].' },
          { speaker: 'Ana', text: 'Me prestás un [blank] por favor.' },
          { speaker: 'Ana', text: '[blank] ¡Chau!' },
        ],
        // Las respuestas van en el orden en que aparecen los [blank].
        correctAnswer: 'Hola, ¿cómo estás?|teléfono|Gracias',
      },
    ],
  },
}
