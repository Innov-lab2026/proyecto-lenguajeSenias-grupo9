import { useEffect } from 'react'
import { Platform } from 'react-native'
import {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { composeMatrix } from '../islands/useIslandIdle'

export { AnimatedG } from '../islands/useIslandIdle'

export type StatKind = 'xp' | 'star' | 'paw'

// Origen de rotación de cada cuerpo (transform-origin del CSS: xp/star =
// centro del viewBox; paw = 29.5px 40px, explícito en icons.css). Horneado
// acá en la matriz — ver el porqué en useIslandIdle.ts (composeMatrix).
const ORIGIN: Record<StatKind, [number, number]> = {
  xp: [20.5, 20],
  star: [38.5, 37],
  paw: [29.5, 40],
}

// `transform` sólo se manda en web: en nativo choca con el `transform` de
// ViewProps (array de mapas), distinto del array de 6 números que espera acá
// — ver el detalle completo en useIslandIdle.ts (useMatrixProps).
const isWeb = Platform.OS === 'web'

// Duraciones de xp-idle / star-idle / paw-wave en icons.css
const BODY_DURATION: Record<StatKind, number> = { xp: 2600, star: 2400, paw: 2200 }
// Duración del pop al sumar (xp-pop/star-pop 0.7s · paw-stamp 0.55s en la demo
// original; alargado ~40% acá para que el efecto se sienta más suave al tocar).
const POP_DURATION: Record<StatKind, number> = { xp: 980, star: 980, paw: 780 }

/**
 * Idle del cuerpo de cada stat (xp-idle / star-idle / paw-wave de icons.css)
 * + el "pop" al sumar (xp-pop / star-pop / paw-stamp), compuesto por encima
 * del idle: la rotación/translación del pop se suma y la escala se multiplica.
 * `popTrigger`: incrementarlo dispara el pop. En reposo queda el frame 0%.
 */
export function useStatIdle(kind: StatKind, enabled: boolean, popTrigger = 0) {
  const t = useSharedValue(0)
  const pop = useSharedValue(1) // 1 = pop terminado / sin pop

  useEffect(() => {
    if (!enabled) return
    t.value = withRepeat(
      withTiming(1, { duration: BODY_DURATION[kind], easing: Easing.linear }),
      -1,
    )
    return () => {
      cancelAnimation(t)
      t.value = 0
    }
  }, [enabled, kind, t])

  useEffect(() => {
    if (popTrigger === 0) return
    pop.value = 0
    // cubic-bezier(0.34, 1.5, 0.64, 1) del CSS: rebote con overshoot
    pop.value = withTiming(1, {
      duration: POP_DURATION[kind],
      easing: Easing.bezier(0.34, 1.5, 0.64, 1),
    })
  }, [popTrigger, kind, pop])

  const bodyProps = useAnimatedProps(() => {
    const p = pop.value
    const [originX, originY] = ORIGIN[kind]

    if (kind === 'xp') {
      const rotation =
        interpolate(t.value, [0, 0.35, 0.65, 1], [0, -3, 2, 0]) +
        interpolate(p, [0, 0.3, 0.55, 1], [0, -8, 5, 0])
      const scale =
        interpolate(t.value, [0, 0.35, 0.65, 1], [1, 1.07, 0.98, 1]) *
        interpolate(p, [0, 0.3, 0.55, 1], [1, 1.35, 0.88, 1])
      const matrix = composeMatrix(rotation, scale, scale, originX, originY)
      return (isWeb ? { matrix, transform: matrix } : { matrix }) as Record<string, unknown>
    }
    if (kind === 'star') {
      const rotation =
        interpolate(t.value, [0, 0.4, 0.7, 1], [-3, 4, -1, -3]) +
        interpolate(p, [0, 0.3, 0.55, 1], [0, 23, -7, 0])
      const scale =
        interpolate(t.value, [0, 0.4, 0.7, 1], [1, 1.08, 0.97, 1]) *
        interpolate(p, [0, 0.3, 0.55, 1], [1, 1.35, 0.9, 1])
      const matrix = composeMatrix(rotation, scale, scale, originX, originY)
      return (isWeb ? { matrix, transform: matrix } : { matrix }) as Record<string, unknown>
    }
    const rotation =
      interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [-8, 10, -4, 7, -8]) +
      interpolate(p, [0, 0.25, 0.45, 0.7, 1], [0, 8, 8, 12, 0])
    const scale =
      interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [1, 1.03, 0.98, 1.02, 1]) *
      interpolate(p, [0, 0.25, 0.45, 0.7, 1], [1, 1.25, 0.85, 1.08, 1])
    const y =
      interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [0, -2, 1, -1, 0]) +
      interpolate(p, [0, 0.25, 0.45, 0.7, 1], [0, -6, 4, -1, 0])
    const matrix = composeMatrix(rotation, scale, scale, originX, originY, 0, y)
    return (isWeb ? { matrix, transform: matrix } : { matrix }) as Record<string, unknown>
  })

  return { bodyProps }
}

/**
 * Aura pulsante detrás del icono (xp-aura / star-aura) + el flash al sumar
 * (xp-flash / star-flash): mientras dura el flash reemplaza al pulso, igual
 * que en el CSS. La huella no tiene aura (su ripple vive en StatBurst).
 */
export function useStatAura(kind: StatKind, enabled: boolean, flashTrigger = 0) {
  const active = enabled && kind !== 'paw'
  const t = useSharedValue(0)
  const flash = useSharedValue(1) // 1 = sin flash

  useEffect(() => {
    if (!active) return
    t.value = withRepeat(
      withTiming(1, { duration: kind === 'xp' ? 2600 : 2400, easing: Easing.linear }),
      -1,
    )
    return () => {
      cancelAnimation(t)
      t.value = 0
    }
  }, [active, kind, t])

  useEffect(() => {
    if (flashTrigger === 0 || kind === 'paw') return
    flash.value = 0
    // Alargado (era 700ms) para acompañar el pop más suave.
    flash.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.ease) })
  }, [flashTrigger, kind, flash])

  const style = useAnimatedStyle(() => {
    const isXp = kind === 'xp'
    const f = flash.value

    if (f < 1) {
      return {
        opacity: interpolate(f, [0, 0.3, 1], isXp ? [0.5, 1, 0.4] : [0.5, 1, 0.45]),
        transform: [
          { scale: interpolate(f, [0, 0.3, 1], isXp ? [0.9, 1.9, 0.88] : [0.9, 1.8, 0.9]) },
        ],
      }
    }

    // xp-aura: opacity 0.4→0.85, scale 0.88→1.12 · star-aura: 0.45→0.9, 0.9→1.15
    return {
      opacity: interpolate(t.value, [0, 0.5, 1], isXp ? [0.4, 0.85, 0.4] : [0.45, 0.9, 0.45]),
      transform: [
        {
          scale: interpolate(t.value, [0, 0.5, 1], isXp ? [0.88, 1.12, 0.88] : [0.9, 1.15, 0.9]),
        },
      ],
    }
  })

  return style
}
