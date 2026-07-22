import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'

export default function LetterScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ letter?: string }>()
  const letter = Array.isArray(params.letter) ? params.letter[0] : params.letter

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-6xl px-5 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start gap-3">
          <Pressable
            onPress={() => router.replace('/alphabet')}
            accessibilityRole="button"
            accessibilityLabel="Volver al Abecedario"
            hitSlop={8}
            className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm shadow-black/10 web:hover:bg-muted/10"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-nunito text-2xl font-bold text-ink">Letra {letter ?? '?'}</Text>
            <Text className="mt-1 font-nunito text-sm text-muted">
              {'Esta p\u00e1gina mostrar\u00e1 la se\u00f1a y el video correspondiente.'}
            </Text>
          </View>
        </View>

        <View className="mx-auto w-full max-w-[500px] pt-2 sm:pt-4">
          <Text className="text-center font-nunito text-6xl font-black text-ink/80 sm:text-7xl lg:text-8xl">
            {letter ?? '-'}
          </Text>

          <View className="mt-4 h-[370px] w-full rounded-3xl border border-muted/20 bg-surface p-5 shadow-sm sm:mt-6 sm:h-[500px] sm:p-6 lg:h-[530px]">
            <Text className="mb-4 font-nunito text-lg font-semibold text-ink">Recuadro de video</Text>
            <View className="flex-1 items-center justify-center rounded-3xl border border-dashed border-muted/40 bg-muted/10">
              <Text className="px-4 text-center font-nunito text-sm text-muted">
                {'Aqu\u00ed aparecer\u00e1 el video de la se\u00f1a para esta letra.'}
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <Button
              label="Practicar"
              disabled
              leftIcon={<Ionicons name="play-outline" size={20} color="#1F2937" />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}