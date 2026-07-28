import { Modal, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { useResponsive } from '@/src/hooks/common/useResponsive'
import { cn } from '@/src/utils/cn'

interface FeedbackModalProps {
  feedback: 'correct' | 'incorrect' | null
  tip?: string
  /** Puntos que todavía se pueden ganar en este step pese al error (PUNTOS_CON_ERRORES). */
  retryPoints?: number
  errorCount?: number
  stepType?: 'content' | 'quiz' | 'matching' | 'dialogue'
  lessonId?: string
  onRetry: () => void
  onNext: () => void
}

const LESSON_POSITIVE_FEEDBACKS: Record<string, { title: string; hintTitle: string; hintText: string }> = {
  '1': {
    title: '¡Muy bien!\nCada acierto te acerca a comunicarte en LSA.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Las expresiones faciales también forman parte de la Lengua de Señas Argentina y ayudan a transmitir el significado de una seña.',
  },
  '2': {
    title: '¡Muy bien!\nSigue así.',
    hintTitle: '¿Sabías que...?',
    hintText: 'En LSA, una misma respuesta puede variar levemente según la región o el contexto, pero siempre conserva su significado.',
  },
  '3': {
    title: '¡Excelente!\nEstás reforzando lo que aprendiste.',
    hintTitle: '¿Sabías que...?',
    hintText: 'La práctica constante es la mejor forma de recordar nuevas señas y reconocerlas con mayor facilidad.',
  },
  '4': {
    title: '¡Excelente!\nRelacionaste todas las señas correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Las expresiones de cortesía fortalecen la comunicación y demuestran respeto hacia los demás.',
  },
  '5': {
    title: '¡Bien Hecho!\nCompletaste la conversación correctamente.',
    hintTitle: '¿Sabías que...?',
    hintText: 'Combinar señas en una conversación te ayuda a comunicarte de forma más natural en LSA.',
  },
}

/** Feedback de correcto/incorrecto tras responder un step: full-screen en mobile, card centrado en desktop. */
export function FeedbackModal({
  feedback,
  tip,
  retryPoints = 0,
  errorCount = 0,
  stepType,
  lessonId,
  onRetry,
  onNext,
}: FeedbackModalProps) {
  const { isMobile } = useResponsive()
  const insets = useSafeAreaInsets()
  const isCorrect = feedback === 'correct'
  const isDoubleError = !isCorrect && errorCount >= 2

  const image = isCorrect
    ? require('@/assets/images/lessons/feedback_correcto.svg')
    : isDoubleError
      ? require('@/assets/images/lessons/feedback_incorrecto_double.svg')
      : require('@/assets/images/lessons/feedback_incorrecto.svg')

  // Obtiene texto de feedback específico basado en el estado y tipo de step
  const getFeedbackText = () => {
    if (isCorrect) {
      if (tip) return tip
      switch (stepType) {
        case 'quiz':
          return '¡Excelente! Lograste identificar la seña correcta.'
        case 'matching':
          return '¡Impresionante! Relacionaste todas las señas correctamente.'
        case 'dialogue':
          return '¡Buen trabajo! Lograste completar la conversación correctamente.'
        default:
          return '¡Excelente! Has respondido correctamente.'
      }
    } else {
      // Incorrect
      if (isDoubleError) {
        switch (stepType) {
          case 'quiz':
            return 'Sigue intentándolo para aprender la seña correcta.'
          case 'matching':
            return 'Sigue intentándolo para relacionar las señas de forma correcta.'
          case 'dialogue':
            return 'Sigue intentándolo para completar la conversación.'
          default:
            return 'Vuelve a intentarlo para aprender la respuesta.'
        }
      } else {
        // Primer error
        switch (stepType) {
          case 'quiz':
            return 'La opción elegida no es la correcta.'
          case 'matching':
            return 'La relación seleccionada no es correcta.'
          case 'dialogue':
            return 'Algunas palabras no están en la posición correcta.'
          default:
            return 'La respuesta seleccionada es incorrecta.'
        }
      }
    }
  }

  const feedbackText = getFeedbackText()
  const customFeedback = lessonId ? LESSON_POSITIVE_FEEDBACKS[lessonId] : null

  const body = (
    <>
      <Text className={cn('font-nunito text-2xl font-bold mb-4', isCorrect ? 'text-green-600' : 'text-red-600')}>
        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
      </Text>

      {isCorrect ? (
        <View className="bg-accent/5 p-5 rounded-2xl w-full flex-1 justify-center gap-3">
          {customFeedback ? (
            <>
              <Text className="font-nunito text-base font-bold text-ink text-center leading-relaxed">
                {customFeedback.title}
              </Text>

              <View className="border-t border-secondary/20 my-1 w-3/4 mx-auto" />

              <View className="gap-1.5">
                <Text className="font-nunito text-sm font-bold text-secondary text-center">
                  {customFeedback.hintTitle}
                </Text>
                <Text className="font-nunito text-sm text-ink leading-relaxed text-center">
                  {customFeedback.hintText}
                </Text>
              </View>
            </>
          ) : (
            <Text className="font-nunito text-sm text-ink leading-relaxed text-center">{feedbackText}</Text>
          )}
        </View>
      ) : (
        <View className="w-full flex-1">
          <Text className="font-nunito text-base text-ink mb-1">{feedbackText}</Text>
          <Text className="font-nunito text-sm text-muted mb-4 opacity-70">
            {isDoubleError
              ? 'Ya no sumas puntos por este paso.'
              : `Como es tu primer reintento, todavía puedes obtener ${retryPoints} puntos.`}
          </Text>
          <Text className="font-nunito text-sm font-bold text-ink italic">
            Consejo: observa atentamente el video antes de seleccionar la respuesta correcta.
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
