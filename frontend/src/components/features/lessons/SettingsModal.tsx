import { Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { LessonModalCard } from '@/src/components/features/lessons/LessonModalCard'

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
    <LessonModalCard visible={visible} className="shadow-xl">
      <Text className="font-nunito text-xl font-bold text-ink mb-6 text-center">Configuraciones</Text>

      <Pressable onPress={onToggleMute} className="flex-row items-center p-4 border-b border-black/5">
        <Ionicons name={isMuted ? 'volume-mute' : 'volume-medium'} size={24} color="#6F706F" />
        <Text className="font-nunito text-base text-ink ml-4">{isMuted ? 'Activar sonido' : 'Desactivar sonido'}</Text>
      </Pressable>

      <Pressable onPress={onExit} className="flex-row items-center p-4">
        <Ionicons name="exit-outline" size={24} color="#EF4444" />
        <Text className="font-nunito text-base text-red-500 ml-4">Salir de la lección</Text>
      </Pressable>

      <Button label="Cerrar" onPress={onClose} variant="white" className="mt-6 border border-black/10" />
    </LessonModalCard>
  )
}
