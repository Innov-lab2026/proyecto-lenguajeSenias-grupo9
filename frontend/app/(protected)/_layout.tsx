import { View } from 'react-native'
import { Slot } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SideBar } from '@/src/components/features/navigation/SideBar'
import { BottomBar } from '@/src/components/features/navigation/BottomBar'
import { useResponsive } from '@/src/hooks/common/useResponsive'

export default function ProtectedLayout() {
  const { isMobile, isTablet } = useResponsive()

  if (isMobile) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <View className="flex-1">
          <Slot />
        </View>
        <BottomBar />
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 flex-row bg-background">
      <SideBar isTablet={isTablet} />
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  )
}
