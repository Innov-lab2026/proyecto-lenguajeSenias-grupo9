import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { cn } from '@/src/utils/cn'
import type { LessonState } from '@/src/types/learning'

interface LessonButtonProps {
  state: LessonState
  icon: ReactNode
  onPress?: () => void
  disabled?: boolean
  className?: string
}

const buttonBgByState: Record<LessonState, string> = {
  locked: 'bg-muted/20 border border-muted/30',
  available: 'bg-accent border border-secondary/30',
  current: 'bg-primary border border-surface',
  completed: 'bg-secondary',
}

const shadowBgByState: Record<LessonState, string> = {
  locked: 'bg-muted/40',
  available: 'bg-secondary/20',
  current: 'bg-primary/60',
  completed: 'bg-secondary/70',
}

export function LessonButton({
  state,
  icon,
  onPress,
  disabled = false,
  className,
}: LessonButtonProps) {
  const isLocked = state === 'locked' || disabled
  
  // En Duolingo, los botones bloqueados son planos.
  // Los activos tienen profundidad 3D (-6dp en Y).
  const defaultTranslateY = isLocked ? -2 : -6
  const scale = useSharedValue(1)
  const translateY = useSharedValue(defaultTranslateY)

  useEffect(() => {
    translateY.value = isLocked ? -2 : -6
  }, [state, isLocked, translateY])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    }
  })

  const handlePressIn = () => {
    if (isLocked) return
    scale.value = withSpring(0.95, { damping: 15 })
    translateY.value = withSpring(0, { damping: 15 })
  }

  const handlePressOut = () => {
    if (isLocked) return
    scale.value = withSpring(1, { damping: 15 })
    translateY.value = withSpring(-6, { damping: 15 })
  }

  return (
    <View className={cn('relative h-20 w-20 items-center justify-center', className)}>
      {/* Sombra 3D (Capa trasera) */}
      <View
        className={cn(
          'absolute bottom-1 h-16 w-16 rounded-full',
          shadowBgByState[state]
        )}
      />

      {/* Botón Principal (Capa delantera animada) */}
      <Animated.View
        style={animatedStyle}
        className="absolute top-1"
      >
        <Pressable
          onPress={isLocked ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isLocked}
          accessibilityRole="button"
          accessibilityState={{ disabled: isLocked }}
          className={cn(
            'h-16 w-16 items-center justify-center rounded-full shadow-sm',
            buttonBgByState[state]
          )}
        >
          {icon}
        </Pressable>
      </Animated.View>
    </View>
  )
}
