import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import type { CompleteLessonResult } from '@/src/types/progress'

interface LessonSummaryProps {
  /** Respuesta de completeLesson. `undefined` mientras la request está en vuelo. */
  result?: CompleteLessonResult
  isPending: boolean
  /** Próximo nivel a desbloquear, o `null` si es la última lección del módulo. */
  nextLevel: number | null
  onClose: () => void
  onContinue: () => void
  insets: { top: number; bottom: number }
}

/** Pantalla de resumen al terminar la lección: recompensa del server + desbloqueo del próximo nivel. */
export function LessonSummary({ result, isPending, nextLevel, onClose, onContinue, insets }: LessonSummaryProps) {
  // El server responde success:false cuando la lección ya estaba completada:
  // no hay recompensa nueva que mostrar, sólo se reconoce la revisita.
  const alreadyCompleted = result != null && !result.success
  const earnedAchievements = result?.earned_achievements ?? []
  const showUnlock = !alreadyCompleted && nextLevel !== null

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
          {alreadyCompleted ? '¡De nuevo por acá!' : '¡Estuviste increíble!'}
        </Text>
        <Text className="font-nunito text-lg text-muted mb-2 text-center">
          {alreadyCompleted ? 'Ya habías completado esta lección.' : 'Completaste la lección'}
        </Text>

        {earnedAchievements.length > 0 ? (
          <Text className="font-nunito text-base font-bold text-secondary text-center px-4">
            ¡Nuevo logro! {earnedAchievements.map((a) => a.name).join(', ')}
          </Text>
        ) : null}
      </View>

      <View className="w-full max-w-md flex-row justify-between gap-2 mt-auto mb-4">
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <View className="w-8 h-8 rounded-full bg-secondary/20 items-center justify-center mb-1">
            <Text className="font-nunito text-xs font-bold text-secondary">XP</Text>
          </View>
          <Text className="font-nunito text-xs font-bold text-ink mb-1">Experiencia</Text>
          <Text className="font-nunito text-2xl font-bold text-ink">{result?.earned_xp ?? 0}</Text>
        </View>
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <Ionicons name="star" size={30} color="#F7BB18" />
          <Text className="font-nunito text-xs font-bold text-ink mb-1">Puntos</Text>
          <Text className="font-nunito text-2xl font-bold text-ink">+{result?.earned_points ?? 0}</Text>
        </View>
        <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
          <Ionicons name="paw" size={30} color="#A5652E" />
          <Text className="font-nunito text-xs font-bold text-ink mb-1">Señas</Text>
          <Text className="font-nunito text-2xl font-bold text-ink">{result?.earned_signs ?? 0}</Text>
        </View>
      </View>

      <View className="h-[22%] min-h-[150px] self-stretch -mx-4 bg-[#67AEF5] items-center justify-end pb-5 relative">
        {showUnlock ? (
          <View className="items-center z-10 mb-3">
            <Image
              source={require('@/assets/images/lessons/candado_abierto.svg')}
              className="w-16 h-16"
              contentFit="contain"
            />
            <Text className="font-nunito text-base font-bold text-ink text-center leading-4">
              Nivel {nextLevel}
              {'\n'}desbloqueado
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
