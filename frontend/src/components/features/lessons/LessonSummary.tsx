import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { StatItem } from '@/src/components/features/home/stats'
import { LESSON_SUMMARY_CONFIG } from '@/src/constants/lessons'
import type { CompleteLessonResult } from '@/src/types/progress'
import { cn } from '@/src/utils/cn'

interface LessonSummaryProps {
  /** Respuesta de completeLesson. `undefined` mientras la request está en vuelo. */
  result?: CompleteLessonResult
  isPending: boolean
  /** Próximo nivel a desbloquear, o `null` si es la última lección del módulo. */
  nextLevel: number | null
  /** `lessons.content_key`: elige los textos y el color de cierre de la lección. */
  contentKey?: string | null
  onClose: () => void
  onContinue: () => void
  insets: { top: number; bottom: number }
}

/** Respiro antes de "revelar" la recompensa (que se note que apareció, no que ya estaba). */
const REVEAL_DELAY_MS = 300

/** Celeste por defecto de la franja inferior (las lecciones de cierre lo pisan). */
const DEFAULT_FOOTER_BG = '#67AEF5'

/**
 * Cuánto se mete la franja sólida por debajo de la onda. La forma del SVG no
 * llega al borde inferior de su viewBox (deja ~1.3%) y además tiene las
 * esquinas de abajo redondeadas, así que si las dos piezas sólo se tocan, por
 * esos huecos se ve el fondo y aparece una línea entre medio. Solapándolas, la
 * franja tapa el borde inferior de la onda y sólo queda a la vista el bulto.
 */
const WAVE_OVERLAP = 12

/**
 * Alto de la onda que corona la franja inferior. Va en el flujo (no como capa
 * flotante), así que este alto es espacio real: el contenido de arriba se corta
 * acá y no puede quedar tapado. Descontado el solape, quedan visibles los ~80px
 * de bulto que se medían en las resoluciones donde la pantalla ya se veía bien.
 */
const WAVE_HEIGHT = 80 + WAVE_OVERLAP

/** Cuánto sube el candado sobre la franja para quedar montado en el bulto. */
const LOCK_OVERLAP = 56

/** Pantalla de resumen al terminar la lección: recompensa del server + desbloqueo del próximo nivel. */
export function LessonSummary({ result, isPending, nextLevel, contentKey, onClose, onContinue, insets }: LessonSummaryProps) {
  // El server responde success:false cuando la lección ya estaba completada:
  // no hay recompensa nueva que mostrar, sólo se reconoce la revisita.
  const alreadyCompleted = result != null && !result.success
  const earnedAchievements = result?.earned_achievements ?? []

  const config = (contentKey ? LESSON_SUMMARY_CONFIG[contentKey] : undefined) ?? {}
  const footerBg = config.footerBg ?? DEFAULT_FOOTER_BG
  // Fondo oscuro (cierre de módulo) ⇒ el texto del candado va en blanco.
  const isDarkFooter = footerBg !== DEFAULT_FOOTER_BG

  // La lección de cierre de módulo no tiene "nivel siguiente", pero igual
  // anuncia algo; por eso el label puede venir de la config.
  const unlockLabel = config.unlockLabel ?? (nextLevel !== null ? `¡Nivel ${nextLevel}\ndesbloqueado!` : null)
  const showUnlock = !alreadyCompleted && unlockLabel !== null

  const isLevel5 = contentKey === 'm1-l5'
  const isLevel10 = contentKey === 'm2-l5'

  // Determinar la ilustración a mostrar (banderines para nivel 5 y 10, de lo contrario la capibara)
  let imageSource = require('@/assets/images/lessons/carpi_victory.svg')
  if (isLevel5) {
    imageSource = require('@/assets/images/lessons/banderines/banderin_nivel5.svg')
  } else if (isLevel10) {
    imageSource = require('@/assets/images/lessons/banderines/banderin_nivel10.svg')
  }

  // Determinar título y subtítulo según la lección
  const titleText = isLevel5 || isLevel10
    ? '¡Logro desbloqueado!'
    : (alreadyCompleted ? '¡De nuevo por acá!' : config.title ?? '¡Estuviste increíble!')

  const subtitleText = isLevel5
    ? 'Conseguiste el banderín “Principiante”'
    : isLevel10
      ? 'Conseguiste el banderín “Intermedio”'
      : (alreadyCompleted ? 'Ya habías completado esta lección.' : config.subtitle ?? 'Completaste la lección')

  // Determinar etiqueta del botón de continuar
  const buttonLabel = isPending
    ? 'Guardando...'
    : isLevel5
      ? 'Empezar Módulo 2'
      : isLevel10
        ? 'Empezar Módulo 3'
        : 'Continuar'

  // StatItem sólo anima cuando su `value` sube mientras está montado. La
  // respuesta del server puede llegar tan rápido que el 0 inicial no alcance a
  // pintarse (mock resuelve en el acto), así que el salto a los valores reales
  // se agenda explícitamente en vez de depender de cuándo resuelva la request.
  // Ya completada ⇒ earned_* viene en 0 y no hay nada que animar.
  const [revealed, setRevealed] = useState({ xp: 0, points: 0, signs: 0 })

  useEffect(() => {
    if (result == null) return
    const timeout = setTimeout(() => {
      setRevealed({ xp: result.earned_xp, points: result.earned_points, signs: result.earned_signs })
    }, REVEAL_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [result])

  return (
    <View
      className="flex-1 bg-[#EAF8FF] items-center justify-start overflow-hidden"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Contenido: se queda con el alto que sobra tras la franja inferior y se
          centra. La ilustración es la que cede espacio cuando la pantalla es
          baja, así los textos y las tarjetas nunca se aprietan contra la onda. */}
      <View className="flex-1 w-full max-w-md md:max-w-2xl items-center justify-center gap-3 px-4">
        {/* 1º La imagen */}
        <View className="w-full flex-1 min-h-[104px] max-h-[320px] items-center justify-center">
          <Image
            source={imageSource}
            className="w-full h-full max-w-[360px]"
            contentFit="contain"
          />
        </View>

        {/* 2º El texto */}
        <View className="w-full items-center">
          <Text className="font-nunito text-4xl font-extrabold text-ink mb-1 text-center">
            {titleText}
          </Text>
          <Text className="font-nunito text-xl text-muted text-center">
            {subtitleText}
          </Text>

          {earnedAchievements.length > 0 ? (
            <Text className="font-nunito text-base font-bold text-secondary text-center px-4 mt-2">
              ¡Nuevo logro! {earnedAchievements.map((a) => a.name).join(', ')}
            </Text>
          ) : null}
        </View>

        {/* 3º Los stats */}
        <View className="w-full flex-row justify-between gap-2">
          <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
            <StatItem kind="xp" label="Experiencia" value={revealed.xp} layout="column" showLabel badgeSize={34} valueClassName="text-3xl" labelClassName="text-sm" />
          </View>
          <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
            <StatItem kind="star" label="Puntos" value={revealed.points} layout="column" showLabel badgeSize={34} valueClassName="text-3xl" labelClassName="text-sm" />
          </View>
          <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
            <StatItem kind="paw" label="Señas" value={revealed.signs} layout="column" showLabel badgeSize={34} valueClassName="text-3xl" labelClassName="text-sm" />
          </View>
        </View>
      </View>

      {/* Franja inferior: onda + cuerpo, las dos en el flujo. Antes la onda era
          un absolute con `top: -180` que se dibujaba encima del contenido sin
          ocupar lugar, y en pantallas bajas o apaisadas se comía las tarjetas. */}
      <View className="self-stretch">
        {/* La imagen se estira más ancha que la pantalla a propósito: el SVG
            trae margen propio y esquinas redondeadas, y a lo ancho quedaban
            huecos del fondo en las puntas. El `overflow-hidden` del contenedor
            raíz recorta lo que sobra. */}
        <Image
          source={require('@/assets/images/lessons/lesson_summary_celeste.svg')}
          style={{ width: '108%', marginLeft: '-4%', height: WAVE_HEIGHT }}
          contentFit="fill"
          tintColor={footerBg}
        />

        <View
          className={cn('items-center px-4 pb-5 gap-2', showUnlock ? null : 'pt-4')}
          style={{ backgroundColor: footerBg, marginTop: -WAVE_OVERLAP }}
        >
          {showUnlock ? (
            <View
              pointerEvents="none" // Evita que este contenedor bloquee los clics en el botón Continuar
              className="items-center gap-2"
              style={{ marginTop: -LOCK_OVERLAP }} // Monta el candado sobre el bulto de la onda
            >
              <Image
                source={require('@/assets/images/lessons/candado_abierto.svg')}
                className="w-16 h-16"
                contentFit="contain"
              />
              <Text
                className={cn(
                  'font-nunito text-base font-bold text-center leading-5',
                  isDarkFooter ? 'text-white' : 'text-ink',
                )}
              >
                {unlockLabel}
              </Text>
            </View>
          ) : null}
          {/* El botón se ajusta a su texto: con un ancho relativo, "Continuar"
              quedaba desproporcionado en pantallas anchas y "Empezar Módulo N"
              se partía en dos líneas en las angostas.

              `w-auto` hay que pasarlo sí o sí — no alcanza con omitir la clase,
              porque la variante del Button trae `w-full` y sin pisarlo el botón
              se estira a todo el ancho del pie. */}
          <Button
            label={buttonLabel}
            onPress={onContinue}
            className="w-auto px-8"
            disabled={isPending}
          />
        </View>
      </View>
    </View>
  )
}
