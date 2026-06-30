import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { LessonButton } from './LessonButton'
import type { ActivityType, Lesson, LessonState } from '@/src/types/learning'
import { cn } from '@/src/utils/cn'

interface LessonNodeProps {
  lesson: Lesson
  onPress?: (lessonId: string) => void
  className?: string
}

type IconName = ComponentProps<typeof Ionicons>['name']

const iconByActivity: Record<ActivityType, IconName> = {
  theory: 'book',
  practice: 'hand-left',
  quiz: 'help-circle',
  camera: 'camera',
  review: 'ribbon',
}

const iconColorByState: Record<LessonState, string> = {
  locked: '#6F706F', // muted
  available: '#0581C3', // secondary
  current: '#3E3D3B', // ink
  completed: '#FFFFFF', // surface
}

export function LessonNode({ lesson, onPress, className }: LessonNodeProps) {
  const iconName = iconByActivity[lesson.type]
  const iconColor = iconColorByState[lesson.state]

  const handlePress = () => {
    if (onPress) {
      onPress(lesson.id)
    }
  }

  return (
    <View className={cn('items-center justify-center gap-1.5', className)}>
      <LessonButton
        state={lesson.state}
        icon={<Ionicons name={iconName} size={26} color={iconColor} />}
        onPress={handlePress}
      />
      <Text
        className={cn(
          'font-nunito text-xs font-bold text-center max-w-[110px]',
          lesson.state === 'locked' ? 'text-muted/50' : 'text-ink'
        )}
        numberOfLines={2}
      >
        {lesson.title}
      </Text>
    </View>
  )
}
