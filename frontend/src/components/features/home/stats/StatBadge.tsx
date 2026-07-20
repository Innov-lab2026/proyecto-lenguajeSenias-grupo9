import type { ComponentType } from 'react'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import { XpIcon, StarIcon, PawIcon } from './StatIcon'
import { StatBurst } from './StatBurst'
import { useStatAura, type StatKind } from './useStatIdle'

const ICONS: Record<
  StatKind,
  ComponentType<{ size?: number; animated?: boolean; popTrigger?: number }>
> = {
  xp: XpIcon,
  star: StarIcon,
  paw: PawIcon,
}

// Colores del radial-gradient de las auras en icons.css (#4A90E2 = token
// secondary; el amarillo es color propio del arte de la estrella).
const GLOW_COLOR: Record<StatKind, string> = {
  xp: '#4A90E2',
  star: '#FCEB69',
  paw: 'transparent',
}

interface StatBadgeProps {
  kind: StatKind
  /** Alto del icono; el aura escala en proporción. */
  size?: number
  animated?: boolean
  /** Incrementarlo dispara el efecto completo: pop + flash + partículas. */
  burstTrigger?: number
}

/**
 * Icono de stat con su aura pulsante detrás (XP y estrella; la huella no
 * lleva aura en idle) y el efecto de "sumar" por encima (StatBurst). El aura
 * replica el span con radial-gradient de la demo usando RadialGradient de SVG.
 */
export function StatBadge({ kind, size = 30, animated = true, burstTrigger = 0 }: StatBadgeProps) {
  const Icon = ICONS[kind]
  const auraStyle = useStatAura(kind, animated, burstTrigger)
  const glowSize = size * 1.5

  return (
    <View className="items-center justify-center">
      {kind === 'paw' ? null : (
        <Animated.View
          style={[
            { position: 'absolute', width: glowSize, height: glowSize, pointerEvents: 'none' },
            auraStyle,
          ]}
        >
          <Svg width={glowSize} height={glowSize}>
            <Defs>
              <RadialGradient id={`glow-${kind}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={GLOW_COLOR[kind]} stopOpacity="0.55" />
                <Stop offset="70%" stopColor={GLOW_COLOR[kind]} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={glowSize / 2}
              cy={glowSize / 2}
              r={glowSize / 2}
              fill={`url(#glow-${kind})`}
            />
          </Svg>
        </Animated.View>
      )}
      <Icon size={size} animated={animated} popTrigger={burstTrigger} />
      <StatBurst kind={kind} trigger={burstTrigger} size={size} />
    </View>
  )
}
