import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { LESSON_SHELL } from '@/src/constants/lessons'

interface LessonHeaderProps {
  stats: { xp: number; stars: number; paws: number }
  progress: number
}

/** HUD superior de la lección: stats (XP/estrellas/patitas) + barra de progreso. */
export function LessonHeader({ stats, progress }: LessonHeaderProps) {
  return (
    <View className="px-5 py-2 border-b border-black/5">
      <View className={LESSON_SHELL}>
        <View className="flex-row justify-around items-center mb-2">
          <View className="flex-row items-center gap-1">
            <View className="w-6 h-6 bg-secondary/20 rounded-full items-center justify-center">
              <Text className="text-[10px] text-secondary font-bold">XP</Text>
            </View>
            <Text className="font-nunito text-xs font-bold text-ink">{stats.xp}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={16} color="#F7BB18" />
            <Text className="font-nunito text-xs font-bold text-ink">{stats.stars}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="paw" size={16} color="#A5652E" />
            <Text className="font-nunito text-xs font-bold text-ink">{stats.paws}</Text>
          </View>
        </View>

        <ProgressBar progress={progress} showPercentage={false} className="h-2" />
      </View>
    </View>
  )
}
