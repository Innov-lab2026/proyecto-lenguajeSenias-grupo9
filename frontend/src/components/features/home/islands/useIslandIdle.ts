import { useEffect } from 'react'
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
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

/**
 * Relojes de idle de las islas vivas — port de los keyframes de
 * local/iconos-e9/icons.css a Reanimated. Cada tipo de parte (plantas,
 * destellos, lago, arbusto, juncos, cartel, bandera, mosca) tiene su reloj;
 * las plantas y destellos comparten 3 relojes con duraciones distintas (los
 * delays negativos del CSS se aproximan con la deriva natural entre ciclos).
 * Los valores en reposo (enabled=false) corresponden al frame 0% del CSS.
 */
export function useIslandIdle(enabled: boolean) {
  const sway0 = useSharedValue(-2.5)
  const sway1 = useSharedValue(-2.5)
  const sway2 = useSharedValue(-2.5)
  const glint0 = useSharedValue(0.35)
  const glint1 = useSharedValue(0.35)
  const glint2 = useSharedValue(0.35)
  const lake = useSharedValue(1)
  const starWater = useSharedValue(0)
  const bush = useSharedValue(0)
  const reeds = useSharedValue(-2.5)
  const board = useSharedValue(0)
  const flag = useSharedValue(0)
  const fly = useSharedValue(0)

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
    starWater.value = cycle(3600)
    bush.value = cycle(3100)
    // island-reeds: mismo sway pero 4.2s
    reeds.value = swing(-2.5, 3, 4200)
    board.value = cycle(5000)
    flag.value = cycle(2400)
    fly.value = cycle(7000)

    const all = [sway0, sway1, sway2, glint0, glint1, glint2, lake, starWater, bush, reeds, board, flag, fly]
    return () => all.forEach((sv) => cancelAnimation(sv))
  }, [enabled, sway0, sway1, sway2, glint0, glint1, glint2, lake, starWater, bush, reeds, board, flag, fly])

  const swayProps = [
    useAnimatedProps(() => ({ rotation: sway0.value })),
    useAnimatedProps(() => ({ rotation: sway1.value })),
    useAnimatedProps(() => ({ rotation: sway2.value })),
  ]

  const glintProps = [
    useAnimatedProps(() => ({ opacity: glint0.value })),
    useAnimatedProps(() => ({ opacity: glint1.value })),
    useAnimatedProps(() => ({ opacity: glint2.value })),
  ]

  const lakeProps = useAnimatedProps(() => ({ opacity: lake.value }))

  // star-water: scale 1→1.05→0.97 + rotate ±1.5° + opacity 0.9→1→0.85 · 3.6s
  const starWaterProps = useAnimatedProps(() => ({
    rotation: interpolate(starWater.value, [0, 0.35, 0.7, 1], [0, 1.5, -1.5, 0]),
    scale: interpolate(starWater.value, [0, 0.35, 0.7, 1], [1, 1.05, 0.97, 1]),
    opacity: interpolate(starWater.value, [0, 0.35, 0.7, 1], [0.9, 1, 0.85, 0.9]),
  }))

  // bush-wiggle: rotate -1.5°→1.8°→-0.5° · 3.1s (el scale sutil del CSS se omite)
  const bushProps = useAnimatedProps(() => ({
    rotation: interpolate(bush.value, [0, 0.3, 0.6, 1], [-1.5, 1.8, -0.5, -1.5]),
  }))

  const reedsProps = useAnimatedProps(() => ({ rotation: reeds.value }))

  // sign-tilt: quieto hasta 55%, luego 4°→-2.5°→1°→0 · 5s
  const boardProps = useAnimatedProps(() => ({
    rotation: interpolate(board.value, [0, 0.55, 0.65, 0.78, 0.88, 1], [0, 0, 4, -2.5, 1, 0]),
  }))

  // flag-wave: skewY 0→2.5°→-2°→1°→0 · 2.4s (el scaleX sutil del CSS se omite)
  const flagProps = useAnimatedProps(() => ({
    skewY: interpolate(flag.value, [0, 0.3, 0.6, 0.8, 1], [0, 2.5, -2, 1, 0]),
  }))

  // fly-orbit: 8 puntos de la órbita en coordenadas del viewBox · 7s
  const flyProps = useAnimatedProps(() => ({
    x: interpolate(fly.value, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1], [33, 46, 57, 50, 38, 27, 28, 33]),
    y: interpolate(fly.value, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1], [26, 18, 26, 38, 44, 38, 30, 26]),
  }))

  return {
    swayProps,
    glintProps,
    lakeProps,
    starWaterProps,
    bushProps,
    reedsProps,
    boardProps,
    flagProps,
    flyProps,
  }
}
