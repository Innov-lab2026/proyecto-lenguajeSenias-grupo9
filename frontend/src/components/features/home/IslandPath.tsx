import { useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Image } from 'expo-image'
import Svg, { Path } from 'react-native-svg'
import { Island, getIslandRatio } from './Island'
import { getIslandState } from '@/src/utils/home'
import { ISLANDS_PER_MODULE } from '@/src/constants/home'
import type { HomeModule } from '@/src/types/home'

interface IslandPathProps {
  module: HomeModule
  onIslandPress?: (islandNumber: number) => void
}

/** Ancho de render de cada isla (el alto respeta la proporción de su SVG). */
const ISLAND_WIDTH = 120
/** Centro horizontal de cada isla (fracción del ancho del panel), de la 1 (abajo) a la 5 (arriba). */
const X_FRACTIONS = [0.5, 0.64, 0.38, 0.65, 0.46]
/** Separación vertical entre centros de islas consecutivas. */
const STEP = 108
/** Aire por encima de la isla 5 (su bandera es el asset más alto). */
const PAD_TOP = 32
/** Aire debajo de la isla 1 (comparte zona con carpi-1). */
const PAD_BOTTOM = 56

const CONTENT_HEIGHT = PAD_TOP + 70 + (ISLANDS_PER_MODULE - 1) * STEP + 46 + PAD_BOTTOM

/** Centro (x, y) de una isla dentro del contenido del camino. */
function getIslandCenter(islandNumber: number, width: number) {
  return {
    x: X_FRACTIONS[islandNumber - 1] * width,
    y: PAD_TOP + 70 + (ISLANDS_PER_MODULE - islandNumber) * STEP,
  }
}

/** Curva suave (bezier) que pasa por los centros de las islas: el "río". */
function buildRiverPath(points: { x: number; y: number }[]): string {
  const [first, ...rest] = points
  let d = `M ${first.x} ${first.y}`
  let prev = first
  for (const point of rest) {
    const midY = (prev.y + point.y) / 2
    d += ` C ${prev.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`
    prev = point
  }
  return d
}

/**
 * Panel celeste con el camino del módulo: 5 islas en zigzag de abajo hacia
 * arriba, unidas por el río, con carpi-1 en la esquina inferior derecha.
 * En pantallas bajas el camino scrollea; arranca mostrando la isla 1 (abajo).
 */
export function IslandPath({ module, onIslandPress }: IslandPathProps) {
  const scrollRef = useRef<ScrollView>(null)
  const [width, setWidth] = useState<number | null>(null)

  const islandNumbers = Array.from({ length: ISLANDS_PER_MODULE }, (_, i) => i + 1)
  const centers = width ? islandNumbers.map((n) => getIslandCenter(n, width)) : []

  return (
    <View
      className="flex-1 bg-panel"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width ? (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <View style={{ width, height: CONTENT_HEIGHT }}>
            {/* Río detrás de las islas. Color = token accent (#ACDCFF); las props
                de react-native-svg no aceptan className, va el hex del token. */}
            <Svg
              width={width}
              height={CONTENT_HEIGHT}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <Path
                d={buildRiverPath(centers)}
                stroke="#ACDCFF"
                strokeWidth={24}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>

            {islandNumbers.map((n) => {
              const center = centers[n - 1]
              const height = ISLAND_WIDTH * getIslandRatio(n)
              return (
                <View
                  key={n}
                  style={{
                    position: 'absolute',
                    left: center.x - ISLAND_WIDTH / 2,
                    top: center.y - height / 2,
                  }}
                >
                  <Island
                    number={n}
                    state={getIslandState(module, n)}
                    width={ISLAND_WIDTH}
                    onPress={onIslandPress ? () => onIslandPress(n) : undefined}
                  />
                </View>
              )
            })}

            <Image
              source={require('@/assets/images/home/carpi-1.png')}
              style={{ position: 'absolute', right: 12, bottom: 8, width: 90, height: 90 }}
              contentFit="contain"
              accessibilityLabel="Carpincho de CarpiSeñas"
            />
          </View>
        </ScrollView>
      ) : null}
    </View>
  )
}
