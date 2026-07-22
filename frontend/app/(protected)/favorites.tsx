import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FavoritesList } from '@/src/components/features/favorites/FavoritesList'

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-5 pt-8 pb-6 max-w-4xl mx-auto w-full">
        <Text className="font-nunito text-4xl font-bold text-ink">Favoritos</Text>
        <Text className="font-nunito text-base text-muted mt-2">
          Tus lecciones y señas guardadas
        </Text>
      </View>
      
      <View className="flex-1 max-w-4xl mx-auto w-full">
        <FavoritesList />
      </View>
    </View>
  )
}

