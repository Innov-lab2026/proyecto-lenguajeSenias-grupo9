import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

interface DraggableWordProps {
  word: string
  disabled?: boolean
  /**
   * Se llama al soltar, con la posición del dedo/mouse en pantalla
   * (coordenadas absolutas). El chip no sabe si cayó sobre un blank válido
   * — eso lo decide quien lo usa (DialogueExercise), que es quien conoce la
   * posición de cada blank.
   */
  onDrop: (word: string, absoluteX: number, absoluteY: number) => void
}

/**
 * Chip arrastrable del banco de palabras (isla 5 — completar la conversación).
 * El estilo animado sólo lleva transform/zIndex/opacity (nada de NativeWind
 * en el Animated.View) para no depender de que className funcione sobre un
 * componente animado — el View interno se encarga de todo el look visual.
 */
export function DraggableWord({ word, disabled = false, onDrop }: DraggableWordProps) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const isDragging = useSharedValue(false)

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      isDragging.value = true
    })
    .onUpdate((event) => {
      translateX.value = event.translationX
      translateY.value = event.translationY
    })
    .onEnd((event) => {
      isDragging.value = false
      const { absoluteX, absoluteY } = event
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
      runOnJS(onDrop)(word, absoluteX, absoluteY)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging.value ? 1.15 : 1 },
    ],
    zIndex: isDragging.value ? 10 : 1,
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <View
          className="px-3 py-1 rounded-xl border-2 bg-surface border-black/5"
          style={disabled ? { opacity: 0.2 } : undefined}
        >
          <Text className="font-nunito text-[10px] font-bold text-ink">{word}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}
