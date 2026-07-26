import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { LessonModalCard } from '@/src/components/features/lessons/LessonModalCard'

interface HintModalProps {
  visible: boolean
  tip?: string
  onClose: () => void
}

/** Modal de pista del step actual. */
export function HintModal({ visible, tip, onClose }: HintModalProps) {
  return (
    <LessonModalCard visible={visible} className="items-center shadow-xl">
      <View className="w-16 h-16 bg-accent/20 rounded-full items-center justify-center mb-4">
        <Ionicons name="bulb" size={32} color="#F7BB18" />
      </View>
      <Text className="font-nunito text-xl font-bold text-ink mb-2">Pista</Text>
      <Text className="font-nunito text-base text-muted text-center mb-8 px-2">
        {tip || 'Observa bien los gestos y la posición de las manos.'}
      </Text>
      <Button label="Entendido" onPress={onClose} />
    </LessonModalCard>
  )
}
