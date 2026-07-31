import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useVideos } from '@/src/hooks/features/alphabet/useVideos'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { Button } from '@/src/components/common/Button'
import type { Video } from '@/src/types/progress'

// Pantalla temporal para revisar de un vistazo todo el catálogo de `videos` de
// la DB (sin pasar por lecciones/abecedario). Pensada para borrarse una vez
// que se termine de auditar el contenido.
export default function DebugVideosScreen() {
  const insets = useSafeAreaInsets()
  const { data: videos, isPending, isError, refetch } = useVideos()
  const [selected, setSelected] = useState<Video | null>(null)

  const sortedVideos = useMemo(
    () => [...(videos ?? [])].sort((a, b) => a.title.localeCompare(b.title, 'es')),
    [videos],
  )

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#4A90E2" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Text className="text-center font-nunito text-lg font-bold text-ink">
          No pudimos cargar los videos
        </Text>
        <Button label="Reintentar" onPress={() => void refetch()} className="mt-1 max-w-xs" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-5 pb-3 pt-4">
        <Text className="font-nunito text-2xl font-bold text-ink">Videos (temporal)</Text>
        <Text className="font-nunito text-sm text-muted">{sortedVideos.length} videos</Text>
      </View>

      <View className="items-center px-5 pb-4">
        {selected ? (
          <LessonVideo uri={selected.url} className="aspect-[9/16] w-full max-w-xs" />
        ) : (
          <View className="aspect-[9/16] w-full max-w-xs items-center justify-center rounded-3xl border-2 border-dashed border-black/10 bg-surface">
            <Text className="px-6 text-center font-nunito text-sm text-muted">
              Seleccioná un video de la lista
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-xl gap-2 px-5 pb-20"
        showsVerticalScrollIndicator={false}
      >
        {sortedVideos.map((video) => {
          const isSelected = selected?.id === video.id
          return (
            <Pressable
              key={video.id}
              onPress={() => setSelected(video)}
              accessibilityRole="button"
              accessibilityLabel={`Reproducir ${video.title}`}
              className={`rounded-2xl border-2 px-4 py-3 ${
                isSelected ? 'border-primary bg-primary/10' : 'border-black/5 bg-surface'
              }`}
            >
              <Text className="font-nunito text-base font-bold text-ink">{video.title}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
