import { Fragment } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { VideoFrame } from '@/src/components/features/lessons/VideoFrame'
import { cn } from '@/src/utils/cn'

interface CompositionStepProps {
  step: LessonStep
  compositionAnswers: (number | null)[]
  onAddWord: (optionIdx: number) => void
  onRemoveWord: (blankIdx: number) => void
  isLocked: boolean
  muted?: boolean
}

/** Step "composition": formar una frase a partir del banco de palabras en el orden correcto. */
export function CompositionStep({
  step,
  compositionAnswers,
  onAddWord,
  onRemoveWord,
  isLocked,
  muted = false,
}: CompositionStepProps) {
  const parts = step.sentence?.split('[blank]') || []
  const isSingleLetter = step.options?.every(opt => opt.length <= 2) || step.id === 'm2-l4-composition'
  let blankCounter = 0

  return (
    <View className="flex-1 w-full">
      {step.videoUrl ? (
        <VideoFrame className="flex-[2.5] mb-1" style={{ maxHeight: '68%' }}>
          <LessonVideo uri={step.videoUrl} muted={muted} className="flex-1 w-full rounded-[32px]" />
        </VideoFrame>
      ) : null}

      {/* Enunciado/Pregunta */}
      <Text className="font-nunito text-base font-bold text-ink text-center py-1 px-2">
        {step.question}
      </Text>

      {/* Slots de la oración */}
      <View className={cn(
        "flex-row items-center justify-center bg-surface rounded-2xl border-2 border-black/5 mb-2 min-h-[46px]",
        isSingleLetter ? "gap-x-0.5 px-2 py-1" : "gap-x-1 px-3 py-1.5"
      )}>
        {parts.map((part, index) => {
          const showBlank = index < parts.length - 1
          const currentBlankIdx = blankCounter
          if (showBlank) blankCounter++

          const trimmedPart = part.trim()

          return (
            <Fragment key={index}>
              {trimmedPart !== '' && (
                <Text className="font-nunito text-base md:text-lg font-bold text-ink">
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
                      isSingleLetter ? 'h-8 px-1 rounded-lg' : 'h-9 px-3 rounded-xl',
                      'justify-center items-center',
                      hasValue
                        ? 'bg-surface border-2 border-[#518BC9] shadow-sm active:opacity-85'
                        : isSingleLetter 
                          ? 'bg-black/5 border-2 border-dashed border-black/10 min-w-[28px]'
                          : 'bg-black/5 border-2 border-dashed border-black/10 min-w-[60px]'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-nunito font-bold',
                        isSingleLetter ? 'text-xs md:text-sm' : 'text-sm md:text-base',
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

      {/* Banco de Palabras */}
      <View className="flex-row flex-wrap gap-2 justify-center mt-auto mb-3 w-full max-w-md self-center px-2">
        {step.options?.map((option, index) => {
          const isUsed = compositionAnswers.includes(index)

          return (
            <Pressable
              key={`${option}-${index}`}
              onPress={() => !isUsed && !isLocked && onAddWord(index)}
              disabled={isUsed || isLocked}
              className={cn(
                'rounded-xl border-2 justify-center items-center',
                isSingleLetter 
                  ? 'px-2 py-1 min-w-[36px] h-9' 
                  : 'px-3 py-2 min-w-[64px]',
                isUsed
                  ? 'bg-black/5 border-black/5 opacity-20'
                  : 'bg-surface border-black/10 shadow-sm active:bg-accent/10 active:border-secondary'
              )}
            >
              <Text
                className={cn(
                  'font-nunito font-bold text-center',
                  isSingleLetter ? 'text-xs md:text-sm' : 'text-sm md:text-base',
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
