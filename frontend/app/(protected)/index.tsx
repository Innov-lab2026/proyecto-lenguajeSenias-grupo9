import { useCallback, useState, useRef, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { StatsHeader } from '@/src/components/features/home/StatsHeader'
import { ModuleTabs } from '@/src/components/features/home/ModuleTabs'
import { IslandPath } from '@/src/components/features/home/IslandPath'
import { LockedModuleView } from '@/src/components/features/home/LockedModuleView'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { getModuleProgress, getLockedModuleMessage } from '@/src/utils/home'
import { useModules } from '@/src/hooks/features/lessons/useModules'
import { useAllLessons } from '@/src/hooks/features/lessons/useAllLessons'
import { useStats } from '@/src/hooks/features/lessons/useStats'
import { useCompletedLessons } from '@/src/hooks/features/lessons/useCompletedLessons'
import { getLastCompletedLessonId } from '@/src/hooks/features/lessons/useLessonEngine'
import type { HomeModule } from '@/src/types/home'
import { DevelopmentModal } from '@/src/components/features/home/DevelopmentModal'

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  // null = "todavía no elegiste": se resuelve al primer módulo cuando cargue.
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [devModalVisible, setDevModalVisible] = useState(false)
  const [devModalLevel, setDevModalLevel] = useState(11)

  const justCompletedLessonIdRef = useRef<string | null>(null)

  const modulesQuery = useModules()
  const statsQuery = useStats()
  const completedLessonsQuery = useCompletedLessons()
  const lessonsQuery = useAllLessons()

  // El home NO se desmonta al entrar a una lección (el Stack raíz la apila
  // encima, no la reemplaza) — vuelve a quedar visible con router.back() sin
  // pasar por un mount nuevo. Por eso el refetch-on-mount de estas queries no
  // alcanza: refetch() explícito al ganar foco trae el progreso actualizado
  // (stats Y lecciones completadas, esta última la que desbloquea la
  // siguiente isla) cada vez que se vuelve a ver el home, sin depender de un
  // reload manual (ver DOCS/LESSONS_UI_IMPLEMENTATION.md).
  const { refetch: refetchStats } = statsQuery
  const { refetch: refetchCompletedLessons } = completedLessonsQuery
  useFocusEffect(
    useCallback(() => {
      refetchStats()
      refetchCompletedLessons()

      const completedId = getLastCompletedLessonId()
      if (completedId) {
        justCompletedLessonIdRef.current = completedId
      }
    }, [refetchStats, refetchCompletedLessons])
  )

  const sortedModules = [...(modulesQuery.data ?? [])].sort((a, b) => a.order - b.order)
  const effectiveSelectedId = selectedModuleId ?? sortedModules[0]?.id

  const completedLessonIds = new Set((completedLessonsQuery.data ?? []).map((c) => c.lesson_id))
  const allLessons = lessonsQuery.data ?? []

  const lessonsOf = (moduleId: string) =>
    allLessons.filter((l) => l.module_id === moduleId).sort((a, b) => a.lesson_number - b.lesson_number)

  const selectedModuleLessons = effectiveSelectedId ? lessonsOf(effectiveSelectedId) : []

  /** Un módulo está completo cuando tiene lecciones y todas figuran completadas. */
  const isModuleComplete = (moduleId: string) => {
    const lessons = lessonsOf(moduleId)
    return lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l.id))
  }

  const isLoading =
    modulesQuery.isPending ||
    statsQuery.isPending ||
    completedLessonsQuery.isPending ||
    lessonsQuery.isPending

  useEffect(() => {
    if (isLoading || sortedModules.length === 0) return

    // 1. Selecciona el módulo activo si no hay ninguno seleccionado (por ejemplo, primer render)
    if (!selectedModuleId) {
      const activeModule = sortedModules.find(m => {
        const prevModule = sortedModules.find(sm => sm.order === m.order - 1)
        const unlocked = m.order === 1 || (prevModule && isModuleComplete(prevModule.id))
        return unlocked && !isModuleComplete(m.id)
      })
      
      if (activeModule) {
        setSelectedModuleId(activeModule.id)
      } else {
        const lastUnlocked = [...sortedModules].reverse().find(m => {
          const prevModule = sortedModules.find(sm => sm.order === m.order - 1)
          return m.order === 1 || (prevModule && isModuleComplete(prevModule.id))
        })
        if (lastUnlocked) {
          setSelectedModuleId(lastUnlocked.id)
        }
      }
      return
    }

    // 2. Redirecciona al siguiente módulo si acabamos de completar una lección y el módulo se completó
    if (justCompletedLessonIdRef.current) {
      const lessonId = justCompletedLessonIdRef.current
      const completedLesson = allLessons.find(l => l.id === lessonId)
      if (completedLesson) {
        const completedModuleId = completedLesson.module_id
        if (isModuleComplete(completedModuleId)) {
          const currentIndex = sortedModules.findIndex(m => m.id === completedModuleId)
          if (currentIndex !== -1 && currentIndex < sortedModules.length - 1) {
            const nextModule = sortedModules[currentIndex + 1]
            setSelectedModuleId(nextModule.id)
          }
        }
      }
      justCompletedLessonIdRef.current = null
    }
  }, [isLoading, completedLessonsQuery.data, modulesQuery.data, lessonsQuery.data])

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#5F9BA4" />
      </View>
    )
  }

  // El primer módulo (menor `order`) siempre está desbloqueado; cada uno de los
  // siguientes se desbloquea al completar el anterior. Un módulo sembrado pero
  // todavía sin lecciones (ej. el 3) nunca cuenta como completo, así que corta
  // la cadena en vez de desbloquear módulos vacíos.
  const modules: HomeModule[] = sortedModules.map((m, index) => ({
    id: m.id,
    title: m.title,
    state: index === 0 || isModuleComplete(sortedModules[index - 1].id) ? 'unlocked' : 'locked',
    completedIslands: lessonsOf(m.id).filter((l) => completedLessonIds.has(l.id)).length,
  }))

  const selectedModule = modules.find((m) => m.id === effectiveSelectedId) ?? modules[0]

  const selectedModuleIndex = modules.findIndex((m) => m.id === selectedModule.id)
  const moduleNumber = selectedModuleIndex !== -1 ? selectedModuleIndex + 1 : 1

  const stats = statsQuery.data
    ? { xp: statsQuery.data.total_xp, stars: statsQuery.data.total_points, paws: statsQuery.data.total_signs }
    : { xp: 0, stars: 0, paws: 0 }

  const handleIslandPress = (islandNumber: number) => {
    const lesson = selectedModuleLessons.find((l) => l.lesson_number === islandNumber)
    if (!lesson) {
      const calculatedLevel = (selectedModuleIndex !== -1 ? selectedModuleIndex : 2) * 5 + islandNumber
      setDevModalLevel(calculatedLevel)
      setDevModalVisible(true)
      return
    }
    // `pr` (points_retry) viaja para que el feedback de error pueda mostrar el
    // número real de puntos que quedan en juego. Es sólo para mostrar: la
    // recompensa la calcula el server al completar la lección.
    // `ck` (content_key) elige qué ejercicio se arma.
    const query = `n=${lesson.lesson_number}&pr=${lesson.points_retry}&ck=${lesson.content_key ?? ''}`
    router.push(`/lesson/${lesson.id}?${query}`)
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
          <IslandPath module={selectedModule} moduleNumber={moduleNumber} onIslandPress={handleIslandPress} />
        ) : (
          <LockedModuleView message={getLockedModuleMessage(modules, selectedModule)} />
        )}
      </View>

      <DevelopmentModal
        visible={devModalVisible}
        levelId={devModalLevel}
        onClose={() => setDevModalVisible(false)}
      />
    </View>
  )
}
