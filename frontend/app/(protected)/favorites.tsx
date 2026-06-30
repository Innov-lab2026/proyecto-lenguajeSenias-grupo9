import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function FavoritesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-5" edges={['top']}>
      <Text className="font-nunito text-2xl font-bold text-ink">Mis Favoritos</Text>
      <Text className="font-nunito text-sm text-muted mt-2 text-center">
        Aquí podrás ver tus señas y lecciones marcadas como favoritas.
      </Text>
    </SafeAreaView>
  )
}
