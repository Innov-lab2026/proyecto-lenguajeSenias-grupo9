import { useRouter, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { useLessonEngine } from '@/src/hooks/features/lessons/useLessonEngine'
import { useStats } from '@/src/hooks/features/lessons/useStats'
import { LESSON_SHELL } from '@/src/constants/lessons'
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

  const statsQuery = useStats()

  const {
    lesson,
    currentStep,
    currentStepIndex,
    selectedOption,
    setSelectedOption,
    matchingState,
    dialogueAnswers,
    setDialogueAnswers,
    shuffledQuizOptions,
    correctSteps,
    showFeedback,
    showSummary,
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
    markWatched,
    toggleFavorite,
    handleMatchSelection,
  } = useLessonEngine({ lessonId: id as string, lessonNumber })

  if (showSummary) {
    return (
      <LessonSummary
        result={completionResult}
        isPending={isSaving}
        nextLevel={nextLevel}
        onClose={() => router.back()}
        onContinue={() => !isSaving && router.back()}
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
