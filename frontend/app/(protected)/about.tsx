import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function AboutScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="mx-auto w-full max-w-3xl px-5 pb-8 pt-5 sm:px-8" showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver al perfil"
          hitSlop={8}
          className="mb-5 h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm shadow-black/10 web:hover:bg-muted/10"
        >
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </Pressable>

        <View className="rounded-3xl border border-muted/20 bg-surface p-6 shadow-sm shadow-black/5 sm:p-8">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Ionicons name="heart" size={32} color="#F59E0B" />
          </View>
          <Text className="font-nunito text-3xl font-bold text-ink">Acerca de Carpiseñas</Text>

          <View className="mt-6 gap-5">
            <Text className="font-nunito text-base leading-7 text-ink/80">
              Carpiseñas es una App pensada para acercar el Lenguaje de Señas Argentina a todos de manera accesible, divertida e inclusiva.
            </Text>
            <Text className="font-nunito text-base leading-7 text-ink/80">
              Creemos en un mundo donde la comunicacion no tenga barreras y el aprendizaje sea una experiencia significativa para todos.
            </Text>
            <Text className="font-nunito text-base leading-7 text-ink/80">
              Aprende el Lenguaje de Señas Argentina jugando, sumando puntos y siguiendo tu progreso para hacer tu aprendizaje más entretenido. Carpi te acompaña en cada etapa del aprendizaje.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
