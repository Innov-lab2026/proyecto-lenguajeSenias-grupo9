export type StepType = 'content' | 'quiz' | 'matching' | 'dialogue'

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
      contentTitle: '¿Comó estás?',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
    },
    {
      id: 'step-1-1-content-2',
      type: 'content',
      contentTitle: '¿Comó te llamás?',
      videoUrl: 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
    },
    {
      id: 'step-1-1-quiz',
      type: 'quiz',
      question: 'Selecioná el video que representa la seña: "¿Comó te llamás?"',
      options: ['¿Comó estás?', '¿Comó te llamás?'],
      videoUrls: {
        '¿Comó estás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
        '¿Comó te llamás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/02_ztp8b3.mp4',
      },
      correctAnswer: '¿Comó te llamás?',
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
      options: ['¿Comó estás?', '¿Comó te llamás?', 'Bien', 'Más o menos'],
      videoUrls: {
        '¿Comó estás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/01_pfseqz.mp4',
        '¿Comó te llamás?': 'https://res.cloudinary.com/dhrtwfd13/video/upload/v1785010484/03_jqt9r7.mp4',
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