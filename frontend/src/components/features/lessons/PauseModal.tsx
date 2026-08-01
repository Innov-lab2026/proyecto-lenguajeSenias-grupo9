import { Pressable, Text, View, Modal } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'

interface PauseModalProps {
  visible: boolean
  isMuted: boolean
  onToggleMute: () => void
  onExit: () => void
  onClose: () => void
}

/** Modal de lección pausada: muestra a Carpi durmiendo y opciones de continuar o salir. */
export function PauseModal({ visible, onExit, onClose }: PauseModalProps) {
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

          {/* Botón salir (X) - sirve para salir de la lección */}
          <Pressable
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel="Salir de la lección"
            hitSlop={8}
            className="absolute top-2 -right-1 w-10 h-10 items-center justify-center active:opacity-60 z-20"
          >
            <Image
              source={require('@/assets/images/lessons/intro_modal_salir.svg')}
              className="w-full h-full"
              contentFit="contain"
            />
          </Pressable>

          {/* Texto "Lección pausada" en el tab superior */}
          <View className="absolute top-4 left-0 right-0 items-center">
            <Text className="font-nunito text-base font-bold text-ink">Lección pausada</Text>
          </View>

          {/* Contenido principal */}
          <View className="flex-1 items-center justify-center mt-12 w-full px-2">
            {/* Ilustración de Carpi durmiendo */}
            <View className="items-center justify-center h-32 my-2 w-full">
              <Image
                source={require('@/assets/images/lessons/carpi_sueno.svg')}
                className="w-28 h-28"
                contentFit="contain"
              />
            </View>

            {/* Mensaje de pausa */}
            <Text className="font-nunito text-sm text-ink text-center px-4 mb-6 leading-tight">
              Podés continuar ahora o volver más tarde.
            </Text>
          </View>

          {/* Botones de acción centrados verticalmente */}
          <View className="w-full items-center gap-3 mb-2">
            <Button
              label="Continuar"
              onPress={onClose}
              variant="primary"
              className="w-[60%] h-12"
              textClassName="text-sm"
            />
            <Button
              label="Salir"
              onPress={onExit}
              variant="white"
              className="w-[60%] h-12 border border-gray-300"
              textClassName="text-sm"
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}
