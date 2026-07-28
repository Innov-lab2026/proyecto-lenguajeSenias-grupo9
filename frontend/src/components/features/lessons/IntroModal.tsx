import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Image, type ImageSource } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { LessonModalCard } from '@/src/components/features/lessons/LessonModalCard'

/**
 * Mapa de imágenes de isla por lección.
 * require() debe llamarse estáticamente, por eso se declara fuera del componente.
 */
const INTRO_IMAGES: Record<string, ImageSource> = {
  '1': require('@/assets/images/lessons/isla_nivel1_presentacion.svg'),
  '2': require('@/assets/images/lessons/isla_nivel2_presentacion.svg'),
  '3': require('@/assets/images/lessons/isla_nivel3_presentacion.svg'),
  '4': require('@/assets/images/lessons/isla_nivel4_presentacion.svg'),
  '5': require('@/assets/images/lessons/isla_nivel5_presentacion.svg'),
  '6': require('@/assets/images/lessons/isla_nivel1_presentacion.svg'),
  '7': require('@/assets/images/lessons/isla_nivel1_presentacion.svg'),
  '8': require('@/assets/images/lessons/isla_nivel1_presentacion.svg'),
  '9': require('@/assets/images/lessons/isla_nivel1_presentacion.svg'),
  '10': require('@/assets/images/lessons/isla_nivel1_presentacion.svg'),
}

interface IntroModalProps {
  visible: boolean
  levelId: ReactNode
  title: string
  description: string
  onStart: () => void
  onExit: () => void
}

/** Modal de inicio de la lección: dificultad, isla, título y descripción. */
export function IntroModal({ visible, levelId, title, description, onStart, onExit }: IntroModalProps) {
  const lessonKey = String(levelId)
  const imageSource = INTRO_IMAGES[lessonKey] ?? INTRO_IMAGES['1']

  return (
    <LessonModalCard visible={visible} className="items-center overflow-hidden rounded-[40px] p-8">
      {/* Botón salir */}
      <Pressable
        onPress={onExit}
        accessibilityRole="button"
        accessibilityLabel="Salir de la lección"
        hitSlop={8}
        className="absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full bg-muted/10 web:hover:bg-muted/20"
      >
        <Ionicons name="close" size={22} color="#6B7280" />
      </Pressable>

      <View className="bg-accent/20 px-4 py-1 rounded-full mb-4">
        <Text className="font-nunito text-sm font-bold text-ink">Fácil</Text>
      </View>

      <View className="items-center mb-6">
        <Image
          source={imageSource}
          className="w-44 h-44"
          contentFit="contain"
        />
      </View>

      <Text className="font-nunito text-3xl font-bold text-ink mb-4">{title}</Text>
      <Text className="font-nunito text-base text-muted text-center mb-8 px-4">{description}</Text>

      <View className="w-1/2">
        <Button label="¡A Jugar!" onPress={onStart} />
      </View>
    </LessonModalCard>
  )
}
