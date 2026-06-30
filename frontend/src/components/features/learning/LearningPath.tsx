import { ScrollView, View } from 'react-native'
import { LessonNode } from './LessonNode'
import { getHorizontalOffset } from '@/src/utils/learningPath'
import type { Lesson } from '@/src/types/learning'
import { cn } from '@/src/utils/cn'

interface LearningPathProps {
  lessons: Lesson[]
  onLessonPress?: (lessonId: string) => void
  className?: string
  contentContainerClassName?: string
}

export function LearningPath({
  lessons,
  onLessonPress,
  className,
  contentContainerClassName,
}: LearningPathProps) {
  return (
    <ScrollView
      className={cn('flex-1 w-full bg-background', className)}
      contentContainerClassName={cn('py-8 items-center', contentContainerClassName)}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-md items-center">
        {lessons.map((lesson, index) => {
          const translateX = getHorizontalOffset(index)

          return (
            <View
              key={lesson.id}
              style={{
                transform: [{ translateX }],
                marginBottom: 24, // Separación vertical entre lecciones
              }}
              className="items-center"
            >
              <LessonNode lesson={lesson} onPress={onLessonPress} />
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
