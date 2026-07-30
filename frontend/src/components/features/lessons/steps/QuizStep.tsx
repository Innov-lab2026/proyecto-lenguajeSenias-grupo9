import { Pressable, Text, View } from 'react-native'
import type { LessonStep } from '@/src/types/lessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { cn } from '@/src/utils/cn'
import { Ionicons } from '@expo/vector-icons'
import { useResponsive } from '@/src/hooks/common/useResponsive'

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
  // Obtener el estado responsivo del dispositivo para adaptar el layout
  const { isMobile } = useResponsive()

  // Para las lecciones m1-l1-quiz y m1-l3-quiz, el video correcto se pre-carga como principal
  const mainVideoUrl = step.videoUrl || 
    ((step.id === 'm1-l1-quiz' || step.id === 'm1-l3-quiz') && step.videoUrls && step.correctAnswer ? step.videoUrls[step.correctAnswer] : undefined)

  const isHorizontalQuiz = step.id === 'm1-l2-quiz'

  // Si el paso tiene un video principal, se muestra con sus opciones normales abajo
  if (mainVideoUrl) {
    return (
      <View className="flex-1 w-full">
        <View className="flex-1 w-full items-center justify-center mb-2">
          <View className="w-full flex-1 max-h-[560px] rounded-[40px] border border-muted/20 bg-surface p-2 shadow-sm relative">
            <LessonVideo uri={mainVideoUrl} muted={muted} className="flex-1 w-full rounded-[32px]" />
          </View>
        </View>

        <Text className="font-nunito text-xl font-bold text-ink text-center py-4 px-2">{step.question}</Text>

        <View
          className={cn(
            "gap-2 mb-2",
            isHorizontalQuiz
              ? "flex-row"
              : isMobile
                ? "flex-row flex-wrap justify-between"
                : "flex-col md:flex-row"
          )}
        >
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => !isLocked && onSelectOption(option)}
              disabled={isLocked}
              className={cn(
                'rounded-2xl border-2 items-center justify-center px-3',
                isHorizontalQuiz
                  ? 'flex-1 h-12'
                  : isMobile
                    ? 'h-12 w-[48%]'
                    : 'flex-1 h-12',
                selectedOption === option ? 'bg-accent/20 border-secondary' : 'bg-surface border-black/5',
                isLocked && 'opacity-80',
              )}
            >
              <Text className="font-nunito text-sm font-bold text-ink text-center">{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }

  // Si no hay videoUrl principal, se asume que las opciones tienen videos asociados (múltiples videos)
  if (isMobile) {
    return (
      <View className="flex-1 items-center w-full">
        {/* Contenedor con moldura para el video activo o el placeholder en móvil */}
        <View className="flex-1 w-full items-center justify-center mb-2">
          {selectedOption && step.videoUrls?.[selectedOption] ? (
            <View className="w-full flex-1 max-h-[560px] rounded-[40px] border border-muted/20 bg-surface p-2 shadow-sm relative">
              <LessonVideo
                key={selectedOption}
                uri={step.videoUrls[selectedOption]}
                muted={muted}
                className="flex-1 w-full rounded-[32px]"
              />
            </View>
          ) : (
            <View className="w-full flex-1 max-h-[560px] rounded-[40px] border border-muted/20 bg-surface p-8 shadow-sm justify-center items-center">
              <Ionicons name="videocam-outline" size={60} color="#9BA8B1" />
              <Text className="font-nunito text-muted mt-2 text-center text-sm">
                Seleccioná una opción para ver el video
              </Text>
            </View>
          )}
        </View>

        <Text className="font-nunito text-xl font-bold text-ink text-center py-4 px-2">{step.question}</Text>

        {/* Botones de opciones distribuidos de manera uniforme (cuadrícula de 2x2 para 4 opciones) */}
        <View className="flex-row flex-wrap justify-between gap-y-2 w-full">
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => !isLocked && onSelectOption(option)}
              disabled={isLocked}
              className={cn(
                'h-12 w-[48%] rounded-2xl border-2 flex-row items-center justify-center px-3',
                selectedOption === option ? 'bg-accent/20 border-secondary' : 'bg-surface border-black/5',
                isLocked && 'opacity-80',
              )}
            >
              <Ionicons
                name="play"
                size={16}
                color={selectedOption === option ? '#4A90E2' : '#9BA8B1'}
                style={{ marginRight: 6 }}
              />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className="font-nunito text-sm font-bold text-ink text-center flex-1"
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }

  // Vista de escritorio/tablet: Muestra la grilla tradicional de videos lado a lado
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

      <Text className="font-nunito text-xl font-bold text-ink text-center py-4 px-2">{step.question}</Text>
    </View>
  )
}
