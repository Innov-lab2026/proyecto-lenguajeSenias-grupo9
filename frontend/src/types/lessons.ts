export type StepType = 'content' | 'quiz'

export interface LessonStep {
  id: string
  type: StepType
  videoUrl?: string
  options?: string[]
  question?: string
  correctAnswer?: string
  tip?: string
  contentTitle?: string
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
      videoUrl: 'https://placeholder.com/video1', // Placeholder
    },
    {
      id: 'step-1-1-content-2',
      type: 'content',
      contentTitle: 'Adiós',
      videoUrl: 'https://placeholder.com/video2', // Placeholder
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
      id: 'step-1-2-content-1',
      type: 'content',
      contentTitle: 'Mío',
      videoUrl: 'https://placeholder.com/video3',
    },
    {
      id: 'step-1-2-content-2',
      type: 'content',
      contentTitle: 'Tuyo',
      videoUrl: 'https://placeholder.com/video4',
    },
    {
      id: 'step-1-2-quiz',
      type: 'quiz',
      question: '¿Qué palabra representa esta seña?',
      options: ['Mío', 'Tuyo'],
      correctAnswer: 'Mío',
      tip: '💡 Consejo LSA\n\n"Mío" y "Tuyo" indican a quién pertenece algo. En muchas lenguas de señas, la posesión suele expresarse después del objeto. (ej: "Libro mio")',
    }
  ]
}
