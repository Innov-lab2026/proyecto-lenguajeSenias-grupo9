import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { cn } from '@/src/utils/cn'

interface ContentStepProps {
  step: LessonStep
  selectedOption: string | null
  onSelectOption: (option: string) => void
  onWatched: (key: string) => void
}

const OPTION_EMOJIS: Record<string, string> = {
  // Lección 2
  'Bien': '😊',
  'Más o menos': '😐',
  'Mal': '😢',
  // Lección 4
  'Por favor': '🙏',
  'Gracias': '🙌',
  'De nada': '🤝',
}

/** Step "content": muestra una seña (video único) o un selector de señas relacionadas. */
export function ContentStep({ step, selectedOption, onSelectOption, onWatched }: ContentStepProps) {
  return (
    <View className="flex-1 w-full">
      <View className="flex-1 w-full items-center justify-center mb-2">
        {!step.options ? (
          <LessonVideo
            uri={step.videoUrl!}
            onWatched={() => onWatched('main')}
            className="h-full max-h-[560px] aspect-[9/16]"
          />
        ) : selectedOption && step.videoUrls?.[selectedOption] ? (
          <LessonVideo
            key={selectedOption}
            uri={step.videoUrls[selectedOption]}
            onWatched={() => onWatched(selectedOption)}
            className="h-full max-h-[560px] aspect-[9/16]"
          />
        ) : (
          <View className="h-full max-h-[560px] aspect-[9/16] items-center justify-center rounded-3xl border-2 border-black/5 bg-surface px-4">
            <Ionicons name="videocam-outline" size={60} color="#9BA8B1" />
            <Text className="font-nunito text-muted mt-2 text-center text-sm">
              Elegí una opción para ver el video
            </Text>
          </View>
        )}
      </View>

      <Text className="font-nunito text-xl md:text-2xl font-bold text-ink text-center mb-2">
        {selectedOption || step.contentTitle}
      </Text>

      {step.options && (
        <View className="flex-row gap-2.5 mb-2 w-full max-w-md self-center">
          {step.options.map((option) => {
            const emoji = OPTION_EMOJIS[option]
            return (
              <Pressable
                key={option}
                onPress={() => onSelectOption(option)}
                className={cn(
                  'flex-1 py-3 rounded-2xl border-2 items-center justify-center',
                  selectedOption === option ? 'bg-accent/20 border-secondary' : 'bg-surface border-black/5',
                )}
              >
                {emoji ? (
                  <Text className="text-2xl mb-1">{emoji}</Text>
                ) : (
                  <Ionicons
                    name="play"
                    size={16}
                    color={selectedOption === option ? '#4A90E2' : '#9BA8B1'}
                    style={{ marginBottom: 4 }}
                  />
                )}
                <Text className="font-nunito text-xs md:text-sm font-bold text-ink text-center px-1">
                  {option}
                </Text>
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
}
