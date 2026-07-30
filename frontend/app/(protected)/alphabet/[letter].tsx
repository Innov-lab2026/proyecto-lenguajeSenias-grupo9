import { useEffect, useState } from 'react'
import { Pressable, Text, View, Modal, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { useVideos } from '@/src/hooks/features/alphabet/useVideos'
import { useCompleteLetter } from '@/src/hooks/features/alphabet/useCompleteLetter'
import { useFavoritesStore } from '@/src/store/favoritesStore'
import { WebView } from 'react-native-webview'
import { Image } from 'expo-image'

export default function LetterScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ letter?: string }>()
  const letter = Array.isArray(params.letter) ? params.letter[0] : params.letter
  const [showPractice, setShowPractice] = useState(false)

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
        <View className="flex-row items-center justify-between w-full relative">
          <View className="flex-1 pr-12">
            <Text className="font-nunito text-2xl font-bold text-ink">Letra {letter ?? '?'}</Text>
            <Text className="font-nunito text-xs text-muted">
              {'Mirá el video para aprender la seña. Después, ¡practicá vos!'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.replace('/alphabet')}
            accessibilityRole="button"
            accessibilityLabel="Volver al Abecedario"
            hitSlop={12}
            className="absolute top-0 right-0 h-10 w-10 items-center justify-center active:scale-95 z-20"
          >
            <Ionicons name="arrow-undo" size={32} color="#518BC9" />
          </Pressable>
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
        <View className="flex-1 items-center justify-center py-2">
          <View className="w-full flex-1 max-h-[85%] rounded-[40px] border border-muted/20 bg-surface p-2 shadow-sm relative">
            {video ? (
              <LessonVideo
                uri={video.url}
                className="flex-1 w-full rounded-[32px]"
              />
            ) : (
              <View className="flex-1 items-center justify-center rounded-[32px] border border-dashed border-muted/40 bg-muted/10 overflow-hidden">
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
              </View>
            )}
            {/* Favorite button – Instagram-style overlay */}
            <Pressable
              onPress={() => {
                if (!letter || !video) return
                favoritesStore.toggleFavorite({
                  id: 'letter-' + letter,
                  type: 'letter',
                  title: `Letra ${letter}`,
                  videoUrl: video.url,
                  letter: letter
                })
              }}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              hitSlop={8}
              className="absolute bottom-4 right-4 h-11 w-11 items-center justify-center rounded-full bg-black/30"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#EF4444" : "#FFFFFF"}
              />
            </Pressable>
          </View>
        </View>

        {/* Footer Action */}
        <View className="mt-auto">
          <Button
            label="Practicar"
            onPress={handleOpenPractice}
            leftIcon={<Ionicons name="play-outline" size={20} color="#1F2937" />}
          />
        </View>
      </View>

      {/* Práctica embebida: iframe en web, WebView en nativo. En web no se abre
          en pestaña nueva a propósito — el Space necesita permiso de cámara y
          se pierde el contexto de la app al salir. */}
      <Modal
        visible={showPractice}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPractice(false)}
      >
        <SafeAreaView className="flex-1 bg-surface">
          <View className="h-14 flex-row items-center justify-end px-5 border-b border-black/5 bg-[#F0F7FF]">
            <Pressable
              onPress={() => setShowPractice(false)}
              className="p-1 active:scale-95"
              accessibilityRole="button"
              accessibilityLabel="Cerrar práctica"
            >
              <Ionicons name="arrow-undo" size={32} color="#518BC9" />
            </Pressable>
          </View>

          {Platform.OS === 'web' ? (
            // allow="camera": el Space usa la cámara para reconocer la seña.
            <iframe
              src={practiceUrl}
              allow="camera; microphone"
              style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
              title="Práctica de Señas"
            />
          ) : (
            <WebView
              source={{ uri: practiceUrl }}
              className="flex-1"
              startInLoadingState
              renderLoading={() => (
                <View className="absolute inset-0 items-center justify-center bg-surface">
                  <ActivityIndicator size="large" color="#4A90E2" />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}