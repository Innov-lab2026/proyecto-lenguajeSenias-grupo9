import { View } from 'react-native'
import { StatItem } from './stats'
import type { HomeStats } from '@/src/types/home'

interface StatsHeaderProps {
  stats: HomeStats
}

/** Fila superior del home: XP, estrellas y huellas del usuario. */
export function StatsHeader({ stats }: StatsHeaderProps) {
  return (
    <View className="w-full flex-row items-center justify-around">
      <StatItem kind="xp" label="Experiencia" value={stats.xp} />
      <StatItem kind="star" label="Estrellas" value={stats.stars} />
      <StatItem kind="paw" label="Huellas" value={stats.paws} />
    </View>
  )
}
