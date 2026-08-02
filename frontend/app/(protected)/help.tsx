import { useState } from 'react'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'

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
            zIndex: 1,
          }}
          contentFit="fill"
        />

        <Text
          className="font-nunito text-3xl font-bold text-white text-center relative mt-10"
          style={{ zIndex: 10 }}
        >
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

        {/* Bloque de contacto */}
        <View className="mt-8 mb-4 rounded-2xl bg-surface border border-muted/15 p-5 shadow-sm">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
              <Ionicons name="mail" size={20} color="#4A90E2" />
            </View>
            <Text className="font-nunito text-lg font-bold text-ink">
              ¿Tenés dudas o sugerencias?
            </Text>
          </View>
          <Text className="font-nunito text-sm text-muted leading-6 mb-4">
            Escribinos y te responderemos a la brevedad. Tu opinión nos ayuda a mejorar Carpiseñas.
          </Text>
          <Button
            label="Enviar email"
            onPress={() => Linking.openURL('mailto:carpisenas@gmail.com.ar?subject=Consulta%20desde%20Carpise%C3%B1as')}
          />
          <Text className="font-nunito text-xs text-muted text-center mt-3">
            carpisenas@gmail.com.ar
          </Text>
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
