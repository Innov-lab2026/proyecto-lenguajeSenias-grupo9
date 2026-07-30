import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { FavoritesList } from '@/src/components/features/favorites/FavoritesList'

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-background">
      {/* Cabecera con banner azul y la imagen nubeblanca_fav.svg estirada hasta los bordes extremos */}
      <View
        className="w-full bg-[#4A90E2] items-center justify-end pb-5 relative"
        style={{ paddingTop: insets.top + 14 }}
      >
        <Image
          source={require('@/assets/images/favoritos/nubeblanca_fav.svg')}
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
          Favoritos
        </Text>
      </View>

      <View className="flex-1 max-w-4xl mx-auto w-full">
        <FavoritesList />
      </View>
    </View>
  )
}

