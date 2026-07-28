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
  sentence?: string // e.g., '¿ [blank] [blank] [blank] [blank] ?.'
}

export interface MatchingState {
  selectedVideo: string | null
  selectedWord: string | null
  completedPairs: Set<string>
  attempts: Record<string, 'correct' | 'incorrect' | null>
  shuffledWords: string[]
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  steps: LessonStep[]
}

export const MOCK_LESSON_1: Lesson = {
  id: 'lesson-1',
  moduleId: 'modulo-1',
  title: 'Presentarte',
  description: 'Aprendé las señas para comenzar una conversación.',
  steps: [
    {
      id: 'step-1-1-content-1',
      type: 'content',
      contentTitle: '¿Cómo estás?',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
    },
    {
      id: 'step-1-1-content-2',
      type: 'content',
      contentTitle: '¿Cómo te llamás?',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
    },
    {
      id: 'step-1-1-quiz',
      type: 'quiz',
      question: 'Selecioná el video que representa la seña: "¿Cómo te llamás?"',
      options: ['¿Cómo estás?', '¿Cómo te llamás?'],
      videoUrls: {
        '¿Cómo estás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
        '¿Cómo te llamás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
      },
      correctAnswer: '¿Cómo te llamás?',
      tip: 'Observá la posición y el movimiento de las manos antes de responder.',
    }
  ]
}

export const MOCK_LESSON_2: Lesson = {
  id: 'lesson-2',
  moduleId: 'modulo-1',
  title: '¿Cómo te sentís?',
  description: 'Expresá tu estado de ánimo con señas básicas.',
  steps: [
    {
      id: 'step-1-2-content-interactive',
      type: 'content',
      contentTitle: '¿Cómo te sentís?',
      options: ['Bien', 'Más o menos', 'Mal'],
      videoUrls: {
        'Bien': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
        'Más o menos': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4',
        'Mal': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4'
      }
    },
    {
      id: 'step-1-2-quiz',
      type: 'quiz',
      question: '¿Qué palabra representa esta seña?',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
      options: ['Bien', 'Más o menos', 'Mal'],
      correctAnswer: 'Bien',
      tip: 'Observá la posición y el movimiento de las manos antes de responder.',
    }
  ]
}

export const MOCK_LESSON_3: Lesson = {
  id: 'lesson-3',
  moduleId: 'modulo-1',
  title: 'Desafío',
  description: '¡Demostrá lo que ya aprendiste!',
  steps: [
    {
      id: 'step-1-3-quiz',
      type: 'quiz',
      question: '¿Cuál videos representa “Más o menos”?',
      options: ['¿Cómo estás?', '¿Cómo te llamás?', 'Bien', 'Más o menos'],
      videoUrls: {
        '¿Cómo estás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
        '¿Cómo te llamás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4',
        'Bien': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
        'Más o menos': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4',
      },
      correctAnswer: 'Más o menos',
      tip: 'Observá la posición y el movimiento de las manos antes de responder.',
    }
  ]
}

export const MOCK_LESSON_4: Lesson = {
  id: 'lesson-4',
  moduleId: 'modulo-1',
  title: 'Cortesía',
  description: 'Aprendé expresiones para comunicarte con respeto.',
  steps: [
    {
      id: 'step-1-4-content-interactive',
      type: 'content',
      contentTitle: 'Cortesía',
      options: ['Por favor', 'Gracias', 'De nada'],
      videoUrls: {
        'Por favor': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
        'Gracias': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
        'De nada': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4'
      }
    },
    {
      id: 'step-1-4-matching',
      type: 'matching',
      question: 'Uní cada video con la palabra correcta.',
      pairs: [
        { videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4', word: 'Por favor' },
        { videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4', word: 'Gracias' },
        { videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4', word: 'De nada' }
      ]
    }
  ]
}

export const MOCK_LESSON_5: Lesson = {
  id: 'lesson-5',
  moduleId: 'modulo-1',
  title: 'Conversar',
  description: 'Combiná las señas aprendidas para mantener una conversación.',
  steps: [
    {
      id: 'step-1-5-content-1',
      type: 'content',
      contentTitle: 'Conversar',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
    },
    {
      id: 'step-1-5-dialogue',
      type: 'dialogue',
      question: 'Completá la conversación arrastrando cada palabra a su lugar.',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
      options: ['¿cómo te llamás?', 'Bien', 'De nada', 'Adiós', 'Por favor'],
      dialogue: [
        { speaker: 'Ana', text: 'Hola, [blank].' },
        { speaker: 'Juan', text: 'Hola, soy Juan. ¿Y vos?' },
        { speaker: 'Ana', text: 'Ana. ¿Cómo estás?' },
        { speaker: 'Juan', text: '[blank], gracias.' },
        { speaker: 'Ana', text: '[blank].' }
      ],
      // Poner las respuestas en orden
      correctAnswer: '¿cómo te llamás?|Bien|De nada'
    }
  ]
}

export const MOCK_LESSON_6: Lesson = {
  id: 'lesson-6',
  moduleId: 'modulo-2',
  title: 'Presentaciones',
  description: 'Aprendé a formar tus primeras frases en LSA.',
  steps: [
    {
      id: 'step-2-1-composition-1',
      type: 'composition',
      question: 'Formá la pregunta arrastrando cada palabra a su lugar',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
      options: ['apellido', 'dirección', 'Cuál', 'nombre', 'tu', 'edad', 'es'],
      sentence: '¿ [blank] [blank] [blank] [blank] ?.',
      correctAnswer: '¿Cuál es tu nombre?.'
    }
  ]
}

export const MOCK_LESSON_7: Lesson = {
  id: 'lesson-7',
  moduleId: 'modulo-2',
  title: 'Nombres',
  description: 'Aprendé a reconocer nombres deletreados en LSA.',
  steps: [
    {
      id: 'step-2-2-content-interactive',
      type: 'content',
      contentTitle: 'Observá los siguientes nombres.',
      options: ['Kai', 'Sol', 'Ana'],
      videoUrls: {
        'Kai': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
        'Sol': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4',
        'Ana': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4'
      }
    },
    {
      id: 'step-2-2-quiz',
      type: 'quiz',
      question: '¿Qué nombre representa esta seña?',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
      options: ['Kai', 'Sol', 'Ana'],
      correctAnswer: 'Kai',
      tip: 'Puedes consultar el ABC desde el menú de la aplicación. ¡Practica tu nombre!.',
    }
  ]
}

export const MOCK_LESSON_8: Lesson = {
  id: 'lesson-8',
  moduleId: 'modulo-2',
  title: 'Preguntar',
  description: 'Aprendé a preguntar el nombre de otra persona.',
  steps: [
    {
      id: 'step-2-3-content-interactive',
      type: 'content',
      contentTitle: 'Observá la siguiente seña.\n¿Cómo te llamás?',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
    },
    {
      id: 'step-2-3-quiz',
      type: 'quiz',
      question: '¿Cuál es la manera correcta de preguntar: "¿Cómo te llamás?"',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
      options: ['Como1', 'Como2'],
      correctAnswer: 'Como1',
      tip: 'Puedes consultar el ABC desde el menú de la aplicación. ¡Practica tu nombre!.',
    }
  ]
}

export const MOCK_LESSON_9: Lesson = {
  id: 'lesson-9',
  moduleId: 'modulo-2',
  title: 'Objetos',
  description: 'Aprendé nuevas palabras de uso cotidiano.',
  steps: [
    {
      id: 'step-2-4-content-interactive',
      type: 'content',
      contentTitle: 'Observá las siguientes señas.',
      options: ['Luz', 'Casa', 'Teléfono'],
      videoUrls: {
        'Luz': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
        'Casa': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4',
        'Teléfono': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4'
      }
    },
    {
      id: 'step-2-4-composition-1',
      type: 'composition',
      question: '¿Qué palabra representa esta seña?\nOrdená las letras para formar la palabra correcta.',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
      options: ['d', 'o', 'é', 't', 'l', 'a', 'n', 'e', 'c', 'o', 'f'],
      sentence: '[blank] [blank] [blank] [blank] [blank] [blank] [blank] [blank]',
      correctAnswer: 'teléfono'
    }
  ]
}

export const MOCK_LESSON_10: Lesson = {
  id: 'lesson-10',
  moduleId: 'modulo-2',
  title: 'Conversar',
  description: 'Combiná las frases aprendidas para mantener una conversación.',
  steps: [
    {
      id: 'step-2-5-content-1',
      type: 'content',
      contentTitle: 'Conversar',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
    },
    {
      id: 'step-2-5-dialogue',
      type: 'dialogue',
      question: 'Completá la conversación arrastrando cada palabra a su lugar.',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
      options: ['Hola, ¿cómo te llamás?', 'Hola, ¿cómo estás?', 'teléfono', '¡Gracias!', 'Luz', 'Adiós'],
      dialogue: [
        { speaker: 'Ana', text: '[blank].' },
        { speaker: 'Juan', text: 'Hola, Ana. Bien, ¿Y vos?' },
        { speaker: 'Ana', text: 'Necesito un [blank]. ¿Podrás prestarme uno?' },
        { speaker: 'Juan', text: 'Persupuesto, aquí tienes.' },
        { speaker: 'Ana', text: '[blank]' }
      ],
      // Poner las respuestas en orden
      correctAnswer: 'Hola, ¿cómo estás?|teléfono|¡Gracias!'
    }
  ]
}