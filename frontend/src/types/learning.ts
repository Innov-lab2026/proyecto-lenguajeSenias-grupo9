export type LessonState = 'locked' | 'available' | 'current' | 'completed'

export type ActivityType = 'theory' | 'practice' | 'quiz' | 'camera' | 'review'

export interface Lesson {
  id: string
  title: string
  subtitle?: string
  state: LessonState
  type: ActivityType
}

export type ModuleState = 'locked' | 'available' | 'current' | 'completed'

export interface Module {
  id: string
  title: string
  state: ModuleState
  lessons: Lesson[]
}
