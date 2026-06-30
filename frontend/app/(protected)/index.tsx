import { useState } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LearningPath } from '@/src/components/features/learning/LearningPath'
import { ModuleTabs } from '@/src/components/features/learning/ModuleTabs'
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

