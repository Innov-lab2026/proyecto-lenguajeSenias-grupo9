import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { LessonStep, MatchingState } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { VideoFrame } from '@/src/components/features/lessons/VideoFrame'
import { cn } from '@/src/utils/cn'

interface MatchingStepProps {
  step: LessonStep
  matchingState: MatchingState
  onSelect: (type: 'video' | 'word', value: string) => void
  muted?: boolean
}

/** Step "matching": relacionar cada video con su palabra correspondiente. */
export function MatchingStep({ step, matchingState, onSelect, muted = false }: MatchingStepProps) {
  return (
    <View className="flex-1 w-full">
      {/* Preview del video seleccionado — el doble de alto que la fila de
          opciones (antes al revés: opciones flex-[1.5] contra video flex-1,
          por eso el video se veía chico y las opciones ocupaban de más). */}
      {matchingState.selectedVideo ? (
        <VideoFrame className="flex-1 mb-2">
          <LessonVideo
            key={matchingState.selectedVideo}
            uri={matchingState.selectedVideo}
            muted={muted}
            className="flex-1 w-full rounded-[32px]"
          />
        </VideoFrame>
      ) : (
        <VideoFrame className="flex-1 mb-2" frameClassName="items-center justify-center px-4">
          <Ionicons name="videocam-outline" size={48} color="#9BA8B1" />
          <Text className="font-nunito text-sm text-muted mt-1 text-center">Seleccioná un video</Text>
        </VideoFrame>
      )}

      <Text className="font-nunito text-lg sm:text-xl font-bold text-ink text-center py-4 px-2">{step.question}</Text>

      {/* Las columnas miden lo que ocupan sus opciones (sin `flex-1`): el alto
          de cada opción es fijo, así que si el contenedor recibía una porción
          de flex más chica que eso, los botones se derramaban por arriba sobre
          la consigna y por abajo sobre el footer. Ahora el sobrante lo absorbe
          el video, que sí puede achicarse. */}
      <View className="flex-row justify-between gap-4 mb-2 w-full max-w-2xl self-center">
        {/* Columna de Videos — altura fija por opción (h-10) y centradas como
            grupo, así no crecen más de lo necesario. */}
        <View className="w-[45%] justify-center gap-2">
          {step.pairs?.map((pair, index) => (
            <Pressable
              key={`video-${index}`}
              onPress={() => pair.videoUrl && onSelect('video', pair.videoUrl)}
              className={cn(
                'h-10 rounded-2xl border-2 items-center justify-center relative',
                matchingState.selectedVideo === pair.videoUrl
                  ? 'bg-accent/20 border-secondary'
                  : matchingState.completedPairs.has(pair.word)
                    ? 'bg-green-50 border-green-500 opacity-60'
                    : 'bg-surface border-black/5',
              )}
            >
              <Ionicons
                name={matchingState.completedPairs.has(pair.word) ? 'checkmark-circle' : 'play-circle'}
                size={20}
                color={
                  matchingState.completedPairs.has(pair.word)
                    ? '#10B981'
                    : matchingState.selectedVideo === pair.videoUrl
                      ? '#4A90E2'
                      : '#9BA8B1'
                }
              />
            </Pressable>
          ))}
        </View>

        {/* Columna de Palabras (Shuffled) */}
        <View className="w-[45%] justify-center gap-2">
          {matchingState.shuffledWords.map((word, index) => (
            <Pressable
              key={`word-${index}`}
              onPress={() => onSelect('word', word)}
              disabled={matchingState.completedPairs.has(word)}
              className={cn(
                'h-10 rounded-2xl border-2 items-center justify-center px-1',
                matchingState.selectedWord === word
                  ? 'bg-accent/20 border-secondary'
                  : matchingState.attempts[word] === 'incorrect'
                    ? 'bg-red-50 border-red-500'
                    : matchingState.completedPairs.has(word)
                      ? 'bg-green-50 border-green-500'
                      : 'bg-surface border-black/5',
              )}
            >
              <Text
                className={cn(
                  'font-nunito text-sm font-bold text-center',
                  matchingState.attempts[word] === 'incorrect'
                    ? 'text-red-600'
                    : matchingState.completedPairs.has(word)
                      ? 'text-green-600'
                      : 'text-ink',
                )}
              >
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  )
}
