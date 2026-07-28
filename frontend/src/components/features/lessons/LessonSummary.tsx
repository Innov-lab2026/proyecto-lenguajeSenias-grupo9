import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { StatItem } from '@/src/components/features/home/stats'
import { LESSON_SUMMARY_CONFIG } from '@/src/constants/lessons'

interface LessonSummaryProps {
  lessonId: string
  earnedStats: { xp: number; stars: number }
  signCount: number
  nextLevel: number
  isSaving: boolean
  onClose: () => void
  onContinue: () => void
  insets: { top: number; bottom: number }
}

/** Respiro antes de "revelar" el puntaje ganado (que se note que apareció, no que ya estaba). */
const REVEAL_DELAY_MS = 300

const DEFAULT_FOOTER_BG = '#67AEF5'

/** Pantalla de resumen al terminar la lección: puntaje ganado + desbloqueo del próximo nivel. */
export function LessonSummary({ lessonId, earnedStats, signCount, nextLevel, isSaving, onClose, onContinue, insets }: LessonSummaryProps) {
  const config = LESSON_SUMMARY_CONFIG[lessonId] ?? LESSON_SUMMARY_CONFIG['1']
  const footerBg = config.footerBg ?? DEFAULT_FOOTER_BG
  // Determinar si el footer es oscuro para usar texto blanco
  const isDarkFooter = footerBg !== DEFAULT_FOOTER_BG

  // StatItem sólo anima cuando su `value` sube mientras está montado — si
  // esta pantalla mostrara earnedStats/signCount directamente, ya montaría
  // con el valor final y no habría delta que animar. Arranca en 0 y sube al
  // valor real un instante después para disparar el mismo efecto (icono +
  // conteo + "+N" flotante) que usa el header del home.
  const [revealed, setRevealed] = useState({ xp: 0, stars: 0, signs: 0 })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRevealed({ xp: earnedStats.xp, stars: earnedStats.stars, signs: signCount })
    }, REVEAL_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [earnedStats.xp, earnedStats.stars, signCount])

  return (
    <View
      className="flex-1 bg-[#EAF8FF] items-center justify-start px-4 overflow-hidden"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Pressable onPress={onClose} className="absolute top-2 right-2 z-10 p-2">
        <Ionicons name="close" size={32} color="#1F2937" />
      </Pressable>

      <View className="flex-1 w-full max-w-md items-center justify-center">
        <Image
          source={require('@/assets/images/lessons/carpi_victory.png')}
          className="w-full max-w-[280px] h-[50%] max-h-[250px] mb-4 self-center"
          contentFit="contain"
        />

        <Text className="font-nunito text-4xl font-bold text-ink mb-0">{config.title}</Text>
        <Text className="font-nunito text-lg text-muted mb-2">{config.subtitle}</Text>
      </View>

      <View className="w-full max-w-md flex-row justify-between gap-2 mt-auto mb-4">
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <StatItem kind="xp" label="Experiencia" value={revealed.xp} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" />
        </View>
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <StatItem kind="star" label="Puntos" value={revealed.stars} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" prefix="+" />
        </View>
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <StatItem kind="paw" label="Señas" value={revealed.signs} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" />
        </View>
      </View>

      <View
        className="h-[22%] min-h-[150px] self-stretch -mx-4 items-center justify-end pb-5 relative"
        style={{ backgroundColor: footerBg }}
      >
        <View className="items-center z-10 mb-3">
          <Image
            source={require('@/assets/images/lessons/candado_abierto.svg')}
            className="w-16 h-16"
            contentFit="contain"
          />
          <Text
            className="font-nunito text-base font-bold text-center leading-4"
            style={{ color: isDarkFooter ? '#FFFFFF' : '#1F2937' }}
          >
            {config.unlockLabel}
          </Text>
        </View>
        <Button
          label={isSaving ? 'Guardando...' : 'Continuar'}
          onPress={onContinue}
          className="w-40 z-10"
          disabled={isSaving}
        />
      </View>
    </View>
  )
}
