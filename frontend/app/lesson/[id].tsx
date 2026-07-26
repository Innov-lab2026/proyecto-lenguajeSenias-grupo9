import { useRouter, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MOCK_LESSON_1, MOCK_LESSON_2, MOCK_LESSON_3, MOCK_LESSON_4, MOCK_LESSON_5, type MatchingState } from '@/src/types/lessons'
import { ContentStep } from '@/src/components/features/lessons/steps/ContentStep'
import { QuizStep } from '@/src/components/features/lessons/steps/QuizStep'
import { MatchingStep } from '@/src/components/features/lessons/steps/MatchingStep'
import { DialogueExercise } from '@/src/components/features/lessons/DialogueExercise'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { LessonSummary } from '@/src/components/features/lessons/LessonSummary'
import { LessonHeader } from '@/src/components/features/lessons/LessonHeader'
import { LessonFooter } from '@/src/components/features/lessons/LessonFooter'
import { IntroModal } from '@/src/components/features/lessons/IntroModal'
import { FeedbackModal } from '@/src/components/features/lessons/FeedbackModal'
import { SettingsModal } from '@/src/components/features/lessons/SettingsModal'
import { HintModal } from '@/src/components/features/lessons/HintModal'
import { useStats } from '@/src/hooks/features/lessons/useStats'
import { useCompleteLesson } from '@/src/hooks/features/lessons/useCompleteLesson'
import { LESSON_SHELL, LESSONS_POR_MODULO } from '@/src/constants/lessons'
import { cn } from '@/src/utils/cn'

export default function LessonScreen() {
  const { id, n, pr } = useLocalSearchParams()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // `id` es el UUID real de la lección (para completeLesson); `n` es el
  // lesson_number (1-5) que llega por query param desde el home y decide qué
  // contenido mock mostrar. El backend no modela el contenido del ejercicio
  // todavía (ver PLAN_FRONTEND_CONECTAR_BACKEND.md §4) — sólo la economía.
  const lessonNumber = Number(Array.isArray(n) ? n[0] : n) || 1

  // `pr` = points_retry de la lección (LessonMeta), también por query param:
  // sólo para mostrar en el feedback cuántos puntos se pueden ganar todavía
  // tras un error. La recompensa real la calcula y persiste el server.
  // Provisional hasta que exista GET /api/lessons/:id y se pueda pedir la
  // metadata desde acá en vez de arrastrarla por la URL.
  const retryPoints = Number(Array.isArray(pr) ? pr[0] : pr) || 0

  const lesson = (() => {
    if (lessonNumber === 2) return MOCK_LESSON_2
    if (lessonNumber === 3) return MOCK_LESSON_3
    if (lessonNumber === 4) return MOCK_LESSON_4
    if (lessonNumber === 5) return MOCK_LESSON_5
    return MOCK_LESSON_1
  })()

  const statsQuery = useStats()
  const completeLessonMutation = useCompleteLesson()

  const [currentStepIndex, setCurrentStepIndex] = useState(-1) // -1 = modal de intro
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [stepAnswers, setStepAnswers] = useState<Record<number, string | null>>({})
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [retryCount, setRetryCount] = useState<Record<number, number>>({})
  const [correctSteps, setCorrectSteps] = useState<Set<number>>(new Set())
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintViewed, setHintViewed] = useState<Record<number, boolean>>({})
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [watchedOptions, setWatchedOptions] = useState<Record<number, Set<string>>>({})
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<number, string>>({})
  const [shuffledQuizOptions, setShuffledQuizOptions] = useState<Record<number, string[]>>({})
  const [matchingState, setMatchingState] = useState<MatchingState>({
    selectedVideo: null,
    selectedWord: null,
    completedPairs: new Set(),
    attempts: {},
    shuffledWords: []
  })

  useEffect(() => {
    if (!showSummary) return
    // isPerfect = ningún paso de la lección tuvo un error, en ningún intento.
    // La recompensa la calcula y persiste el server (nunca el cliente); acá
    // sólo se informa qué pasó.
    const isPerfect = Object.keys(retryCount).length === 0
    completeLessonMutation.mutate({ lessonId: id as string, isPerfect })
  }, [showSummary])

  const currentStep = lesson.steps[currentStepIndex]

  useEffect(() => {
    if (currentStepIndex !== -1) {
      setSelectedOption(stepAnswers[currentStepIndex] || null)

      // Mezcla las palabras del ejercicio de matching
      if (currentStep?.type === 'matching' && currentStep.pairs) {
        const words = currentStep.pairs.map(p => p.word)
        setMatchingState(prev => ({
          ...prev,
          shuffledWords: [...words].sort(() => Math.random() - 0.5)
        }))
      }

      // Mezcla las opciones del quiz con varios videos
      if (currentStep?.type === 'quiz' && !currentStep.videoUrl && currentStep.options) {
        setShuffledQuizOptions(prev => ({
          ...prev,
          [currentStepIndex]: [...currentStep.options!].sort(() => Math.random() - 0.5)
        }))
      }
    }
  }, [currentStepIndex, currentStep])

  const isLastStep = currentStepIndex === lesson.steps.length - 1

  const dialogueBlanksCount = currentStep?.dialogue?.reduce(
    (acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0),
    0,
  ) || 0

  const handleStart = () => setCurrentStepIndex(0)

  const handleNext = () => {
    if (showFeedback === 'incorrect') {
      // El usuario tocó "Siguiente" después de un error (en vez de "Reintentar")
      setShowFeedback(null)

      if (currentStep.type === 'matching') {
        // En matching, un par incorrecto no avanza de step: solo reinicia la selección actual
        setMatchingState(prev => ({
          ...prev,
          selectedVideo: null,
          selectedWord: null,
          attempts: { ...prev.attempts, [prev.selectedWord || '']: null }
        }))
        return
      }

      setStepAnswers(prev => ({ ...prev, [currentStepIndex]: selectedOption }))

      if (isLastStep) {
        setShowSummary(true)
      } else {
        setCurrentStepIndex(prev => prev + 1)
      }
      return
    }

    if (showFeedback === 'correct') {
      // El usuario tocó "Siguiente" después de responder correctamente
      setShowFeedback(null)
      setStepAnswers(prev => ({ ...prev, [currentStepIndex]: selectedOption }))

      if (!correctSteps.has(currentStepIndex)) {
        setCorrectSteps(prev => {
          const newSet = new Set(prev)
          newSet.add(currentStepIndex)
          return newSet
        })
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
      // Verifica el par seleccionado contra la respuesta correcta del step
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

          // Si ya completó todos los pares, el step queda resuelto
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
        }
      }
    } else if (currentStep.type === 'dialogue') {
      const answers: string[] = []
      for (let i = 0; i < dialogueBlanksCount; i++) {
        answers.push(dialogueAnswers[i] || '')
      }

      if (answers.join('|') === currentStep.correctAnswer) {
        setShowFeedback('correct')
      } else {
        setShowFeedback('incorrect')
        setRetryCount(prev => ({
          ...prev,
          [currentStepIndex]: (prev[currentStepIndex] || 0) + 1
        }))
      }
    } else {
      // Step de quiz
      if (selectedOption === currentStep.correctAnswer) {
        setShowFeedback('correct')
      } else {
        setShowFeedback('incorrect')
        setRetryCount(prev => ({
          ...prev,
          [currentStepIndex]: (prev[currentStepIndex] || 0) + 1
        }))
      }
    }
  }

  const handleRetry = () => {
    setShowFeedback(null)
    setSelectedOption(null)
    setDialogueAnswers({})
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

  const toggleFavorite = () => {
    if (!currentStep?.id) return
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentStep.id)) newSet.delete(currentStep.id)
      else newSet.add(currentStep.id)
      return newSet
    })
  }

  const handleMatchSelection = (type: 'video' | 'word', value: string) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return

    setMatchingState(prev => ({
      ...prev,
      [type === 'video' ? 'selectedVideo' : 'selectedWord']: value
    }))
  }

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
      <LessonSummary
        result={completeLessonMutation.data}
        isPending={completeLessonMutation.isPending}
        nextLevel={lessonNumber < LESSONS_POR_MODULO ? lessonNumber + 1 : null}
        onClose={() => router.back()}
        onContinue={() => !completeLessonMutation.isPending && router.back()}
        insets={insets}
      />
    )
  }

  return (
    <View
      className="flex-1 bg-background overflow-hidden"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <LessonHeader
        stats={{
          xp: statsQuery.data?.total_xp ?? 0,
          stars: statsQuery.data?.total_points ?? 0,
          paws: statsQuery.data?.total_signs ?? 0,
        }}
        progress={Math.max(0, ((currentStepIndex + 1) / lesson.steps.length) * 100)}
      />

      <IntroModal
        visible={currentStepIndex === -1}
        levelId={lessonNumber}
        title={lesson.title}
        description={lesson.description}
        onStart={handleStart}
      />

      {/* Contenido del step actual */}
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
            <View className="flex-1 w-full">
              {currentStep.videoUrl ? (
                <View className="w-full items-center justify-center mb-2">
                  <LessonVideo uri={currentStep.videoUrl} muted={isMuted} className="h-[200px] aspect-[9/16]" />
                </View>
              ) : null}

              <DialogueExercise
                question={currentStep.question}
                dialogue={currentStep.dialogue ?? []}
                options={currentStep.options ?? []}
                answers={dialogueAnswers}
                onAnswersChange={setDialogueAnswers}
              />
            </View>
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

      <FeedbackModal
        feedback={showFeedback}
        tip={currentStep?.tip}
        retryPoints={retryPoints}
        onRetry={handleRetry}
        onNext={handleNext}
      />

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
