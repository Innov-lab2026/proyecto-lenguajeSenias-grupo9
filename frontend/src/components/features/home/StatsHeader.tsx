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
import { StatBadge, type StatKind } from './stats'
import { useAnimatedCount } from './stats/useAnimatedCount'
import type { HomeStats } from '@/src/types/home'

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
      pointerEvents="none"
      style={[{ position: 'absolute', left: '60%', top: -8 }, style]}
    >
      <Text className="font-nunito text-base font-bold" style={{ color: GAIN_COLOR[kind] }}>
        +{amount}
      </Text>
    </Animated.View>
  )
}

interface StatItemProps {
  kind: StatKind
  label: string
  value: number
}

/**
 * Un stat del header: cuando `value` aumenta dispara el patrón rewardStep de
 * icons.js (efecto del icono + "+N" flotante + contador con easing + número
 * que late). Tocar el icono dispara solo el efecto (easter egg / QA).
 */
function StatItem({ kind, label, value }: StatItemProps) {
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
      className="flex-row items-center gap-2"
    >
      <StatBadge kind={kind} size={30} burstTrigger={burst} />
      <Animated.View style={pumpStyle}>
        <Text className="font-nunito text-xl font-bold text-ink">{display}</Text>
      </Animated.View>
      {gain ? <GainLabel key={gain.id} amount={gain.amount} kind={kind} /> : null}
    </Pressable>
  )
}

interface StatsHeaderProps {
  stats: HomeStats
}

/** Fila superior del home: XP, estrellas y huellas del usuario. */
export function StatsHeader({ stats }: StatsHeaderProps) {
  return (
    <View className="w-full flex-row items-center justify-around">
      <StatItem kind="xp" label="Experiencia" value={stats.xp} />
      <StatItem kind="star" label="Estrellas" value={stats.stars} />
      <StatItem kind="paw" label="Huellas" value={stats.paws} />
    </View>
  )
}
