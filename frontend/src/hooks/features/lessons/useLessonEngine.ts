import { useEffect, useState } from 'react'
import { MOCK_LESSON_1, MOCK_LESSON_2, MOCK_LESSON_3, MOCK_LESSON_4, MOCK_LESSON_5, type MatchingState } from '@/src/types/lessons'
import { LESSONS_POR_MODULO } from '@/src/constants/lessons'
import { useCompleteLesson } from './useCompleteLesson'

interface UseLessonEngineArgs {
  /** UUID real de la lección (el que consume completeLesson). */
  lessonId: string
  /** 1 a 5: la isla dentro del módulo. Decide qué contenido mock se muestra. */
  lessonNumber: number
}

/**
 * Máquina de estados de la lección: qué step se muestra, respuestas, feedback,
 * y toda la UI de acompañamiento (ajustes/pista/favoritos). No conoce routing
 * ni safe-area — eso lo resuelve la pantalla (`app/lesson/[id].tsx`), que sólo
 * compone este estado en componentes.
 *
 * La recompensa NO se calcula acá: al llegar al resumen se dispara
 * `completeLesson` y el server decide y persiste cuánto se ganó. Este hook
 * sólo informa qué pasó (`isPerfect`) y expone el resultado.
 */
export function useLessonEngine({ lessonId, lessonNumber }: UseLessonEngineArgs) {
  const lesson = (() => {
    if (lessonNumber === 2) return MOCK_LESSON_2
    if (lessonNumber === 3) return MOCK_LESSON_3
    if (lessonNumber === 4) return MOCK_LESSON_4
    if (lessonNumber === 5) return MOCK_LESSON_5
    return MOCK_LESSON_1
  })()

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
    completeLessonMutation.mutate({ lessonId, isPerfect })
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

  /** Próximo nivel a desbloquear, o `null` si es la última lección del módulo. */
  const nextLevel = lessonNumber < LESSONS_POR_MODULO ? lessonNumber + 1 : null

  return {
    lesson,
    currentStep,
    currentStepIndex,
    isLastStep,

    selectedOption,
    setSelectedOption,
    matchingState,
    dialogueAnswers,
    setDialogueAnswers,
    shuffledQuizOptions,
    correctSteps,

    showFeedback,
    showSummary,
    /** Resultado de completeLesson: `undefined` mientras la request está en vuelo. */
    completionResult: completeLessonMutation.data,
    isSaving: completeLessonMutation.isPending,

    isMuted,
    setIsMuted,
    showSettings,
    setShowSettings,
    showHint,
    setShowHint,
    hintViewed,
    setHintViewed,
    favorites,

    footerLabel,
    footerDisabled,
    nextLevel,

    handleStart,
    handleNext,
    handleRetry,
    handleBack,
    markWatched,
    toggleFavorite,
    handleMatchSelection,
  }
}
