import { ScrollView, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RewardStats } from '@/src/components/features/rewards/RewardStats'
import { AchievementsList } from '@/src/components/features/rewards/AchievementsList'
import { StickersList } from '@/src/components/features/rewards/StickersList'
import { MOCK_HOME_STATS } from '@/src/constants/home'
import { Image } from 'expo-image'
import { useProfile } from '@/src/hooks/features/profile/useProfile'

export default function RewardsScreen() {
  const insets = useSafeAreaInsets()
  const { data: profile } = useProfile()

  return (
    <ScrollView 
      className="flex-1 bg-background" 
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con Stats */}
      <View className="bg-accent rounded-b-[50px] pb-10 shadow-sm">
        <View className="px-5 pt-6 items-center">
          <Text className="font-nunito text-5xl font-bold text-ink mb-6">Recompensas</Text>
          <RewardStats stats={MOCK_HOME_STATS} />
        </View>
      </View>

      {/* Perfil flotante (similar a la imagen) */}
      <View className="items-center -mt-8 z-10">
        <View className="w-16 h-16 rounded-full bg-surface border-4 border-surface shadow-md overflow-hidden items-center justify-center">
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-slate-400 items-center justify-center">
              <Text className="text-white font-bold text-xl">
                {profile?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="mx-auto w-full max-w-3xl">
        <AchievementsList />
        <StickersList />
      </View>
    </ScrollView>
  )
}

