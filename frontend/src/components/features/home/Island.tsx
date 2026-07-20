import { useEffect } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { ISLAND_COMPONENTS } from './islands'
import type { IslandState } from '@/src/types/home'

const inOut = Easing.inOut(Easing.ease)

interface IslandProps {
  /** Número de isla (1 = abajo de todo, 5 = arriba de todo). */
  number: number
  state: IslandState
  /** Ancho de render; el alto sale de la proporción del SVG. */
  width: number
  onPress?: () => void
}

/**
 * Isla individual del camino: SVG vivo o bloqueado según el estado. Las vivas
 * "respiran" (island-breathe de icons.css: translateY ±2.5px · 5.5s); las
 * bloqueadas quedan totalmente quietas = apagadas.
 */
export function Island({ number, state, width, onPress }: IslandProps) {
  const IslandSvg = ISLAND_COMPONENTS[number]
  const isAvailable = state === 'available'

  const breathe = useSharedValue(0)

  useEffect(() => {
    if (!isAvailable) return
    breathe.value = withRepeat(
      withSequence(
        withTiming(-2.5, { duration: 2750, easing: inOut }),
        withTiming(0, { duration: 2750, easing: inOut }),
      ),
      -1,
    )
    return () => {
      cancelAnimation(breathe)
      breathe.value = 0
    }
  }, [isAvailable, breathe])

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: breathe.value }],
  }))

  return (
    <Pressable
      onPress={isAvailable ? onPress : undefined}
      disabled={!isAvailable}
      accessibilityRole="button"
      accessibilityLabel={`Isla ${number}, ${isAvailable ? 'disponible' : 'bloqueada'}`}
      accessibilityState={{ disabled: !isAvailable }}
      className={isAvailable ? 'active:opacity-80' : undefined}
    >
      <Animated.View style={breatheStyle}>
        <IslandSvg width={width} blocked={!isAvailable} />
      </Animated.View>
    </Pressable>
  )
}
