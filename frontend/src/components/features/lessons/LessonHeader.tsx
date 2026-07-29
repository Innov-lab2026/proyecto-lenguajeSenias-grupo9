import { Text, View } from 'react-native'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { LESSON_SHELL } from '@/src/constants/lessons'
import { StatBadge } from '@/src/components/features/home/stats/StatBadge'

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
            <StatBadge kind="xp" size={24} animated={false} />
            <Text className="font-nunito text-xs font-bold text-ink">{stats.xp}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <StatBadge kind="star" size={24} animated={false} />
            <Text className="font-nunito text-xs font-bold text-ink">{stats.stars}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <StatBadge kind="paw" size={24} animated={false} />
            <Text className="font-nunito text-xs font-bold text-ink">{stats.paws}</Text>
          </View>
        </View>

        <ProgressBar progress={progress} showPercentage={false} className="h-2" />
      </View>
    </View>
  )
}
