import { View } from 'react-native'
import { StatItem } from '../home/stats'
import type { HomeStats } from '@/src/types/home'

interface RewardStatsProps {
  stats: HomeStats
}

export function RewardStats({ stats }: RewardStatsProps) {
  return (
    <View className="flex-row justify-between w-full px-1 py-4 gap-2">
      <View className="flex-1 min-h-[110px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1 py-2 shadow-sm">
        <StatItem kind="xp" label="Experiencia" value={stats.xp} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" />
      </View>
      <View className="flex-1 min-h-[110px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1 py-2 shadow-sm">
        <StatItem kind="star" label="Puntos" value={stats.stars} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" />
      </View>
      <View className="flex-1 min-h-[110px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1 py-2 shadow-sm">
        <StatItem kind="paw" label="Señas" value={stats.paws} layout="column" showLabel badgeSize={34} valueClassName="text-2xl" />
      </View>
    </View>
  )
}


