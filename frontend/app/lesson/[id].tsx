import { useRouter, useLocalSearchParams } from 'expo-router'
import { View, Text, Pressable } from 'react-native'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { MOCK_LESSON_1, MOCK_LESSON_2, MOCK_LESSON_3, MOCK_LESSON_4, MOCK_LESSON_5, type MatchingState } from '@/src/types/lessons'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { ContentStep } from '@/src/components/features/lessons/steps/ContentStep'
import { QuizStep } from '@/src/components/features/lessons/steps/QuizStep'
import { MatchingStep } from '@/src/components/features/lessons/steps/MatchingStep'
import { DialogueStep } from '@/src/components/features/lessons/steps/DialogueStep'
import { LessonHeader } from '@/src/components/features/lessons/LessonHeader'
import { LessonFooter } from '@/src/components/features/lessons/LessonFooter'
import { IntroModal } from '@/src/components/features/lessons/IntroModal'
import { FeedbackModal } from '@/src/components/features/lessons/FeedbackModal'
import { SettingsModal } from '@/src/components/features/lessons/SettingsModal'
import { HintModal } from '@/src/components/features/lessons/HintModal'
import { MOCK_HOME_STATS } from '@/src/constants/home'
import { LESSON_SHELL } from '@/src/constants/lessons'
import { updateProgress } from '@/src/services/progress'
import { cn } from '@/src/utils/cn'

export default function LessonScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const lesson = useMemo(() => {
    if (id === '1') return MOCK_LESSON_1
    if (id === '2') return MOCK_LESSON_2
    if (id === '3') return MOCK_LESSON_3
    if (id === '4') return MOCK_LESSON_4
    return MOCK_LESSON_5
  }, [id])

  const [currentStepIndex, setCurrentStepIndex] = useState(-1) // -1 for intro modal
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [stepAnswers, setStepAnswers] = useState<Record<number, string | null>>({})
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [retryCount, setRetryCount] = useState<Record<number, number>>({})
  const [earnedStats, setEarnedStats] = useState({ xp: 0, stars: 0, accuracy: 100 })
  const [correctSteps, setCorrectSteps] = useState<Set<number>>(new Set())
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintViewed, setHintViewed] = useState<Record<number, boolean>>({})
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [watchedOptions, setWatchedOptions] = useState<Record<number, Set<string>>>({})
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<number, string>>({})
  const [selectedWordForDialogue, setSelectedWordForDialogue] = useState<string | null>(null)
  const [shuffledQuizOptions, setShuffledQuizOptions] = useState<Record<number, string[]>>({})
  const [matchingState, setMatchingState] = useState<MatchingState>({
    selectedVideo: null,
    selectedWord: null,
    completedPairs: new Set(),
    attempts: {},
    shuffledWords: []
  })

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

  useEffect(() => {
    if (currentStepIndex !== -1) {
      setSelectedOption(stepAnswers[currentStepIndex] || null)
      
      // Shuffle words for matching exercise
      if (currentStep?.type === 'matching' && currentStep.pairs) {
        const words = currentStep.pairs.map(p => p.word)
        setMatchingState(prev => ({
          ...prev,
          shuffledWords: [...words].sort(() => Math.random() - 0.5)
        }))
      }

      // Shuffle options for quiz with multiple videos
      if (currentStep?.type === 'quiz' && !currentStep.videoUrl && currentStep.options) {
        setShuffledQuizOptions(prev => ({
          ...prev,
          [currentStepIndex]: [...currentStep.options!].sort(() => Math.random() - 0.5)
        }))
      }
    }
  }, [currentStepIndex, currentStep])

  const isLastStep = currentStepIndex === lesson.steps.length - 1

  const xpValues = [15, 15, 20, 25, 25]
  const pointsNoErrors = [100, 100, 150, 200, 250]
  const pointsWithErrors = [50, 50, 75, 100, 125]

  const handleStart = () => setCurrentStepIndex(0)
  
  const handleNext = () => {
    if (showFeedback === 'incorrect') {
      // User clicked "Siguiente" after an error
      setShowFeedback(null)
      
      if (currentStep.type === 'matching') {
        // Reset selections on matching retry
        setMatchingState(prev => ({
          ...prev,
          selectedVideo: null,
          selectedWord: null,
          attempts: { ...prev.attempts, [prev.selectedWord || '']: null }
        }))
        return
      }

      setStepAnswers(prev => ({ ...prev, [currentStepIndex]: selectedOption }))
      
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
    
    if (showFeedback === 'correct' || showFeedback === 'incorrect') {
      // User clicked "Siguiente" after any feedback
      setShowFeedback(null)
      setStepAnswers(prev => ({ ...prev, [currentStepIndex]: selectedOption }))

      // Only give points if correct
      if (showFeedback === 'correct') {
        const hasErrors = (retryCount[currentStepIndex] || 0) > 0
        const xpGain = xpValues[currentStepIndex]
        const starsGain = hasErrors ? pointsWithErrors[currentStepIndex] : pointsNoErrors[currentStepIndex]

        if (!correctSteps.has(currentStepIndex)) {
            setEarnedStats(prev => ({
            ...prev,
            xp: prev.xp + xpGain,
            stars: prev.stars + starsGain
            }))
            setCorrectSteps(prev => {
            const newSet = new Set(prev)
            newSet.add(currentStepIndex)
            return newSet
            })
        }
      }

      if (isLastStep) {
        setShowSummary(true)
      } else {
        setCurrentStepIndex(prev => prev + 1)
      }
      return
    }

    if (currentStep.type === 'content' || correctSteps.has(currentStepIndex)) {
      if (isLastStep) {
        setShowSummary(true)
      } else {
        setCurrentStepIndex(prev => prev + 1)
      }
    } else if (currentStep.type === 'matching') {
      // Logic for matching check
      if (matchingState.selectedVideo && matchingState.selectedWord) {
        const correctPair = currentStep.pairs?.find(p => p.videoUrl === matchingState.selectedVideo)
        const isMatch = correctPair?.word === matchingState.selectedWord

        if (isMatch) {
          setMatchingState(prev => ({
            ...prev,
            completedPairs: new Set([...prev.completedPairs, prev.selectedWord!]),
            attempts: { ...prev.attempts, [prev.selectedWord!]: 'correct' },
            selectedVideo: null,
            selectedWord: null
          }))
          
          // Verify if all finished
          const allDone = (matchingState.completedPairs.size + 1) === (currentStep.pairs?.length || 0)
          if (allDone) {
            setShowFeedback('correct')
          }
        } else {
          setMatchingState(prev => ({
            ...prev,
            attempts: { ...prev.attempts, [prev.selectedWord!]: 'incorrect' }
          }))
          setShowFeedback('incorrect')
          setRetryCount(prev => ({
            ...prev,
            [currentStepIndex]: (prev[currentStepIndex] || 0) + 1
          }))
          setEarnedStats(prev => ({ ...prev, accuracy: Math.max(0, prev.accuracy - 20) }))
        }
      }
    } else if (currentStep.type === 'dialogue') {
      const answers = currentStep.dialogue?.reduce((acc, line, lineIdx) => {
        const lineBlanks = line.text.match(/\[blank\]/g)
        if (lineBlanks) {
          lineBlanks.forEach((_, blankIdx) => {
            const globalBlankIdx = Object.keys(acc).length
            acc[globalBlankIdx] = dialogueAnswers[globalBlankIdx] || ''
          })
        }
        return acc
      }, {} as Record<number, string>) || {}
      
      const userAnswersString = Object.values(answers).join('|')
      if (userAnswersString === currentStep.correctAnswer) {
        setShowFeedback('correct')
      } else {
        setShowFeedback('incorrect')
        setRetryCount(prev => ({
          ...prev,
          [currentStepIndex]: (prev[currentStepIndex] || 0) + 1
        }))
        setEarnedStats(prev => ({ ...prev, accuracy: Math.max(0, prev.accuracy - 20) }))
      }
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
    setDialogueAnswers({})
    setSelectedWordForDialogue(null)
    setMatchingState({
      selectedVideo: null,
      selectedWord: null,
      completedPairs: new Set(),
      attempts: {},
      shuffledWords: currentStep?.pairs ? [...currentStep.pairs.map(p => p.word)].sort(() => Math.random() - 0.5) : []
    })
    setStepAnswers(prev => ({ ...prev, [currentStepIndex]: null }))
    // Al reintentar, permitimos que el usuario vuelva a interactuar
    setCorrectSteps(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentStepIndex)
      return newSet
    })
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      setShowFeedback(null)
    }
  }

  const markWatched = (key: string) => {
    setWatchedOptions(prev => {
      const currentStepWatched = new Set(prev[currentStepIndex] || [])
      currentStepWatched.add(key)
      return { ...prev, [currentStepIndex]: currentStepWatched }
    })
  }

  const handleSelectWordForDialogue = (option: string) => {
    if (selectedWordForDialogue === null) return
    setDialogueAnswers(prev => ({ ...prev, [selectedWordForDialogue]: option }))
    setSelectedWordForDialogue(null)
  }

  const toggleFavorite = () => {
    if (!currentStep?.id) return
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentStep.id)) newSet.delete(currentStep.id)
      else newSet.add(currentStep.id)
      return newSet
    })
  }

  const handleMatchSelection = useCallback((type: 'video' | 'word', value: string) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return;

    setMatchingState(prev => ({
      ...prev,
      [type === 'video' ? 'selectedVideo' : 'selectedWord']: value
    }));
  }, [showFeedback, correctSteps, currentStepIndex]);

  useEffect(() => {
    // Shuffling words for matching exercise is done in the effect that reacts to currentStepIndex
  }, []);

  const dialogueBlanksCount = currentStep?.dialogue?.reduce(
    (acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0),
    0,
  ) || 0

  const footerNeedsCheck =
    ((currentStep?.type === 'quiz' && !!selectedOption) ||
      (currentStep?.type === 'matching' && !!matchingState.selectedVideo && !!matchingState.selectedWord) ||
      (currentStep?.type === 'dialogue' && Object.keys(dialogueAnswers).length === dialogueBlanksCount)) &&
    !correctSteps.has(currentStepIndex)

  const footerLabel = footerNeedsCheck ? 'Comprobar' : 'Siguiente'

  const footerDisabled =
    (currentStep?.type === 'quiz' && !selectedOption && !correctSteps.has(currentStepIndex)) ||
    (currentStep?.type === 'content' && !currentStep.options && (watchedOptions[currentStepIndex]?.size || 0) === 0) ||
    (currentStep?.type === 'content' && !!currentStep.options && (watchedOptions[currentStepIndex]?.size || 0) < currentStep.options.length) ||
    (currentStep?.type === 'matching' &&
      !matchingState.selectedVideo &&
      !matchingState.selectedWord &&
      matchingState.completedPairs.size < (currentStep.pairs?.length || 0) &&
      !correctSteps.has(currentStepIndex)) ||
    (currentStep?.type === 'matching' &&
      (matchingState.selectedVideo || matchingState.selectedWord) &&
      !(matchingState.selectedVideo && matchingState.selectedWord) &&
      !correctSteps.has(currentStepIndex)) ||
    (currentStep?.type === 'dialogue' &&
      Object.keys(dialogueAnswers).length < dialogueBlanksCount &&
      !correctSteps.has(currentStepIndex))

  if (showSummary) {
    return (
      <View
        className="flex-1 bg-[#EAF8FF] items-center justify-start px-4 overflow-hidden"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Pressable 
          onPress={() => router.back()} 
          className="absolute top-2 right-2 z-10 p-2"
        >
          <Ionicons name="close" size={32} color="#1F2937" />
        </Pressable>

        <View className="flex-1 w-full items-center justify-center">
          <Image 
          source={require('@/assets/images/lessons/carpi_victory.png')} 
          className="w-full h-[50%] max-h-[250px] mb-4"
          contentFit="contain"
          />
        
        <Text className="font-nunito text-4xl font-bold text-ink mb-0">¡Estuviste increíble!</Text>
        <Text className="font-nunito text-lg text-muted mb-2">Completaste tu primera lección</Text>
        </View>
        
        <View className="w-full max-w-md flex-row justify-between gap-2 mt-auto mb-4">
           <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
             <View className="w-8 h-8 rounded-full bg-secondary/20 items-center justify-center mb-1">
               <Text className="font-nunito text-xs font-bold text-secondary">XP</Text>
             </View>
             <Text className="font-nunito text-xs font-bold text-ink mb-1">Experiencia</Text>
             <Text className="font-nunito text-2xl font-bold text-ink">{earnedStats.xp}</Text>
           </View>
           <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
             <Ionicons name="star" size={30} color="#F7BB18" />
             <Text className="font-nunito text-xs font-bold text-ink mb-1">Puntos</Text>
             <Text className="font-nunito text-2xl font-bold text-ink">+{earnedStats.stars}</Text>
           </View>
           <View className="flex-1 min-h-[116px] bg-surface rounded-2xl border-2 border-[#4A90E2] items-center justify-center px-1">
             <Ionicons name="paw" size={30} color="#A5652E" />
             <Text className="font-nunito text-xs font-bold text-ink mb-1">Señas</Text>
             <Text className="font-nunito text-2xl font-bold text-ink">{lesson.steps.filter(step => step.type === 'content').length}</Text>
           </View>
        </View>


        <View className="h-[22%] min-h-[150px] self-stretch -mx-4 bg-[#67AEF5] items-center justify-end pb-5 relative">
          <View className="items-center z-10 mb-3">
            <Image
              source={require('@/assets/images/lessons/candado_abierto.svg')}
              className="w-16 h-16"
              contentFit="contain"
            />
            <Text className="font-nunito text-base font-bold text-ink text-center leading-4">Nivel {Number(id) + 1}{'\n'}desbloqueado</Text>
          </View>
          <Button 
            label={isSaving ? "Guardando..." : "Continuar"} 
            onPress={() => !isSaving && router.back()} 
            className="w-40 z-10"
            disabled={isSaving}
          />
        </View>
      </View>
    )
  }

  return (
    <View
      className="flex-1 bg-background overflow-hidden"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <LessonHeader
        stats={MOCK_HOME_STATS}
        progress={Math.max(0, ((currentStepIndex + 1) / lesson.steps.length) * 100)}
      />

      <IntroModal
        visible={currentStepIndex === -1}
        levelId={id}
        title={lesson.title}
        description={lesson.description}
        onStart={handleStart}
      />

      {/* Main Content */}
      {currentStep && (
        <View className={cn('flex-1 px-4 pt-2', LESSON_SHELL)}>
          {currentStep.type === 'content' ? (
            <ContentStep
              step={currentStep}
              selectedOption={selectedOption}
              onSelectOption={setSelectedOption}
              onWatched={markWatched}
            />
          ) : currentStep.type === 'matching' ? (
            <MatchingStep step={currentStep} matchingState={matchingState} onSelect={handleMatchSelection} />
          ) : currentStep.type === 'dialogue' ? (
            <DialogueStep
              step={currentStep}
              dialogueAnswers={dialogueAnswers}
              selectedBlankId={selectedWordForDialogue}
              onSelectBlank={setSelectedWordForDialogue}
              onSelectWord={handleSelectWordForDialogue}
            />
          ) : (
            <QuizStep
              step={currentStep}
              options={shuffledQuizOptions[currentStepIndex] || currentStep.options || []}
              selectedOption={selectedOption}
              onSelectOption={setSelectedOption}
              isLocked={correctSteps.has(currentStepIndex)}
            />
          )}
        </View>
      )}
      <FeedbackModal feedback={showFeedback} tip={currentStep?.tip} onRetry={handleRetry} onNext={handleNext} />

      <SettingsModal
        visible={showSettings}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onExit={() => {
          setShowSettings(false)
          router.back()
        }}
        onClose={() => setShowSettings(false)}
      />

      <HintModal visible={showHint} tip={currentStep?.tip} onClose={() => setShowHint(false)} />

      {!showFeedback && currentStepIndex !== -1 && (
        <LessonFooter
          ctaLabel={footerLabel}
          ctaDisabled={footerDisabled}
          onNext={handleNext}
          showBack={currentStepIndex > 0}
          onBack={handleBack}
          onSettings={() => setShowSettings(true)}
          isFavorite={favorites.has(currentStep?.id || '')}
          onToggleFavorite={toggleFavorite}
          hintViewed={!!hintViewed[currentStepIndex]}
          onHint={() => {
            setShowHint(true)
            setHintViewed(prev => ({ ...prev, [currentStepIndex]: true }))
          }}
        />
      )}
    </View>
  )
}
