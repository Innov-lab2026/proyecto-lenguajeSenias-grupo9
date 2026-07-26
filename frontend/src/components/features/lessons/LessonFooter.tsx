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
    <View className="px-4 pb-2 pt-2 bg-background border-t border-black/5">
      <View className="mx-auto w-full max-w-sm">
        <Button label={ctaLabel} onPress={onNext} disabled={ctaDisabled} />
      </View>

      <View className="flex-row items-center mt-2 h-8">
        <View className="w-10">
          {showBack && (
            <Pressable onPress={onBack}>
              <Ionicons name="arrow-undo-outline" size={24} color="#6F706F" />
            </Pressable>
          )}
        </View>

        <View className="flex-1 flex-row justify-center items-center gap-12">
          <Pressable onPress={onSettings}>
            <Ionicons name="settings-sharp" size={24} color="#6F706F" />
          </Pressable>

          <Pressable onPress={onToggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#EF4444' : '#6F706F'}
            />
          </Pressable>

          <Pressable onPress={onHint}>
            <Ionicons name={hintViewed ? 'bulb-outline' : 'bulb'} size={24} color={hintViewed ? '#6F706F' : '#F7BB18'} />
          </Pressable>
        </View>

        <View className="w-10" />
      </View>
    </View>
  )
}
