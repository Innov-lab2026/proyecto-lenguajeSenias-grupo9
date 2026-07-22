import { useRouter, useLocalSearchParams } from 'expo-router'
import { View, Text, Pressable, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useState, useMemo, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { MOCK_LESSON_1, MOCK_LESSON_2 } from '@/src/types/lessons'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { RewardStats } from '@/src/components/features/rewards/RewardStats'
import { MOCK_HOME_STATS } from '@/src/constants/home'
import { updateProgress } from '@/src/services/progress'
import { cn } from '@/src/utils/cn'

export default function LessonScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const lesson = useMemo(() => {
    if (id === '1') return MOCK_LESSON_1
    return MOCK_LESSON_2
  }, [id])

  const [currentStepIndex, setCurrentStepIndex] = useState(-1) // -1 for intro modal
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [retryCount, setRetryCount] = useState<Record<number, number>>({})
  const [earnedStats, setEarnedStats] = useState({ xp: 0, stars: 0, accuracy: 100 })

  useEffect(() => {
    if (showSummary) {
      const saveProgress = async () => {
        setIsSaving(true)
        try {
          await updateProgress({
            module_id: lesson.moduleId,
            completed_islands: Number(id), // Suponemos que id es el número de isla
            xp_gain: earnedStats.xp,
            stars_gain: earnedStats.stars
          })
        } catch (error) {
          console.error('Error saving progress:', error)
        } finally {
          setIsSaving(false)
        }
      }
      saveProgress()
    }
  }, [showSummary])

  const currentStep = lesson.steps[currentStepIndex]
  const isLastStep = currentStepIndex === lesson.steps.length - 1

  const xpValues = [15, 15, 20, 25, 25]
  const pointsNoErrors = [100, 100, 150, 200, 250]
  const pointsWithErrors = [50, 50, 75, 100, 125]

  const handleStart = () => setCurrentStepIndex(0)
  
  const handleNext = () => {
    if (showFeedback === 'incorrect') {
      // User clicked "Siguiente" after an error
      setShowFeedback(null)
      setSelectedOption(null)
      
      // Points for finishing with error: 0 additional points
      setEarnedStats(prev => ({
        ...prev,
        xp: prev.xp + xpValues[currentStepIndex]
      }))

      if (isLastStep) {
        setShowSummary(true)
      } else {
        setCurrentStepIndex(prev => prev + 1)
      }
      return
    }
    
    if (showFeedback === 'correct') {
      // User clicked "Siguiente" after success
      setShowFeedback(null)
      setSelectedOption(null)

      const hasErrors = (retryCount[currentStepIndex] || 0) > 0
      const xpGain = xpValues[currentStepIndex]
      const starsGain = hasErrors ? pointsWithErrors[currentStepIndex] : pointsNoErrors[currentStepIndex]

      setEarnedStats(prev => ({
        ...prev,
        xp: prev.xp + xpGain,
        stars: prev.stars + starsGain
      }))

      if (isLastStep) {
        setShowSummary(true)
      } else {
        setCurrentStepIndex(prev => prev + 1)
      }
      return
    }

    if (currentStep.type === 'content') {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      // Quiz step
      if (selectedOption === currentStep.correctAnswer) {
        setShowFeedback('correct')
      } else {
        setShowFeedback('incorrect')
        setRetryCount(prev => ({
          ...prev,
          [currentStepIndex]: (prev[currentStepIndex] || 0) + 1
        }))
        setEarnedStats(prev => ({ ...prev, accuracy: Math.max(0, prev.accuracy - 20) }))
      }
    }
  }

  const handleRetry = () => {
    setShowFeedback(null)
    setSelectedOption(null)
  }


  if (showSummary) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Pressable 
          onPress={() => router.back()} 
          className="absolute top-12 right-6 z-10 p-2"
        >
          <Ionicons name="close" size={32} color="#1F2937" />
        </Pressable>

        <Image 
          source={require('@/assets/images/home/carpi-2.png')} 
          className="w-48 h-48 mb-6"
          contentFit="contain"
        />
        
        <Text className="font-nunito text-4xl font-bold text-ink mb-2">¡Estuviste increíble!</Text>
        <Text className="font-nunito text-lg text-muted mb-8">Completaste tu primera lección</Text>
        
        <View className="w-full flex-row justify-between gap-3 mb-10">
           <View className="flex-1 bg-surface rounded-2xl p-4 items-center shadow-sm">
             <Text className="font-nunito text-xs font-bold text-secondary mb-1">XP</Text>
             <Text className="font-nunito text-2xl font-bold text-ink">{earnedStats.xp}</Text>
           </View>
           <View className="flex-1 bg-surface rounded-2xl p-4 items-center shadow-sm">
             <Text className="font-nunito text-xs font-bold text-primary mb-1">Puntos</Text>
             <Text className="font-nunito text-2xl font-bold text-ink">+{earnedStats.stars}</Text>
           </View>
           <View className="flex-1 bg-surface rounded-2xl p-4 items-center shadow-sm">
             <Text className="font-nunito text-xs font-bold text-accent mb-1">Señas</Text>
             <Text className="font-nunito text-2xl font-bold text-ink">{earnedStats.accuracy}%</Text>
           </View>
        </View>


        <Text className="font-nunito text-lg font-bold text-ink mb-6">nivel 2 desbloqueado</Text>
        
        <Button 
          label={isSaving ? "Guardando..." : "Continuar"} 
          onPress={() => !isSaving && router.back()} 
          className="w-full"
          disabled={isSaving}
        />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* HUD Header */}
      <View className="px-5 py-4 border-b border-black/5 flex-row justify-start items-center gap-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#6F706F" />
        </Pressable>
        {/* Simplified Stat Header for HUD */}
        <View className="flex-1 flex-row justify-around items-center">
          <View className="flex-row items-center gap-1">
            <View className="w-6 h-6 bg-secondary/20 rounded-full items-center justify-center">
              <Text className="text-[10px] text-secondary font-bold">XP</Text>
            </View>
            <Text className="font-nunito text-xs font-bold text-ink">{MOCK_HOME_STATS.xp}</Text>
          </View>
          <View className="flex-row items-center gap-1">
             <Ionicons name="star" size={16} color="#F7BB18" />
             <Text className="font-nunito text-xs font-bold text-ink">{MOCK_HOME_STATS.stars}</Text>
          </View>
          <View className="flex-row items-center gap-1">
             <Ionicons name="paw" size={16} color="#A5652E" />
             <Text className="font-nunito text-xs font-bold text-ink">{MOCK_HOME_STATS.paws}</Text>
          </View>
        </View>
      </View>

      {/* Intro Modal */}
      <Modal visible={currentStepIndex === -1} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-surface w-full rounded-[40px] p-8 items-center relative overflow-hidden">
            <Pressable 
              onPress={() => router.back()} 
              className="absolute top-4 right-6 p-2"
            >
              <Ionicons name="close" size={24} color="#6F706F" />
            </Pressable>

            <View className="bg-accent/20 px-4 py-1 rounded-full mb-4">
              <Text className="font-nunito text-sm font-bold text-ink">Fácil</Text>
            </View>

            <View className="items-center mb-6">
               {/* Island Representation */}
               <View className="w-32 h-32 bg-accent/10 rounded-full items-center justify-center mb-2">
                 <Image 
                    source={require('@/assets/images/home/carpi-1.png')} 
                    className="w-24 h-24"
                    contentFit="contain"
                 />
               </View>
               <View className="bg-primary px-3 py-1 rounded-md rotate-[-5deg]">
                 <Text className="text-white font-bold text-xs">Nivel {id}</Text>
               </View>
            </View>

            <Text className="font-nunito text-3xl font-bold text-ink mb-4">{lesson.title}</Text>
            <Text className="font-nunito text-base text-muted text-center mb-8 px-4">
              {lesson.description}
            </Text>

            <Button label="¡A Jugar!" onPress={handleStart} className="px-10" />
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      {currentStep && (
        <ScrollView className="flex-1 px-5 pt-6">
          {currentStep.type === 'content' ? (
            <View>
              <Text className="font-nunito text-3xl font-bold text-ink text-center mb-8">
                {currentStep.contentTitle}
              </Text>
              <View className="aspect-square w-full bg-slate-200 rounded-3xl items-center justify-center overflow-hidden border-2 border-slate-300">
                <Ionicons name="videocam-outline" size={80} color="#9BA8B1" />
                <Text className="font-nunito text-muted mt-4">Video Placeholder</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text className="font-nunito text-xl font-bold text-ink text-center mb-8">
                {currentStep.question}
              </Text>

              <View className="flex-row flex-wrap gap-4 mb-10">
                {currentStep.options?.map((option) => (
                  <Pressable 
                    key={option}
                    onPress={() => setSelectedOption(option)}
                    className={cn(
                      "w-[47%] aspect-square rounded-3xl border-2 items-center justify-center p-4",
                      selectedOption === option 
                        ? "bg-accent/20 border-secondary" 
                        : "bg-surface border-black/5"
                    )}
                  >
                    <View className="bg-slate-200 w-full h-3/4 mb-2 rounded-xl items-center justify-center">
                       <Ionicons name="videocam-outline" size={32} color="#9BA8B1" />
                    </View>
                    <Text className="font-nunito text-sm font-bold text-ink">{option}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Feedback Modals Overlay */}
      <Modal visible={showFeedback !== null} transparent animationType="slide">
        <View className="flex-1 bg-black/20 justify-end">
          <View className={cn(
            "bg-surface rounded-t-[40px] px-6 pt-8 pb-12 items-center shadow-lg",
            showFeedback === 'incorrect' ? "border-t-4 border-red-500" : "border-t-4 border-green-500"
          )}>
            <View className="items-center mb-6">
              <View className={cn(
                "w-16 h-16 rounded-full items-center justify-center mb-4",
                showFeedback === 'correct' ? "bg-green-100" : "bg-red-100"
              )}>
                <Ionicons 
                  name={showFeedback === 'correct' ? "checkmark-circle" : "close-circle"} 
                  size={48} 
                  color={showFeedback === 'correct' ? "#2FAD55" : "#EF4444"} 
                />
              </View>
              <Text className={cn(
                "font-nunito text-2xl font-bold",
                showFeedback === 'correct' ? "text-green-600" : "text-red-600"
              )}>
                {showFeedback === 'correct' ? "¡Correcto!" : "Incorrecto"}
              </Text>
            </View>

            {showFeedback === 'correct' ? (
              <View className="bg-accent/5 p-4 rounded-2xl mb-8 w-full">
                <Text className="font-nunito text-sm text-ink leading-relaxed">
                  {currentStep?.tip}
                </Text>
              </View>
            ) : (
              <View className="mb-8 w-full">
                <Text className="font-nunito text-base text-ink mb-1">Puedes intentarlo nuevamente.</Text>
                <Text className="font-nunito text-sm text-muted mb-4 opacity-70">
                  Como es tu primer reintento, todavia puedes obtener 75 puntos.
                </Text>
                <Text className="font-nunito text-sm font-bold text-ink italic">
                  Consejo: observa atentamente el video antes de seleccionar la respuesta correcta.
                </Text>
              </View>
            )}

            <View className="w-full gap-3">
              {showFeedback === 'incorrect' && (
                <Button 
                  label="Reintentar" 
                  onPress={handleRetry} 
                  variant="secondary"
                  className="bg-primary/20 border-primary"
                />
              )}
              <Button label="Siguiente" onPress={handleNext} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer Navigation (only if not showing feedback) */}
      {!showFeedback && currentStepIndex !== -1 && (
        <View className="px-5 pb-8 pt-4 bg-background border-t border-black/5">
          <Button 
            label={currentStep?.type === 'quiz' ? 'Comprobar' : 'Siguiente'} 
            onPress={handleNext}
            disabled={currentStep?.type === 'quiz' && !selectedOption}
          />
          <View className="flex-row justify-center gap-8 mt-4">
             <Ionicons name="settings-outline" size={20} color="#6F706F" />
             <Ionicons name="arrow-undo-outline" size={20} color="#6F706F" />
             <Ionicons name="bulb-outline" size={20} color="#6F706F" />
          </View>
        </View>
      )}
    </View>
  )
}
