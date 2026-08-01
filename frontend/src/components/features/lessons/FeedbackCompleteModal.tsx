import { Modal, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { useResponsive } from '@/src/hooks/common/useResponsive'

interface FeedbackCompleteModalProps {
  visible: boolean
  onContinue: () => void
}

/** Modal de lección completada (para cuando el usuario repite una lección ya realizada). */
export function FeedbackCompleteModal({ visible, onContinue }: FeedbackCompleteModalProps) {
  const { isMobile } = useResponsive()
  const insets = useSafeAreaInsets()

  const imageSource = require('@/assets/images/lessons/feedback_complete.svg')
  const waveSource = require('@/assets/images/lessons/lesson_feedback_blanco.svg')
  const iconSource = require('@/assets/images/lessons/feedback_icon_correcto.svg')

  const body = (
    <View className="flex-1 w-full items-center justify-between pb-6 pt-3 px-6">
      {/* Icono de check verde superpuesto */}
      <Image
        source={iconSource}
        className="w-16 h-16 z-20 mb-2 mt-[-86px] self-center"
        contentFit="contain"
      />

      <View className="flex-1 justify-center items-center">
        {/* Espacio para estructurar mejor el footer */}
      </View>

      <Button label="Continuar" onPress={onContinue} className="w-56 z-30" />
    </View>
  )

  if (isMobile) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View className="flex-1 bg-[#EAF8FF]" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="flex-1 w-full items-center justify-between">
            {/* Textos superiores */}
            <View className="w-full px-4 items-center" style={{ marginTop: '40%' }}>
              <Text className="font-nunito text-3xl font-extrabold text-ink text-center mb-4">
                ¡Lección completada!
              </Text>
              <Text className="font-nunito text-base text-muted text-center leading-relaxed">
                Podés repetir las lecciones para seguir practicando, pero no obtendrás puntos adicionales.
              </Text>
            </View>

            {/* Ilustración central que sobresale por los bordes laterales */}
            <Image
              source={imageSource}
              className="w-[105%] flex-1 max-h-[380px] self-center mt-4 -mx-6"
              contentFit="cover"
            />

            {/* Parte inferior con onda blanca */}
            <View className="w-full h-36 items-center relative bg-surface">
              <Image
                source={waveSource}
                style={{
                  position: 'absolute',
                  top: -100,
                  left: 0,
                  right: 0,
                  height: 120,
                }}
                contentFit="fill"
              />
              {body}
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  // Vista de Tablet / Desktop (Modal centrado)
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full max-w-md items-center overflow-hidden rounded-[32px] bg-[#EAF8FF]">
          <View className="w-full px-6 pt-6 items-center">
            <Text className="font-nunito text-3xl font-extrabold text-ink text-center mb-3">
              ¡Lección completada!
            </Text>
            <Text className="font-nunito text-sm text-muted text-center leading-relaxed">
              Podés repetir las lecciones para seguir practicando, pero no obtendrás puntos adicionales.
            </Text>
          </View>

          <Image source={imageSource} className="w-full h-64 mt-4" contentFit="contain" />

          <View className="w-full h-36 items-center relative bg-surface">
            <Image
              source={waveSource}
              style={{
                position: 'absolute',
                top: -50,
                left: 0,
                right: 0,
                height: 120,
              }}
              contentFit="fill"
            />
            {body}
          </View>
        </View>
      </View>
    </Modal>
  )
}
