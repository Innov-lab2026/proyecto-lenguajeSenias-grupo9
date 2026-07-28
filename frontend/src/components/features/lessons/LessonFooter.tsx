import { Pressable, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'

interface LessonFooterProps {
  ctaLabel: string
  ctaDisabled: boolean
  onNext: () => void
  showBack: boolean
  onBack: () => void
  onSettings: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
  /** true = ya se vio la pista de este step (ícono outline en vez de relleno). */
  hintViewed: boolean
  onHint: () => void
}

/** Footer de la lección: CTA principal + fila de accesos (atrás/ajustes/favorito/pista). */
export function LessonFooter({
  ctaLabel,
  ctaDisabled,
  onNext,
  showBack,
  onBack,
  onSettings,
  isFavorite,
  onToggleFavorite,
  hintViewed,
  onHint,
}: LessonFooterProps) {
  return (
    <View className="bg-background">
      <View className="px-4 pt-2 pb-3 mx-auto w-full max-w-sm">
        <Button label={ctaLabel} onPress={onNext} disabled={ctaDisabled} />
      </View>

      <View className="bg-surface border-t-2 border-l-2 border-r-2 border-secondary rounded-t-[32px] px-5 pb-6 pt-5">
        <View className="mx-auto w-full max-w-sm flex-row items-center h-8">
          <View className="flex-1 items-center justify-center">
            {showBack && (
              <Pressable onPress={onBack}>
                <Ionicons name="arrow-undo" size={24} color="#518BC9" />
              </Pressable>
            )}
          </View>

          <View className="flex-1 items-center justify-center">
            <Pressable onPress={onSettings}>
              <Ionicons name="settings-sharp" size={24} color="#763D14" />
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center">
            <Pressable onPress={onToggleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#EF4444' : '#6F706F'}
              />
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center">
            <Pressable onPress={onHint}>
              <Ionicons name="bulb" size={24} color="#F7BB18" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}
