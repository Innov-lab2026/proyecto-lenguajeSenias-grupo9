import { Modal, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { useResponsive } from '@/src/hooks/common/useResponsive'
import { LESSON_POSITIVE_FEEDBACK } from '@/src/constants/lessons'
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
}

/** Texto del error según qué se estaba resolviendo. */
const ERROR_POR_STEP: Partial<Record<StepType, string>> = {
  quiz: 'La opción elegida no es la correcta.',
  matching: 'La relación seleccionada no es correcta.',
  dialogue: 'Algunas palabras no están en la posición correcta.',
  composition: 'Algunas palabras no están en la posición correcta.',
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
  const errorText = (stepType && ERROR_POR_STEP[stepType]) ?? 'Esa no es la respuesta correcta.'

  const body = (
    <>
      <Text className={cn('font-nunito text-2xl font-bold mb-4', isCorrect ? 'text-green-600' : 'text-red-600')}>
        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
      </Text>

      {isCorrect ? (
        <View className="bg-accent/5 p-5 rounded-2xl w-full flex-1 justify-center gap-3">
          {positive ? (
            <>
              <Text className="font-nunito text-base font-bold text-ink text-center leading-relaxed">
                {positive.title}
              </Text>

              <View className="border-t border-secondary/20 my-1 w-3/4 mx-auto" />

              <View className="gap-1.5">
                <Text className="font-nunito text-sm font-bold text-secondary text-center">
                  {positive.hintTitle}
                </Text>
                <Text className="font-nunito text-sm text-ink leading-relaxed text-center">
                  {positive.hintText}
                </Text>
              </View>
            </>
          ) : (
            <Text className="font-nunito text-sm text-ink leading-relaxed">{tip}</Text>
          )}
        </View>
      ) : (
        <View className="w-full flex-1">
          <Text className="font-nunito text-base text-ink mb-1">{errorText}</Text>
          {/* El puntaje se define por lección, no por step: fallar de nuevo no
              baja más la recompensa, así que el monto se muestra siempre igual. */}
          {retryPoints > 0 ? (
            <Text className="font-nunito text-sm text-muted mb-4 opacity-70">
              Al completar la lección todavía podés ganar {retryPoints} puntos.
            </Text>
          ) : null}
          <Text className="font-nunito text-sm font-bold text-ink italic">
            {isRepeatedError
              ? 'Seguí intentando: mirá el video con atención antes de responder.'
              : 'Consejo: observá atentamente el video antes de seleccionar la respuesta correcta.'}
          </Text>
        </View>
      )}

      <View className="w-full gap-3 mt-4">
        {!isCorrect && (
          <Button label="Reintentar" onPress={onRetry} variant="white" className="border-2 border-primary" />
        )}
        <Button label="Siguiente" onPress={onNext} />
      </View>
    </>
  )

  if (isMobile) {
    return (
      <Modal visible={feedback !== null} animationType="slide" presentationStyle="fullScreen">
        <View className="flex-1 bg-surface" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="flex-1 w-full items-center">
            <Image source={image} className="w-full h-1/2" contentFit="cover" contentPosition="top" />
            <View className="flex-1 w-full px-6 pt-3 pb-4 items-center">{body}</View>
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
          <View className="w-full items-center px-6 pb-6 pt-3">{body}</View>
        </View>
      </View>
    </Modal>
  )
}
