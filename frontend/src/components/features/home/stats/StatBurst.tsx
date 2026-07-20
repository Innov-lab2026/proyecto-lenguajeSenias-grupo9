import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import Svg, { Defs, Ellipse, Polygon, RadialGradient, Stop } from 'react-native-svg'
import type { StatKind } from './useStatIdle'

// Paletas de partículas de icons.js (colores del arte)
const XP_COLORS = ['#4A90E2', '#7FB4F0', '#2E68A0', '#B7D6F7', '#FFFFFF']
const STAR_COLORS = ['#FCEB69', '#FDAF43', '#FFF8C8', '#FFFEFF', '#FCAF43']

// Estrella del clip-path de .burst-piece, como puntos de un Polygon (0-100)
const STAR_POINTS = '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35'

interface ParticleSpec {
  dx: number
  dy: number
  rot: number
  size: number
  color: string
  delay: number
  duration: number
}

// Fórmulas de triggerXp / triggerStar / triggerPaw en icons.js, escaladas por k
function makeXpSparks(k: number): ParticleSpec[] {
  return Array.from({ length: 14 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.35
    const dist = (26 + Math.random() * 34) * k
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 14 * k, // las chispas tienden a subir
      rot: Math.random() * 360 - 180,
      size: (4 + Math.random() * 5) * k,
      color: XP_COLORS[i % XP_COLORS.length],
      delay: Math.random() * 100,
      duration: 900,
    }
  })
}

function makeStarPieces(k: number): ParticleSpec[] {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3
    const dist = (28 + Math.random() * 36) * k
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      rot: Math.random() * 360 - 180,
      size: (5 + Math.random() * 5) * k,
      color: STAR_COLORS[i % STAR_COLORS.length],
      delay: Math.random() * 80,
      duration: 850,
    }
  })
}

function makePawStamps(k: number): ParticleSpec[] {
  return Array.from({ length: 4 }, (_, i) => {
    const angle = -Math.PI / 2 + (i - 1.5) * 0.55
    const dist = (22 + i * 8) * k
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 8 * k,
      rot: (i - 1.5) * 18,
      size: 42 * k,
      color: '#DA9146', // blob del radial-gradient de .paw-stamp
      delay: i * 50,
      duration: 900,
    }
  })
}

interface ParticleProps {
  clock: SharedValue<number>
  spec: ParticleSpec
  /** Duración total del burst (para mapear el reloj 0-1 al delay local). */
  total: number
  kind: StatKind
  index: number
}

/** Una partícula: vuela desde el centro hacia (dx, dy) desvaneciéndose. */
function Particle({ clock, spec, total, kind, index }: ParticleProps) {
  const style = useAnimatedStyle(() => {
    const local = Math.min(Math.max((clock.value * total - spec.delay) / spec.duration, 0), 1)
    const endScale = kind === 'paw' ? 1.1 : 0.3
    return {
      opacity:
        local <= 0 || local >= 1
          ? 0
          : interpolate(local, [0, 1], [kind === 'paw' ? 0.75 : 1, 0]),
      transform: [
        { translateX: interpolate(local, [0, 1], [0, spec.dx]) },
        { translateY: interpolate(local, [0, 1], [0, spec.dy]) },
        { scale: interpolate(local, [0, 1], [kind === 'paw' ? 0.7 : 1, endScale]) },
        { rotate: `${interpolate(local, [0, 1], [0, spec.rot])}deg` },
      ],
    }
  })

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: spec.size, height: spec.size }, style]}
    >
      {kind === 'xp' ? (
        // chispa: cuadradito redondeado
        <View style={{ flex: 1, borderRadius: 2, backgroundColor: spec.color }} />
      ) : kind === 'star' ? (
        // piecita con forma de estrella (clip-path del CSS → Polygon)
        <Svg width={spec.size} height={spec.size} viewBox="0 0 100 100">
          <Polygon points={STAR_POINTS} fill={spec.color} />
        </Svg>
      ) : (
        // huella fantasma: blob con gradiente radial
        <Svg width={spec.size} height={spec.size}>
          <Defs>
            <RadialGradient id={`stamp-${index}`} cx="50%" cy="60%" r="50%">
              <Stop offset="0%" stopColor={spec.color} stopOpacity="0.55" />
              <Stop offset="70%" stopColor={spec.color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={spec.size / 2}
            cy={spec.size / 2}
            rx={spec.size / 2}
            ry={spec.size / 2.2}
            fill={`url(#stamp-${index})`}
          />
        </Svg>
      )}
    </Animated.View>
  )
}

/** Anillo expansivo del XP (xp-ring: 54px, borde 3px, scale 0.4→1.8 · 750ms). */
function XpRing({ clock, k }: { clock: SharedValue<number>; k: number }) {
  const size = 54 * k
  const style = useAnimatedStyle(() => {
    const local = Math.min((clock.value * 1000) / 750, 1)
    return {
      opacity: local >= 1 ? 0 : interpolate(local, [0, 1], [0.9, 0]),
      transform: [{ scale: interpolate(local, [0, 1], [0.4, 1.8]) }],
    }
  })
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3 * k,
          borderColor: '#4A90E2', // token secondary
        },
        style,
      ]}
    />
  )
}

/** Onda del pisotón de la huella (paw-ripple: elipse 20×12, scale 0.6→3.2 · 550ms). */
function PawRipple({ clock, k }: { clock: SharedValue<number>; k: number }) {
  const w = 20 * k
  const h = 12 * k
  const style = useAnimatedStyle(() => {
    const local = Math.min((clock.value * 1050) / 550, 1)
    return {
      opacity: local >= 1 ? 0 : interpolate(local, [0, 1], [0.9, 0]),
      transform: [{ translateY: 8 * k }, { scale: interpolate(local, [0, 1], [0.6, 3.2]) }],
    }
  })
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: w, height: h }, style]}>
      <Svg width={w} height={h}>
        <Ellipse
          cx={w / 2}
          cy={h / 2}
          rx={w / 2 - 2}
          ry={h / 2 - 2}
          stroke="rgba(129, 93, 62, 0.55)"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </Animated.View>
  )
}

// Duración total de cada burst (delay máximo + vuelo de la partícula)
const TOTAL: Record<StatKind, number> = { xp: 1000, star: 930, paw: 1050 }

interface StatBurstProps {
  kind: StatKind
  /** Incrementarlo dispara el efecto (0 = todavía sin disparos). */
  trigger: number
  /** Alto del icono, para escalar distancias (la demo usa ~40px). */
  size: number
}

/**
 * Efecto "al sumar" de un stat — port de triggerXp/triggerStar/triggerPaw de
 * icons.js: partículas regeneradas al azar en cada disparo sobre un reloj
 * compartido. En reposo no renderiza nada.
 */
export function StatBurst({ kind, trigger, size }: StatBurstProps) {
  const clock = useSharedValue(1)
  const [specs, setSpecs] = useState<ParticleSpec[]>([])
  const k = size / 40

  useEffect(() => {
    if (trigger === 0) return
    setSpecs(kind === 'xp' ? makeXpSparks(k) : kind === 'star' ? makeStarPieces(k) : makePawStamps(k))
    clock.value = 0
    clock.value = withTiming(1, { duration: TOTAL[kind], easing: Easing.out(Easing.ease) })
  }, [trigger, kind, k, clock])

  if (specs.length === 0) return null

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center"
    >
      {kind === 'xp' ? <XpRing clock={clock} k={k} /> : null}
      {kind === 'paw' ? <PawRipple clock={clock} k={k} /> : null}
      {specs.map((spec, i) => (
        <Particle key={`${trigger}-${i}`} clock={clock} spec={spec} total={TOTAL[kind]} kind={kind} index={i} />
      ))}
    </View>
  )
}
