import { View, Text } from 'react-native'
import { StatBadge } from '../home/stats/StatBadge'
import type { HomeStats } from '@/src/types/home'

interface RewardStatsProps {
  stats: HomeStats
}

export function RewardStats({ stats }: RewardStatsProps) {
  return (
    <View className="flex-row justify-between w-full px-4 py-6 gap-3">
      <StatCard
        kind="xp"
        label="EXPERIENCIA"
        value={stats.xp}
      />
      <StatCard
        kind="star"
        label="PUNTOS"
        value={stats.stars}
      />
      <StatCard
        kind="paw"
        label="SEÑAS"
        value={stats.paws}
      />
    </View>
  )
}

function StatCard({ kind, label, value }: { kind: 'xp' | 'star' | 'paw'; label: string; value: number }) {
  return (
    <View className="flex-1 bg-surface rounded-2xl p-3 items-center shadow-md border border-black/5">
      <View className="flex-row items-baseline gap-2 mb-1">
        <StatBadge kind={kind} size={24} />
        <Text className="font-nunito text-2xl font-bold text-ink">{value}</Text>
      </View>
      <Text className="font-nunito text-[10px] font-bold text-muted/80 tracking-widest">{label}</Text>
    </View>
  )
}

