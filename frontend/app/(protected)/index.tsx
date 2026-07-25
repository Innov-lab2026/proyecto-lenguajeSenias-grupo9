import { useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { StatsHeader } from '@/src/components/features/home/StatsHeader'
import { ModuleTabs } from '@/src/components/features/home/ModuleTabs'
import { IslandPath } from '@/src/components/features/home/IslandPath'
import { LockedModuleView } from '@/src/components/features/home/LockedModuleView'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { getModuleProgress, getLockedModuleMessage } from '@/src/utils/home'
import { useModules } from '@/src/hooks/features/lessons/useModules'
import { useModuleLessons } from '@/src/hooks/features/lessons/useModuleLessons'
import { useStats } from '@/src/hooks/features/lessons/useStats'
import { useCompletedLessons } from '@/src/hooks/features/lessons/useCompletedLessons'
import type { HomeModule } from '@/src/types/home'

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  // null = "todavía no elegiste": se resuelve al primer módulo cuando cargue.
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  const modulesQuery = useModules()
  const statsQuery = useStats()
  const completedLessonsQuery = useCompletedLessons()

  const sortedModules = [...(modulesQuery.data ?? [])].sort((a, b) => a.order - b.order)
  const effectiveSelectedId = selectedModuleId ?? sortedModules[0]?.id

  const moduleLessonsQuery = useModuleLessons(effectiveSelectedId)

  const isLoading =
    modulesQuery.isPending ||
    statsQuery.isPending ||
    completedLessonsQuery.isPending ||
    (Boolean(effectiveSelectedId) && moduleLessonsQuery.isPending)

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#5F9BA4" />
      </View>
    )
  }

  const completedLessonIds = new Set((completedLessonsQuery.data ?? []).map((c) => c.lesson_id))
  const selectedModuleLessons = [...(moduleLessonsQuery.data ?? [])].sort(
    (a, b) => a.lesson_number - b.lesson_number,
  )
  const completedIslandsForSelected = selectedModuleLessons.filter((l) =>
    completedLessonIds.has(l.id),
  ).length

  // El primer módulo (menor `order`) siempre está desbloqueado. El resto queda
  // "locked" por ahora: desbloquearlo en cascada necesitaría el progreso de
  // CADA módulo anterior, pero sólo pedimos lecciones del módulo seleccionado
  // (un hook por módulo a la vez, no en loop) — y hoy sólo hay un módulo
  // sembrado, así que no hay con qué ejercitar esa cascada todavía. Ver
  // PLAN_FRONTEND_CONECTAR_BACKEND.md §5.4/§10 antes de tocar esto.
  const modules: HomeModule[] = sortedModules.map((m, index) => ({
    id: m.id,
    title: m.title,
    state: index === 0 ? 'unlocked' : 'locked',
    completedIslands: m.id === effectiveSelectedId ? completedIslandsForSelected : 0,
  }))

  const selectedModule = modules.find((m) => m.id === effectiveSelectedId) ?? modules[0]

  const stats = statsQuery.data
    ? { xp: statsQuery.data.total_xp, stars: statsQuery.data.total_points, paws: statsQuery.data.total_signs }
    : { xp: 0, stars: 0, paws: 0 }

  const handleIslandPress = (islandNumber: number) => {
    const lesson = selectedModuleLessons.find((l) => l.lesson_number === islandNumber)
    if (!lesson) return
    router.push(`/lesson/${lesson.id}?n=${lesson.lesson_number}`)
  }

  if (!selectedModule) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#5F9BA4" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Mobile-first: en desktop/tablet el home se acota a una columna centrada
          (mismo criterio que las pantallas de auth) para no estirar el zigzag. */}
      <View className="mx-auto w-full max-w-3xl flex-1">
        <View className="w-full gap-4 px-5 pb-3 pt-4">
          <StatsHeader stats={stats} />
          {/* La barra mide el progreso del módulo abierto (islas completadas / 5). */}
          <ProgressBar progress={getModuleProgress(selectedModule)} />
        </View>

        <ModuleTabs
          modules={modules}
          selectedId={selectedModule.id}
          onSelect={setSelectedModuleId}
        />

        {selectedModule.state === 'unlocked' ? (
          <IslandPath module={selectedModule} onIslandPress={handleIslandPress} />
        ) : (
          <LockedModuleView message={getLockedModuleMessage(modules, selectedModule)} />
        )}
      </View>
    </View>
  )
}
