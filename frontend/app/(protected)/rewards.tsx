import { ScrollView, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RewardStats } from '@/src/components/features/rewards/RewardStats'
import { AchievementsList } from '@/src/components/features/rewards/AchievementsList'
import { StickersList } from '@/src/components/features/rewards/StickersList'
import { Image } from 'expo-image'
import { useStats } from '@/src/hooks/features/lessons/useStats'

export default function RewardsScreen() {
  const insets = useSafeAreaInsets()
  const statsQuery = useStats()

  // total_points ya viene neto: purchase_sticker descuenta en el server.
  const stats = statsQuery.data
    ? {
        xp: statsQuery.data.total_xp,
        stars: statsQuery.data.total_points,
        paws: statsQuery.data.total_signs
      }
    : { xp: 0, stars: 0, paws: 0 }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecera con banner azul y la imagen nubeblanca_recomp.svg */}
      <View
        className="w-full bg-[#4A90E2] items-center justify-end pb-5 relative"
        style={{ paddingTop: insets.top + 14 }}
      >
        <Image
          source={require('@/assets/images/recompensas/nubeblanca_recomp.svg')}
          className="absolute top-0 bottom-0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
          }}
          contentFit="fill"
        />
        <Text className="font-nunito text-3xl font-bold text-white text-center z-10 relative mt-10">
          Recompensas
        </Text>
      </View>

      {/* Estadísticas de recompensa */}
      <View className="px-5 pt-4 pb-2 items-center">
        <RewardStats stats={stats} />
      </View>

      <View className="mx-auto w-full max-w-3xl">
        <AchievementsList />
        <StickersList />
      </View>
    </ScrollView>
  )
}

