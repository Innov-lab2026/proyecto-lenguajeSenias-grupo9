import { useState, useCallback } from 'react'
import { Alert, View, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatsHeader } from '@/src/components/features/home/StatsHeader'
import { ModuleTabs } from '@/src/components/features/home/ModuleTabs'
import { IslandPath } from '@/src/components/features/home/IslandPath'
import { LockedModuleView } from '@/src/components/features/home/LockedModuleView'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { MOCK_HOME_STATS, MOCK_HOME_MODULES } from '@/src/constants/home'
import { getModuleProgress, getLockedModuleMessage } from '@/src/utils/home'
import { getUserProgress, type UserProgress } from '@/src/services/progress'

import { useRouter, useFocusEffect } from 'expo-router'

export default function HomeScreen() {
  const router = useRouter()
  const [selectedModuleId, setSelectedModuleId] = useState(MOCK_HOME_MODULES[0].id)
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [stats, setStats] = useState(MOCK_HOME_STATS)
  const [loading, setLoading] = useState(true)

  const insets = useSafeAreaInsets()

  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        try {
          // No mostramos loading si ya tenemos datos para evitar parpadeos al volver
          if (progress.length === 0) setLoading(true)
          
          const data = await getUserProgress()
          setProgress(data)
          
          const totalXp = data.reduce((acc, p) => acc + p.total_xp, 0)
          const totalStars = data.reduce((acc, p) => acc + p.total_stars, 0)
          
          setStats(prev => ({
            ...prev,
            xp: totalXp || prev.xp,
            stars: totalStars || prev.stars
          }))
        } catch (error) {
          console.error('Error fetching progress:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchProgress()
    }, [])
  )

  // Mapear los módulos mock con el progreso real
  const modulesWithProgress = MOCK_HOME_MODULES.map(m => {
    const p = progress.find(prog => prog.module_id === m.id)
    return {
      ...m,
      completedIslands: p ? p.completed_islands : 0
    }
  })

  const selectedModule =
    modulesWithProgress.find((m) => m.id === selectedModuleId) ?? modulesWithProgress[0]

  if (loading) {
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
          modules={modulesWithProgress}
          selectedId={selectedModuleId}
          onSelect={setSelectedModuleId}
        />

        {selectedModule.state === 'unlocked' ? (
          <IslandPath
            module={selectedModule}
            onIslandPress={(n) => router.push(`/lesson/${n}`)}
          />
        ) : (
          <LockedModuleView message={getLockedModuleMessage(modulesWithProgress, selectedModule)} />
        )}
      </View>
    </View>
  )
}

