import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { LessonModalCard } from '@/src/components/features/lessons/LessonModalCard'

interface IntroModalProps {
  visible: boolean
  levelId: ReactNode
  title: string
  description: string
  onStart: () => void
}

/** Modal de inicio de la lección: dificultad, isla, título y descripción. */
export function IntroModal({ visible, levelId, title, description, onStart }: IntroModalProps) {
  return (
    <LessonModalCard visible={visible} className="items-center overflow-hidden rounded-[40px] p-8">
      <View className="bg-accent/20 px-4 py-1 rounded-full mb-4">
        <Text className="font-nunito text-sm font-bold text-ink">Fácil</Text>
      </View>

      <View className="items-center mb-6">
        <View className="w-32 h-32 bg-accent/10 rounded-full items-center justify-center mb-2">
          <Image
            source={require('@/assets/images/lessons/isla_nivel1_presentacion.svg')}
            className="w-24 h-24"
            contentFit="contain"
          />
        </View>
        <View className="bg-primary px-3 py-1 rounded-md rotate-[-5deg]">
          <Text className="text-white font-bold text-xs">Nivel {levelId}</Text>
        </View>
      </View>

      <Text className="font-nunito text-3xl font-bold text-ink mb-4">{title}</Text>
      <Text className="font-nunito text-base text-muted text-center mb-8 px-4">{description}</Text>

      <Button label="¡A Jugar!" onPress={onStart} className="px-10" />
    </LessonModalCard>
  )
}
