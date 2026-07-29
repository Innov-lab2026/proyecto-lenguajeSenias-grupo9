import { Fragment } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
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
  let blankCounter = 0

  return (
    <View className="flex-1 w-full">
      {step.videoUrl && (
        <View className="w-full flex-1 items-center justify-center mb-4" style={{ maxHeight: '50%' }}>
          {/* El video principal del step */}
          <View className="w-full flex-1 rounded-[40px] border border-muted/20 bg-surface p-2 shadow-sm relative">
            <LessonVideo uri={step.videoUrl} muted={muted} className="flex-1 w-full rounded-[32px]" />
          </View>
        </View>
      )}

      {/* Enunciado/Pregunta */}
      <Text className="font-nunito text-xl font-bold text-ink text-center py-4 px-2">
        {step.question}
      </Text>

      {/* Slots de la oración */}
      <View className="flex-row items-center justify-center gap-x-1 bg-surface rounded-2xl border-2 border-black/5 px-3 py-3 mb-4 min-h-[56px]">
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
                      'h-9 px-3 rounded-xl justify-center items-center',
                      hasValue
                        ? 'bg-surface border-2 border-[#518BC9] shadow-sm active:opacity-85'
                        : 'bg-black/5 border-2 border-dashed border-black/10 min-w-[60px]'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-nunito text-sm md:text-base font-bold',
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
      <View className="flex-row flex-wrap gap-2.5 justify-center mt-auto mb-6 w-full max-w-md self-center px-2">
        {step.options?.map((option, index) => {
          const isUsed = compositionAnswers.includes(index)

          return (
            <Pressable
              key={`${option}-${index}`}
              onPress={() => !isUsed && !isLocked && onAddWord(index)}
              disabled={isUsed || isLocked}
              className={cn(
                'rounded-xl border-2 px-4 py-2.5 justify-center items-center min-w-[80px]',
                isUsed
                  ? 'bg-black/5 border-black/5 opacity-20'
                  : 'bg-surface border-black/10 shadow-sm active:bg-accent/10 active:border-secondary'
              )}
            >
              <Text
                className={cn(
                  'font-nunito text-sm md:text-base font-bold text-center',
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
