import { Pressable, Text, View, Modal } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'

interface HintModalProps {
  visible: boolean
  tip?: string
  onClose: () => void
}

/** Modal de pista del step actual: muestra una lámpara animada y la explicación. */
export function HintModal({ visible, tip, onClose }: HintModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full max-w-[340px] aspect-[13/16] relative items-center justify-between p-6">
          {/* Imagen de fondo del modal (idéntica a la de IntroModal) */}
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

          {/* Texto "Pista" en el tab superior */}
          <View className="absolute top-4 left-0 right-0 items-center">
            <Text className="font-nunito text-base font-bold text-ink">Pista</Text>
          </View>

          {/* Contenido principal */}
          <View className="flex-1 items-center justify-center mt-6 w-full">
            {/* Lámpara ilustrativa */}
            <View className="items-center justify-center h-28 my-2">
              <Image
                source={require('@/assets/images/lessons/tip_lampara.svg')}
                className="w-24 h-24"
                contentFit="contain"
              />
            </View>

            {/* Explicación de la pista */}
            <Text className="font-nunito text-base text-muted text-center px-6 mt-4 mb-4">
              {tip || 'Observa bien los gestos y la posición de las manos.'}
            </Text>
          </View>

          {/* Botón de acción */}
          <Button label="Entendido" onPress={onClose} className="mb-2" />
        </View>
      </View>
    </Modal>
  )
}
