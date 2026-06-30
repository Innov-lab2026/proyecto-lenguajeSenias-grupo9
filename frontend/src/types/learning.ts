export type LessonState = 'locked' | 'available' | 'current' | 'completed'

export type ActivityType = 'theory' | 'practice' | 'quiz' | 'camera' | 'review'

export interface Lesson {
  id: string
  title: string
  subtitle?: string
  state: LessonState
  type: ActivityType
}
