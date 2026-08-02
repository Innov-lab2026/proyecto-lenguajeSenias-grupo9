import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { VideoFrame } from '@/src/components/features/lessons/VideoFrame'
import { cn } from '@/src/utils/cn'

interface ContentStepProps {
  step: LessonStep
  selectedOption: string | null
  onSelectOption: (option: string) => void
  onWatched: (key: string) => void
  muted?: boolean
}

/**
 * A partir de acá una etiqueta no entra en un tercio de pantalla angosta y se
 * corta. Sale de medir el caso real: con 3 botones en fila a 360px a cada texto
 * le quedan ~50px, que alcanza para "Más o menos" (11) pero no para
 * "¿cómo te llamás?" (16).
 */
const MAX_CHARS_EN_FILA = 12

/** Step "content": muestra una seña (video único) o un selector de señas relacionadas. */
export function ContentStep({ step, selectedOption, onSelectOption, onWatched, muted = false }: ContentStepProps) {
  // Grilla de 2 columnas en vez de una fila: con 4 opciones porque no entran, y
  // con etiquetas largas porque se truncarían. Se decide por el contenido y no
  // por el id del step, así una opción larga nueva queda contemplada sola.
  const options = step.options ?? []
  const useGrid = options.length === 4 || options.some((option) => option.length > MAX_CHARS_EN_FILA)

  return (
    <View className="flex-1 w-full">
      {!step.options ? (
        <VideoFrame className="mb-2">
          <LessonVideo
            uri={step.videoUrl!}
            muted={muted}
            onWatched={() => onWatched('main')}
            className="flex-1 w-full rounded-[32px]"
          />
        </VideoFrame>
      ) : selectedOption && step.videoUrls?.[selectedOption] ? (
        <VideoFrame className="mb-2">
          <LessonVideo
            key={selectedOption}
            uri={step.videoUrls[selectedOption]}
            muted={muted}
            onWatched={() => onWatched(selectedOption)}
            className="flex-1 w-full rounded-[32px]"
          />
        </VideoFrame>
      ) : (
        <VideoFrame className="mb-2" frameClassName="items-center justify-center px-4">
          <Ionicons name="videocam-outline" size={60} color="#9BA8B1" />
          <Text className="font-nunito text-muted mt-2 text-center text-sm">
            Elegí una opción para ver el video
          </Text>
        </VideoFrame>
      )}

      <Text className="font-nunito text-lg sm:text-xl font-bold text-ink text-center py-4 px-2">
        {step.contentTitle}
      </Text>

      {step.options && (
        <View
          className={cn(
            useGrid
              ? 'flex-row flex-wrap justify-between gap-y-2 w-full mb-2'
              : cn(
                step.id === 'm1-l2-content-interactive' ||
                  step.id === 'm1-l3-content-interactive' ||
                  step.id === 'm1-l4-content-interactive' ||
                  step.id === 'm1-l5-content-1' ||
                  step.id === 'm2-l2-content-interactive' ||
                  step.id === 'm2-l4-content-interactive'
                  ? 'flex-row'
                  : 'flex-col md:flex-row',
                'gap-2 mb-2'
              )
          )}
        >
          {step.options.map((option) => (
            <Pressable
              key={option}
              onPress={() => onSelectOption(option)}
              className={cn(
                useGrid
                  ? 'h-12 w-[48%] rounded-2xl border-2 flex-row items-center justify-center px-3'
                  : 'flex-1 h-12 rounded-2xl border-2 flex-row items-center justify-center px-4',
                selectedOption === option ? 'bg-accent/20 border-secondary' : 'bg-surface border-black/5',
              )}
            >
              <Ionicons
                name="play"
                size={16}
                color={selectedOption === option ? '#4A90E2' : '#9BA8B1'}
                style={{ marginRight: 6 }}
              />
              <Text
                numberOfLines={2}
                className="font-nunito text-xs sm:text-sm font-bold text-ink text-center flex-1 leading-tight"
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}
