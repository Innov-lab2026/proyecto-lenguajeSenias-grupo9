import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { StatBadge } from './StatBadge'
import type { StatKind } from './useStatIdle'
import { useAnimatedCount } from './useAnimatedCount'
import { cn } from '@/src/utils/cn'

// Colores del "+N" por stat (hud-gain de icons.css; colores del arte)
const GAIN_COLOR: Record<StatKind, string> = { xp: '#2E68A0', star: '#D58B01', paw: '#A5652E' }

/** "+N" que flota y se desvanece junto al número (hud-gain-rise · 1.3s). */
function GainLabel({ amount, kind }: { amount: number; kind: StatKind }) {
  const t = useSharedValue(0)

  useEffect(() => {
    t.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.ease) })
  }, [t])

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.2, 1], [0, 1, 0]),
    transform: [
      { translateY: interpolate(t.value, [0, 0.2, 1], [6, -4, -26]) },
      { scale: interpolate(t.value, [0, 0.2, 1], [0.7, 1.15, 1]) },
    ],
  }))

  return (
    <Animated.View
      style={[{ position: 'absolute', left: '60%', top: -8, pointerEvents: 'none' }, style]}
    >
      <Text className="font-nunito text-base font-bold" style={{ color: GAIN_COLOR[kind] }}>
        +{amount}
      </Text>
    </Animated.View>
  )
}

export interface StatItemProps {
  kind: StatKind
  label: string
  value: number
  /** 'row' (icono junto al número — header del home) | 'column' (icono arriba — cards grandes). */
  layout?: 'row' | 'column'
  /** Muestra el label visible junto al número (las cards de recompensa lo necesitan; el header del home no). */
  showLabel?: boolean
  badgeSize?: number
  valueClassName?: string
  /** Texto fijo antes del número (ej. "+" en la card de puntos del resumen de lección). */
  prefix?: string
}

/**
 * Un stat animado: cuando `value` aumenta dispara el patrón rewardStep de
 * icons.js (efecto del icono + "+N" flotante + contador con easing + número
 * que late). Tocar el icono dispara solo el efecto (easter egg / QA).
 *
 * El delta se detecta comparando contra el `value` del render anterior — si
 * el componente se monta ya con el valor final (sin haber mostrado antes uno
 * menor), no hay nada que animar. Quien lo use y quiera "revelar" un puntaje
 * ganado (ej. la pantalla de recompensas) debe montar en 0 y subir el valor
 * real un instante después.
 */
export function StatItem({
  kind,
  label,
  value,
  layout = 'row',
  showLabel = false,
  badgeSize = 30,
  valueClassName = 'text-xl',
  prefix = '',
}: StatItemProps) {
  const [burst, setBurst] = useState(0)
  const [gain, setGain] = useState<{ amount: number; id: number } | null>(null)
  const prevValue = useRef(value)
  const { display, isCounting } = useAnimatedCount(value)

  useEffect(() => {
    const delta = value - prevValue.current
    prevValue.current = value
    if (delta <= 0) return
    setBurst((b) => b + 1)
    setGain({ amount: delta, id: Date.now() })
    const timeout = setTimeout(() => setGain(null), 1400)
    return () => clearTimeout(timeout)
  }, [value])

  // hud-value-pump: el número late (scale 1↔1.25 · 0.45s) mientras cuenta
  const pump = useSharedValue(1)
  useEffect(() => {
    if (!isCounting) {
      cancelAnimation(pump)
      pump.value = withTiming(1, { duration: 150 })
      return
    }
    pump.value = withRepeat(
      withSequence(withTiming(1.25, { duration: 225 }), withTiming(1, { duration: 225 })),
      -1,
    )
    return () => cancelAnimation(pump)
  }, [isCounting, pump])

  const pumpStyle = useAnimatedStyle(() => ({ transform: [{ scale: pump.value }] }))

  return (
    <Pressable
      onPress={() => setBurst((b) => b + 1)}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      className={cn(layout === 'column' ? 'items-center' : 'flex-row items-center gap-2')}
    >
      <StatBadge kind={kind} size={badgeSize} burstTrigger={burst} />
      {showLabel && <Text className="font-nunito text-xs font-bold text-ink mb-1 mt-1">{label}</Text>}
      <View style={{ position: 'relative' }}>
        <Animated.View style={pumpStyle}>
          <Text className={cn('font-nunito font-bold text-ink', valueClassName)}>
            {prefix}
            {display}
          </Text>
        </Animated.View>
        {gain ? <GainLabel key={gain.id} amount={gain.amount} kind={kind} /> : null}
      </View>
    </Pressable>
  )
}
