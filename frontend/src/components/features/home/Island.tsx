import { Pressable } from 'react-native'
import { Image } from 'expo-image'
import type { IslandState } from '@/src/types/home'

interface IslandAsset {
  available: number
  blocked: number
  /** alto/ancho del viewBox del SVG, para renderizar sin deformar. */
  ratio: number
}

// La isla 1 no tiene versión bloqueada: al desbloquear un módulo siempre está
// disponible (y los módulos bloqueados no renderizan el camino).
const ISLAND_ASSETS: Record<number, IslandAsset> = {
  1: {
    available: require('@/assets/images/home/01-island.svg'),
    blocked: require('@/assets/images/home/01-island.svg'),
    ratio: 64 / 84,
  },
  2: {
    available: require('@/assets/images/home/02-island.svg'),
    blocked: require('@/assets/images/home/02-island-blocked.svg'),
    ratio: 51 / 85,
  },
  3: {
    available: require('@/assets/images/home/03-island.svg'),
    blocked: require('@/assets/images/home/03-island-blocked.svg'),
    ratio: 68 / 84,
  },
  4: {
    available: require('@/assets/images/home/04-island.svg'),
    blocked: require('@/assets/images/home/04-island-blocked.svg'),
    ratio: 66 / 83,
  },
  5: {
    available: require('@/assets/images/home/05-island.svg'),
    blocked: require('@/assets/images/home/05-island-blocked.svg'),
    ratio: 81 / 71,
  },
}

interface IslandProps {
  /** Número de isla (1 = abajo de todo, 5 = arriba de todo). */
  number: number
  state: IslandState
  /** Ancho de render; el alto sale de la proporción del SVG. */
  width: number
  onPress?: () => void
}

/** Isla individual del camino: elige el asset según número y estado. */
export function Island({ number, state, width, onPress }: IslandProps) {
  const asset = ISLAND_ASSETS[number]
  const isAvailable = state === 'available'

  return (
    <Pressable
      onPress={isAvailable ? onPress : undefined}
      disabled={!isAvailable}
      accessibilityRole="button"
      accessibilityLabel={`Isla ${number}, ${isAvailable ? 'disponible' : 'bloqueada'}`}
      accessibilityState={{ disabled: !isAvailable }}
      className={isAvailable ? 'active:opacity-80' : undefined}
    >
      <Image
        source={isAvailable ? asset.available : asset.blocked}
        style={{ width, height: width * asset.ratio }}
        contentFit="contain"
      />
    </Pressable>
  )
}

/** Proporción alto/ancho de una isla (la usa IslandPath para posicionar centros). */
export function getIslandRatio(number: number): number {
  return ISLAND_ASSETS[number].ratio
}
