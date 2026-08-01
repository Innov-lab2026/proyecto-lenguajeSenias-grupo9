import { Modal, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { useResponsive } from '@/src/hooks/common/useResponsive'
import { LESSON_POSITIVE_FEEDBACK, LESSON_NEGATIVE_FEEDBACK } from '@/src/constants/lessons'
import type { StepType } from '@/src/types/lessons'
import { cn } from '@/src/utils/cn'

interface FeedbackModalProps {
  feedback: 'correct' | 'incorrect' | null
  tip?: string
  /** points_retry de la lección: lo máximo que se puede ganar ya habiendo fallado. 0 = no mostrarlo. */
  retryPoints?: number
  /** Errores acumulados en el step actual: a partir del segundo cambia la ilustración y el tono. */
  errorCount?: number
  stepType?: StepType
  /** `lessons.content_key`: elige el mensaje de acierto personalizado de la lección. */
  contentKey?: string | null
  onRetry: () => void
  onNext: () => void
  onExit?: () => void
}

/** Texto del error según qué se estaba resolviendo. */
const ERROR_POR_STEP: Partial<Record<StepType, string>> = {
  quiz: '¡Estás cerca!',
  matching: '¡Estás cerca!',
  dialogue: '¡Estás cerca!',
  composition: '¡Estás cerca!',
}

/** Feedback de correcto/incorrecto tras responder un step: full-screen en mobile, card centrado en desktop. */
export function FeedbackModal({
  feedback,
  tip,
  retryPoints = 0,
  errorCount = 0,
  stepType,
  contentKey,
  onRetry,
  onNext,
  onExit,
}: FeedbackModalProps) {
  const { isMobile } = useResponsive()
  const insets = useSafeAreaInsets()
  const isCorrect = feedback === 'correct'
  // Al segundo error se cambia la ilustración por una más empática.
  const isRepeatedError = !isCorrect && errorCount >= 2

  const image = isCorrect
    ? require('@/assets/images/lessons/feedback_correcto.svg')
    : isRepeatedError
      ? require('@/assets/images/lessons/feedback_incorrecto_double.svg')
      : require('@/assets/images/lessons/feedback_incorrecto.svg')

  const positive = contentKey ? LESSON_POSITIVE_FEEDBACK[contentKey] : undefined
  const negative = contentKey ? LESSON_NEGATIVE_FEEDBACK[contentKey] : undefined
  const errorText = (stepType && ERROR_POR_STEP[stepType]) ?? 'Esa no es la respuesta correcta.'
  const negativeText = tip || negative?.text || errorText

  // Seleccionar el ícono correspondiente según el tipo de feedback
  const iconSource = isCorrect
    ? require('@/assets/images/lessons/feedback_icon_correcto.svg')
    : require('@/assets/images/lessons/feedback_icon_incorrecto.svg')

  const body = (
    <>
      {/* Ícono de feedback que se superpone al fondo divisorio curvo */}
      <Image
        source={iconSource}
        className="w-16 h-16 z-20 mb-1 mt-[-42px]"
        contentFit="contain"
      />

      <Text className={cn('font-nunito text-2xl font-bold mb-2 text-ink')}>
        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
      </Text>

      {isCorrect ? (
        <View className="w-full flex-1 justify-center items-center gap-2">
          {positive ? (
            <View className="gap-1 items-center">
              <Text className="font-nunito text-base font-bold text-ink text-center">
                {positive.hintTitle}
              </Text>
              <Text className="font-nunito text-sm text-ink leading-relaxed text-center">
                {positive.hintText}
              </Text>
            </View>
          ) : (
            <Text className="font-nunito text-base text-ink leading-relaxed text-center">{tip}</Text>
          )}
        </View>
      ) : (
        <View className="w-full flex-1 justify-center items-center gap-2">
          {!isRepeatedError ? (
            <>
              <Text className="font-nunito text-base font-bold text-ink text-center leading-relaxed">
                {errorText}
              </Text>
              {retryPoints > 0 ? (
                <Text className="font-nunito text-sm font-bold text-ink text-center">
                  Todavía podés obtener {retryPoints} puntos.
                </Text>
              ) : null}
            </>
          ) : (
            <>
              {negative?.title ? (
                <Text className="font-nunito text-lg font-bold text-ink text-center leading-relaxed">
                  {negative.title}
                </Text>
              ) : null}
              <Text className="font-nunito text-base text-ink text-center leading-relaxed">{negativeText}</Text>
              <Text className="font-nunito text-sm font-bold text-ink text-center mt-1">
                Ya no obtenés puntos en este ejercicio, pero cada intento te ayuda a mejorar.
              </Text>
            </>
          )}
        </View>
      )}

      <View className="w-full gap-3 mt-4">
        {isCorrect ? (
          <Button label="Siguiente" onPress={onNext} />
        ) : (
          <>
            <Button label="Reintentar" onPress={onRetry} variant="primary" />
            <Button label="Volver" onPress={onExit} variant="white" className="border-2 border-primary" />
          </>
        )}
      </View>
    </>
  )

  if (isMobile) {
    return (
      <Modal visible={feedback !== null} animationType="slide" presentationStyle="fullScreen">
        <View className="flex-1 bg-surface" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="flex-1 w-full items-center">
            <Image source={image} className="w-full h-1/2" contentFit="cover" contentPosition="top" />
            <View className="flex-1 w-full items-center relative bg-surface">
              {/* Fondo divisorio curvo de ancho completo para mostrar bordes redondeados */}
              <Image
                source={require('@/assets/images/lessons/lesson_feedback_blanco.svg')}
                style={{
                  position: 'absolute',
                  top: -50,
                  left: 0,
                  right: 0,
                  height: 120,
                }}
                contentFit="fill"
              />
              {/* Contenedor interno para aplicar padding horizontal al body */}
              <View className="flex-1 w-full px-6 pt-3 pb-4 items-center">
                {body}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={feedback !== null} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full max-w-md items-center overflow-hidden rounded-[32px] bg-surface">
          <Image source={image} className="w-full h-64" contentFit="cover" contentPosition="top" />
          <View className="w-full items-center relative bg-surface">
            {/* Fondo divisorio curvo de ancho completo para mostrar bordes redondeados */}
            <Image
              source={require('@/assets/images/lessons/lesson_feedback_blanco.svg')}
              style={{
                position: 'absolute',
                top: -50,
                left: 0,
                right: 0,
                height: 120,
              }}
              contentFit="fill"
            />
            {/* Contenedor interno para aplicar padding horizontal al body */}
            <View className="w-full items-center px-6 pb-6 pt-3">
              {body}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
