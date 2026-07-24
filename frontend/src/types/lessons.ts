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
/* ... existing code ... */
export const MOCK_LESSON_5: Lesson = {
  id: 'lesson-5',
  moduleId: 'modulo-1',
  title: 'Conversación',
  description: 'Practica una conversación básica con saludos y nombres.',
  steps: [
    {
      id: 'step-1-5-content-1',
      type: 'content',
      contentTitle: 'Conversación',
      videoUrl: 'https://placeholder.com/video-conversation',
    },
    {
      id: 'step-1-5-dialogue',
      type: 'dialogue',
      question: '¿Cómo se completa esta conversación? Arrastra cada palabra a su lugar.',
      videoUrl: 'https://placeholder.com/video-conversation',
      options: ['nombre', 'apellido', 'hermana', 'Hola', 'Adiós', 'Lindo', 'feo'],
      dialogue: [
        { speaker: 'Ana', text: 'Hola, mi [blank] es Anna. ¿Cual es tu nombre?' },
        { speaker: 'Juan', text: '[blank] Ana, soy Juan.' },
        { speaker: 'Ana', text: '[blank] nombre! Adiós Juan.' },
        { speaker: 'Juan', text: '[blank] Ana, tambien el tuyo.' }
      ],
      // We need to store the correct answers in order or by index
      correctAnswer: 'nombre|Hola|Lindo|Adiós'
    }
  ]
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
  title: 'Saludos',
  description: 'Aprende los saludos básicos en lengua de señas.',
  steps: [
    {
      id: 'step-1-1-content-1',
      type: 'content',
      contentTitle: 'Hola',
      videoUrl: 'https://placeholder.com/video1',
    },
    {
      id: 'step-1-1-content-2',
      type: 'content',
      contentTitle: 'Adiós',
      videoUrl: 'https://placeholder.com/video2',
    },
    {
      id: 'step-1-1-quiz',
      type: 'quiz',
      question: '¿Cuál de estos videos representa la palabra "Hola"?',
      options: ['Hola', 'Adiós'],
      correctAnswer: 'Hola',
      tip: '💡 ¿Sabías que...?\n\nEl saludo es la primera forma de iniciar una conversación y demostrar respeto hacia la otra persona.',
    }
  ]
}

export const MOCK_LESSON_2: Lesson = {
  id: 'lesson-2',
  moduleId: 'modulo-1',
  title: 'Posesivos',
  description: 'Aprende a indicar posesión: Mío y Tuyo.',
  steps: [
    {
      id: 'step-1-2-content-interactive',
      type: 'content',
      contentTitle: 'Posesivos',
      options: ['Mío', 'Tuyo'],
      videoUrls: {
        'Mío': 'https://placeholder.com/video-mio',
        'Tuyo': 'https://placeholder.com/video-tuyo'
      }
    },
    {
      id: 'step-1-2-quiz',
      type: 'quiz',
      question: '¿Qué palabra representa esta seña?',
      videoUrl: 'https://placeholder.com/video-mio',
      options: ['Mío', 'Tuyo'],
      correctAnswer: 'Mío',
      tip: '💡 Consejo LSA\n\n"Mío" y "Tuyo" indican a quién pertenece algo. En muchas lenguas de señas, la posesión suele expresarse después del objeto. (ej: "Libro mio")',
    }
  ]
}

export const MOCK_LESSON_3: Lesson = {
  id: 'lesson-3',
  moduleId: 'modulo-1',
  title: 'Identidad',
  description: 'Aprende a decir tu nombre en lengua de señas.',
  steps: [
    {
      id: 'step-1-3-content-1',
      type: 'content',
      contentTitle: 'Nombre',
      videoUrl: 'https://placeholder.com/video-nombre',
    },
    {
      id: 'step-1-3-quiz',
      type: 'quiz',
      question: '¿Cuál de estos videos representa la palabra "Nombre"?',
      options: ['Mío', 'Nombre', 'Hola', 'Tuyo'],
      correctAnswer: 'Nombre',
      tip: '💡 Tip de Nombre\n\nEn la comunidad sorda, además de deletrear tu nombre, solemos tener una "seña personal" que nos identifica de forma única.',
    }
  ]
}

export const MOCK_LESSON_4: Lesson = {
  id: 'lesson-4',
  moduleId: 'modulo-1',
  title: 'Cortesía',
  description: 'Las palabras mágicas: Por favor, Gracias y De nada.',
  steps: [
    {
      id: 'step-1-4-content-interactive',
      type: 'content',
      contentTitle: 'Cortesía',
      options: ['Por favor', 'Gracias', 'De nada'],
      videoUrls: {
        'Por favor': 'https://placeholder.com/video-porfavor',
        'Gracias': 'https://placeholder.com/video-gracias',
        'De nada': 'https://placeholder.com/video-denada'
      }
    },
    {
      id: 'step-1-4-matching',
      type: 'matching',
      question: 'Relaciona cada video con la frase correspondiente.',
      pairs: [
        { videoUrl: 'https://placeholder.com/video-porfavor', word: 'Por favor' },
        { videoUrl: 'https://placeholder.com/video-gracias', word: 'Gracias' },
        { videoUrl: 'https://placeholder.com/video-denada', word: 'De nada' }
      ]
    }
  ]
}
