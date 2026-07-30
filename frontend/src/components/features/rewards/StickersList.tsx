import { View, Text, ScrollView, Pressable, Platform, Image as RNImage, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useStickers } from '@/src/hooks/features/rewards/useStickers'
import { useMyStickers } from '@/src/hooks/features/rewards/useMyStickers'
import { usePurchaseSticker } from '@/src/hooks/features/rewards/usePurchaseSticker'
import { useStats } from '@/src/hooks/features/lessons/useStats'
import { useAppAlert } from '@/src/components/common/AppAlertProvider'
import { getApiErrorMessage } from '@/src/services/http'
import type { Sticker } from '@/src/types/gamification'
import { cn } from '@/src/utils/cn'

/**
 * Arte local de cada sticker, matcheado por `name` contra el catálogo real
 * (mismo criterio que ya usa el abecedario para encontrar el video de cada
 * letra por su `title`) — la DB no guarda ninguna imagen, sólo nombre/tier/precio.
 */
const STICKER_IMAGES: Record<string, any> = {
  'Bien': require('@/assets/images/recompensas/stickers/basico/Sticker1-basico.png'),
  'LSA': require('@/assets/images/recompensas/stickers/basico/Sticker2-basico.png'),
  'Baile': require('@/assets/images/recompensas/stickers/estandar/Sticker3-estandar.png'),
  'ABC': require('@/assets/images/recompensas/stickers/estandar/Sticker4-estandar.png'),
  'Mate': require('@/assets/images/recompensas/stickers/premium/Sticker5-premium.png'),
  'Empanada': require('@/assets/images/recompensas/stickers/premium/Sticker6-premium.png'),
  'Seña': require('@/assets/images/recompensas/stickers/premium/Sticker7-premium.png'),
}

// Colores de los badges según el tier del sticker
const BADGE_COLORS: Record<Sticker['tier'], string> = {
  'Básico': 'bg-[#4A90E2]',
  'Estándar': 'bg-[#F59E0B]',
  'Premium': 'bg-[#8B5CF6]',
}

export function StickersList() {
  const stickersQuery = useStickers()
  const myStickersQuery = useMyStickers()
  const purchaseMutation = usePurchaseSticker()
  const statsQuery = useStats()
  const { confirm, notify } = useAppAlert()

  const isLoading = stickersQuery.isPending || myStickersQuery.isPending
  // `purchase_sticker` ya descuenta total_points en el server: acá no hace
  // falta restar nada del lado del cliente.
  const userStars = statsQuery.data?.total_points ?? 0

  const ownedIds = new Set((myStickersQuery.data ?? []).map((o) => o.sticker_id))
  const catalog = stickersQuery.data ?? []
  const acquiredStickers = catalog.filter((s) => ownedIds.has(s.id))
  const lockedStickers = catalog.filter((s) => !ownedIds.has(s.id))

  const handleUnlock = async (sticker: Sticker) => {
    if (userStars < sticker.price) {
      await notify({
        title: 'Puntos insuficientes',
        message: `Necesitás ${sticker.price} puntos para desbloquear este sticker. ¡Seguí completando lecciones para ganar más estrellas!`,
      })
      return
    }

    const confirmed = await confirm({
      title: 'Desbloquear sticker',
      message: `¿Querés desbloquear este sticker ${sticker.tier} por ${sticker.price} puntos?`,
      confirmLabel: 'Desbloquear',
    })
    if (!confirmed) return

    purchaseMutation.mutate(sticker.id, {
      onSuccess: async (result) => {
        if (!result.success) {
          const message =
            result.message === 'Not enough points'
              ? `Necesitás ${result.required} puntos para desbloquear este sticker.`
              : 'No se pudo completar la compra.'
          await notify({ title: 'No se pudo comprar', message })
          return
        }
        await notify({ title: '¡Felicitaciones!', message: '¡Sticker desbloqueado con éxito!' })
      },
      onError: async (error) => {
        await notify({ title: 'Error', message: getApiErrorMessage(error) })
      },
    })
  }

  const handleDownloadSticker = async (sticker: Sticker) => {
    const confirmed = await confirm({
      title: 'Descargar sticker',
      message: `¿Querés descargar el sticker "${sticker.name}" en formato PNG?`,
      confirmLabel: 'Descargar',
    })
    if (!confirmed) return

    if (Platform.OS !== 'web') {
      await notify({ title: 'Descargado', message: '¡Sticker guardado en la galería de fotos!' })
      return
    }

    const image = STICKER_IMAGES[sticker.name]
    try {
      let uri: string | null = null

      if (typeof image === 'string') {
        uri = image
      } else if (image && typeof image === 'object') {
        if (typeof image.default === 'string') {
          uri = image.default
        } else if (typeof image.uri === 'string') {
          uri = image.uri
        } else {
          const asset = RNImage.resolveAssetSource(image)
          uri = asset?.uri ?? null
        }
      } else if (typeof image === 'number') {
        const asset = RNImage.resolveAssetSource(image)
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
        await notify({ title: 'Error', message: 'No se pudo resolver la ruta de la imagen.' })
      }
    } catch (e: any) {
      console.error(e)
      await notify({ title: 'Error', message: `Ocurrió un error al descargar el sticker.\n${e?.message || e}` })
    }
  }

  // Renderizador de un card de sticker
  const renderStickerCard = (sticker: Sticker, isLocked: boolean) => {
    return (
      <Pressable
        key={sticker.id}
        onPress={() => void (isLocked ? handleUnlock(sticker) : handleDownloadSticker(sticker))}
        disabled={isLocked && purchaseMutation.isPending}
        className="w-32 h-44 mr-3 bg-[#1A2536] rounded-[24px] items-center justify-between p-3.5 relative border-b-[4px] border-black/20 active:mt-0.5 active:border-b-0 overflow-hidden"
      >
        {/* Badge superior indicando el tier del sticker */}
        <View className={cn("px-2 py-0.5 rounded-full z-10", BADGE_COLORS[sticker.tier])}>
          <Text className="font-nunito text-[9px] font-black text-white uppercase tracking-wider">
            {sticker.tier}
          </Text>
        </View>

        {/* Imagen del sticker */}
        <View className="flex-1 justify-center items-center py-2">
          <Image
            source={STICKER_IMAGES[sticker.name]}
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

  if (isLoading) {
    return (
      <View className="mt-8 px-5 pb-10 items-center justify-center py-10">
        <ActivityIndicator size="small" color="#5F9BA4" />
      </View>
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
