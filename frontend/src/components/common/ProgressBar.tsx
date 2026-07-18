import { Text, View } from 'react-native'
import { cn } from '@/src/utils/cn'

interface ProgressBarProps {
  /** Progreso en porcentaje (0-100). */
  progress: number
  className?: string
}

/**
 * Barra de progreso pill: track verde claro (`progress`) y relleno verde
 * fuerte (`progress-fill`) que crece cuando el progreso supera 0. El
 * porcentaje va siempre centrado en blanco sobre toda la barra.
 */
export function ProgressBar({ progress, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)))

  return (
    <View
      className={cn('h-7 w-full overflow-hidden rounded-full bg-progress', className)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      {clamped > 0 ? (
        <View className="h-full rounded-full bg-progress-fill" style={{ width: `${clamped}%` }} />
      ) : null}
      <View className="absolute inset-0 items-center justify-center">
        <Text className="font-nunito text-sm font-bold text-white">{clamped}%</Text>
      </View>
    </View>
  )
}
