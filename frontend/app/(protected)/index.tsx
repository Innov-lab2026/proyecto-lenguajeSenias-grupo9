import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/src/components/common/Button'
import { useLogout } from '@/src/hooks/features/auth/useLogout'
import { LearningPath } from '@/src/components/features/learning/LearningPath'
import type { Lesson } from '@/src/types/learning'

const MOCK_LESSONS: Lesson[] = [
  { id: '1', title: 'Abecedario LSA', state: 'completed', type: 'theory' },
  { id: '2', title: 'Números 1-10', state: 'completed', type: 'practice' },
  { id: '3', title: 'Saludos Básicos', state: 'current', type: 'practice' },
  { id: '4', title: 'Trivia Familiar', state: 'available', type: 'quiz' },
  { id: '5', title: 'Señas de Comida', state: 'locked', type: 'camera' },
  { id: '6', title: 'Repaso General', state: 'locked', type: 'review' },
]

export default function HomeScreen() {
  const logout = useLogout()

  const handleLessonPress = (lessonId: string) => {
    const lesson = MOCK_LESSONS.find((l) => l.id === lessonId)
    if (lesson) {
      Alert.alert('Lección Seleccionada', `Iniciando: ${lesson.title}`)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header Premium */}
      <View className="w-full flex-row items-center justify-between border-b border-muted/10 bg-surface px-5 py-4 shadow-sm">
        <View>
          <Text className="font-nunito text-2xl font-bold text-ink">Carpiseñas</Text>
          <Text className="font-nunito text-xs text-muted">Aprende Lengua de Señas Argentina</Text>
        </View>
        <Button label="Salir" variant="ghost" onPress={logout} className="h-10 w-20 rounded-lg px-2" />
      </View>

      {/* Camino de Aprendizaje */}
      <LearningPath lessons={MOCK_LESSONS} onLessonPress={handleLessonPress} />
    </SafeAreaView>
  )
}
