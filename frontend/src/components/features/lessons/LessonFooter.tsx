import { Pressable, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'

// Iconos personalizados en formato SVG
const configIcon = require('@/assets/images/lessons/icons/config.svg')
const favBlcIcon = require('@/assets/images/lessons/icons/fav_blc.svg')
const favRedIcon = require('@/assets/images/lessons/icons/fav_red.svg')

interface LessonFooterProps {
  ctaLabel: string
  ctaDisabled: boolean
  onNext: () => void
  showBack: boolean
  onBack: () => void
  onSettings: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
  /** true = ya se vio la pista de este step. */
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

      {/* Barra de accesos como tarjeta: se apoya sobre el borde inferior y
          separa visualmente el CTA de los controles secundarios. Altura reducida. */}
      <View className="bg-surface border-t-2 border-l-2 border-r-2 border-secondary rounded-t-[32px] px-5 pb-4 pt-3">
        <View className="mx-auto w-full max-w-sm flex-row items-center h-7">
          <View className="flex-1 items-center justify-center">
            {showBack && (
              <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Paso anterior" hitSlop={8}>
                <Ionicons name="arrow-undo" size={24} color="#518BC9" />
              </Pressable>
            )}
          </View>

          <View className="flex-1 items-center justify-center">
            <Pressable onPress={onSettings} accessibilityRole="button" accessibilityLabel="Ajustes" hitSlop={8}>
              <Image
                source={configIcon}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center">
            <Pressable
              onPress={onToggleFavorite}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              hitSlop={8}
            >
              <Image
                source={isFavorite ? favRedIcon : favBlcIcon}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center">
            <Pressable onPress={onHint} accessibilityRole="button" accessibilityLabel="Ver pista" hitSlop={8}>
              {/* El foco/bombilla permanece encendido siempre incluso tras hacer click */}
              <Ionicons
                name="bulb"
                size={24}
                color="#F7BB18"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}
