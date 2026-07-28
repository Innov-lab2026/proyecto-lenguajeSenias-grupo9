import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { StatItem } from '@/src/components/features/home/stats'
import { LESSON_SUMMARY_CONFIG } from '@/src/constants/lessons'
import type { CompleteLessonResult } from '@/src/types/progress'
import { cn } from '@/src/utils/cn'

interface LessonSummaryProps {
  /** Respuesta de completeLesson. `undefined` mientras la request está en vuelo. */
  result?: CompleteLessonResult
  isPending: boolean
  /** Próximo nivel a desbloquear, o `null` si es la última lección del módulo. */
  nextLevel: number | null
  /** `lessons.content_key`: elige los textos y el color de cierre de la lección. */
  contentKey?: string | null
  onClose: () => void
  onContinue: () => void
  insets: { top: number; bottom: number }
}

/** Respiro antes de "revelar" la recompensa (que se note que apareció, no que ya estaba). */
const REVEAL_DELAY_MS = 300

/** Celeste por defecto de la franja inferior (las lecciones de cierre lo pisan). */
const DEFAULT_FOOTER_BG = '#67AEF5'

/** Pantalla de resumen al terminar la lección: recompensa del server + desbloqueo del próximo nivel. */
export function LessonSummary({ result, isPending, nextLevel, contentKey, onClose, onContinue, insets }: LessonSummaryProps) {
  // El server responde success:false cuando la lección ya estaba completada:
  // no hay recompensa nueva que mostrar, sólo se reconoce la revisita.
  const alreadyCompleted = result != null && !result.success
  const earnedAchievements = result?.earned_achievements ?? []

  const config = (contentKey ? LESSON_SUMMARY_CONFIG[contentKey] : undefined) ?? {}
  const footerBg = config.footerBg ?? DEFAULT_FOOTER_BG
  // Fondo oscuro (cierre de módulo) ⇒ el texto del candado va en blanco.
  const isDarkFooter = footerBg !== DEFAULT_FOOTER_BG

  // La lección de cierre de módulo no tiene "nivel siguiente", pero igual
  // anuncia algo; por eso el label puede venir de la config.
  const unlockLabel = config.unlockLabel ?? (nextLevel !== null ? `Nivel ${nextLevel}\ndesbloqueado` : null)
  const showUnlock = !alreadyCompleted && unlockLabel !== null

  // StatItem sólo anima cuando su `value` sube mientras está montado. La
  // respuesta del server puede llegar tan rápido que el 0 inicial no alcance a
  // pintarse (mock resuelve en el acto), así que el salto a los valores reales
  // se agenda explícitamente en vez de depender de cuándo resuelva la request.
  // Ya completada ⇒ earned_* viene en 0 y no hay nada que animar.
  const [revealed, setRevealed] = useState({ xp: 0, points: 0, signs: 0 })

  useEffect(() => {
    if (result == null) return
    const timeout = setTimeout(() => {
      setRevealed({ xp: result.earned_xp, points: result.earned_points, signs: result.earned_signs })
    }, REVEAL_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [result])

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

        <Text className="font-nunito text-4xl font-bold text-ink mb-0 text-center">
          {alreadyCompleted ? '¡De nuevo por acá!' : config.title ?? '¡Estuviste increíble!'}
        </Text>
        <Text className="font-nunito text-lg text-muted mb-2 text-center">
          {alreadyCompleted ? 'Ya habías completado esta lección.' : config.subtitle ?? 'Completaste la lección'}
        </Text>

        {earnedAchievements.length > 0 ? (
          <Text className="font-nunito text-base font-bold text-secondary text-center px-4">
            ¡Nuevo logro! {earnedAchievements.map((a) => a.name).join(', ')}
          </Text>
        ) : null}
      </View>

      <View className="w-full max-w-md flex-row justify-between gap-2 mt-auto mb-4">
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <StatItem kind="xp" label="Experiencia" value={revealed.xp} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" />
        </View>
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <StatItem kind="star" label="Puntos" value={revealed.points} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" prefix="+" />
        </View>
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <StatItem kind="paw" label="Señas" value={revealed.signs} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" />
        </View>
      </View>

      <View
        className="h-[22%] min-h-[150px] self-stretch -mx-4 items-center justify-end pb-5 relative"
        style={{ backgroundColor: footerBg }}
      >
        {showUnlock ? (
          <View className="items-center z-10 mb-3">
            <Image
              source={require('@/assets/images/lessons/candado_abierto.svg')}
              className="w-16 h-16"
              contentFit="contain"
            />
            <Text
              className={cn(
                'font-nunito text-base font-bold text-center leading-4',
                isDarkFooter ? 'text-white' : 'text-ink',
              )}
            >
              {unlockLabel}
            </Text>
          </View>
        ) : null}
        <Button
          label={isPending ? 'Guardando...' : 'Continuar'}
          onPress={onContinue}
          className="w-40 z-10"
          disabled={isPending}
        />
      </View>
    </View>
  )
}
