import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RewardsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-5" edges={['top']}>
      <Text className="font-nunito text-2xl font-bold text-ink">Recompensas</Text>
      <Text className="font-nunito text-sm text-muted mt-2 text-center">
        Recompensas de la Aplicación.
      </Text>
    </SafeAreaView>
  )
}
