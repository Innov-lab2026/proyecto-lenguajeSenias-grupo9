import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'

export default function LetterScreen() {
  const params = useLocalSearchParams<{ letter?: string }>()
  const letter = Array.isArray(params.letter) ? params.letter[0] : params.letter

  return (
    <SafeAreaView className="flex-1 bg-background px-5" edges={['top']}>
      <View className="px-4 pt-5">
        <Text className="font-nunito text-2xl font-bold text-ink">Letra {letter ?? '?'}</Text>
        <Text className="font-nunito text-sm text-muted mt-2">
          Esta página mostrará la seña y el video correspondiente.
        </Text>
      </View>

      <View className="flex-1 justify-center px-4 py-6">
        <Text className="text-center font-nunito text-7xl font-black text-ink/80">
          {letter ?? '-'}
        </Text>

        <View className="mt-10 h-[400px] sm:h-[600px] w-full sm:w-[500px] rounded-3xl border border-muted/20 bg-surface p-6 mx-auto shadow-sm">
          <Text className="font-nunito text-lg font-semibold text-ink mb-4">
            Recuadro de video
          </Text>
          <View className="h-[90%] rounded-3xl border border-dashed border-muted/40 bg-muted/10 items-center justify-center">
            <Text className="font-nunito text-sm text-muted text-center px-4">
              Aquí aparecerá el video de la seña para esta letra.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
