import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import type { HomeStats } from '@/src/types/home'

interface StatsHeaderProps {
  stats: HomeStats
}

interface StatItem {
  key: keyof HomeStats
  label: string
  source: number
  value: number
}

/** Fila superior del home: XP, estrellas y huellas del usuario. */
export function StatsHeader({ stats }: StatsHeaderProps) {
  const items: StatItem[] = [
    {
      key: 'xp',
      label: 'Experiencia',
      source: require('@/assets/icons/home/xp-icon.svg'),
      value: stats.xp,
    },
    {
      key: 'stars',
      label: 'Estrellas',
      source: require('@/assets/icons/home/star-icon.svg'),
      value: stats.stars,
    },
    {
      key: 'paws',
      label: 'Huellas',
      source: require('@/assets/icons/home/leg-icon.png'),
      value: stats.paws,
    },
  ]

  return (
    <View className="w-full flex-row items-center justify-around">
      {items.map((item) => (
        <View
          key={item.key}
          className="flex-row items-center gap-2"
          accessibilityLabel={`${item.label}: ${item.value}`}
        >
          <Image source={item.source} style={{ width: 30, height: 30 }} contentFit="contain" />
          <Text className="font-nunito text-xl font-bold text-ink">{item.value}</Text>
        </View>
      ))}
    </View>
  )
}
