import { useEffect } from 'react'
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

export { AnimatedG } from '../islands/useIslandIdle'

export type StatKind = 'xp' | 'star' | 'paw'

// Duraciones de xp-idle / star-idle / paw-wave en icons.css
const BODY_DURATION: Record<StatKind, number> = { xp: 2600, star: 2400, paw: 2200 }
// Duración del pop al sumar (xp-pop/star-pop 0.7s · paw-stamp 0.55s)
const POP_DURATION: Record<StatKind, number> = { xp: 700, star: 700, paw: 550 }

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

    if (kind === 'xp') {
      return {
        rotation:
          interpolate(t.value, [0, 0.35, 0.65, 1], [0, -3, 2, 0]) +
          interpolate(p, [0, 0.3, 0.55, 1], [0, -8, 5, 0]),
        scale:
          interpolate(t.value, [0, 0.35, 0.65, 1], [1, 1.07, 0.98, 1]) *
          interpolate(p, [0, 0.3, 0.55, 1], [1, 1.35, 0.88, 1]),
        y: 0,
      }
    }
    if (kind === 'star') {
      return {
        rotation:
          interpolate(t.value, [0, 0.4, 0.7, 1], [-3, 4, -1, -3]) +
          interpolate(p, [0, 0.3, 0.55, 1], [0, 23, -7, 0]),
        scale:
          interpolate(t.value, [0, 0.4, 0.7, 1], [1, 1.08, 0.97, 1]) *
          interpolate(p, [0, 0.3, 0.55, 1], [1, 1.35, 0.9, 1]),
        y: 0,
      }
    }
    return {
      rotation:
        interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [-8, 10, -4, 7, -8]) +
        interpolate(p, [0, 0.25, 0.45, 0.7, 1], [0, 8, 8, 12, 0]),
      scale:
        interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [1, 1.03, 0.98, 1.02, 1]) *
        interpolate(p, [0, 0.25, 0.45, 0.7, 1], [1, 1.25, 0.85, 1.08, 1]),
      y:
        interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [0, -2, 1, -1, 0]) +
        interpolate(p, [0, 0.25, 0.45, 0.7, 1], [0, -6, 4, -1, 0]),
    }
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
    flash.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
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
