import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { VideoFrame } from '@/src/components/features/lessons/VideoFrame'
import { cn } from '@/src/utils/cn'

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

  // Mismo criterio de color que DialogueExercise: el primer hablante en
  // aparecer va en azul, el segundo en naranja — por orden de aparición, no
  // por nombre, así funciona para cualquier par de hablantes.
  const uniqueSpeakers = Array.from(
    new Set((step.dialogue ?? []).map((line) => line.speaker.toLowerCase())),
  )

  // `resolveStepVideos` descarta en silencio los ids que no están en el catálogo:
  // si no quedó ninguno, el step no tiene nada que reproducir.
  const hasMissingVideos = (step.videoSequenceIds?.length ?? 0) > 0 && urls.length === 0

  // Reinicia la secuencia al cambiar de step.
  //
  // ⚠️ Depende del id del step y NO de `step.videoSequenceUrls`: ese array lo
  // rearma `resolveStepVideos` cada vez que se recalcula `lesson` (pasa si se
  // refetchea el catálogo de videos, con staleTime de 5 min), así que como
  // dependencia se compara por referencia y reiniciaría la conversación desde
  // el primer video a mitad de reproducción.
  useEffect(() => {
    setCurrentIdx(0)
  }, [step.id])

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
      ) : hasMissingVideos ? (
        // Sin ningún video resuelto no hay forma de completar el step (avanzar
        // exige verlos), así que se explica en vez de dejar el hueco en blanco.
        <VideoFrame
          className="flex-[5] mb-1"
          style={{ maxHeight: '76%' }}
          frameClassName="items-center justify-center px-4"
        >
          <Ionicons name="cloud-offline-outline" size={48} color="#9BA8B1" />
          <Text className="font-nunito text-sm text-muted text-center mt-2">
            No pudimos cargar los videos de esta conversación. Revisá tu conexión y volvé a entrar
            a la lección.
          </Text>
        </VideoFrame>
      ) : null}

      {/* Contenedor inferior empujado hacia abajo para dar más espacio al video */}
      <View className="mt-auto gap-y-2 mb-3">
        {/* Enunciado/Pregunta */}
        <Text className="font-nunito text-sm md:text-base font-bold text-ink text-center px-2">
          {step.question || 'Observá la conversación completa.'}
        </Text>

        {/* Diálogo completo en un único recuadro (no interactivo): una
            transcripción de la charla, no un globo por línea. Cada línea
            conserva el nombre de su hablante, coloreado. */}
        <View className="w-full px-2">
          <View className="p-3 rounded-2xl border bg-[#EAF8FF] border-[#BEE3F8] w-full max-w-[90%] self-center gap-1.5">
            {step.dialogue?.map((line, lineIdx) => {
              const isFirstSpeaker = uniqueSpeakers.indexOf(line.speaker.toLowerCase()) === 0

              // Nombre y texto en un solo renglón (antes en dos): en pantallas
              // bajas el video es lo que necesita el espacio, no la transcripción.
              // Un <Text> anidado permite que el nombre mantenga su color propio
              // dentro de la misma línea que el resto del texto.
              return (
                <Text key={lineIdx} className="font-nunito text-sm md:text-base text-ink">
                  <Text
                    className={cn(
                      'font-bold',
                      isFirstSpeaker ? 'text-secondary' : 'text-[#D97706]',
                    )}
                  >
                    {line.speaker}:{' '}
                  </Text>
                  {line.text}
                </Text>
              )
            })}
          </View>
        </View>
      </View>
    </View>
  )
}
