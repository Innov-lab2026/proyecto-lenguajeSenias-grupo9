export type StepType = 'content' | 'quiz' | 'matching' | 'dialogue' | 'composition' | 'dialogue-composition' | 'dialogue-sequence'

export interface DialogueLine {
  speaker: string
  text: string // Use [blank] for gaps
}

export interface LessonStep {
  id: string
  type: StepType
  speaker?: string
  /**
   * URL ya resuelta. `LESSON_CONTENT` no la declara nunca: todos los steps
   * referencian su video por `videoId` y el resolver completa este campo
   * (ver `utils/lessonVideos.ts`). Queda en el tipo porque es lo que consumen
   * los componentes de step, y como escotilla por si algún día hace falta un
   * video que no esté en `public.videos`.
   */
  videoUrl?: string
  options?: string[]
  videoUrls?: Record<string, string>
  pairs?: { videoUrl?: string, videoId?: string, word: string }[]
  dialogue?: DialogueLine[]
  question?: string
  correctAnswer?: string
  tip?: string
  contentTitle?: string
  subtitle?: string
  /** Plantilla del step `composition`: la frase a armar, con `[blank]` por hueco. */
  sentence?: string

  /**
   * `public.videos.id` del video de este step. Se resuelve contra el catálogo
   * (`GET /api/videos`) en vez de hardcodear la URL: los ids son estables entre
   * resubidas de Cloudinary, las URLs no — una resubida en julio dejó 12 de 15
   * URLs hardcodeadas apuntando a archivos borrados (ver local/VIDEOS_DB.md §4).
   */
  videoId?: string
  videoIds?: Record<string, string>
  videoSequenceIds?: string[]
  videoSequenceUrls?: string[]

  /**
   * `false` para que las opciones se muestren en el orden declarado en vez de
   * mezclarse. Por default los quiz de varios videos se mezclan, para que la
   * respuesta correcta no caiga siempre en la misma posición.
   *
   * Se desactiva cuando las opciones son ETIQUETAS DE POSICIÓN ("Opción A" /
   * "Opción B") en vez de palabras con significado propio: ahí mezclarlas no
   * esconde nada (la respuesta correcta sigue siendo la misma etiqueta, esté
   * donde esté) y encima las muestra fuera de orden — B a la izquierda, A a la
   * derecha.
   */
  shuffleOptions?: boolean

  /**
   * `true` para mostrar un solo video por vez (el de la opción elegida), como
   * ya hace `ContentStep` con sus selectores (ej. `m1-l4-content-interactive`:
   * Por favor / Gracias / Perdón). Sin esto, un quiz de varios videos los
   * muestra TODOS a la vez, lado a lado, en pantallas anchas — sólo en mobile
   * se ve uno por vez por default.
   */
  singleVideoAtATime?: boolean
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

/**
 * Ids de `public.videos` (ver local/VIDEOS_DB.md). Se referencian por id y no
 * por URL a propósito: los ids son estables entre resubidas de Cloudinary — la
 * resubida del 30/07 cambió las 50 URLs del catálogo y no tocó un solo id.
 */
const V = {
  COMO_ESTAS: '9b72d4ff-1a7e-4646-87de-a03dc72bf2df',
  /** Versión "plana" de la seña: la que se enseña en m1-l1. */
  COMO_TE_LLAMAS: '4035fa27-40d0-484d-847e-aad6b03c6621',
  /** Variante editada para el ejercicio de comparación de m2-l3 (hace juego con la incorrecta). */
  COMO_TE_LLAMAS_CORRECTO_EJ: 'ad415ec9-c78f-4704-8396-be1497ed357d',
  /** Misma seña hecha mal a propósito: m2-l3 pregunta cuál de las dos está bien. */
  COMO_TE_LLAMAS_INCORRECTO: '44f6d9e2-aace-4343-b405-5d684d0a0956',
  BIEN: '5d9a8a93-2748-47b4-a85e-3d1b53392143',
  MAS_O_MENOS: '507226b9-e46f-48a3-b990-0e6ddc8262df',
  MAL: '02284bfc-88a6-421c-9e2f-407412570ea2',
  KAI: '12801b9a-0dda-45dc-a41c-ce1cf88d0234',
  SOL: 'cbbe8104-cb03-4965-8b19-3bd1ed9c1f1e',
  ANA: '5aec4513-41e7-4eaa-98ed-1bf57afea740',
  POR_FAVOR: '44436173-1589-4754-9825-cdbd4f42c9e2',
  GRACIAS: '2f6b0774-5fd5-4d37-add2-d90a92fd619a',
  /** No hay video de "De nada" grabado — m1-l4 usa "Perdón" en su lugar. */
  PERDON: 'fc1abd05-093b-4a70-9523-971efeeb3d86',
  LUZ: '9fefc7d1-a029-4e14-be2e-f6cb74978b81',
  CASA: '73c7aa0a-cd20-4fd3-a565-f8192eb93f28',
  TELEFONO: 'd0cb6486-11c2-4e67-93d9-659c95fbef37',

  // ⚠️ PROVISORIOS — usados como relleno en m1-l5 y m2-l5 hasta que se graben
  // los videos de las conversaciones completas (ver PENDIENTES_DB.md §0.6).
  // Son videos reales y del tema correcto, así que las lecciones se pueden
  // jugar y completar; pero NO representan el diálogo entero, y por eso esas
  // dos lecciones no tienen filas en `lesson_signs` (acreditan 0 señas).
  HOLA_COMO_ESTAS: '046db8db-ad6d-4383-8323-22e6d497d81d',
  ME_PRESTAS_TELEFONO: '1c059eb0-2983-4452-ba65-46a058166303',
} as const

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
    description: 'Aprendé las señas básicas para iniciar una conversación.',
    steps: [
      {
        id: 'm1-l1-content-1',
        type: 'content',
        contentTitle: 'Observá la siguiente seña.\n¿Cómo estás?',
        subtitle: '¿Cómo estás?',
        videoId: V.COMO_ESTAS,
      },
      {
        id: 'm1-l1-content-2',
        type: 'content',
        contentTitle: 'Observá la siguiente seña.\n¿Cómo te llamás?',
        subtitle: '¿Cómo te llamás?',
        videoId: V.COMO_TE_LLAMAS,
      },
      {
        id: 'm1-l1-quiz',
        type: 'quiz',
        // El video que se muestra es siempre el de la respuesta correcta
        // (ver QuizStep.tsx: mainVideoUrl para 'm1-l1-quiz'). La pregunta pide
        // identificar la PALABRA que representa, no "el video" — eso implicaría
        // varios videos para comparar, y acá sólo hay uno.
        subtitle: 'Quiz: Presentaciones',
        question: '¿Qué representa la seña?',
        options: ['¿Cómo estás?', '¿Cómo te llamás?'],
        videoIds: {
          '¿Cómo estás?': V.COMO_ESTAS,
          '¿Cómo te llamás?': V.COMO_TE_LLAMAS,
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
        contentTitle: 'Observá las tres señas antes de continuar.',
        subtitle: 'Estados de ánimo',
        options: ['Bien', 'Más o menos', 'Mal'],
        videoIds: {
          'Bien': V.BIEN,
          'Más o menos': V.MAS_O_MENOS,
          'Mal': V.MAL,
        },
      },
      {
        id: 'm1-l2-quiz',
        type: 'quiz',
        subtitle: 'Quiz: Estados de ánimo',
        question: '¿Qué palabra representa esta seña?',
        videoId: V.BIEN,
        options: ['Bien', 'Más o menos', 'Mal'],
        correctAnswer: 'Bien',
        tip: 'Observá la posición y el movimiento de las manos antes de responder.',
      },
    ],
  },

  'm1-l3': {
    title: 'Desafío',
    description: '¡Demostrá lo que ya sabés!',
    steps: [
      {
        id: 'm1-l3-content-interactive',
        type: 'content',
        contentTitle: 'Observá las cuatro señas antes de continuar.',
        subtitle: 'Expresiones varias',
        options: ['Más o menos', 'Perdón', 'Gracias', '¿Cómo estás?'],
        videoIds: {
          'Más o menos': V.MAS_O_MENOS,
          'Perdón': V.PERDON,
          'Gracias': V.GRACIAS,
          '¿Cómo estás?': V.COMO_ESTAS,
        },
      },
      {
        id: 'm1-l3-quiz',
        type: 'quiz',
        subtitle: 'Desafío: Estados de ánimo',
        question: '¿Cuál de estos videos representa "Más o menos"?',
        // Etiquetas de posición, no palabras: no deben mezclarse (mismo
        // criterio que m2-l3-quiz) — "Opción 3" tiene que renderizar siempre
        // en el tercer lugar, si no el número deja de tener sentido.
        options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
        shuffleOptions: false,
        // Un solo video en pantalla, el de la opción elegida — no las 4 a la
        // vez lado a lado (que es lo que hace por default el layout de
        // desktop). Mismo patrón que ya usa m1-l4-content-interactive.
        singleVideoAtATime: true,
        videoIds: {
          'Opción 1': V.COMO_ESTAS,
          'Opción 2': V.PERDON,
          'Opción 3': V.GRACIAS,
          'Opción 4': V.MAS_O_MENOS,
        },
        correctAnswer: 'Opción 4',
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
        subtitle: 'Expresiones de Cortesía',
        contentTitle: 'Observá las tres señas antes de continuar.',
        options: ['Por favor', 'Gracias', 'Perdón'],
        videoIds: {
          'Por favor': V.POR_FAVOR,
          'Gracias': V.GRACIAS,
          'Perdón': V.PERDON,
        },
      },
      {
        id: 'm1-l4-matching',
        type: 'matching',
        subtitle: 'Relacionar video y expressión',
        question: 'Uní cada video con la expresión correcta.',
        pairs: [
          { videoId: V.POR_FAVOR, word: 'Por favor' },
          { videoId: V.GRACIAS, word: 'Gracias' },
          { videoId: V.PERDON, word: 'Perdón' },
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
        subtitle: 'Charla: Presentaciones',
        contentTitle: 'Observá las tres señas antes de continuar.',
        options: ['Bien', 'Más o menos', '¿cómo te llamás?'],
        videoIds: {
          'Bien': V.BIEN,
          'Más o menos': V.MAS_O_MENOS,
          '¿cómo te llamás?': V.COMO_TE_LLAMAS,
        },
      },
      {
        id: 'm1-l5-dialogue',
        type: 'dialogue',
        subtitle: 'Completar charla: Presentaciones',
        question: 'Completá la conversación arrastrando cada expresión a su lugar.',
        videoId: V.HOLA_COMO_ESTAS,
        options: ['¿cómo te llamás?', 'Bien', 'De nada', 'Adiós', 'Por favor', 'Más o menos'],
        dialogue: [
          { speaker: 'Pedro', text: 'Hola, [blank].' },
          { speaker: 'Juan', text: 'Hola, soy Juan. ¿Y vos?' },
          { speaker: 'Pedro', text: 'Pedro. ¿Cómo estás?' },
          { speaker: 'Juan', text: '[blank], gracias.' },
          { speaker: 'Pedro', text: '[blank].' },
        ],
        // Las respuestas van en el orden en que aparecen los [blank].
        correctAnswer: '¿cómo te llamás?|Bien|Más o menos',
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
        subtitle: 'Armar frase: Presentaciones',
        question: 'Formá la pregunta arrastrando cada palabra a su lugar',
        // Misma seña que enseña m1-l1: en LSA "¿Cuál es tu nombre?" y "¿Cómo te
        // llamás?" se signan igual. Se reusa el mismo video a propósito — y con
        // él el mismo id en lesson_signs, así la RPC NO vuelve a acreditar la
        // seña a quien ya la aprendió en m1-l1 (ver PENDIENTES_DB.md §0.5).
        videoId: V.COMO_TE_LLAMAS,
        options: ['apellido', 'dirección', 'Cómo', 'edad', 'te', 'llamás', 'es'],
        sentence: '¿ [blank] [blank] [blank] ?',
        correctAnswer: '¿Cómo te llamás?',
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
        subtitle: 'Nombres',
        contentTitle: 'Observá los siguientes nombres.',
        options: ['Kai', 'Sol', 'Ana'],
        videoIds: {
          'Kai': V.KAI,
          'Sol': V.SOL,
          'Ana': V.ANA,
        },
      },
      {
        id: 'm2-l2-quiz',
        type: 'quiz',
        subtitle: 'Quiz: Nombres',
        question: '¿Qué nombre representa esta seña?',
        videoId: V.KAI,
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
        subtitle: 'Preguntar el nombre',
        contentTitle: 'Observá la siguiente seña.\n¿Cómo te llamás?',
        videoId: V.COMO_TE_LLAMAS,
      },
      {
        id: 'm2-l3-quiz',
        type: 'quiz',
        subtitle: 'Quiz: Preguntar el nombre',
        // Sin video propio: dos opciones = grilla de dos videos (una bien
        // hecha, otra mal a propósito), no un video único + botones de texto —
        // el objetivo es que el usuario compare las señas, no lea etiquetas.
        // Ambas son la variante "ej_siguiente", grabadas como par para este
        // ejercicio (la versión plana de la seña se enseña en m1-l1/m2-l3-content).
        question: 'Seleccioná el video donde la seña "¿Cómo te llamás?" está bien hecha.',
        options: ['Opción A', 'Opción B'],
        // Sin mezclar: son etiquetas de posición, no palabras. Mezclarlas
        // mostraba "Opción B" a la izquierda y "Opción A" a la derecha, sin
        // esconder nada a cambio (ver `shuffleOptions` en LessonStep).
        shuffleOptions: false,
        videoIds: {
          'Opción A': V.COMO_TE_LLAMAS_CORRECTO_EJ,
          'Opción B': V.COMO_TE_LLAMAS_INCORRECTO,
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
        subtitle: 'Objetos',
        contentTitle: 'Observá las siguientes señas.',
        options: ['Luz', 'Casa', 'Teléfono'],
        videoIds: {
          'Luz': V.LUZ,
          'Casa': V.CASA,
          'Teléfono': V.TELEFONO,
        },
      },
      {
        id: 'm2-l4-composition',
        type: 'composition',
        subtitle: 'Armar palabra',
        question: '¿Qué palabra representa esta seña?\nOrdená las letras para formar la palabra correcta.',
        videoId: V.TELEFONO,
        options: ['o', 'é', 't', 'l', 'a', 'n', 'e', 'c', 'o', 'f'],
        sentence: '[blank] [blank] [blank] [blank] [blank] [blank] [blank] [blank]',
        correctAnswer: 'teléfono',
      },
    ],
  },

  'm2-l5': {
    title: 'Conversar',
    description: 'Completá una conversación en LSA paso a paso.',
    steps: [
      {
        id: 'm2-l5-dialogue-1',
        type: 'dialogue-composition',
        subtitle: 'Charla: Pedir prestado',
        question: 'Comenzá la conversación arrastrando la frase correcta.',
        speaker: 'Pedro',
        videoId: V.HOLA_COMO_ESTAS,
        sentence: '[blank]',
        options: ['Hola, ¿cómo estás?', 'Hola, ¿cómo te llamás?'],
        correctAnswer: 'Hola, ¿cómo estás?',
      },
      {
        id: 'm2-l5-dialogue-2',
        type: 'dialogue-composition',
        subtitle: 'Charla: Pedir prestado',
        question: 'Continuá la conversación completando la frase.',
        speaker: 'Pedro',
        videoId: V.ME_PRESTAS_TELEFONO,
        sentence: '¿Me prestás un [blank] ,\n[blank] ?',
        options: ['gracias', 'por favor', 'celular', 'teléfono'],
        correctAnswer: 'teléfono por favor',
      },
      {
        id: 'm2-l5-dialogue-3',
        type: 'dialogue-composition',
        subtitle: 'Charla: Pedir prestado',
        question: 'Terminá la conversación completando la frase.',
        speaker: 'Pedro',
        videoId: V.GRACIAS,
        sentence: '[blank].',
        options: ['Gracias', 'Por favor', 'De nada', 'Adiós'],
        correctAnswer: 'Gracias',
      },
      {
        id: 'm2-l5-dialogue-4',
        type: 'dialogue-sequence',
        subtitle: 'Charla: Pedir prestado',
        question: 'Observá la conversación completa.',
        videoSequenceIds: [V.HOLA_COMO_ESTAS, V.ME_PRESTAS_TELEFONO, V.GRACIAS],
        dialogue: [
          { speaker: 'Pedro', text: 'Hola, ¿cómo estás?\n\n¿Me prestás un teléfono, por favor?\n\nGracias.' },
        ],
      },
    ],
  },
}
