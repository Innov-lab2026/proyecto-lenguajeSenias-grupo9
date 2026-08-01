import { useEffect, useState } from 'react'
import { Pressable, Text, View, Modal, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { LessonFooter } from '@/src/components/features/lessons/LessonFooter'
import { HintModal } from '@/src/components/features/lessons/HintModal'
import { PauseModal } from '@/src/components/features/lessons/PauseModal'
import { setItem, deleteItem } from '@/src/lib/storage'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { VideoFrame } from '@/src/components/features/lessons/VideoFrame'
import { useVideos } from '@/src/hooks/features/alphabet/useVideos'
import { useCompleteLetter } from '@/src/hooks/features/alphabet/useCompleteLetter'
import { useFavoritesStore } from '@/src/store/favoritesStore'
import { usePreferencesStore } from '@/src/store/preferencesStore'
import { WebView } from 'react-native-webview'
import { Image } from 'expo-image'

export default function LetterScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ letter?: string }>()
  const letter = Array.isArray(params.letter) ? params.letter[0] : params.letter
  const [showPractice, setShowPractice] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const isMuted = usePreferencesStore((s) => s.isMuted)

  const handlePauseExit = () => {
    if (letter) {
      setItem('paused_letter', letter).catch((err) =>
        console.error('[alphabet] error guardando letra pausada:', err)
      )
    }
    setShowPauseModal(false)
    router.replace('/home')
  }

  const handleNormalBack = () => {
    deleteItem('paused_letter').catch((err) =>
      console.error('[alphabet] error eliminando letra pausada:', err)
    )
    router.replace('/alphabet')
  }

  const favoritesStore = useFavoritesStore()

  // Hidratar favoritos al montar
  useEffect(() => {
    favoritesStore.loadFavorites()
  }, [])

  const isFavorite = letter ? favoritesStore.isFavorite('letter-' + letter) : false

  const videosQuery = useVideos()
  // Match por título exacto (mayúsculas): así están cargados en la DB.
  const video = videosQuery.data?.find((v) => v.title.trim().toUpperCase() === letter?.toUpperCase())

  // Marcar la letra como vista: recién cuando existe el video, no al entrar.
  // Hay letras sin grabar (la Y, hoy) y no tiene sentido acreditarlas por
  // mostrar el placeholder de "todavía no hay video".
  //
  // Se dispara una vez por visita, sin chequear antes si ya estaba: la RPC es
  // idempotente (devuelve success: false y no acredita de nuevo), así que el
  // costo de revisitar es un POST de más, no progreso duplicado.
  const { mutate: markLetterSeen, error: markLetterError } = useCompleteLetter()

  // Depende de `video?.id` y no de `video`: un refetch del catálogo devuelve
  // objetos nuevos con el mismo contenido, y eso volvería a disparar el efecto.
  const videoId = video?.id

  useEffect(() => {
    if (!letter || !videoId) return
    markLetterSeen(letter, {
      onError: (err) => {
        // El detalle técnico (puede ser un error crudo de Postgres, ej. si la
        // migración de CH/LL/RR todavía no corrió) queda sólo en consola —
        // nunca se muestra tal cual al usuario.
        console.error('[alphabet] no se pudo registrar la letra vista:', err)
      },
    })
  }, [letter, videoId, markLetterSeen])

  const practiceUrl = 'https://matiascodeds-lsa-fingerspelling.hf.space'

  const handleOpenPractice = () => {
    setShowPractice(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-5 pb-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-1">
            <Text className="font-nunito text-2xl font-bold text-ink">Letra {letter ?? '?'}</Text>
            <Text className="font-nunito text-xs text-muted">
              {'Mirá el video para aprender la seña. Después, ¡practicá vos!'}
            </Text>
          </View>
        </View>

        {/* No bloquea la pantalla: el video se puede seguir viendo igual,
            sólo falló acreditar el progreso de esta letra. */}
        {markLetterError ? (
          <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text className="flex-1 font-nunito text-xs font-bold text-red-600">
              No pudimos guardar tu progreso en esta letra. Podés seguir viendo el video igual.
            </Text>
          </View>
        ) : null}

        {/* Content Area */}
        <View className="flex-1 items-center justify-top py-4">
          {video ? (
            <VideoFrame className="mb-2">
              <LessonVideo
                uri={video.url}
                className="flex-1 w-full rounded-[32px]"
                muted={isMuted}
              />
            </VideoFrame>
          ) : (
            <VideoFrame className="mb-2" frameClassName="items-center justify-center">
              <Ionicons
                name={videosQuery.isPending ? 'hourglass-outline' : 'videocam-outline'}
                size={80}
                color="#9BA8B1"
              />
              <Text className="px-4 mt-4 text-center font-nunito text-sm text-muted">
                {videosQuery.isPending
                  ? 'Cargando video...'
                  : 'Todavía no hay un video grabado para esta letra.'}
              </Text>
            </VideoFrame>
          )}
        </View>

      </View>

      {/* Navbar inferior estilo LessonFooter */}
      <LessonFooter
        ctaLabel="Practicar"
        ctaDisabled={false}
        onNext={handleOpenPractice}
        showBack={true}
        onBack={handleNormalBack}
        onSettings={() => setShowPauseModal(true)}
        isFavorite={isFavorite}
        onToggleFavorite={() => {
          if (!letter || !video) return
          favoritesStore.toggleFavorite({
            id: 'letter-' + letter,
            type: 'letter',
            title: `Letra ${letter}`,
            videoUrl: video.url,
            letter: letter,
          })
        }}
        hintViewed={false}
        onHint={() => setShowHint(true)}
      />

      <HintModal
        visible={showHint}
        tip={`Observá bien la posición de los dedos para formar la letra ${letter ?? ''}.`}
        onClose={() => setShowHint(false)}
      />

      <PauseModal
        visible={showPauseModal}
        title="Práctica pausada"
        message={`Podés continuar aprendiendo la letra ${letter ?? ''} ahora o volver más tarde.`}
        onClose={() => setShowPauseModal(false)}
        onExit={handlePauseExit}
      />

      {/* Práctica embebida: iframe en web, WebView en nativo. En web no se abre
          en pestaña nueva a propósito — el Space necesita permiso de cámara y
          se pierde el contexto de la app al salir. */}
      <Modal
        visible={showPractice}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPractice(false)}
      >
        <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
          {/* Header vacío celeste para empujar el texto del Iframe/Gradio hacia abajo */}
          <View className="h-12 bg-[#F0F9FF] w-full" />

          {/* Contenedor del Iframe/WebView con overflow-hidden para recortar el footer de Gradio */}
          <View className="flex-1 overflow-hidden">
            {Platform.OS === 'web' ? (
              // allow="camera": el Space usa la cámara para reconocer la seña.
              <iframe
                src={practiceUrl}
                allow="camera; microphone"
                style={{ flex: 1, border: 'none', width: '100%', height: '100%', marginBottom: -50 }}
                title="Práctica de Señas"
              />
            ) : (
              <WebView
                source={{ uri: practiceUrl }}
                style={{ flex: 1, marginBottom: -50 }}
                startInLoadingState
                renderLoading={() => (
                  <View className="absolute inset-0 items-center justify-center bg-surface">
                    <ActivityIndicator size="large" color="#4A90E2" />
                  </View>
                )}
              />
            )}
          </View>

          {/* Navbar inferior del modal usando LessonFooter configurada solo con el botón volver */}
          <LessonFooter
            ctaLabel=""
            ctaDisabled={false}
            onNext={() => {}}
            showBack={true}
            onBack={() => setShowPractice(false)}
            onSettings={() => {}}
            isFavorite={false}
            onToggleFavorite={() => {}}
            hintViewed={false}
            onHint={() => {}}
            showSettingsButton={false}
            showFavoriteButton={false}
            showHintButton={false}
            showCTA={false}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}