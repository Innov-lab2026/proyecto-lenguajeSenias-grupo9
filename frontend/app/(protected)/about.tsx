import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'

export default function AboutScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-background">
      {/* Cabecera con banner azul y la imagen nubeblanca_about.svg */}
      <View
        className="w-full bg-[#4A90E2] items-center justify-end pb-5 relative"
        style={{ paddingTop: insets.top + 14 }}
      >
        <Image
          source={require('@/assets/images/profile/nubeblanca_about.svg')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            zIndex: 1,
          }}
          contentFit="fill"
        />

        <Text
          className="font-nunito text-3xl font-bold text-white text-center relative mt-10"
          style={{ zIndex: 10 }}
        >
          Acerca de Carpiseñas
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-3xl px-5 pb-20 pt-6 sm:px-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 gap-5">
          <Text className="font-nunito text-lg leading-8 text-ink/80 text-justify">
            Carpiseñas es una App pensada para acercar el Lenguaje de Señas Argentina a personas oyentes de manera accesible, divertida e inclusiva.
          </Text>
          <Text className="font-nunito text-lg leading-8 text-ink/80 text-justify">
            Creemos en un mundo donde la comunicación no tenga barreras y el aprendizaje sea una experiencia significativa para todos.
          </Text>
          <Text className="font-nunito text-lg leading-8 text-ink/80 text-justify">
            Aprende el Lenguaje de Señas Argentina jugando, sumando puntos y siguiendo tu progreso para hacer tu aprendizaje más entretenido. Carpi te acompaña en cada etapa del aprendizaje.
          </Text>
        </View>

        {/* Imagen del carpincho lector centralizado entre el texto y la barra inferior */}
        <View className="items-center mt-10 mb-4 w-full">
          <Image
            source={require('@/assets/images/onboarding/carpi_lector.png')}
            style={{ width: 220, height: 250 }}
            contentFit="contain"
          />
        </View>
      </ScrollView>

      {/* Botón flotante de volver en la esquina inferior derecha (sólo el ícono, sin círculo blanco de fondo) */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Volver al perfil"
        hitSlop={8}
        className="absolute bottom-6 right-6 h-12 w-12 items-center justify-center active:opacity-60 z-50"
      >
        <Ionicons name="arrow-undo" size={32} color="#518BC9" />
      </Pressable>
    </View>
  )
}
