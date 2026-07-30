import { useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Alert, Platform, Image as RNImage } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useRewardsStore } from '@/src/store/rewardsStore'
import { useStats } from '@/src/hooks/features/lessons/useStats'
import { cn } from '@/src/utils/cn'

const ALL_STICKERS = [
  {
    id: 'sticker-1',
    name: 'Bien',
    type: 'Básico' as const,
    price: 300,
    image: require('@/assets/images/recompensas/stickers/basico/Sticker1-basico.png'),
  },
  {
    id: 'sticker-2',
    name: 'LSA',
    type: 'Básico' as const,
    price: 300,
    image: require('@/assets/images/recompensas/stickers/basico/Sticker2-basico.png'),
  },
  {
    id: 'sticker-3',
    name: 'Baile',
    type: 'Estándar' as const,
    price: 600,
    image: require('@/assets/images/recompensas/stickers/estandar/Sticker3-estandar.png'),
  },
  {
    id: 'sticker-4',
    name: 'ABC',
    type: 'Estándar' as const,
    price: 600,
    image: require('@/assets/images/recompensas/stickers/estandar/Sticker4-estandar.png'),
  },
  {
    id: 'sticker-5',
    name: 'Mate',
    type: 'Premium' as const,
    price: 1200,
    image: require('@/assets/images/recompensas/stickers/premium/Sticker5-premium.png'),
  },
  {
    id: 'sticker-6',
    name: 'Empanada',
    type: 'Premium' as const,
    price: 1200,
    image: require('@/assets/images/recompensas/stickers/premium/Sticker6-premium.png'),
  },
  {
    id: 'sticker-7',
    name: 'Seña',
    type: 'Premium' as const,
    price: 1200,
    image: require('@/assets/images/recompensas/stickers/premium/Sticker7-premium.png'),
  },
]

// Colores de los badges según el tipo de sticker
const BADGE_COLORS = {
  'Básico': 'bg-[#4A90E2]',
  'Estándar': 'bg-[#F59E0B]',
  'Premium': 'bg-[#8B5CF6]',
}

export function StickersList() {
  const { unlockedStickerIds, unlockSticker, loadUnlockedStickers } = useRewardsStore()
  const statsQuery = useStats()
  // Calcular puntos gastados en stickers comprados
  const spentPoints = unlockedStickerIds.reduce((sum, id) => {
    const sticker = ALL_STICKERS.find((s) => s.id === id)
    return sum + (sticker ? sticker.price : 0)
  }, 0)

  const userStars = Math.max(0, (statsQuery.data?.total_points ?? 0) - spentPoints)

  useEffect(() => {
    loadUnlockedStickers().catch(console.error)
  }, [loadUnlockedStickers])

  const acquiredStickers = ALL_STICKERS.filter((s) => unlockedStickerIds.includes(s.id))
  const lockedStickers = ALL_STICKERS.filter((s) => !unlockedStickerIds.includes(s.id))

  const handleUnlock = (stickerId: string, price: number, type: string) => {
    if (Platform.OS === 'web') {
      if (userStars < price) {
        alert(`Puntos insuficientes\n\nNecesitás ${price} puntos para desbloquear este sticker. ¡Seguí completando lecciones para ganar más estrellas!`)
        return
      }

      const confirmUnlock = window.confirm(`¿Querés desbloquear este sticker ${type} por ${price} puntos?`)
      if (confirmUnlock) {
        unlockSticker(stickerId)
        alert('¡Felicitaciones!\n\n¡Sticker desbloqueado con éxito!')
      }
    } else {
      if (userStars < price) {
        Alert.alert(
          'Puntos insuficientes',
          `Necesitás ${price} puntos para desbloquear este sticker. ¡Seguí completando lecciones para ganar más estrellas!`
        )
        return
      }

      Alert.alert(
        'Desbloquear Sticker',
        `¿Querés desbloquear este sticker ${type} por ${price} puntos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desbloquear',
            onPress: () => {
              unlockSticker(stickerId)
              Alert.alert('¡Felicitaciones!', '¡Sticker desbloqueado con éxito!')
            }
          }
        ]
      )
    }
  }

  const handleDownloadSticker = (sticker: typeof ALL_STICKERS[0]) => {
    if (Platform.OS === 'web') {
      const confirmDownload = window.confirm(`¿Querés descargar el sticker "${sticker.name}" en formato PNG?`)
      if (confirmDownload) {
        try {
          let uri: string | null = null
          const img = sticker.image

          if (typeof img === 'string') {
            uri = img
          } else if (img && typeof img === 'object') {
            if (typeof img.default === 'string') {
              uri = img.default
            } else if (typeof img.uri === 'string') {
              uri = img.uri
            } else {
              const asset = RNImage.resolveAssetSource(img)
              uri = asset?.uri ?? null
            }
          } else if (typeof img === 'number') {
            const asset = RNImage.resolveAssetSource(img)
            uri = asset?.uri ?? null
          }

          if (uri) {
            const link = document.createElement('a')
            link.href = uri
            link.download = `${sticker.name}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } else {
            alert('Error: No se pudo resolver la ruta de la imagen.')
          }
        } catch (e: any) {
          console.error(e)
          alert(`Error: Ocurrió un error al descargar el sticker.\nDetalle: ${e?.message || e}`)
        }
      }
    } else {
      Alert.alert(
        'Descargar Sticker',
        `¿Querés descargar el sticker "${sticker.name}" en formato PNG?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descargar',
            onPress: () => {
              Alert.alert('Descargado', '¡Sticker guardado en la galería de fotos!')
            }
          }
        ]
      )
    }
  }

  // Renderizador de un card de sticker
  const renderStickerCard = (sticker: typeof ALL_STICKERS[0], isLocked: boolean) => {
    return (
      <Pressable
        key={sticker.id}
        onPress={() => isLocked ? handleUnlock(sticker.id, sticker.price, sticker.type) : handleDownloadSticker(sticker)}
        className="w-32 h-44 mr-3 bg-[#1A2536] rounded-[24px] items-center justify-between p-3.5 relative border-b-[4px] border-black/20 active:mt-0.5 active:border-b-0 overflow-hidden"
      >
        {/* Badge superior indicando el tipo de sticker */}
        <View className={cn("px-2 py-0.5 rounded-full z-10", BADGE_COLORS[sticker.type])}>
          <Text className="font-nunito text-[9px] font-black text-white uppercase tracking-wider">
            {sticker.type}
          </Text>
        </View>

        {/* Imagen del sticker */}
        <View className="flex-1 justify-center items-center py-2">
          <Image
            source={sticker.image}
            className={cn("w-20 h-20", isLocked && "opacity-25")}
            contentFit="contain"
          />
        </View>

        {/* Sección inferior: Precio/Bloqueo para cerrados, o Nombre para abiertos */}
        {isLocked ? (
          <View className="flex-row items-center gap-1 bg-[#F59E0B]/20 px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text className="font-nunito text-[10px] font-bold text-[#F59E0B]">
              {sticker.price}
            </Text>
          </View>
        ) : (
          <Text className="font-nunito text-[11px] font-extrabold text-white/80 text-center" numberOfLines={1}>
            {sticker.name}
          </Text>
        )}
      </Pressable>
    )
  }

  return (
    <View className="mt-8 px-5 pb-10">
      <Text className="font-nunito text-3xl font-bold text-ink mb-6">Stickers</Text>

      {/* Carrusel de Adquiridos (se oculta si no hay stickers comprados) */}
      {acquiredStickers.length > 0 && (
        <View className="mb-8">
          <Text className="font-nunito text-xl font-bold text-ink mb-3">Adquiridos</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {acquiredStickers.map((s) => renderStickerCard(s, false))}
          </ScrollView>
        </View>
      )}

      {/* Carrusel de A Desbloquear */}
      <Text className="font-nunito text-xl font-bold text-ink mb-3">A Desbloquear</Text>
      {lockedStickers.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {lockedStickers.map((s) => renderStickerCard(s, true))}
        </ScrollView>
      ) : (
        <View className="py-6 bg-surface border border-dashed border-black/10 rounded-2xl items-center justify-center">
          <Text className="font-nunito text-xs text-muted">¡Desbloqueaste todos los stickers!</Text>
        </View>
      )}
    </View>
  )
}
