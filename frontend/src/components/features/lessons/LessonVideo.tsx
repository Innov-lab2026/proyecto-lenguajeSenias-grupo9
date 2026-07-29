import { useEffect, useRef } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { useEvent, useEventListener } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/src/utils/cn'

interface LessonVideoProps {
  uri: string
  muted?: boolean
  autoPlay?: boolean
  /** Se dispara al llegar al final del video. */
  onWatched?: () => void
  className?: string
  /** Reduce el tamaño de los overlays (loading/play) para usarlo en grillas chicas. */
  compact?: boolean
  /**
   * false cuando el video vive dentro de otro Pressable (ej. una tarjeta de opción
   * seleccionable): no envuelve en su propio Pressable ni muestra el overlay de
   * play/pause, para no capturar el tap que le corresponde al padre.
   */
  interactive?: boolean
}

/** Marco de video vertical reutilizable para los steps de una lección (ver local/LESSON_UI_PLAN.md). */
export function LessonVideo({
  uri,
  muted = false,
  autoPlay = true,
  onWatched,
  className,
  compact = false,
  interactive = true,
}: LessonVideoProps) {
  const player = useVideoPlayer(uri, (p) => {
    p.muted = muted
  })

  const { status } = useEvent(player, 'statusChange', { status: player.status })
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing })

  // El video queda en el último frame al terminar (no hay loop). Se guarda en
  // ref, no en estado: el efecto de `autoPlay` lo lee para decidir entre play()
  // y replay(), y como dependencia se reactivaría en bucle al marcarse.
  const hasEnded = useRef(false)

  // El callback de useVideoPlayer sólo corre al crear el player, así que un
  // cambio posterior de `muted` (el toggle de Configuraciones) no llegaría solo.
  useEffect(() => {
    player.muted = muted
  }, [muted, player])

  // Reactivo a `autoPlay` (no solo al montar): en el quiz de opciones-video hay varios
  // LessonVideo montados a la vez y solo el seleccionado debe reproducir.
  useEffect(() => {
    if (!autoPlay) {
      player.pause()
      return
    }
    // Re-seleccionar una opción ya vista tiene que volver a reproducirla:
    // play() sobre un video terminado no hace nada.
    if (hasEnded.current) {
      hasEnded.current = false
      player.replay()
    } else {
      player.play()
    }
  }, [autoPlay, player])

  useEventListener(player, 'playToEnd', () => {
    onWatched?.()
    hasEnded.current = true
  })

  const togglePlayback = () => {
    if (player.playing) {
      player.pause()
      return
    }
    if (hasEnded.current) {
      hasEnded.current = false
      player.replay()
      return
    }
    player.play()
  }

  if (status === 'error') {
    return (
      <View className={cn('items-center justify-center overflow-hidden rounded-3xl border-2 border-black/5 bg-surface', className)}>
        <Ionicons name="videocam-outline" size={compact ? 32 : 60} color="#9BA8B1" />
      </View>
    )
  }

  const video = (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%' }}
      contentFit="cover"
      nativeControls={false}
      fullscreenOptions={{ enable: false }}
      allowsPictureInPicture={false}
    />
  )

  if (!interactive) {
    return (
      <View className={cn('overflow-hidden rounded-3xl border-2 border-black/5 bg-surface', className)}>
        {video}
        {status === 'loading' && (
          <View className="absolute inset-0 items-center justify-center bg-surface/60">
            <ActivityIndicator color="#4A90E2" />
          </View>
        )}
      </View>
    )
  }

  return (
    <Pressable
      onPress={togglePlayback}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pausar video' : 'Reproducir video'}
      className={cn('overflow-hidden rounded-3xl border-2 border-black/5 bg-surface', className)}
    >
      {video}

      {status === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-surface/60">
          <ActivityIndicator color="#4A90E2" />
        </View>
      )}

      {!isPlaying && status === 'readyToPlay' && (
        <View className="absolute inset-0 items-center justify-center bg-black/10">
          <View
            className={cn(
              'items-center justify-center rounded-full bg-white/80 shadow-sm',
              compact ? 'h-10 w-10' : 'h-16 w-16',
            )}
          >
            <Ionicons name="play" size={compact ? 20 : 32} color="#4A90E2" style={{ marginLeft: 2 }} />
          </View>
        </View>
      )}
    </Pressable>
  )
}
