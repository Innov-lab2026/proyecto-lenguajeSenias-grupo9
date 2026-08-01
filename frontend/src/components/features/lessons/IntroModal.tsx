import { Pressable, Text, View, Modal } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { Island } from '@/src/components/features/home/Island'

interface IntroModalProps {
  visible: boolean
  levelId: number
  title: string
  description: string
  /** 1 a 5: elige la ilustración de la isla (mapeado dinámicamente si es mayor a 5). */
  islandNumber?: number
  onStart: () => void
  onClose?: () => void
}

/**
 * Mapeo de dificultad por número de nivel (1 a 10).
 */
const DIFFICULTY_BY_LEVEL: Record<number, string> = {
  1: 'Fácil',
  2: 'Medio',
  3: 'Difícil',
  4: 'Medio',
  5: 'Difícil',
  6: 'Fácil',
  7: 'Medio',
  8: 'Difícil',
  9: 'Difícil',
  10: 'Medio',
}

/** Modal de inicio de la lección: dificultad, isla animada, título y descripción. */
export function IntroModal({ visible, levelId, title, description, islandNumber = 1, onStart, onClose }: IntroModalProps) {
  const computedIslandNumber = typeof islandNumber === 'number' ? ((islandNumber - 1) % 5) + 1 : 1
  const difficulty = DIFFICULTY_BY_LEVEL[levelId] ?? 'Fácil'

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full max-w-[340px] relative items-center justify-between p-6">
          {/* Imagen de fondo del modal */}
          <Image
            source={require('@/assets/images/lessons/intro_modal.svg')}
            className="absolute inset-0 w-full h-full"
            contentFit="fill"
          />

          {/* Botón salir */}
          {onClose && (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar modal"
              hitSlop={8}
              className="absolute top-2 -right-1 w-10 h-10 items-center justify-center active:opacity-60 z-20"
            >
              <Image
                source={require('@/assets/images/lessons/intro_modal_salir.svg')}
                className="w-full h-full"
                contentFit="contain"
              />
            </Pressable>
          )}

          {/* Texto de dificultad en el tab superior */}
          <View className="absolute top-4 left-0 right-0 items-center">
            <Text className="font-nunito text-base font-bold text-ink">{difficulty}</Text>
          </View>

          {/* Contenido principal */}
          <View className="flex-1 items-center justify-center mt-6 w-full">
            {/* Indicador de nivel */}
            <View className="bg-secondary px-6 py-1.5 rounded-full mb-3 shadow-sm">
              <Text className="text-white font-nunito font-bold text-lg">Nivel {levelId}</Text>
            </View>

            {/* Isla animada de la home */}
            <View className="items-center justify-center h-28 my-1">
              <Island number={computedIslandNumber} state="available" width={110} />
            </View>

            {/* Título y descripción */}
            <Text className="font-nunito text-2xl font-bold text-ink text-center px-4 mt-2">
              {title}
            </Text>
            <Text className="font-nunito text-sm text-muted text-center px-6 mt-1 mb-4">
              {description}
            </Text>
          </View>

          {/* Botón de acción */}
          <Button label="¡A Jugar!" onPress={onStart} className="mb-2" />
        </View>
      </View>
    </Modal>
  )
}
