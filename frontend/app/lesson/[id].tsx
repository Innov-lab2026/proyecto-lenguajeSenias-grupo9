import { useRouter, useLocalSearchParams } from 'expo-router'
import { View, Text, Pressable, Modal } from 'react-native'
import { Fragment, useState, useMemo, useEffect, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { MOCK_LESSON_1, MOCK_LESSON_2, MOCK_LESSON_3, MOCK_LESSON_4, MOCK_LESSON_5 } from '@/src/types/lessons'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'
import { ProgressBar } from '@/src/components/common/ProgressBar'
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
  const [matchingState, setMatchingState] = useState<{
    selectedVideo: string | null;
    selectedWord: string | null;
    completedPairs: Set<string>;
    attempts: Record<string, 'correct' | 'incorrect' | null>;
    shuffledWords: string[];
  }>({
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
      {/* HUD Header */}
      <View className="px-5 py-2 border-b border-black/5">
        {/* Stats Row */}
        <View className="flex-row justify-around items-center mb-2">
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

        {/* Progress Bar at the bottom of header */}
        <ProgressBar 
          progress={Math.max(0, ((currentStepIndex + 1) / lesson.steps.length) * 100)} 
          showPercentage={false}
          className="h-2"
        />
      </View>

      {/* Intro Modal */}
      <Modal visible={currentStepIndex === -1} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-surface w-full rounded-[40px] p-8 items-center relative overflow-hidden">
            <View className="bg-accent/20 px-4 py-1 rounded-full mb-4">
              <Text className="font-nunito text-sm font-bold text-ink">Fácil</Text>
            </View>

            <View className="items-center mb-6">
               {/* Island Representation */}
               <View className="w-32 h-32 bg-accent/10 rounded-full items-center justify-center mb-2">
                 <Image 
                    source={require('@/assets/images/lessons/isla_nivel1_presentacion.svg')} 
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
        <View 
          className="flex-1 w-full max-w-6xl self-center px-4 pt-2"
        >
          {currentStep.type === 'content' ? (
            <View className="flex-1 w-full">
              <View className="flex-1 w-full bg-slate-200 rounded-3xl items-center justify-center overflow-hidden border-2 border-slate-300 mb-2 relative">
                <Ionicons name="videocam-outline" size={60} color="#9BA8B1" />
                <Text className="font-nunito text-muted mt-2 text-sm">
                  {selectedOption ? `Video de ${selectedOption}` : 'Mira el video'}
                </Text>
                
                {/* Simulation of "watched" for single video steps */}
                {!currentStep.options && (
                  <Pressable 
                    onPress={() => {
                      setWatchedOptions(prev => {
                        const currentStepWatched = new Set(prev[currentStepIndex] || [])
                        currentStepWatched.add('main')
                        return { ...prev, [currentStepIndex]: currentStepWatched }
                      })
                    }}
                    className="absolute inset-0 items-center justify-center bg-black/5"
                  >
                    <View className="w-16 h-16 bg-white/80 rounded-full items-center justify-center shadow-sm">
                       <Ionicons name="play" size={32} color="#4A90E2" className="ml-1" />
                    </View>
                  </Pressable>
                )}
              </View>

              <Text className="font-nunito text-xl font-bold text-ink text-center mb-2">
                {selectedOption || currentStep.contentTitle}
              </Text>

              {currentStep.options && (
                <View className="flex-col md:flex-row gap-2 mb-2">
                  {currentStep.options.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSelectedOption(option)
                        setWatchedOptions(prev => {
                          const currentStepWatched = new Set(prev[currentStepIndex] || [])
                          currentStepWatched.add(option)
                          return { ...prev, [currentStepIndex]: currentStepWatched }
                        })
                      }}
                      className={cn(
                        "flex-1 h-12 rounded-2xl border-2 flex-row items-center justify-center px-4",
                        selectedOption === option 
                          ? "bg-accent/20 border-secondary" 
                          : "bg-surface border-black/5"
                      )}
                    >
                      <Ionicons 
                        name="play" 
                        size={16} 
                        color={selectedOption === option ? "#4A90E2" : "#9BA8B1"} 
                        style={{ marginRight: 8 }}
                      />
                      <Text className="font-nunito text-sm font-bold text-ink">{option}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
) : currentStep.type === 'matching' ? (
            <View className="flex-1 w-full">
              {/* Video Preview at the top */}
              <View className="flex-1 w-full bg-slate-200 rounded-2xl items-center justify-center overflow-hidden border-2 border-slate-300 mb-2 relative">
                {matchingState.selectedVideo ? (
                  <>
                    <Ionicons name="play" size={48} color="#4A90E2" />
                    <View className="absolute bottom-2 right-4 bg-black/20 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] text-white font-bold">Reproduciendo...</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="videocam-outline" size={48} color="#9BA8B1" />
                    <Text className="font-nunito text-xs text-muted mt-1">Selecciona un video</Text>
                  </>
                )}
              </View>

              <Text className="font-nunito text-xs font-bold text-ink text-center mb-2">
                {currentStep.question}
              </Text>

              <View className="flex-row justify-between mb-2 w-full max-w-4xl self-center flex-[1.5]">
                {/* Columna de Videos */}
                <View className="w-[45%] justify-between py-1">
                  {currentStep.pairs?.map((pair, index) => (
                    <Pressable
                      key={`video-${index}`}
                      onPress={() => handleMatchSelection('video', pair.videoUrl)}
                      className={cn(
                        "flex-1 my-1 rounded-2xl border-2 items-center justify-center relative min-h-[40px]",
                        matchingState.selectedVideo === pair.videoUrl 
                          ? "bg-accent/20 border-secondary" 
                          : matchingState.completedPairs.has(pair.word)
                            ? "bg-green-50 border-green-500 opacity-60"
                            : "bg-surface border-black/5"
                      )}
                    >
                      <Ionicons 
                        name={matchingState.completedPairs.has(pair.word) ? "checkmark-circle" : "play-circle"} 
                        size={20} 
                        color={
                          matchingState.completedPairs.has(pair.word) ? "#10B981" :
                          matchingState.selectedVideo === pair.videoUrl ? "#4A90E2" : "#9BA8B1"
                        } 
                      />
                    </Pressable>
                  ))}
                </View>

                {/* Columna de Palabras (Shuffled) */}
                <View className="w-[45%] justify-between py-1">
                  {matchingState.shuffledWords.map((word, index) => (
                    <Pressable
                      key={`word-${index}`}
                      onPress={() => handleMatchSelection('word', word)}
                      disabled={matchingState.completedPairs.has(word)}
                      className={cn(
                        "flex-1 my-1 rounded-2xl border-2 items-center justify-center px-1 min-h-[40px]",
                        matchingState.selectedWord === word 
                          ? "bg-accent/20 border-secondary"
                          : matchingState.attempts[word] === 'incorrect'
                            ? "bg-red-50 border-red-500"
                            : matchingState.completedPairs.has(word)
                              ? "bg-green-50 border-green-500"
                              : "bg-surface border-black/5"
                      )}
                    >
                      <Text className={cn(
                        "font-nunito text-[10px] font-bold text-center",
                        matchingState.attempts[word] === 'incorrect' ? "text-red-600" :
                        matchingState.completedPairs.has(word) ? "text-green-600" : "text-ink"
                      )}>
                        {word}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : currentStep.type === 'dialogue' ? (
            <View className="flex-1 w-full">
              {/* Video Area */}
              <View className="flex-1 w-full bg-slate-200 rounded-2xl items-center justify-center overflow-hidden border-2 border-slate-300 mb-2">
                 <Ionicons name="videocam-outline" size={24} color="#9BA8B1" />
              </View>

              <Text className="font-nunito text-xs font-bold text-ink text-center mb-2">
                {currentStep.question}
              </Text>

              {/* Dialogue Area */}
              <View className="flex-[1.5] bg-surface rounded-2xl border-2 border-black/5 p-3 mb-2">
                  {currentStep.dialogue?.map((line, lineIdx) => {
                    const parts = line.text.split('[blank]');
                    let blankCounter = 0;
                    const previousLinesBlanks = currentStep.dialogue!.slice(0, lineIdx).reduce((acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0), 0);

                    return (
                      <View key={lineIdx} className={cn(
                        "flex-row flex-wrap items-center mb-2",
                        line.speaker === 'Ana' ? "justify-start" : "justify-end"
                      )}>
                        <View className={cn(
                          "max-w-[90%] rounded-xl p-2 flex-row flex-wrap items-center gap-1",
                          line.speaker === 'Ana' ? "bg-accent/10" : "bg-primary/10"
                        )}>
                          {parts.map((part, partIdx) => {
                            const showBlank = partIdx < parts.length - 1;
                            const blankIdx = previousLinesBlanks + blankCounter;
                            if (showBlank) blankCounter++;

                            return (
                              <Fragment key={partIdx}>
                                <Text className="font-nunito text-[10px] text-ink">{part}</Text>
                                {showBlank && (
                                  <Pressable 
                                    onPress={() => setSelectedWordForDialogue(String(blankIdx))}
                                    className={cn(
                                      "h-5 min-w-[40px] border-b-2 items-center justify-center px-1 mx-1",
                                      selectedWordForDialogue === String(blankIdx) ? "border-secondary bg-accent/20" : "border-black/20"
                                    )}
                                  >
                                    <Text className="font-nunito text-[10px] font-bold text-secondary">
                                      {dialogueAnswers[blankIdx] || ''}
                                    </Text>
                                  </Pressable>
                                )}
                              </Fragment>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
              </View>

              {/* Word Bank */}
              <View className="flex-row flex-wrap gap-1 justify-center mb-2">
                {currentStep.options?.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (selectedWordForDialogue !== null) {
                        setDialogueAnswers(prev => ({ ...prev, [selectedWordForDialogue]: option }));
                        setSelectedWordForDialogue(null);
                      }
                    }}
                    className="bg-surface border-2 border-black/5 rounded-lg px-2 py-1"
                  >
                    <Text className="font-nunito text-[10px] font-bold text-ink">{option}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View className="flex-1 w-full">
              {currentStep.videoUrl ? (
                // Quiz with main video and text options
                <View className="flex-1 w-full">
                  <View className="flex-1 w-full bg-slate-200 rounded-3xl items-center justify-center overflow-hidden border-2 border-slate-300 mb-2">
                    <Ionicons name="videocam-outline" size={60} color="#9BA8B1" />
                  </View>

                  <Text className="font-nunito text-lg font-bold text-ink text-center mb-2">
                    {currentStep.question}
                  </Text>

                  <View className="flex-col md:flex-row gap-2 mb-2">
                    {currentStep.options?.map((option) => (
                      <Pressable 
                        key={option}
                        onPress={() => !correctSteps.has(currentStepIndex) && setSelectedOption(option)}
                        disabled={correctSteps.has(currentStepIndex)}
                        className={cn(
                          "flex-1 h-12 rounded-2xl border-2 items-center justify-center",
                          selectedOption === option 
                            ? "bg-accent/20 border-secondary" 
                            : "bg-surface border-black/5",
                          correctSteps.has(currentStepIndex) && "opacity-80"
                        )}
                      >
                        <Text className="font-nunito text-sm font-bold text-ink">{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                // Quiz where options are videos (like Lesson 1 & 3)
                <View className="flex-1 items-center w-full">
                  <View className="flex-1 flex-col md:flex-row justify-center gap-2 mb-2 w-full max-w-5xl">
                    {(shuffledQuizOptions[currentStepIndex] || currentStep.options)?.map((option) => (
                      <Pressable 
                        key={option}
                        onPress={() => !correctSteps.has(currentStepIndex) && setSelectedOption(option)}
                        disabled={correctSteps.has(currentStepIndex)}
                        className={cn(
                          "flex-1 w-full md:w-[48%] rounded-2xl border-2 items-center justify-center p-2 relative",
                          selectedOption === option 
                            ? "bg-accent/20 border-secondary" 
                            : "bg-surface border-black/5",
                          correctSteps.has(currentStepIndex) && "opacity-80"
                        )}
                      >
                        <View className="bg-slate-200 w-full h-full rounded-xl items-center justify-center overflow-hidden relative min-h-[100px]">
                          <Ionicons name="videocam-outline" size={24} color="#9BA8B1" />
                          <Text className="font-nunito text-[8px] text-muted bottom-1 absolute">{option}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>

                  <Text className="font-nunito text-lg font-bold text-ink text-center mb-2">
                    {currentStep.question}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
      {/* Feedback Modals Overlay */}
      <Modal visible={showFeedback !== null} animationType="slide" presentationStyle="fullScreen">
        <View
          className="flex-1 bg-surface"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="flex-1 w-full items-center">
              <Image 
                source={
                  showFeedback === 'correct' 
                    ? require('@/assets/images/lessons/feedback_correcto.svg') 
                    : require('@/assets/images/lessons/feedback_incorrecto.svg')
                } 
                className="w-full h-1/2"
                contentFit="cover"
              />
            <View className="flex-1 w-full px-6 pt-3 pb-4 items-center">
              <Text className={cn(
                "font-nunito text-2xl font-bold mb-4",
                showFeedback === 'correct' ? "text-green-600" : "text-red-600"
              )}>
                {showFeedback === 'correct' ? "¡Correcto!" : "Incorrecto"}
              </Text>
            {showFeedback === 'correct' ? (
              <View className="bg-accent/5 p-4 rounded-2xl w-full flex-1">
                <Text className="font-nunito text-sm text-ink leading-relaxed">
                  {currentStep?.tip}
                </Text>
              </View>
            ) : (
              <View className="w-full flex-1">
                <Text className="font-nunito text-base text-ink mb-1">Puedes intentarlo nuevamente.</Text>
                <Text className="font-nunito text-sm text-muted mb-4 opacity-70">
                  Como es tu primer reintento, todavia puedes obtener 75 puntos.
                </Text>
                <Text className="font-nunito text-sm font-bold text-ink italic">
                  Consejo: observa atentamente el video antes de seleccionar la respuesta correcta.
                </Text>
              </View>
            )}

            <View className="w-full gap-3 mt-4">
              {showFeedback === 'incorrect' && (
                <Button 
                  label="Reintentar" 
                  onPress={handleRetry} 
                  variant="white"
                  className="border-2 border-primary"
                />
              )}
              <Button label="Siguiente" onPress={handleNext} />
            </View>
          </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-surface w-full rounded-[32px] p-6 shadow-xl">
            <Text className="font-nunito text-xl font-bold text-ink mb-6 text-center">Configuraciones</Text>
            
            <Pressable 
              onPress={() => {
                setIsMuted(!isMuted);
                setShowSettings(false);
              }}
              className="flex-row items-center p-4 border-b border-black/5"
            >
              <Ionicons name={isMuted ? "volume-mute" : "volume-medium"} size={24} color="#6F706F" />
              <Text className="font-nunito text-base text-ink ml-4">
                {isMuted ? "Activar sonido" : "Desactivar sonido"}
              </Text>
            </Pressable>

            <Pressable 
              onPress={() => {
                setShowSettings(false);
                router.back();
              }}
              className="flex-row items-center p-4"
            >
              <Ionicons name="exit-outline" size={24} color="#EF4444" />
              <Text className="font-nunito text-base text-red-500 ml-4">Salir de la lección</Text>
            </Pressable>

            <Button 
              label="Cerrar" 
              onPress={() => setShowSettings(false)} 
              variant="white"
              className="mt-6 border border-black/10"
            />
          </View>
        </View>
      </Modal>

      {/* Hint Modal */}
      <Modal visible={showHint} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-surface w-full rounded-[32px] p-6 shadow-xl items-center">
            <View className="w-16 h-16 bg-accent/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="bulb" size={32} color="#F7BB18" />
            </View>
            <Text className="font-nunito text-xl font-bold text-ink mb-2">Pista</Text>
            <Text className="font-nunito text-base text-muted text-center mb-8 px-2">
              {currentStep?.tip || "Observa bien los gestos y la posición de las manos."}
            </Text>
            <Button 
              label="Entendido" 
              onPress={() => setShowHint(false)} 
            />
          </View>
        </View>
      </Modal>

      {/* Footer Navigation (only if not showing feedback) */}
      {!showFeedback && currentStepIndex !== -1 && (
        <View className="px-4 pb-2 pt-2 bg-background border-t border-black/5">
          <Button 
            label={
              ((currentStep?.type === 'quiz' && !!selectedOption) || 
               (currentStep?.type === 'matching' && matchingState.selectedVideo && matchingState.selectedWord) ||
               (currentStep?.type === 'dialogue' && Object.keys(dialogueAnswers).length === (currentStep.dialogue?.reduce((acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0), 0) || 0)))
              && !correctSteps.has(currentStepIndex) 
              ? 'Comprobar' 
              : 'Siguiente'
            } 
            onPress={handleNext}
            disabled={
              (currentStep?.type === 'quiz' && !selectedOption && !correctSteps.has(currentStepIndex)) ||
              (currentStep?.type === 'content' && !currentStep.options && (watchedOptions[currentStepIndex]?.size || 0) === 0) ||
              (currentStep?.type === 'content' && !!currentStep.options && (watchedOptions[currentStepIndex]?.size || 0) < currentStep.options.length) ||
              (currentStep?.type === 'matching' && !matchingState.selectedVideo && !matchingState.selectedWord && matchingState.completedPairs.size < (currentStep.pairs?.length || 0) && !correctSteps.has(currentStepIndex)) ||
              (currentStep?.type === 'matching' && (matchingState.selectedVideo || matchingState.selectedWord) && !(matchingState.selectedVideo && matchingState.selectedWord) && !correctSteps.has(currentStepIndex)) ||
              (currentStep?.type === 'dialogue' && Object.keys(dialogueAnswers).length < (currentStep.dialogue?.reduce((acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0), 0) || 0) && !correctSteps.has(currentStepIndex))
            }
          />
          <View className="flex-row items-center mt-2 h-8">
             <View className="w-10">
               {currentStepIndex > 0 && (
                 <Pressable onPress={handleBack}>
                   <Ionicons name="arrow-undo-outline" size={24} color="#6F706F" />
                 </Pressable>
               )}
             </View>

             <View className="flex-1 flex-row justify-center items-center gap-12">
               <Pressable onPress={() => setShowSettings(true)}>
                 <Ionicons name="settings-sharp" size={24} color="#6F706F" />
               </Pressable>

               <Pressable onPress={toggleFavorite}>
                 <Ionicons 
                   name={favorites.has(currentStep?.id || '') ? "heart" : "heart-outline"} 
                   size={24} 
                   color={favorites.has(currentStep?.id || '') ? "#EF4444" : "#6F706F"} 
                 />
               </Pressable>

               <Pressable 
                 onPress={() => {
                   setShowHint(true);
                   setHintViewed(prev => ({ ...prev, [currentStepIndex]: true }));
                 }}
               >
                 <Ionicons 
                   name={hintViewed[currentStepIndex] ? "bulb-outline" : "bulb"} 
                   size={24} 
                   color={hintViewed[currentStepIndex] ? "#6F706F" : "#F7BB18"} 
                 />
               </Pressable>
             </View>

             <View className="w-10" />
          </View>
        </View>
      )}
    </View>
  )
}
