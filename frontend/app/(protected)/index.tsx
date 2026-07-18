import { useState } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LearningPath } from '@/src/components/features/learning/LearningPath'
import { ModuleTabs } from '@/src/components/features/learning/ModuleTabs'
import { StatsHeader } from '@/src/components/features/home/StatsHeader'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { MOCK_HOME_STATS, MOCK_HOME_MODULES } from '@/src/constants/home'
import { getModuleProgress } from '@/src/utils/home'
import type { Module } from '@/src/types/learning'

const MOCK_MODULES: Module[] = [
  {
    id: 'modulo-1',
    title: 'Módulo 1',
    state: 'completed',
    lessons: [
      { id: '1-1', title: 'Abecedario LSA', state: 'completed', type: 'theory' },
      { id: '1-2', title: 'Vocales', state: 'completed', type: 'practice' },
      { id: '1-3', title: 'Consonantes', state: 'completed', type: 'practice' },
      { id: '1-4', title: 'Tu nombre en señas', state: 'completed', type: 'quiz' },
    ],
  },
  {
    id: 'modulo-2',
    title: 'Módulo 2',
    state: 'current',
    lessons: [
      { id: '2-1', title: 'Saludos', state: 'completed', type: 'theory' },
      { id: '2-2', title: 'Números 1-10', state: 'current', type: 'practice' },
      { id: '2-3', title: 'Trivia Familiar', state: 'available', type: 'quiz' },
      { id: '2-4', title: 'Señas de Comida', state: 'locked', type: 'camera' },
      { id: '2-5', title: 'Repaso General', state: 'locked', type: 'review' },
    ],
  },
  {
    id: 'modulo-3',
    title: 'Módulo 3',
    state: 'locked',
    lessons: [],
  },
]

export default function HomeScreen() {
  const [selectedModuleId, setSelectedModuleId] = useState('modulo-2')

  const selectedModule = MOCK_MODULES.find((m) => m.id === selectedModuleId) ?? MOCK_MODULES[0]

  const handleLessonPress = (lessonId: string) => {
    const lesson = selectedModule.lessons.find((l) => l.id === lessonId)
    if (lesson) {
      Alert.alert('Lección seleccionada', `Iniciando: ${lesson.title}`)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header nuevo del home. TODO(paso C/D): conectar el progreso al módulo
          seleccionado cuando las pestañas usen MOCK_HOME_MODULES. */}
      <View className="w-full gap-4 px-5 pb-3 pt-4">
        <StatsHeader stats={MOCK_HOME_STATS} />
        <ProgressBar progress={getModuleProgress(MOCK_HOME_MODULES[0])} />
      </View>

      <ModuleTabs
        modules={MOCK_MODULES}
        selectedId={selectedModuleId}
        onSelect={setSelectedModuleId}
      />
      <View className="flex-1">
        <LearningPath
          lessons={selectedModule.lessons}
          onLessonPress={handleLessonPress}
        />
      </View>
    </SafeAreaView>
  )
}

