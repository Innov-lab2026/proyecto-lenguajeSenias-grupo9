import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const HELP_ITEMS = [
  {
    question: '¿Qué significa el fueguito?',
    answer:
      'El fueguito representa las rachas. Para sumar racha, tenes que entrar todos los días a la aplicación y completar al menos un ejercicio. Si te salteas un día, la racha se reinicia.',
  },
  {
    question: '¿Qué es la mano de arriba?',
    answer:
      'La mano que aparece en la parte superior de la pantalla, representa la cantidad de señas aprendidas. Mientas más avanzas, mayor va a ser el número que aparezca en tu contador.',
  },
  {
    question: '¿Para qué son las estrellas?',
    answer:
      'Las estrellas son la cantidad de puntos que vas sumando por cada ejercicio. Las estrellas se pueden cambiar por stickers o pistas para poder completar un ejercicio.',
  },
  {
    question: '¿Qué son los XP?',
    answer:
      'Los XP representan la experiencia, es decir, el progreso total de aprendizaje. Cada ejercicio completado, suma experiencia.',
  },
]

export default function HelpScreen() {
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
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-secondary/15">
            <Ionicons name="help" size={32} color="#4A90E2" />
          </View>
          <Text className="font-nunito text-3xl font-bold text-ink">Ayuda</Text>

          <View className="mt-6 gap-4">
            {HELP_ITEMS.map((item) => (
              <View key={item.question} className="rounded-2xl bg-background p-4">
                <Text className="font-nunito text-lg font-bold text-ink">{item.question}</Text>
                <Text className="mt-2 font-nunito text-base leading-6 text-ink/80">{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
