import { Fragment } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { VideoFrame } from '@/src/components/features/lessons/VideoFrame'
import { cn } from '@/src/utils/cn'

interface DialogueCompositionStepProps {
  step: LessonStep
  compositionAnswers: (number | null)[]
  onAddWord: (optionIdx: number) => void
  onRemoveWord: (blankIdx: number) => void
  isLocked: boolean
  muted?: boolean
  onVideoWatched?: () => void
}

/** Step "dialogue-composition": formar una frase a partir del banco de palabras en el orden correcto dentro de una burbuja de diálogo. */
export function DialogueCompositionStep({
  step,
  compositionAnswers,
  onAddWord,
  onRemoveWord,
  isLocked,
  muted = false,
  onVideoWatched,
}: DialogueCompositionStepProps) {
  const lines = step.sentence?.split('\n') || []
  let blankCounter = 0

  return (
    <View className="flex-1 w-full">
      {step.videoUrl ? (
        <VideoFrame className="flex-[4] mb-1" style={{ maxHeight: '74%' }}>
          <LessonVideo uri={step.videoUrl} muted={muted} onWatched={onVideoWatched} className="flex-1 w-full rounded-[32px]" />
        </VideoFrame>
      ) : step.videoId ? (
        // El video es obligatorio para avanzar: si su id no está en el catálogo
        // hay que decirlo, no dejar el espacio vacío y el botón sin explicación.
        <VideoFrame
          className="flex-[4] mb-1"
          style={{ maxHeight: '74%' }}
          frameClassName="items-center justify-center px-4"
        >
          <Ionicons name="cloud-offline-outline" size={48} color="#9BA8B1" />
          <Text className="font-nunito text-sm text-muted text-center mt-2">
            No pudimos cargar el video de este ejercicio. Revisá tu conexión y volvé a entrar a la
            lección.
          </Text>
        </VideoFrame>
      ) : null}

      {/* Contenedor inferior empujado hacia abajo para dar más espacio al video */}
      <View className="mt-auto gap-y-2">
        {/* Enunciado/Pregunta */}
        <Text className="font-nunito text-sm md:text-base font-bold text-ink text-center px-2">
          {step.question}
        </Text>

        {/* Burbuja del diálogo */}
        <View className="mb-2 p-2.5 rounded-2xl border bg-[#EAF8FF] border-[#BEE3F8] self-center items-start min-w-[70%] max-w-[85%]">
          <Text className="font-nunito text-xs font-bold text-secondary mb-1">
            {step.speaker}
          </Text>
          <View className="w-full gap-y-1">
            {lines.map((line, lineIdx) => {
              const parts = line.split('[blank]')
              return (
                <View key={lineIdx} className="flex-row items-center flex-wrap gap-x-1 gap-y-1">
                  {parts.map((part, index) => {
                    const showBlank = index < parts.length - 1
                    const currentBlankIdx = blankCounter
                    if (showBlank) blankCounter++

                    const trimmedPart = part.trim()

                    return (
                      <Fragment key={index}>
                        {trimmedPart !== '' && (
                          <Text className="font-nunito text-sm md:text-base text-ink">
                            {trimmedPart}
                          </Text>
                        )}
                        {showBlank && (() => {
                          const selectedOptionIdx = compositionAnswers[currentBlankIdx]
                          const hasValue = selectedOptionIdx !== null && selectedOptionIdx !== undefined
                          const wordText = hasValue ? step.options?.[selectedOptionIdx] : ''

                          return (
                            <Pressable
                              onPress={() => hasValue && !isLocked && onRemoveWord(currentBlankIdx)}
                              disabled={!hasValue || isLocked}
                              className={cn(
                                'h-8 px-2 rounded-lg justify-center items-center',
                                hasValue
                                  ? 'bg-surface border-2 border-secondary shadow-sm active:opacity-85'
                                  : 'bg-black/5 border-2 border-dashed border-black/10 min-w-[64px]'
                              )}
                            >
                              <Text
                                className={cn(
                                  'font-nunito font-bold text-xs md:text-sm',
                                  hasValue ? 'text-ink' : 'text-transparent'
                                )}
                              >
                                {wordText || 'blank'}
                              </Text>
                            </Pressable>
                          )
                        })()}
                      </Fragment>
                    )
                  })}
                </View>
              )
            })}
          </View>
        </View>
      </View>

      {/* Banco de Palabras */}
      <View className="flex-row flex-wrap gap-2 justify-center mb-3 w-full max-w-md self-center px-2">
        {step.options?.map((option, index) => {
          const isUsed = compositionAnswers.includes(index)

          return (
            <Pressable
              key={`${option}-${index}`}
              onPress={() => !isUsed && !isLocked && onAddWord(index)}
              disabled={isUsed || isLocked}
              className={cn(
                'rounded-xl border-2 justify-center items-center px-3 py-2 min-w-[64px]',
                isUsed
                  ? 'bg-black/5 border-black/5 opacity-20'
                  : 'bg-surface border-black/10 shadow-sm active:bg-accent/10 active:border-secondary'
              )}
            >
              <Text
                className={cn(
                  'font-nunito font-bold text-center text-sm md:text-base',
                  isUsed ? 'text-transparent' : 'text-ink'
                )}
              >
                {option}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
