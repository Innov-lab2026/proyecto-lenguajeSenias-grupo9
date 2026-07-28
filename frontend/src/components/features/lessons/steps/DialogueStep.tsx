import { Fragment } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { cn } from '@/src/utils/cn'

interface DialogueStepProps {
  step: LessonStep
  dialogueAnswers: Record<number, string>
  /** Índice (como string) del hueco seleccionado para completar con una palabra del banco. */
  selectedBlankId: string | null
  onSelectBlank: (blankId: string) => void
  onSelectWord: (option: string) => void
}

/** Step "dialogue": completar los huecos de una conversación con el banco de palabras. */
export function DialogueStep({ step, dialogueAnswers, selectedBlankId, onSelectBlank, onSelectWord }: DialogueStepProps) {
  return (
    <View className="flex-1 w-full">
      {step.videoUrl && (
        <View className="w-full items-center justify-center mb-2">
          <LessonVideo uri={step.videoUrl} className="h-[235px] aspect-[9/16]" />
        </View>
      )}

      <Text className="font-nunito text-base md:text-lg font-bold text-ink text-center mb-2">{step.question}</Text>

      {/* Dialogue Area */}
      <ScrollView className="flex-1 bg-surface rounded-2xl border-2 border-black/5 p-3 mb-2" showsVerticalScrollIndicator={false}>
        {step.dialogue?.map((line, lineIdx) => {
          const parts = line.text.split('[blank]')
          let blankCounter = 0
          const previousLinesBlanks = step.dialogue!.slice(0, lineIdx).reduce(
            (acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0),
            0,
          )

          return (
            <View
              key={lineIdx}
              className={cn('w-full mb-2', line.speaker === 'Ana' ? 'items-start' : 'items-end')}
            >
              <Text
                className={cn(
                  'font-nunito font-bold text-xs mb-0.5 px-1',
                  line.speaker === 'Ana' ? 'text-secondary' : 'text-ink/50'
                )}
              >
                {line.speaker}
              </Text>
              <View
                className={cn(
                  'max-w-[90%] rounded-xl p-2 flex-row flex-wrap items-center gap-1',
                  line.speaker === 'Ana' ? 'bg-accent/10' : 'bg-primary/10',
                )}
              >
                {parts.map((part, partIdx) => {
                  const showBlank = partIdx < parts.length - 1
                  const blankIdx = previousLinesBlanks + blankCounter
                  if (showBlank) blankCounter++

                  return (
                    <Fragment key={partIdx}>
                      <Text className="font-nunito text-sm md:text-base text-ink">{part}</Text>
                      {showBlank && (
                        <Pressable
                          onPress={() => onSelectBlank(String(blankIdx))}
                          className={cn(
                            'h-7 min-w-[52px] border-b-2 items-center justify-center px-1 mx-1',
                            selectedBlankId === String(blankIdx) ? 'border-secondary bg-accent/20' : 'border-black/20',
                          )}
                        >
                          <Text className="font-nunito text-sm md:text-base font-bold text-secondary">
                            {dialogueAnswers[blankIdx] || ''}
                          </Text>
                        </Pressable>
                      )}
                    </Fragment>
                  )
                })}
              </View>
            </View>
          )
        })}
      </ScrollView>

      {/* Word Bank */}
      <View className="flex-row flex-wrap gap-1.5 justify-center mb-2">
        {step.options?.map((option) => (
          <Pressable
            key={option}
            onPress={() => {
              if (selectedBlankId !== null) onSelectWord(option)
            }}
            className="bg-surface border-2 border-black/5 rounded-lg px-3 py-1.5"
          >
            <Text className="font-nunito text-sm md:text-base font-bold text-ink">{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
