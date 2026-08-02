import { Modal, Text, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { useResponsive } from '@/src/hooks/common/useResponsive'

interface FeedbackCompleteModalProps {
  visible: boolean
  onContinue: () => void
}

/**
 * Proporción de la ilustración (`feedback_complete.svg`, viewBox 390x375): es
 * casi cuadrada. Darle una caja mucho más apaisada que esto es lo que la
 * arruinaba — con `cover` recortaba hasta dejar una franja sin la cabeza de
 * Carpi, y con `contain` quedaba centrada dejando aire a los costados.
 */
const ILLUSTRATION_ASPECT = 390 / 375

/** El ancho se pasa de la pantalla a propósito, para que la escena sangre por los costados. */
const ILLUSTRATION_BLEED = 1.05

/** Alto de la franja inferior con la onda blanca (`h-36`). */
const FOOTER_HEIGHT = 144

/** Alto que se le reserva siempre al bloque de textos, para que nunca se apriete. */
const TEXTS_MIN_HEIGHT = 150

/** Alto de la onda blanca que separa la ilustración del pie. */
const WAVE_HEIGHT = 120

/** Dónde arranca la onda respecto del pie, según variante. */
const WAVE_TOP_MOBILE = -100
const WAVE_TOP_DESKTOP = -50

/** Padding superior del cuerpo del pie (`pt-3`), que corre al ícono hacia abajo. */
const BODY_PADDING_TOP = 12

/**
 * Cuánto baja el ícono desde el borde superior de la onda. Se mide contra la
 * onda y no contra el pie porque cada variante la ubica a distinta altura: con
 * un desplazamiento fijo, el ícono caía sobre la ilustración en vez del blanco.
 */
const ICON_INSET_IN_WAVE = 26

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

/** Modal de lección completada (para cuando el usuario repite una lección ya realizada). */
export function FeedbackCompleteModal({ visible, onContinue }: FeedbackCompleteModalProps) {
  const { isMobile } = useResponsive()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()

  // La caja de la ilustración parte del alto que le correspondería por su
  // proporción y recién ahí se acota, en vez de heredar una forma arbitraria
  // del layout.
  //
  // El tope sale del espacio que sobra de verdad (pantalla menos la franja
  // inferior y lo reservado para los textos), no de una fracción fija: al
  // sangrar a lo ancho, una ilustración casi cuadrada pide mucho alto, y
  // recortarla de más la deja ampliada y sin contexto. Con esto se le da todo
  // el alto disponible antes de empezar a recortar.
  const availableForIllustration =
    height - FOOTER_HEIGHT - TEXTS_MIN_HEIGHT - insets.top - insets.bottom

  const mobileIllustrationHeight = clamp(
    (width * ILLUSTRATION_BLEED) / ILLUSTRATION_ASPECT,
    180,
    Math.min(420, availableForIllustration),
  )

  const cardWidth = Math.min(448, width - 48)
  const desktopIllustrationHeight = clamp(
    cardWidth / ILLUSTRATION_ASPECT,
    200,
    Math.min(320, height * 0.4),
  )

  const imageSource = require('@/assets/images/lessons/feedback_complete.svg')
  const waveSource = require('@/assets/images/lessons/lesson_feedback_blanco.svg')
  const iconSource = require('@/assets/images/lessons/feedback_icon_correcto.svg')

  /** El pie se arma a partir de dónde quedó la onda, para que el ícono siempre caiga sobre el blanco. */
  const renderBody = (waveTop: number) => (
    <View className="flex-1 w-full items-center justify-between pb-6 pt-3 px-6">
      {/* Icono de check verde superpuesto */}
      <Image
        source={iconSource}
        className="w-16 h-16 z-20 mb-2 self-center"
        style={{ marginTop: waveTop + ICON_INSET_IN_WAVE - BODY_PADDING_TOP }}
        contentFit="contain"
      />

      <View className="flex-1 justify-center items-center">
        {/* Espacio para estructurar mejor el footer */}
      </View>

      <Button label="Continuar" onPress={onContinue} className="w-1/2 z-30" />
    </View>
  )

  if (isMobile) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View className="flex-1 bg-[#EAF8FF]" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="flex-1 w-full items-center">
            {/* Textos superiores, centrados en el espacio que sobra.
                Antes usaban `marginTop: '40%'`, que en React Native se calcula
                sobre el ANCHO del padre: en pantallas anchas y bajas se comía
                el alto disponible y dejaba a la ilustración una franja mínima. */}
            <View className="flex-1 w-full px-4 items-center justify-center">
              <Text className="font-nunito text-3xl font-extrabold text-ink text-center mb-4">
                ¡Lección completada!
              </Text>
              <Text className="font-nunito text-base text-muted text-center leading-relaxed">
                Podés repetir las lecciones para seguir practicando, pero no obtendrás puntos adicionales.
              </Text>
            </View>

            {/* Ilustración central que sobresale por los bordes laterales. El
                recorte se ancla arriba: si falta alto se pierde el pasto de
                abajo (que igual tapa la onda blanca) y nunca la cara de Carpi. */}
            <View className="w-full overflow-hidden" style={{ height: mobileIllustrationHeight }}>
              <Image
                source={imageSource}
                style={{ width: `${ILLUSTRATION_BLEED * 100}%`, height: '100%', alignSelf: 'center' }}
                contentFit="cover"
                contentPosition="top"
              />
            </View>

            {/* Parte inferior con onda blanca */}
            <View className="w-full h-36 items-center relative bg-surface">
              <Image
                source={waveSource}
                style={{
                  position: 'absolute',
                  top: WAVE_TOP_MOBILE,
                  left: 0,
                  right: 0,
                  height: WAVE_HEIGHT,
                }}
                contentFit="fill"
              />
              {renderBody(WAVE_TOP_MOBILE)}
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

          {/* `cover` en vez de `contain`: la ilustración es casi cuadrada y en
              una caja apaisada `contain` la dejaba centrada con el fondo del
              modal a la vista a los dos costados. */}
          <View className="w-full overflow-hidden mt-4" style={{ height: desktopIllustrationHeight }}>
            <Image
              source={imageSource}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              contentPosition="top"
            />
          </View>

          <View className="w-full h-36 items-center relative bg-surface">
            <Image
              source={waveSource}
              style={{
                position: 'absolute',
                top: WAVE_TOP_DESKTOP,
                left: 0,
                right: 0,
                height: WAVE_HEIGHT,
              }}
              contentFit="fill"
            />
            {renderBody(WAVE_TOP_DESKTOP)}
          </View>
        </View>
      </View>
    </Modal>
  )
}
