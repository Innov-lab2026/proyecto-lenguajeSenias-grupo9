import { useEffect } from 'react'
import { Platform } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { G, Path } from 'react-native-svg'

export const AnimatedG = Animated.createAnimatedComponent(G)
export const AnimatedPath = Animated.createAnimatedComponent(Path)

const inOut = Easing.inOut(Easing.ease)

/** Loop simétrico a→b→a (keyframes 0%/50%/100% del CSS). */
function swing(from: number, to: number, duration: number) {
  'worklet'
  return withRepeat(
    withSequence(
      withTiming(to, { duration: duration / 2, easing: inOut }),
      withTiming(from, { duration: duration / 2, easing: inOut }),
    ),
    -1,
  )
}

/** Progreso lineal 0→1 en loop (para keyframes multi-parada con 0% = 100%). */
function cycle(duration: number) {
  'worklet'
  return withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1)
}

type SharedNumber = { readonly value: number }

function readVal(v: number | SharedNumber): number {
  'worklet'
  return typeof v === 'number' ? v : v.value
}

/**
 * Construye la matriz afín 2D que react-native-svg espera en la prop nativa
 * `matrix` (mismo orden y matemática que `extractTransform.ts`/`Matrix2D.ts`
 * de la librería: rotar+escalar+sesgar alrededor de un origen, y trasladar).
 *
 * Por qué hace falta: los props "cortos" (`rotation`, `scale`, `origin`,
 * `skewY`) sólo existen a nivel JS — react-native-svg los convierte a
 * `matrix` durante el render normal de React (ver `G.tsx`/`extractTransform`).
 * Con New Architecture (Fabric, activa en este proyecto — ver app.json),
 * Reanimated escribe las `animatedProps` directo en el nodo nativo sin pasar
 * por esa conversión: el spec de Fabric para `<G>` (`GroupNativeComponent.ts`)
 * sólo expone `matrix` como prop de transformación real, así que los props
 * cortos no tienen ningún efecto ahí (se ven quietos en Expo Go/dispositivo,
 * aunque sí "funcionen" en web, donde todo pasa por el render JS). Por eso
 * la matriz se arma a mano acá y se manda ya calculada.
 */
export function composeMatrix(
  rotationDeg: number,
  scaleX: number,
  scaleY: number,
  originX: number,
  originY: number,
  translateX = 0,
  translateY = 0,
  skewXDeg = 0,
  skewYDeg = 0,
): [number, number, number, number, number, number] {
  'worklet'
  const rad = (deg: number) => (deg * Math.PI) / 180
  const cos = Math.cos(rad(rotationDeg))
  const sin = Math.sin(rad(rotationDeg))
  let a = cos * scaleX
  let b = sin * scaleX
  let c = -sin * scaleY
  let d = cos * scaleY

  if (skewXDeg || skewYDeg) {
    const b1 = Math.tan(rad(skewYDeg))
    const c1 = Math.tan(rad(skewXDeg))
    const a2 = a
    const b2 = b
    const c2 = c
    const d2 = d
    a = a2 + c1 * b2
    b = b1 * a2 + b2
    c = c2 + c1 * d2
    d = b1 * c2 + d2
  }

  const x = translateX + originX
  const y = translateY + originY
  return [a, b, c, d, x - (originX * a + originY * c), y - (originX * b + originY * d)]
}

interface MatrixExtras {
  opacity?: SharedNumber
  translateX?: SharedNumber
  translateY?: SharedNumber
  skewY?: SharedNumber
}

/**
 * Hook genérico: arma un `animatedProps` con `matrix` (+ opacidad opcional) a
 * partir de valores compartidos de rotación/escala/traslación/sesgo. Cada
 * parte animada de una isla llama a este hook una vez, con su propio origen
 * (medido con getBBox — ver origins.json) y sus valores compartidos.
 */
// `<G>` (Fabric) extiende ViewProps, que YA define su propio `transform`
// (el de React Native: array de mapas tipo {rotate:'45deg'}) — muy distinto
// del `transform` que entiende react-native-svg en web (un array de 6
// números → `matrix()`). Mandar nuestro array de números bajo esa clave en
// nativo choca con el `transform` de ViewProps y crashea
// ("Double cannot be cast to ReadableNativeMap"). Por eso `transform` sólo
// se manda en web; en nativo va sólo `matrix` (la prop SVG real, sin choque).
const isWeb = Platform.OS === 'web'

export function useMatrixProps(
  rotation: number | SharedNumber,
  scale: number | SharedNumber,
  originX: number,
  originY: number,
  extra?: MatrixExtras,
) {
  return useAnimatedProps(() => {
    const rot = readVal(rotation)
    const sc = readVal(scale)
    const tx = extra?.translateX ? extra.translateX.value : 0
    const ty = extra?.translateY ? extra.translateY.value : 0
    const sk = extra?.skewY ? extra.skewY.value : 0
    const matrix = composeMatrix(rot, sc, sc, originX, originY, tx, ty, 0, sk)
    const base = isWeb ? { matrix, transform: matrix } : { matrix }
    // `matrix` no está en la interfaz pública GProps de react-native-svg
    // (sólo aparece en la firma interna de setNativeProps), de ahí el cast.
    return (extra?.opacity ? { ...base, opacity: extra.opacity.value } : base) as Record<
      string,
      unknown
    >
  })
}

/**
 * Relojes de idle de las islas vivas — port de los keyframes de
 * local/iconos-e9/icons.css a Reanimated. Devuelve valores "en crudo"
 * (grados, opacidad, progreso 0-1); las `animatedProps` finales (con
 * `matrix`) se arman en el sitio de uso con `useMatrixProps`, porque el
 * origen de rotación es distinto para cada parte. Las plantas y destellos
 * comparten 3 relojes con duraciones distintas (los delays negativos del CSS
 * se aproximan con la deriva natural entre ciclos). Los valores en reposo
 * (enabled=false) corresponden al frame 0% del CSS.
 */
export function useIslandIdle(enabled: boolean) {
  const sway0 = useSharedValue(-2.5)
  const sway1 = useSharedValue(-2.5)
  const sway2 = useSharedValue(-2.5)
  const glint0 = useSharedValue(0.35)
  const glint1 = useSharedValue(0.35)
  const glint2 = useSharedValue(0.35)
  const lake = useSharedValue(1)
  const starWaterT = useSharedValue(0)
  const bushT = useSharedValue(0)
  const reeds = useSharedValue(-2.5)
  const boardT = useSharedValue(0)
  const flagT = useSharedValue(0)
  const flyT = useSharedValue(0)

  useEffect(() => {
    if (!enabled) return

    // plant-sway: -2.5°→3° · 3.4s / 3.9s / 3s (variantes nth-of-type del CSS)
    sway0.value = swing(-2.5, 3, 3400)
    sway1.value = swing(-2.5, 3, 3900)
    sway2.value = swing(-2.5, 3, 3000)
    // water-glint: opacity 0.35→1 · 2.8s (2.6/3.4 para desfasar los grupos)
    glint0.value = swing(0.35, 1, 2800)
    glint1.value = swing(0.35, 1, 2600)
    glint2.value = swing(0.35, 1, 3400)
    // island-shimmer sobre el lago: opacity 1→0.82 · 3.2s
    lake.value = swing(1, 0.82, 3200)
    starWaterT.value = cycle(3600)
    bushT.value = cycle(3100)
    // island-reeds: mismo sway pero 4.2s
    reeds.value = swing(-2.5, 3, 4200)
    boardT.value = cycle(5000)
    flagT.value = cycle(2400)
    flyT.value = cycle(7000)

    const all = [sway0, sway1, sway2, glint0, glint1, glint2, lake, starWaterT, bushT, reeds, boardT, flagT, flyT]
    return () => all.forEach((sv) => cancelAnimation(sv))
  }, [enabled, sway0, sway1, sway2, glint0, glint1, glint2, lake, starWaterT, bushT, reeds, boardT, flagT, flyT])

  const glintProps = [
    useAnimatedProps(() => ({ opacity: glint0.value })),
    useAnimatedProps(() => ({ opacity: glint1.value })),
    useAnimatedProps(() => ({ opacity: glint2.value })),
  ]
  const lakeProps = useAnimatedProps(() => ({ opacity: lake.value }))

  // star-water: scale 1→1.05→0.97 + rotate ±1.5° + opacity 0.9→1→0.85 · 3.6s
  const starWaterRotation = useDerivedValue(() =>
    interpolate(starWaterT.value, [0, 0.35, 0.7, 1], [0, 1.5, -1.5, 0]),
  )
  const starWaterScale = useDerivedValue(() =>
    interpolate(starWaterT.value, [0, 0.35, 0.7, 1], [1, 1.05, 0.97, 1]),
  )
  const starWaterOpacity = useDerivedValue(() =>
    interpolate(starWaterT.value, [0, 0.35, 0.7, 1], [0.9, 1, 0.85, 0.9]),
  )

  // bush-wiggle: rotate -1.5°→1.8°→-0.5° · 3.1s (el scale sutil del CSS se omite)
  const bushRotation = useDerivedValue(() =>
    interpolate(bushT.value, [0, 0.3, 0.6, 1], [-1.5, 1.8, -0.5, -1.5]),
  )

  // sign-tilt: quieto hasta 55%, luego 4°→-2.5°→1°→0 · 5s
  const boardRotation = useDerivedValue(() =>
    interpolate(boardT.value, [0, 0.55, 0.65, 0.78, 0.88, 1], [0, 0, 4, -2.5, 1, 0]),
  )

  // flag-wave: skewY 0→2.5°→-2°→1°→0 · 2.4s (el scaleX sutil del CSS se omite)
  const flagSkewY = useDerivedValue(() =>
    interpolate(flagT.value, [0, 0.3, 0.6, 0.8, 1], [0, 2.5, -2, 1, 0]),
  )

  // fly-orbit: 8 puntos de la órbita en coordenadas del viewBox · 7s
  const flyX = useDerivedValue(() =>
    interpolate(flyT.value, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1], [33, 46, 57, 50, 38, 27, 28, 33]),
  )
  const flyY = useDerivedValue(() =>
    interpolate(flyT.value, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1], [26, 18, 26, 38, 44, 38, 30, 26]),
  )

  return {
    sway: [sway0, sway1, sway2],
    glintProps,
    lakeProps,
    reeds,
    starWaterRotation,
    starWaterScale,
    starWaterOpacity,
    bushRotation,
    boardRotation,
    flagSkewY,
    flyX,
    flyY,
  }
}
