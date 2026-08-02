import { useEffect, useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Image } from 'expo-image'
import Svg, { Path } from 'react-native-svg'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  useDerivedValue,
  interpolate,
  FadeIn,
  FadeOut,
  runOnJS
} from 'react-native-reanimated'
import { Island } from './Island'
import { getIslandRatio } from './islands'
import { getIslandState } from '@/src/utils/home'
import { ISLANDS_PER_MODULE } from '@/src/constants/home'
import { useResponsive } from '@/src/hooks/common/useResponsive'
import type { HomeModule } from '@/src/types/home'
import { CarpiAvatar } from '../../common/CarpiAvatar'

interface IslandPathProps {
  module: HomeModule
  moduleNumber: number
  onIslandPress?: (islandNumber: number) => void
}

/** Ancho de render de cada isla (el alto respeta la proporción de su SVG). */
const ISLAND_WIDTH = 120
/** Centro horizontal de cada isla (fracción del ancho del panel), de la 1 (abajo) a la 5 (arriba). */
const X_FRACTIONS = [0.5, 0.64, 0.38, 0.65, 0.46]
/** Separación vertical entre centros de islas consecutivas. */
const STEP = 122
/** Aire por encima de la isla 5 (su bandera es el asset más alto). */
const PAD_TOP = 32
/** Aire debajo de la isla 1 (comparte zona con carpi-1). */
const PAD_BOTTOM = 56

const ISLAND_POSTERS = [
  require('@/assets/images/home/carteles/cartel1.svg'),
  require('@/assets/images/home/carteles/cartel2.svg'),
  require('@/assets/images/home/carteles/cartel3.svg'),
  require('@/assets/images/home/carteles/cartel4.svg'),
  require('@/assets/images/home/carteles/cartel5.svg'),
  require('@/assets/images/home/carteles/cartel6.svg'),
  require('@/assets/images/home/carteles/cartel7.svg'),
  require('@/assets/images/home/carteles/cartel8.svg'),
  require('@/assets/images/home/carteles/cartel9.svg'),
  require('@/assets/images/home/carteles/cartel10.svg'),
  require('@/assets/images/home/carteles/cartel11.svg'),
]
const POSTER_WIDTH = 36
const POSTER_HEIGHT = 48

// Desplazamientos verticales personalizados para cada cartel (1 a 5) para compensar
const POSTER_TOP_OFFSETS: Record<number, number> = {
  1: -POSTER_HEIGHT + 42,
  2: -POSTER_HEIGHT + 42,
  3: -POSTER_HEIGHT + 42,
  4: -POSTER_HEIGHT + 46,
  5: -POSTER_HEIGHT + 60,
}

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
export function IslandPath({ module, moduleNumber, onIslandPress }: IslandPathProps) {
  const scrollRef = useRef<ScrollView>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const { isMobile, isTablet } = useResponsive()

  const islandNumbers = Array.from({ length: ISLANDS_PER_MODULE }, (_, i) => i + 1)
  const centers = width ? islandNumbers.map((n) => getIslandCenter(n, width)) : []

  // Altura de cada isla según su estado actual (bloqueada o viva)
  const islandHeights = width
    ? islandNumbers.map((n) => {
      const state = getIslandState(module, n)
      return ISLAND_WIDTH * getIslandRatio(n, state === 'blocked')
    })
    : []

  // La isla actual donde debe estar el avatar (1 a 5)
  const targetIsland = Math.min(module.completedIslands + 1, ISLANDS_PER_MODULE)

  // Posición inicial del ScrollView basada en la isla de destino
  const initialScrollY = centers.length > 0
    ? Math.max(0, centers[ISLANDS_PER_MODULE - targetIsland].y - 300)
    : CONTENT_HEIGHT

  // El progreso inicial en reposo del avatar según las islas completadas:
  // - Si completó 0 islas: se ubica en el fondo de la isla 1 (valor 0).
  // - Si completó C > 0 islas: se ubica en la cima de la isla C (valor C - 0.5).
  const getRestingProgress = (completed: number) => {
    if (completed === 0) return 0
    return (completed - 1) + 0.5
  }

  const restingProgress = getRestingProgress(module.completedIslands)

  // Progreso animado en el camino (0 a 4.5)
  const animProgress = useSharedValue(restingProgress)

  useEffect(() => {
    if (width && centers.length > 0) {
      const targetResting = getRestingProgress(module.completedIslands)
      animProgress.value = withSpring(targetResting, { damping: 15, stiffness: 60 })

      // Hacer scroll hasta la posición de la isla destino
      const targetIsland = Math.min(module.completedIslands + 1, ISLANDS_PER_MODULE)
      const targetCenter = centers[targetIsland - 1]
      if (targetCenter) {
        // Centrar aproximadamente la isla en la pantalla
        scrollRef.current?.scrollTo({
          y: Math.max(0, targetCenter.y - 300),
          animated: true
        })
      }
    }
    // El efecto solo debe dispararse si cambia completedIslands o el ancho (width)
  }, [module.completedIslands, width])

  // Obtiene las coordenadas (x, y) de Carpi en función de su progreso en el camino (0 a 4.5).
  // Los comentarios en español explican las matemáticas aplicadas.
  const getAvatarPosition = (stateProgress: number) => {
    'worklet';
    if (!centers || centers.length === 0 || islandHeights.length === 0) return { x: 0, y: 0 }

    // Clampeamos el progreso para que no se salga de los límites definidos
    const progress = Math.min(Math.max(0, stateProgress), 4.5)
    const k = Math.min(Math.max(0, Math.floor(progress)), centers.length - 1)
    const diff = progress - k

    // Si es la última isla, o si estamos en la fase vertical de la isla (de bottom a top)
    if (k >= centers.length - 1 || diff <= 0.5) {
      const w = Math.min(1, diff / 0.5)
      const center = centers[k]
      const height = islandHeights[k]
      // Posición delantera/inferior de la isla k + 1 (más abajo, en el agua)
      const bottomY = center.y + height / 2 + 15
      // Posición trasera/superior de la isla k + 1 (más abajo, en el borde de la isla)
      const topY = center.y - height / 2 + 48
      return {
        x: center.x,
        y: bottomY + w * (topY - bottomY)
      }
    } else {
      // Viajando por el río (curva Bezier) entre la cima de la isla k + 1 y la base de la isla k + 2
      const u = (diff - 0.5) / 0.5
      const localT = 0.2 + u * 0.6 // Mapea u (0 a 1) en el rango Bezier (0.2 a 0.8)

      const p0 = centers[k]
      const p3 = centers[k + 1]
      if (!p0 || !p3) return { x: 0, y: 0 }

      const midY = (p0.y + p3.y) / 2
      const p1 = { x: p0.x, y: midY }
      const p2 = { x: p3.x, y: midY }

      const mt = 1 - localT
      const x = mt * mt * mt * p0.x + 3 * mt * mt * localT * p1.x + 3 * mt * localT * localT * p2.x + localT * localT * localT * p3.x
      const y = mt * mt * mt * p0.y + 3 * mt * mt * localT * p1.y + 3 * mt * localT * localT * p2.y + localT * localT * localT * p3.y

      return { x, y }
    }
  }

  const animatedCarpiStyle = useAnimatedStyle(() => {
    if (!centers || centers.length === 0 || islandHeights.length === 0) {
      return { opacity: 0 }
    }

    const tTotal = animProgress.value
    const progress = Math.min(Math.max(0, tTotal), 4.5)
    const k = Math.min(Math.max(0, Math.floor(progress)), centers.length - 1)
    const diff = progress - k

    const pos = getAvatarPosition(tTotal)
    // zIndex dinámico: si está en la parte superior/trasera (diff >= 0.4) o en el río, va detrás de la isla (zIndex = 5).
    // Si está en la parte inferior/delantera (diff < 0.4), va delante de la isla (zIndex = 20).
    const zIndexVal = diff < 0.4 ? 20 : 5

    return {
      opacity: 1,
      zIndex: zIndexVal,
      transform: [
        { translateX: pos.x - 28 },
        { translateY: pos.y - 45 }
      ]
    }
  })

  // Controlador al presionar una isla con animación de recorrido de Carpi
  const handleIslandPress = (n: number) => {
    if (!onIslandPress || isAnimating) return

    const completed = module.completedIslands
    // Si hace click en la siguiente lección activa (completed + 1)
    if (n === completed + 1) {
      const targetProgress = n - 1 // parte inferior de la isla n

      // Si ya está en la posición de destino, abrimos la lección inmediatamente
      if (Math.abs(animProgress.value - targetProgress) < 0.01) {
        onIslandPress(n)
        return
      }

      setIsAnimating(true)
      animProgress.value = withSpring(targetProgress, { damping: 15, stiffness: 60 })

      // Usamos un temporizador seguro en el hilo de JS para evitar problemas de callbacks en React Native Web
      setTimeout(() => {
        handleAnimationComplete(n)
      }, 650)
    } else {
      // Para lecciones ya completadas, se abre inmediatamente
      onIslandPress(n)
    }
  }

  const handleAnimationComplete = (n: number) => {
    setIsAnimating(false)
    onIslandPress?.(n)
  }

  return (
    <View
      className="flex-1 bg-panel"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width ? (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          // Posiciona el scroll inicialmente cerca do avatar
          contentOffset={{ x: 0, y: initialScrollY }}
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

            {width && (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                  },
                  animatedCarpiStyle
                ]}
              >
                <CarpiAvatar size={56} />
              </Animated.View>
            )}

            {islandNumbers.map((n) => {
              const center = centers[n - 1]
              const state = getIslandState(module, n)
              const height = ISLAND_WIDTH * getIslandRatio(n, state === 'blocked')
              // Los carteles 1, 3 y 5 deben estar en el lado superior izquierdo, mientras que el 2 y 4 en el lado superior derecho.
              // Por lo tanto, signOnRight (lado derecho) debe ser verdadero para números de islas pares.
              const signOnRight = n % 2 === 0
              return (
                <View
                  key={n}
                  style={{
                    position: 'absolute',
                    left: center.x - ISLAND_WIDTH / 2,
                    top: center.y - height / 2,
                    zIndex: 10, // Para permitir que el avatar quede detrás (zIndex = 5) o delante (zIndex = 20)
                  }}
                >
                  <Island
                    number={n}
                    state={state}
                    width={ISLAND_WIDTH}
                    onPress={onIslandPress ? () => handleIslandPress(n) : undefined}
                  />
                  {/* El cartel solo se muestra con animación si la isla está activa (disponible) */}
                  {state === 'available' && (
                    <Animated.View
                      entering={FadeIn.duration(400)}
                      exiting={FadeOut.duration(300)}
                      style={{
                        position: 'absolute',
                        width: POSTER_WIDTH,
                        height: POSTER_HEIGHT,
                        top: POSTER_TOP_OFFSETS[n] ?? -POSTER_HEIGHT + 42,
                        left: signOnRight ? ISLAND_WIDTH - 20 : -8,
                        zIndex: 10,
                      }}
                    >
                      <Image
                        source={ISLAND_POSTERS[(moduleNumber - 1) * 5 + n - 1]}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        contentFit="contain"
                        accessibilityLabel={`Cartel de la isla ${n}`}
                      />
                    </Animated.View>
                  )}
                </View>
              )
            })}

            <Image
              source={require('@/assets/images/home/carpi-1.png')}
              style={{
                position: 'absolute',
                right: isMobile ? 6 : isTablet ? 8 : 10,
                bottom: isMobile ? 6 : isTablet ? 8 : 10,
                width: isMobile ? 120 : isTablet ? 140 : 160,
                height: isMobile ? 120 : isTablet ? 140 : 160,
              }}
              contentFit="contain"
              accessibilityLabel="Carpincho de CarpiSeñas"
            />
          </View>
        </ScrollView>
      ) : null}
    </View>
  )
}
