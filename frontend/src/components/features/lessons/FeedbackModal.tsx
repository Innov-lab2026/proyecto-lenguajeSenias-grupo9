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
  onRetry: () => void
  onNext: () => void
}

/** Feedback de correcto/incorrecto tras responder un step: full-screen en mobile, card centrado en desktop. */
export function FeedbackModal({ feedback, tip, retryPoints = 0, onRetry, onNext }: FeedbackModalProps) {
  const { isMobile } = useResponsive()
  const insets = useSafeAreaInsets()
  const isCorrect = feedback === 'correct'

  const image = isCorrect
    ? require('@/assets/images/lessons/feedback_correcto.svg')
    : require('@/assets/images/lessons/feedback_incorrecto.svg')

  const body = (
    <>
      <Text className={cn('font-nunito text-2xl font-bold mb-4', isCorrect ? 'text-green-600' : 'text-red-600')}>
        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
      </Text>

      {isCorrect ? (
        <View className="bg-accent/5 p-4 rounded-2xl w-full flex-1">
          <Text className="font-nunito text-sm text-ink leading-relaxed">{tip}</Text>
        </View>
      ) : (
        <View className="w-full flex-1">
          <Text className="font-nunito text-base text-ink mb-1">Puedes intentarlo nuevamente.</Text>
          <Text className="font-nunito text-sm text-muted mb-4 opacity-70">
            Como es tu primer reintento, todavia puedes obtener {retryPoints} puntos.
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
