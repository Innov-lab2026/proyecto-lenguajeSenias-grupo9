import { useEffect, useState } from 'react'
import { MOCK_LESSON_1, MOCK_LESSON_2, MOCK_LESSON_3, MOCK_LESSON_4, MOCK_LESSON_5, MOCK_LESSON_6, MOCK_LESSON_7, MOCK_LESSON_8, MOCK_LESSON_9, MOCK_LESSON_10, type MatchingState } from '@/src/types/lessons'
import { XP_POR_STEP, PUNTOS_SIN_ERRORES, PUNTOS_CON_ERRORES, SEÑAS_POR_STEP } from '@/src/constants/lessons'
import { getUserProgress, updateProgress } from '@/src/services/progress'

/**
 * Máquina de estados de la lección: qué step se muestra, respuestas, puntaje
 * ganado, y toda la UI de acompañamiento (ajustes/pista/favoritos). No conoce
 * routing ni safe-area — eso lo resuelve la pantalla (`app/lesson/[id].tsx`),
 * que sólo compone este estado en componentes.
 */
export function useLessonEngine(id: string | string[] | undefined) {
  const lesson = (() => {
    if (id === '1') return MOCK_LESSON_1
    if (id === '2') return MOCK_LESSON_2
    if (id === '3') return MOCK_LESSON_3
    if (id === '4') return MOCK_LESSON_4
    if (id === '5') return MOCK_LESSON_5
    if (id === '6') return MOCK_LESSON_6
    if (id === '7') return MOCK_LESSON_7
    if (id === '8') return MOCK_LESSON_8
    if (id === '9') return MOCK_LESSON_9
    return MOCK_LESSON_10
  })()

  // XP_POR_STEP / PUNTOS_* están definidos por lección (coincide con xp_reward/
  // points_perfect/points_retry del seed del backend), no por la posición del
  // step dentro de la lección — la lección 1 tiene 3 steps, así que su quiz
  // queda en currentStepIndex=2 y leería por error los valores de la lección 3
  // si se indexara con currentStepIndex. lessonIndex replica la misma escalera
  // de `id` para no desalinearse con el fallback a la lección 5.
  const lessonIndex = (() => {
    if (id === '1') return 0
    if (id === '2') return 1
    if (id === '3') return 2
    if (id === '4') return 3
    if (id === '5') return 4
    if (id === '6') return 5
    if (id === '7') return 6
    if (id === '8') return 7
    if (id === '10') return 9
    return 9
  })()

  const relativeIsland = (() => {
    const numId = Number(id)
    if (lesson.moduleId === 'modulo-1') return numId
    if (lesson.moduleId === 'modulo-2') return numId - 5
    if (lesson.moduleId === 'modulo-3') return numId - 10
    return numId
  })()

  const [completedIslands, setCompletedIslands] = useState<number | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getUserProgress()
        const prog = data.find(p => p.module_id === lesson.moduleId)
        setCompletedIslands(prog ? prog.completed_islands : 0)
      } catch (error) {
        console.error('Error fetching progress in engine:', error)
      }
    }
    fetchProgress()
  }, [lesson.moduleId])

  const isRepeating = completedIslands !== null && completedIslands >= relativeIsland
  const retryPoints = isRepeating ? 0 : PUNTOS_CON_ERRORES[lessonIndex]
  const signCount = isRepeating ? 0 : SEÑAS_POR_STEP[lessonIndex]

  const [currentStepIndex, setCurrentStepIndex] = useState(-1) // -1 = modal de intro
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
  const [compositionAnswers, setCompositionAnswers] = useState<Record<number, (number | null)[]>>({})
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
            completed_islands: relativeIsland,
            xp_gain: earnedStats.xp,
            stars_gain: earnedStats.stars,
            signs_gain: signCount
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

      // Sigue de largo tras un error: xp de participación, sin estrellas
      setEarnedStats(prev => ({
        ...prev,
        xp: prev.xp + XP_POR_STEP[lessonIndex]
      }))

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

      const errors = retryCount[currentStepIndex] || 0
      const xpGain = XP_POR_STEP[lessonIndex]
      const starsGain = isRepeating
        ? 0
        : errors === 0
          ? PUNTOS_SIN_ERRORES[lessonIndex]
          : errors === 1
            ? PUNTOS_CON_ERRORES[lessonIndex]
            : 0

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
            attempts: { ...prev.attempts, [prev.selectedWord!]: 'incorrect' },
            selectedVideo: null,
            selectedWord: null
          }))
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
    } else if (currentStep.type === 'composition') {
      const stepAnswers = compositionAnswers[currentStepIndex] || []
      const selectedWords = stepAnswers
        .map(idx => (idx !== null && idx !== undefined ? currentStep.options?.[idx] : ''))
        .filter(Boolean)
      const combined = selectedWords.join('')
      const normalizedSelected = combined.toLowerCase().replace(/[¿?.,!\s]/g, '')
      const normalizedCorrect = (currentStep.correctAnswer || '').toLowerCase().replace(/[¿?.,!\s]/g, '')

      if (normalizedSelected === normalizedCorrect) {
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
      // Step de quiz
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

    if (currentStep?.type === 'dialogue' && currentStep.correctAnswer) {
      const correctAnswersArray = currentStep.correctAnswer.split('|')
      setDialogueAnswers(prev => {
        const newAnswers: Record<number, string> = {}
        Object.keys(prev).forEach(key => {
          const idx = Number(key)
          if (prev[idx] === correctAnswersArray[idx]) {
            newAnswers[idx] = prev[idx]
          }
        })
        return newAnswers
      })
    } else {
      setDialogueAnswers({})
    }

    if (currentStep?.type === 'composition') {
      const options = currentStep.options || []
      const cleanWord = (w: string) => w.toLowerCase().replace(/[¿?.,!]/g, '').trim()
      const hasSpaces = (currentStep.correctAnswer || '').trim().includes(' ')
      const correctWords = hasSpaces
        ? (currentStep.correctAnswer || '').split(' ').map(cleanWord).filter(Boolean)
        : (currentStep.correctAnswer || '').split('').map(cleanWord).filter(Boolean)

      setCompositionAnswers(prev => {
        const currentAnswers = prev[currentStepIndex] || []
        const newAnswers = currentAnswers.map((idx, i) => {
          if (idx === null || idx === undefined) return null

          const selectedWord = options[idx]
          const isCorrect = selectedWord && cleanWord(selectedWord) === correctWords[i]
          return isCorrect ? idx : null
        })
        return {
          ...prev,
          [currentStepIndex]: newAnswers
        }
      })
    } else {
      // No reseteamos por completo, pero si no es composition, limpiamos sus respuestas del step actual
      setCompositionAnswers(prev => {
        const copy = { ...prev }
        delete copy[currentStepIndex]
        return copy
      })
    }

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

  const handleMatchSelection = (type: 'video' | 'word', value: string) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return

    setMatchingState(prev => {
      const newAttempts = { ...prev.attempts }
      // Limpia todas las respuestas marcadas como incorrectas al hacer una nueva selección
      Object.keys(newAttempts).forEach(key => {
        if (newAttempts[key] === 'incorrect') {
          newAttempts[key] = null
        }
      })
      return {
        ...prev,
        [type === 'video' ? 'selectedVideo' : 'selectedWord']: value,
        attempts: newAttempts
      }
    })
  }

  const handleAddWordToComposition = (optionIdx: number) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return

    const blankCount = currentStep?.sentence?.match(/\[blank\]/g)?.length || 0
    setCompositionAnswers(prev => {
      const currentAnswers = prev[currentStepIndex]
        ? [...prev[currentStepIndex]]
        : Array(blankCount).fill(null)

      const firstNullIdx = currentAnswers.indexOf(null)
      if (firstNullIdx !== -1) {
        currentAnswers[firstNullIdx] = optionIdx
      }
      return {
        ...prev,
        [currentStepIndex]: currentAnswers
      }
    })
  }

  const handleRemoveWordFromComposition = (blankIdx: number) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return

    const blankCount = currentStep?.sentence?.match(/\[blank\]/g)?.length || 0
    setCompositionAnswers(prev => {
      const currentAnswers = prev[currentStepIndex]
        ? [...prev[currentStepIndex]]
        : Array(blankCount).fill(null)

      currentAnswers[blankIdx] = null
      return {
        ...prev,
        [currentStepIndex]: currentAnswers
      }
    })
  }

  const dialogueBlanksCount = currentStep?.dialogue?.reduce(
    (acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0),
    0,
  ) || 0

  const compositionBlankCount = currentStep?.sentence?.match(/\[blank\]/g)?.length || 0
  const isCompositionStepFilled = currentStep?.type === 'composition' &&
    (compositionAnswers[currentStepIndex] || Array(compositionBlankCount).fill(null)).every(idx => idx !== null)

  const footerNeedsCheck =
    ((currentStep?.type === 'quiz' && !!selectedOption) ||
      (currentStep?.type === 'matching' && !!matchingState.selectedVideo && !!matchingState.selectedWord) ||
      (currentStep?.type === 'dialogue' && Object.keys(dialogueAnswers).length === dialogueBlanksCount) ||
      (currentStep?.type === 'composition' && isCompositionStepFilled)) &&
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
      !correctSteps.has(currentStepIndex)) ||
    (currentStep?.type === 'composition' &&
      !isCompositionStepFilled &&
      !correctSteps.has(currentStepIndex))

  const nextLevel = Number(id) + 1

  return {
    lesson,
    currentStep,
    currentStepIndex,
    isLastStep,

    selectedOption,
    setSelectedOption,
    matchingState,
    dialogueAnswers,
    selectedWordForDialogue,
    setSelectedWordForDialogue,
    compositionAnswers,
    shuffledQuizOptions,
    correctSteps,

    showFeedback,
    showSummary,
    isSaving,
    earnedStats,
    currentStepErrorCount: retryCount[currentStepIndex] || 0,

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
    retryPoints,
    signCount,
    nextLevel,

    handleStart,
    handleNext,
    handleRetry,
    handleBack,
    markWatched,
    handleSelectWordForDialogue,
    toggleFavorite,
    handleMatchSelection,
    handleAddWordToComposition,
    handleRemoveWordFromComposition,
  }
}
