import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { VideoFrame } from '@/src/components/features/lessons/VideoFrame'

interface DialogueSequenceStepProps {
  step: LessonStep
  muted?: boolean
  onVideoWatched?: () => void
}

/** Step "dialogue-sequence": reproduce en bucle la secuencia de videos del diálogo y muestra el diálogo estático completo abajo. */
export function DialogueSequenceStep({
  step,
  muted = false,
  onVideoWatched,
}: DialogueSequenceStepProps) {
  const urls = step.videoSequenceUrls || []
  const [currentIdx, setCurrentIdx] = useState(0)
  const currentUrl = urls[currentIdx]

  // Reinicia el índice si cambian los videos
  useEffect(() => {
    setCurrentIdx(0)
  }, [step.videoSequenceUrls])

  const handleVideoEnded = () => {
    if (urls.length > 0) {
      const nextIdx = (currentIdx + 1) % urls.length
      setCurrentIdx(nextIdx)
      // Si dio toda la vuelta, se reprodujo la conversación completa
      if (nextIdx === 0) {
        onVideoWatched?.()
      }
    }
  }

  return (
    <View className="flex-1 w-full">
      {currentUrl ? (
        <VideoFrame className="flex-[5] mb-1" style={{ maxHeight: '76%' }}>
          <LessonVideo
            key={currentUrl}
            uri={currentUrl}
            muted={muted}
            onWatched={handleVideoEnded}
            className="flex-1 w-full rounded-[32px]"
          />
        </VideoFrame>
      ) : null}

      {/* Contenedor inferior empujado hacia abajo para dar más espacio al video */}
      <View className="mt-auto gap-y-2 mb-3">
        {/* Enunciado/Pregunta */}
        <Text className="font-nunito text-sm md:text-base font-bold text-ink text-center px-2">
          {step.question || 'Observá la conversación completa.'}
        </Text>

        {/* Diálogo Completo (no interactivo, globos estáticos) */}
        <View className="items-center justify-center w-full px-2">
          {step.dialogue?.map((line, lineIdx) => {
            return (
              <View
                key={lineIdx}
                className="p-2.5 rounded-2xl border bg-[#EAF8FF] border-[#BEE3F8] self-center items-start min-w-[70%] max-w-[85%]"
              >
                <Text className="font-nunito text-xs font-bold text-secondary mb-1">
                  {line.speaker}
                </Text>
                <Text className="font-nunito text-sm md:text-base text-ink">
                  {line.text}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}
