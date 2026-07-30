import { Pressable, Text, View, Modal } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { Island } from '@/src/components/features/home/Island'

interface DevelopmentModalProps {
  visible: boolean
  levelId: number
  onClose: () => void
}

/** Modal indicando que un nivel aún está en desarrollo (mismo estilo que IntroModal). */
export function DevelopmentModal({ visible, levelId, onClose }: DevelopmentModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full max-w-[340px] aspect-[13/16] relative items-center justify-between p-6">
          {/* Imagen de fondo del modal */}
          <Image
            source={require('@/assets/images/lessons/intro_modal.svg')}
            className="absolute inset-0 w-full h-full"
            contentFit="fill"
          />

          {/* Botón salir */}
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

          {/* Texto superior */}
          <View className="absolute top-4 left-0 right-0 items-center">
            <Text className="font-nunito text-base font-bold text-ink">Próximamente</Text>
          </View>

          {/* Contenido principal */}
          <View className="flex-1 items-center justify-center mt-6 w-full">
            {/* Indicador de nivel */}
            <View className="bg-secondary px-6 py-1.5 rounded-full mb-3 shadow-sm">
              <Text className="text-white font-nunito font-bold text-lg">Nivel {levelId}</Text>
            </View>

            {/* Isla bloqueada/en desarrollo */}
            <View className="items-center justify-center h-28 my-1">
              <Island number={1} state="blocked" width={110} />
            </View>

            {/* Título y descripción */}
            <Text className="font-nunito text-2xl font-bold text-ink text-center px-4 mt-2">
              ¡Muy pronto!
            </Text>
            <Text className="font-nunito text-sm text-muted text-center px-6 mt-1 mb-4">
              Este nivel aún está en desarrollo. ¡Estamos preparando nuevas señas para vos!
            </Text>
          </View>

          {/* Botón de acción */}
          <Button label="Entendido" onPress={onClose} className="mb-2" />
        </View>
      </View>
    </Modal>
  )
}
