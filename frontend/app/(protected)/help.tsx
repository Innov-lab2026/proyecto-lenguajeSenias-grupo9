import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'

const HELP_ITEMS = [
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
  {
    question: '¿Cómo practico el abecedario?',
    answer:
      'Ingresá a la sección del abecedario que se encuentra en la barra de navegación y seleccioná la letra que quieras practicar. Verás un video de cómo hacer la seña y luego podrás practicar.',
  },
  {
    question: '¿Cómo funciona la cámara?',
    answer:
      'Primero activá la cámara, luego ubicá tu mano frente a la misma y realizá la seña de la letra que quieras practicar. La aplicación te dirá qué letra estás representando.',
  },
]

export default function HelpScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [openIndex, setOpenIndex] = useState<number | null>(0) // Abre el primero por defecto

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <View className="flex-1 bg-background">
      {/* Cabecera con banner azul y la imagen nubeblanca_help.svg */}
      <View
        className="w-full bg-[#4A90E2] items-center justify-end pb-5 relative"
        style={{ paddingTop: insets.top + 14 }}
      >
        <Image
          source={require('@/assets/images/profile/nubeblanca_help.svg')}
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
          Ayuda
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-3xl px-5 pb-20 pt-6 sm:px-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 gap-4">
          {HELP_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <View key={item.question} className="overflow-hidden">
                {/* Cabecera del acordeón */}
                <Pressable
                  onPress={() => handleToggle(index)}
                  className={`flex-row items-center justify-between p-4 bg-[#6BA4E8] ${
                    isOpen ? 'rounded-t-2xl' : 'rounded-2xl'
                  }`}
                  style={{ elevation: 1 }}
                >
                  <Text className="font-nunito text-[17px] font-bold text-ink flex-1 pr-4">
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#1F2937"
                  />
                </Pressable>

                {/* Contenido desplegable */}
                {isOpen && (
                  <View className="bg-surface border-x border-b border-[#6BA4E8] rounded-b-2xl p-5 shadow-sm">
                    <Text className="font-nunito text-base leading-7 text-ink/80 text-justify">
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* Botón flotante de volver en el canto inferior direito (solo el icono, sin circulo blanco de fondo) */}
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
