import { Pressable, Text, View } from 'react-native'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { cn } from '@/src/utils/cn'

interface QuizStepProps {
  step: LessonStep
  /** Opciones a mostrar, ya resueltas por el padre (mezcladas si corresponde). */
  options: string[]
  selectedOption: string | null
  onSelectOption: (option: string) => void
  /** true cuando el step ya fue respondido correctamente (deshabilita la selección). */
  isLocked: boolean
  muted?: boolean
}

/** Step "quiz": video principal + opciones de texto, o una grilla de videos para elegir. */
export function QuizStep({ step, options, selectedOption, onSelectOption, isLocked, muted = false }: QuizStepProps) {
  if (step.videoUrl) {
    return (
      <View className="flex-1 w-full">
        <View className="flex-1 w-full items-center justify-center mb-2">
          <LessonVideo uri={step.videoUrl} muted={muted} className="h-full max-h-[560px] aspect-[9/16]" />
        </View>

        <Text className="font-nunito text-lg md:text-xl font-bold text-ink text-center mb-2">{step.question}</Text>

        <View className="flex-col md:flex-row gap-2 mb-2">
          {step.options?.map((option) => (
            <Pressable
              key={option}
              onPress={() => !isLocked && onSelectOption(option)}
              disabled={isLocked}
              className={cn(
                'flex-1 h-12 rounded-2xl border-2 items-center justify-center',
                selectedOption === option ? 'bg-accent/20 border-secondary' : 'bg-surface border-black/5',
                isLocked && 'opacity-80',
              )}
            >
              <Text className="font-nunito text-sm font-bold text-ink">{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 flex-col md:flex-row justify-center gap-2 mb-2 w-full max-w-5xl">
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => !isLocked && onSelectOption(option)}
            disabled={isLocked}
            className={cn(
              'flex-1 w-full md:w-[48%] rounded-2xl border-2 items-center justify-center p-2 relative overflow-hidden',
              selectedOption === option ? 'bg-accent/20 border-secondary' : 'bg-surface border-black/5',
              isLocked && 'opacity-80',
            )}
          >
            <View className="w-full h-full min-h-[160px] rounded-xl overflow-hidden relative">
              <LessonVideo
                uri={step.videoUrls?.[option] ?? ''}
                muted={muted}
                autoPlay={selectedOption === option}
                interactive={false}
                compact
                className="h-full w-full"
              />
              <View className="absolute bottom-1 inset-x-1 bg-black/40 rounded-md px-1.5 py-0.5">
                <Text className="font-nunito text-xs text-white font-bold text-center">{option}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <Text className="font-nunito text-lg md:text-xl font-bold text-ink text-center mb-2">{step.question}</Text>
    </View>
  )
}
