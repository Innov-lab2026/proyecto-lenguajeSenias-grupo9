import { useState, useCallback, useRef } from 'react'
import { Alert, View, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatsHeader } from '@/src/components/features/home/StatsHeader'
import { ModuleTabs } from '@/src/components/features/home/ModuleTabs'
import { IslandPath } from '@/src/components/features/home/IslandPath'
import { LockedModuleView } from '@/src/components/features/home/LockedModuleView'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { MOCK_HOME_STATS, MOCK_HOME_MODULES, ISLANDS_PER_MODULE } from '@/src/constants/home'
import { getModuleProgress, getLockedModuleMessage } from '@/src/utils/home'
import { getUserProgress, type UserProgress } from '@/src/services/progress'

import { useRouter, useFocusEffect } from 'expo-router'

export default function HomeScreen() {
  const router = useRouter()
  const [selectedModuleId, setSelectedModuleId] = useState(MOCK_HOME_MODULES[0].id)
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [stats, setStats] = useState(MOCK_HOME_STATS)
  const [loading, setLoading] = useState(true)
  // Ref (no state): necesitamos leer "ya cargamos alguna vez" dentro de un
  // useCallback con deps [] sin que ese closure quede pegado al `progress`
  // del primer render (ese bug hacía que "progress.length === 0" diera
  // siempre true, mostrando el spinner en cada regreso al home — eso
  // desmonta StatsHeader y lo remonta ya con el valor final, matando la
  // animación de conteo que se dispara cuando `value` sube).
  const hasLoadedOnce = useRef(false)

  const insets = useSafeAreaInsets()

  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        try {
          // Sólo en la primera carga: los regresos posteriores actualizan
          // `stats` con StatsHeader montado, para que se vea la animación.
          if (!hasLoadedOnce.current) setLoading(true)

          const data = await getUserProgress()
          setProgress(data)

          const totalXp = data.reduce((acc, p) => acc + p.total_xp, 0)
          const totalStars = data.reduce((acc, p) => acc + p.total_stars, 0)
          const totalSigns = data.reduce((acc, p) => acc + p.total_signs, 0)

          setStats(prev => ({
            ...prev,
            xp: totalXp || prev.xp,
            stars: totalStars || prev.stars,
            paws: totalSigns || prev.paws
          }))
        } catch (error) {
          console.error('Error fetching progress:', error)
        } finally {
          setLoading(false)
          hasLoadedOnce.current = true
        }
      }
      fetchProgress()
    }, [])
  )

  // Mapear los módulos mock con el progreso real
  const modulesWithProgress = MOCK_HOME_MODULES.map((m, index) => {
    const p = progress.find(prog => prog.module_id === m.id)
    const completedIslands = p ? p.completed_islands : 0

    // El módulo 1 siempre está unlocked.
    // Los siguientes módulos se desbloquean si el anterior completó todas sus islas.
    let state = m.state
    if (index > 0) {
      const prevModule = MOCK_HOME_MODULES[index - 1]
      const prevProgress = progress.find(prog => prog.module_id === prevModule.id)
      const prevCompleted = prevProgress ? prevProgress.completed_islands : 0
      state = prevCompleted >= ISLANDS_PER_MODULE ? 'unlocked' : 'locked'
    }

    return {
      ...m,
      completedIslands,
      state
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
            onIslandPress={(n) => {
              const moduleOffset = selectedModule.id === 'modulo-1' ? 0 : selectedModule.id === 'modulo-2' ? 5 : 10
              router.push(`/lesson/${moduleOffset + n}`)
            }}
          />
        ) : (
          <LockedModuleView message={getLockedModuleMessage(modulesWithProgress, selectedModule)} />
        )}
      </View>
    </View>
  )
}

