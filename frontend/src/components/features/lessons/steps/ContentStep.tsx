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
  muted?: boolean
}

/** Step "content": muestra una seña (video único) o un selector de señas relacionadas. */
export function ContentStep({ step, selectedOption, onSelectOption, onWatched, muted = false }: ContentStepProps) {
  return (
    <View className="flex-1 w-full">
      <View className="flex-1 w-full items-center justify-center mb-2">
        {!step.options ? (
          <View className="w-full flex-1 max-h-[560px] rounded-[40px] border border-muted/20 bg-surface p-2 shadow-sm relative">
            <LessonVideo
              uri={step.videoUrl!}
              muted={muted}
              onWatched={() => onWatched('main')}
              className="flex-1 w-full rounded-[32px]"
            />
          </View>
        ) : selectedOption && step.videoUrls?.[selectedOption] ? (
          <View className="w-full flex-1 max-h-[560px] rounded-[40px] border border-muted/20 bg-surface p-2 shadow-sm relative">
            <LessonVideo
              key={selectedOption}
              uri={step.videoUrls[selectedOption]}
              muted={muted}
              onWatched={() => onWatched(selectedOption)}
              className="flex-1 w-full rounded-[32px]"
            />
          </View>
        ) : (
          <View className="h-full max-h-[560px] aspect-[9/16] items-center justify-center rounded-3xl border-2 border-black/5 bg-surface px-4">
            <Ionicons name="videocam-outline" size={60} color="#9BA8B1" />
            <Text className="font-nunito text-muted mt-2 text-center text-sm">
              Elegí una opción para ver el video
            </Text>
          </View>
        )}
      </View>

      <Text className="font-nunito text-xl font-bold text-ink text-center py-4 px-2">
        {selectedOption || step.contentTitle}
      </Text>

      {step.options && (
        <View className="flex-col md:flex-row gap-2 mb-2">
          {step.options.map((option) => (
            <Pressable
              key={option}
              onPress={() => onSelectOption(option)}
              className={cn(
                'flex-1 h-12 rounded-2xl border-2 flex-row items-center justify-center px-4',
                selectedOption === option ? 'bg-accent/20 border-secondary' : 'bg-surface border-black/5',
              )}
            >
              <Ionicons
                name="play"
                size={16}
                color={selectedOption === option ? '#4A90E2' : '#9BA8B1'}
                style={{ marginRight: 8 }}
              />
              <Text className="font-nunito text-sm font-bold text-ink">{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}
