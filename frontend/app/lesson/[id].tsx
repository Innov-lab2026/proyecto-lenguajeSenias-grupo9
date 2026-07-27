import { useRouter, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ContentStep } from '@/src/components/features/lessons/steps/ContentStep'
import { QuizStep } from '@/src/components/features/lessons/steps/QuizStep'
import { MatchingStep } from '@/src/components/features/lessons/steps/MatchingStep'
import { DialogueStep } from '@/src/components/features/lessons/steps/DialogueStep'
import { LessonSummary } from '@/src/components/features/lessons/LessonSummary'
import { LessonHeader } from '@/src/components/features/lessons/LessonHeader'
import { LessonFooter } from '@/src/components/features/lessons/LessonFooter'
import { IntroModal } from '@/src/components/features/lessons/IntroModal'
import { FeedbackModal } from '@/src/components/features/lessons/FeedbackModal'
import { SettingsModal } from '@/src/components/features/lessons/SettingsModal'
import { HintModal } from '@/src/components/features/lessons/HintModal'
import { useLessonEngine } from '@/src/hooks/features/lessons/useLessonEngine'
import { MOCK_HOME_STATS } from '@/src/constants/home'
import { LESSON_SHELL } from '@/src/constants/lessons'
import { cn } from '@/src/utils/cn'

export default function LessonScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const {
    lesson,
    currentStep,
    currentStepIndex,
    selectedOption,
    setSelectedOption,
    matchingState,
    dialogueAnswers,
    selectedWordForDialogue,
    setSelectedWordForDialogue,
    shuffledQuizOptions,
    correctSteps,
    showFeedback,
    showSummary,
    isSaving,
    earnedStats,
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
  } = useLessonEngine(id)

  if (showSummary) {
    return (
      <LessonSummary
        earnedStats={earnedStats}
        signCount={signCount}
        nextLevel={nextLevel}
        isSaving={isSaving}
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
          xp: MOCK_HOME_STATS.xp + earnedStats.xp,
          stars: MOCK_HOME_STATS.stars + earnedStats.stars,
          paws: MOCK_HOME_STATS.paws,
        }}
        progress={Math.max(0, ((currentStepIndex + 1) / lesson.steps.length) * 100)}
      />

      <IntroModal
        visible={currentStepIndex === -1}
        levelId={id}
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
