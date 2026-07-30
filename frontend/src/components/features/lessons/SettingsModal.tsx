import { Pressable, Text, View, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'

interface SettingsModalProps {
  visible: boolean
  isMuted: boolean
  onToggleMute: () => void
  onExit: () => void
  onClose: () => void
}

/** Modal de configuraciones de la lección: silenciar audio y salir. */
export function SettingsModal({ visible, isMuted, onToggleMute, onExit, onClose }: SettingsModalProps) {
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

          {/* Texto "Configuraciones" en el tab superior */}
          <View className="absolute top-4 left-0 right-0 items-center">
            <Text className="font-nunito text-base font-bold text-ink">Ajustes</Text>
          </View>

          {/* Contenido principal */}
          <View className="flex-1 justify-center mt-8 w-full px-2">
            <Pressable onPress={onToggleMute} className="flex-row items-center py-4 border-b border-black/5">
              <Ionicons name={isMuted ? 'volume-mute' : 'volume-medium'} size={24} color="#6F706F" />
              <Text className="font-nunito text-base text-ink ml-4">{isMuted ? 'Activar sonido' : 'Desactivar sonido'}</Text>
            </Pressable>

            <Pressable onPress={onExit} className="flex-row items-center py-4">
              <Ionicons name="exit-outline" size={24} color="#EF4444" />
              <Text className="font-nunito text-base text-red-500 ml-4">Salir de la lección</Text>
            </Pressable>
          </View>

          {/* Botón de acción (Cerrar con el patrón amarillo del app) */}
          <Button label="Cerrar" onPress={onClose} className="mb-2" />
        </View>
      </View>
    </Modal>
  )
}
