import { useEffect, useMemo, useState } from 'react'
import { LESSON_CONTENT, type Lesson, type MatchingState } from '@/src/types/lessons'
import { LESSONS_POR_MODULO } from '@/src/constants/lessons'
import { useCompleteLesson } from './useCompleteLesson'
import { useVideos } from '@/src/hooks/features/alphabet/useVideos'
import { resolveLessonVideos } from '@/src/utils/lessonVideos'
import { useFavoritesStore } from '@/src/store/favoritesStore'
import { usePreferencesStore } from '@/src/store/preferencesStore'

interface UseLessonEngineArgs {
  /** UUID real de la lección (el que consume completeLesson). */
  lessonId: string
  /** 1 a 5: la isla dentro del módulo. Sólo para mostrar "Nivel N" y el desbloqueo. */
  lessonNumber: number
  /** `lessons.content_key` de la DB: con qué contenido se arma el ejercicio. */
  contentKey: string | null
}

let lastCompletedLessonId: string | null = null

export function setLastCompletedLessonId(id: string | null) {
  lastCompletedLessonId = id
}

export function getLastCompletedLessonId() {
  const val = lastCompletedLessonId
  lastCompletedLessonId = null
  return val
}

/** Placeholder para que el hook no tenga que lidiar con `lesson` nulo. La pantalla corta antes (ver `hasContent`). */
const EMPTY_LESSON: Lesson = { title: '', description: '', steps: [] }

/** Normaliza una frase de `composition` para compararla: sin espacios, signos ni mayúsculas. */
function normalizeComposition(value: string): string {
  return value.toLowerCase().replace(/[¿?¡!.,\s]/g, '')
}

/** Cantidad de huecos `[blank]` de un step `composition`. */
function countBlanks(sentence: string | undefined): number {
  return sentence?.match(/\[blank\]/g)?.length ?? 0
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
export function useLessonEngine({ lessonId, lessonNumber, contentKey }: UseLessonEngineArgs) {
  // Sin fallback a otra lección: mostrar contenido ajeno cuando falta el propio
  // confunde más de lo que ayuda. `hasContent` deja que la pantalla avise.
  const content = contentKey ? LESSON_CONTENT[contentKey] : undefined
  const hasContent = content != null

  // Los videos se referencian por id en LESSON_CONTENT y se resuelven contra el
  // catálogo (ver utils/lessonVideos.ts). Se hace acá y no en la pantalla porque
  // este hook también lee `videoUrl`/`pairs[].videoUrl` internamente (matching,
  // favoritos, quiz): resolviendo en el origen, todo lo de abajo ve URLs reales.
  //
  // ⚠️ useMemo NO es una optimización acá — es correctitud, y no lo saques.
  // `resolveLessonVideos` arma un objeto nuevo (`{...lesson, steps: map()}`), así
  // que sin memo `lesson` (y con él `currentStep`) cambia de identidad en cada
  // render. El efecto que mezcla las opciones del quiz depende de `currentStep`:
  // se re-dispararía siempre, llamando setShuffledQuizOptions con un orden nuevo
  // → re-render → loop infinito ("Maximum update depth exceeded", con las
  // opciones del quiz parpadeando y sin poder elegir ninguna).
  const videosQuery = useVideos()
  const videos = videosQuery.data
  const lesson = useMemo(
    () => resolveLessonVideos(content ?? EMPTY_LESSON, videos),
    [content, videos],
  )
  /** El catálogo todavía no llegó: la pantalla espera antes de montar el ejercicio. */
  const isLoadingVideos = videosQuery.isPending

  const completeLessonMutation = useCompleteLesson()

  const [currentStepIndex, setCurrentStepIndex] = useState(-1) // -1 = modal de intro

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [stepAnswers, setStepAnswers] = useState<Record<number, string | null>>({})
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [retryCount, setRetryCount] = useState<Record<number, number>>({})
  const [correctSteps, setCorrectSteps] = useState<Set<number>>(new Set())
  const isMuted = usePreferencesStore((s) => s.isMuted)
  const setIsMuted = usePreferencesStore((s) => s.setIsMuted)
  const [showSettings, setShowSettings] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintViewed, setHintViewed] = useState<Record<number, boolean>>({})

  const favoritesStore = useFavoritesStore()
  useEffect(() => {
    favoritesStore.loadFavorites()
  }, [])
  const favorites = new Set(favoritesStore.items.map((i) => i.id))

  const [watchedOptions, setWatchedOptions] = useState<Record<number, Set<string>>>({})
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<number, string>>({})
  // Por step: qué índice de `options` ocupa cada hueco de la frase (null = vacío).
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
    if (!showSummary) return
    // isPerfect = ningún paso de la lección tuvo un error, en ningún intento.
    // La recompensa la calcula y persiste el server (nunca el cliente); acá
    // sólo se informa qué pasó.
    const isPerfect = Object.keys(retryCount).length === 0
    completeLessonMutation.mutate({ lessonId, isPerfect })
    setLastCompletedLessonId(lessonId)
  }, [showSummary])

  const currentStep = lesson.steps[currentStepIndex]

  useEffect(() => {
    if (currentStepIndex !== -1) {
      const targetStepIds = [
        'm1-l2-content-interactive',
        'm1-l3-content-interactive',
        'm1-l3-quiz',
        'm1-l4-content-interactive',
        'm1-l5-content-1',
        'm2-l2-content-interactive',
        'm2-l4-content-interactive',
      ]
      if (currentStep && targetStepIds.includes(currentStep.id) && currentStep.options && currentStep.options.length > 0) {
        setSelectedOption(stepAnswers[currentStepIndex] || currentStep.options[0])
      } else {
        setSelectedOption(stepAnswers[currentStepIndex] || null)
      }

      // Mezcla las palabras del ejercicio de matching
      if (currentStep?.type === 'matching' && currentStep.pairs) {
        const words = currentStep.pairs.map(p => p.word)
        const defaultVideo = currentStep.id === 'm1-l4-matching' && currentStep.pairs.length > 0
          ? currentStep.pairs[0].videoUrl ?? null
          : null
        setMatchingState(prev => ({
          ...prev,
          selectedVideo: defaultVideo,
          shuffledWords: [...words].sort(() => Math.random() - 0.5)
        }))
      }

      // Mezcla las opciones del quiz con varios videos, salvo que el step pida
      // el orden declarado (`shuffleOptions: false`, ver LessonStep).
      if (
        currentStep?.type === 'quiz' &&
        !currentStep.videoUrl &&
        currentStep.options &&
        currentStep.shuffleOptions !== false
      ) {
        setShuffledQuizOptions(prev => ({
          ...prev,
          [currentStepIndex]: [...currentStep.options!].sort(() => Math.random() - 0.5)
        }))
      }
    }
    // Depende del ID del step, no del objeto: este efecto tiene que correr
    // cuando el usuario CAMBIA de step, no cada vez que `currentStep` cambia de
    // identidad. `lesson` se recalcula si el catálogo de videos se refetchea
    // (staleTime de 5 min), y con el objeto como dependencia eso volvería a
    // mezclar el quiz a mitad de ejercicio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, currentStep?.id])

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
      setStepAnswers(prev => ({ ...prev, [currentStepIndex]: selectedOption }))
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
    } else if (currentStep.type === 'composition') {
      // Se compara la frase armada contra correctAnswer ignorando espacios,
      // mayúsculas y puntuación: el banco de palabras no incluye los signos
      // (van fijos en `sentence`) y hay ejercicios que arman una palabra
      // letra por letra, donde no hay espacios que respetar.
      const answers = compositionAnswers[currentStepIndex] || []
      const built = answers
        .map(idx => (idx !== null && idx !== undefined ? currentStep.options?.[idx] : ''))
        .filter(Boolean)
        .join('')

      if (normalizeComposition(built) === normalizeComposition(currentStep.correctAnswer || '')) {
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

    // En dialogue conservamos las respuestas correctas
    if (currentStep?.type === 'dialogue') {
      const correctParts = currentStep.correctAnswer?.split('|') ?? []
      setDialogueAnswers(prev => {
        const next: Record<number, string> = {}
        Object.entries(prev).forEach(([key, val]) => {
          const idx = Number(key)
          if (val === correctParts[idx]) {
            next[idx] = val
          }
        })
        return next
      })
    } else {
      setDialogueAnswers({})
    }

    // En composition no se borra todo: se conservan las palabras que ya estaban
    // en su lugar y sólo se vacían las mal ubicadas, para no obligar a rehacer
    // una frase larga desde cero.
    if (currentStep?.type === 'composition') {
      const options = currentStep.options ?? []
      const correct = currentStep.correctAnswer ?? ''
      // Una palabra por hueco, salvo que la respuesta no tenga espacios: ahí el
      // ejercicio se arma letra por letra (ej. "teléfono").
      const expected = correct.includes(' ')
        ? correct.split(' ').map(normalizeComposition).filter(Boolean)
        : correct.split('').map(normalizeComposition).filter(Boolean)

      setCompositionAnswers(prev => ({
        ...prev,
        [currentStepIndex]: (prev[currentStepIndex] ?? []).map((optionIdx, blankIdx) => {
          if (optionIdx === null || optionIdx === undefined) return null
          const word = options[optionIdx]
          return word && normalizeComposition(word) === expected[blankIdx] ? optionIdx : null
        })
      }))
    }

    // En matching conservamos los pares que ya se unieron correctamente
    if (currentStep?.type === 'matching') {
      setMatchingState(prev => {
        const nextAttempts: Record<string, 'correct' | 'incorrect' | null> = {}
        const nextCompletedPairs = new Set<string>()
        Object.entries(prev.attempts).forEach(([word, status]) => {
          if (status === 'correct') {
            nextAttempts[word] = 'correct'
            nextCompletedPairs.add(word)
          }
        })
        return {
          ...prev,
          selectedVideo: null,
          selectedWord: null,
          completedPairs: nextCompletedPairs,
          attempts: nextAttempts
        }
      })
    } else {
      setMatchingState({
        selectedVideo: null,
        selectedWord: null,
        completedPairs: new Set(),
        attempts: {},
        shuffledWords: currentStep?.pairs ? [...currentStep.pairs.map(p => p.word)].sort(() => Math.random() - 0.5) : []
      })
    }

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

  /** Vuelve al intro modal de la lección (paso -1). */
  const handleBackToIntro = () => {
    setCurrentStepIndex(-1)
    setShowFeedback(null)
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

    let title = 'Ejercicio'
    let moduleNumber = 1
    const match = contentKey?.match(/m(\d+)-l(\d+)/)
    if (match) {
      moduleNumber = parseInt(match[1])
      const lessonNumber = parseInt(match[2])
      const level = (moduleNumber - 1) * 5 + lessonNumber
      title = `Nivel ${level}, ${lesson.title.toLowerCase()}`
    }

    let videoUrl = currentStep.videoUrl
    if (!videoUrl && currentStep.correctAnswer && currentStep.videoUrls?.[currentStep.correctAnswer]) {
      videoUrl = currentStep.videoUrls[currentStep.correctAnswer]
    } else if (!videoUrl && currentStep.videoUrls) {
      const keys = Object.keys(currentStep.videoUrls)
      if (keys.length > 0) videoUrl = currentStep.videoUrls[keys[0]]
    }

    let subtitle = currentStep.subtitle || ''
    if (!subtitle) {
      if (currentStep.type === 'content') {
        if (currentStep.contentTitle && !currentStep.contentTitle.startsWith('Observá')) {
          subtitle = currentStep.contentTitle
        } else if (currentStep.options) {
          subtitle = currentStep.options.join(', ')
        }
      } else if (currentStep.correctAnswer) {
        if (!currentStep.correctAnswer.startsWith('Opción')) {
          subtitle = currentStep.correctAnswer.replace(/\|/g, ', ')
        }
      } else if (currentStep.type === 'matching') {
        subtitle = 'Relacionar señas'
      }
    }

    favoritesStore.toggleFavorite({
      id: currentStep.id,
      type: 'lesson',
      title,
      videoUrl,
      moduleNumber,
      contentKey: contentKey ?? undefined,
      subtitle: subtitle || undefined
    })
  }

  /** Coloca la opción tocada en el primer hueco libre de la frase. */
  const handleAddWordToComposition = (optionIdx: number) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return

    const blankCount = countBlanks(currentStep?.sentence)
    setCompositionAnswers(prev => {
      const answers = prev[currentStepIndex] ? [...prev[currentStepIndex]] : Array(blankCount).fill(null)
      const firstFree = answers.indexOf(null)
      if (firstFree === -1) return prev

      answers[firstFree] = optionIdx
      return { ...prev, [currentStepIndex]: answers }
    })
  }

  /** Devuelve al banco la palabra de un hueco. */
  const handleRemoveWordFromComposition = (blankIdx: number) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return

    const blankCount = countBlanks(currentStep?.sentence)
    setCompositionAnswers(prev => {
      const answers = prev[currentStepIndex] ? [...prev[currentStepIndex]] : Array(blankCount).fill(null)
      answers[blankIdx] = null
      return { ...prev, [currentStepIndex]: answers }
    })
  }

  const handleMatchSelection = (type: 'video' | 'word', value: string) => {
    if (showFeedback || correctSteps.has(currentStepIndex)) return

    setMatchingState(prev => ({
      ...prev,
      [type === 'video' ? 'selectedVideo' : 'selectedWord']: value
    }))
  }

  const compositionBlankCount = countBlanks(currentStep?.sentence)
  const isCompositionFilled =
    currentStep?.type === 'composition' &&
    compositionBlankCount > 0 &&
    (compositionAnswers[currentStepIndex] ?? Array(compositionBlankCount).fill(null)).every(idx => idx !== null)

  const footerNeedsCheck =
    ((currentStep?.type === 'quiz' && !!selectedOption) ||
      (currentStep?.type === 'matching' && !!matchingState.selectedVideo && !!matchingState.selectedWord) ||
      (currentStep?.type === 'dialogue' && Object.keys(dialogueAnswers).length === dialogueBlanksCount) ||
      (currentStep?.type === 'composition' && isCompositionFilled)) &&
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
      !isCompositionFilled &&
      !correctSteps.has(currentStepIndex))

  let absoluteLevel = lessonNumber
  if (contentKey) {
    const match = contentKey.match(/m(\d+)-l(\d+)/)
    if (match) {
      const moduleNum = parseInt(match[1])
      const lessonNum = parseInt(match[2])
      absoluteLevel = (moduleNum - 1) * 5 + lessonNum
    }
  }

  /** Próximo nivel a desbloquear, o `null` si es la última lección del módulo. */
  const nextLevel = lessonNumber < LESSONS_POR_MODULO ? absoluteLevel + 1 : null

  return {
    lesson,
    /** false si la lección no tiene contenido cargado para su `content_key`. */
    hasContent,
    /** true mientras se descarga el catálogo de videos (sus URLs todavía no están resueltas). */
    isLoadingVideos,
    currentStep,
    currentStepIndex,
    isLastStep,

    selectedOption,
    setSelectedOption,
    matchingState,
    dialogueAnswers,
    setDialogueAnswers,
    compositionAnswers,
    shuffledQuizOptions,
    correctSteps,

    showFeedback,
    showSummary,
    /** Errores acumulados en el step actual (cambia el tono del feedback). */
    currentStepErrorCount: retryCount[currentStepIndex] ?? 0,
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
    handleBackToIntro,
    markWatched,
    toggleFavorite,
    handleMatchSelection,
    handleAddWordToComposition,
    handleRemoveWordFromComposition,
  }
}
