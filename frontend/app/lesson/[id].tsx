import { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { ContentStep } from '@/src/components/features/lessons/steps/ContentStep'
import { QuizStep } from '@/src/components/features/lessons/steps/QuizStep'
import { MatchingStep } from '@/src/components/features/lessons/steps/MatchingStep'
import { CompositionStep } from '@/src/components/features/lessons/steps/CompositionStep'
import { DialogueCompositionStep } from '@/src/components/features/lessons/steps/DialogueCompositionStep'
import { DialogueSequenceStep } from '@/src/components/features/lessons/steps/DialogueSequenceStep'
import { DialogueExercise } from '@/src/components/features/lessons/DialogueExercise'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { LessonSummary } from '@/src/components/features/lessons/LessonSummary'
import { LessonHeader } from '@/src/components/features/lessons/LessonHeader'
import { LessonFooter } from '@/src/components/features/lessons/LessonFooter'
import { IntroModal } from '@/src/components/features/lessons/IntroModal'
import { FeedbackModal } from '@/src/components/features/lessons/FeedbackModal'
import { PauseModal } from '@/src/components/features/lessons/PauseModal'
import { HintModal } from '@/src/components/features/lessons/HintModal'
import { FeedbackCompleteModal } from '@/src/components/features/lessons/FeedbackCompleteModal'
import { useLessonEngine } from '@/src/hooks/features/lessons/useLessonEngine'
import { useStats } from '@/src/hooks/features/lessons/useStats'
import { useCompletedLessons } from '@/src/hooks/features/lessons/useCompletedLessons'
import { useFavoritesStore } from '@/src/store/favoritesStore'
import { LESSON_SHELL } from '@/src/constants/lessons'
import { cn } from '@/src/utils/cn'

export default function LessonScreen() {
  const { id, n, pr, ck } = useLocalSearchParams()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // `id` es el UUID real de la lección (para completeLesson); `n` es el
  // lesson_number (1-5), sólo para mostrar "Nivel N" y el desbloqueo. El
  // backend no modela el contenido del ejercicio todavía (ver
  // PLAN_FRONTEND_CONECTAR_BACKEND.md §4) — sólo la economía.
  const lessonNumber = Number(Array.isArray(n) ? n[0] : n) || 1

  const contentKey = (Array.isArray(ck) ? ck[0] : ck) ?? null

  const absoluteLevel = (() => {
    if (contentKey) {
      const match = contentKey.match(/m(\d+)-l(\d+)/)
      if (match) {
        const moduleNum = parseInt(match[1])
        const lessonNum = parseInt(match[2])
        return (moduleNum - 1) * 5 + lessonNum
      }
    }
    return lessonNumber
  })()

  // `pr` = points_retry de la lección (LessonMeta), también por query param:
  // sólo para mostrar en el feedback cuántos puntos se pueden ganar todavía
  // tras un error. La recompensa real la calcula y persiste el server.
  // Provisional hasta que exista GET /api/lessons/:id y se pueda pedir la
  // metadata desde acá en vez de arrastrarla por la URL.
  const retryPoints = Number(Array.isArray(pr) ? pr[0] : pr) || 0

  // Si se entró a la lección por URL directa (recarga, link compartido) no hay
  // una entrada previa en el historial para volver: router.back() no hace nada.
  const exitLesson = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/home')
    }
  }

  const statsQuery = useStats()
  const completedLessonsQuery = useCompletedLessons()
  const [wasAlreadyCompleted, setWasAlreadyCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    if (completedLessonsQuery.data && wasAlreadyCompleted === null) {
      const isCompleted = completedLessonsQuery.data.some((c) => c.lesson_id === id)
      setWasAlreadyCompleted(isCompleted)
    }
  }, [completedLessonsQuery.data, id, wasAlreadyCompleted])

  const {
    lesson,
    hasContent,
    isLoadingVideos,
    currentStep,
    currentStepIndex,
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
    currentStepErrorCount,
    completionResult,
    isSaving,
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
    markStepVideoWatched,
    toggleFavorite,
    handleMatchSelection,
    handleAddWordToComposition,
    handleRemoveWordFromComposition,
  } = useLessonEngine({ lessonId: id as string, lessonNumber, contentKey })

  // Steps donde el botón "atrás" vuelve al intro modal de la lección.
  const introBackStepIds = new Set([
    'm1-l1-content-1',
    'm1-l2-content-interactive',
    'm1-l3-content-interactive',
    'm1-l4-content-interactive',
    'm1-l5-content-1',
    'm2-l1-composition',
    'm2-l2-content-interactive',
    'm2-l3-content-interactive',
    'm2-l4-content-interactive',
    'm2-l5-dialogue-1',
  ])
  const isIntroBackStep = !!currentStep && introBackStepIds.has(currentStep.id)

  // Lección sembrada en la DB pero sin contenido cargado para su content_key.
  if (!hasContent) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Ionicons name="construct-outline" size={64} color="#9BA8B1" />
        <Text className="font-nunito text-xl font-bold text-ink text-center mt-4">
          Lección en preparación
        </Text>
        <Text className="font-nunito text-base text-muted text-center mt-2">
          Todavía estamos armando el contenido de esta lección. ¡Volvé pronto!
        </Text>
        <Button label="Volver" onPress={exitLesson} className="mt-6 px-10" />
      </View>
    )
  }

  // Los videos de los steps se resuelven por id contra el catálogo: hasta que
  // llega, las URLs están vacías. Montar igual dejaría los players sin fuente
  // (y el gate de "ya lo viste" nunca se destrabaría).
  if (isLoadingVideos) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#5F9BA4" />
      </View>
    );
  }

  if (showSummary) {
    if (wasAlreadyCompleted) {
      return (
        <FeedbackCompleteModal
          visible={showSummary}
          onContinue={() => router.replace('/home')}
        />
      )
    }

    return (
      <LessonSummary
        result={completionResult}
        isPending={isSaving}
        nextLevel={nextLevel}
        contentKey={contentKey}
        onClose={exitLesson}
        onContinue={() => !isSaving && exitLesson()}
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
        levelId={absoluteLevel}
        islandNumber={lessonNumber}
        title={lesson.title}
        description={lesson.description}
        onStart={handleStart}
        onClose={exitLesson}
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
              muted={isMuted}
            />
          ) : currentStep.type === 'matching' ? (
            <MatchingStep
              step={currentStep}
              matchingState={matchingState}
              onSelect={handleMatchSelection}
              muted={isMuted}
            />
          ) : currentStep.type === 'composition' ? (
            <CompositionStep
              step={currentStep}
              compositionAnswers={compositionAnswers[currentStepIndex] ?? []}
              onAddWord={handleAddWordToComposition}
              onRemoveWord={handleRemoveWordFromComposition}
              isLocked={correctSteps.has(currentStepIndex)}
              muted={isMuted}
            />
          ) : currentStep.type === 'dialogue-composition' ? (
            <DialogueCompositionStep
              step={currentStep}
              compositionAnswers={compositionAnswers[currentStepIndex] ?? []}
              onAddWord={handleAddWordToComposition}
              onRemoveWord={handleRemoveWordFromComposition}
              isLocked={correctSteps.has(currentStepIndex)}
              muted={isMuted}
              onVideoWatched={() => markStepVideoWatched(currentStepIndex)}
            />
          ) : currentStep.type === 'dialogue-sequence' ? (
            <DialogueSequenceStep
              step={currentStep}
              muted={isMuted}
              onVideoWatched={() => markStepVideoWatched(currentStepIndex)}
            />
          ) : currentStep.type === 'dialogue' ? (
            <View className="flex-1 w-full">
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
              muted={isMuted}
            />
          )}
        </View>
      )}

      <FeedbackModal
        feedback={showFeedback}
        tip={currentStep?.tip}
        retryPoints={retryPoints}
        errorCount={currentStepErrorCount}
        stepType={currentStep?.type}
        contentKey={contentKey}
        onRetry={handleRetry}
        onNext={handleNext}
        onExit={() => router.replace('/home')}
      />

      <PauseModal
        visible={showSettings}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onExit={() => {
          setShowSettings(false)
          setTimeout(() => {
            exitLesson()
          }, 100)
        }}
        onClose={() => setShowSettings(false)}
      />

      <HintModal visible={showHint} tip={currentStep?.tip} onClose={() => setShowHint(false)} />

      {!showFeedback && currentStepIndex !== -1 && (
        <LessonFooter
          ctaLabel={footerLabel}
          ctaDisabled={footerDisabled}
          onNext={handleNext}
          showBack={currentStepIndex > 0 || isIntroBackStep}
          onBack={isIntroBackStep ? handleBackToIntro : handleBack}
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
