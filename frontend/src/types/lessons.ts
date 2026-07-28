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
        videoUrl: VIDEO_1,
      },
      {
        id: 'm1-l1-content-2',
        type: 'content',
        contentTitle: '¿Cómo te llamás?',
        videoUrl: VIDEO_2,
      },
      {
        id: 'm1-l1-quiz',
        type: 'quiz',
        question: 'Seleccioná el video que representa la seña: "¿Cómo te llamás?"',
        options: ['¿Cómo estás?', '¿Cómo te llamás?'],
        videoUrls: {
          '¿Cómo estás?': VIDEO_1,
          '¿Cómo te llamás?': VIDEO_2,
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
        contentTitle: '¿Cómo te sentís?',
        options: ['Bien', 'Más o menos', 'Mal'],
        videoUrls: {
          'Bien': VIDEO_2,
          'Más o menos': VIDEO_3,
          'Mal': VIDEO_3,
        },
      },
      {
        id: 'm1-l2-quiz',
        type: 'quiz',
        question: '¿Qué palabra representa esta seña?',
        videoUrl: VIDEO_2,
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
          '¿Cómo estás?': VIDEO_1,
          '¿Cómo te llamás?': VIDEO_3,
          'Bien': VIDEO_2,
          'Más o menos': VIDEO_3,
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
        contentTitle: 'Cortesía',
        options: ['Por favor', 'Gracias', 'De nada'],
        videoUrls: {
          'Por favor': VIDEO_1,
          'Gracias': VIDEO_2,
          'De nada': VIDEO_3,
        },
      },
      {
        id: 'm1-l4-matching',
        type: 'matching',
        question: 'Uní cada video con la palabra correcta.',
        pairs: [
          { videoUrl: VIDEO_1, word: 'Por favor' },
          { videoUrl: VIDEO_2, word: 'Gracias' },
          { videoUrl: VIDEO_3, word: 'De nada' },
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
          'Kai': VIDEO_2,
          'Sol': VIDEO_3,
          'Ana': VIDEO_3,
        },
      },
      {
        id: 'm2-l2-quiz',
        type: 'quiz',
        question: '¿Qué nombre representa esta seña?',
        videoUrl: VIDEO_2,
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
        videoUrl: VIDEO_2,
      },
      {
        id: 'm2-l3-quiz',
        type: 'quiz',
        // TODO(contenido): las opciones son placeholders. El ejercicio compara dos
        // formas de preguntar, así que deberían ser dos videos (videoUrls), no dos
        // etiquetas de texto. Pendiente de los videos reales.
        question: 'Seleccioná la manera correcta de preguntar "¿Cómo te llamás?"',
        videoUrl: VIDEO_2,
        options: ['Como1', 'Como2'],
        correctAnswer: 'Como1',
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
        options: ['d', 'o', 'é', 't', 'l', 'a', 'n', 'e', 'c', 'o', 'f'],
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
        options: ['Hola, ¿cómo te llamás?', 'Hola, ¿cómo estás?', 'teléfono', '¡Gracias!', 'Luz', 'Adiós'],
        dialogue: [
          { speaker: 'Ana', text: '[blank].' },
          { speaker: 'Juan', text: 'Hola, Ana. Bien, ¿y vos?' },
          { speaker: 'Ana', text: 'Necesito un [blank]. ¿Podrás prestarme uno?' },
          { speaker: 'Juan', text: 'Por supuesto, acá tenés.' },
          { speaker: 'Ana', text: '[blank]' },
        ],
        // Las respuestas van en el orden en que aparecen los [blank].
        correctAnswer: 'Hola, ¿cómo estás?|teléfono|¡Gracias!',
      },
    ],
  },
}
