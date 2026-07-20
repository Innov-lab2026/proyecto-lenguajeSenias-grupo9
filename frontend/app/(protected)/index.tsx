import { useState } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatsHeader } from '@/src/components/features/home/StatsHeader'
import { ModuleTabs } from '@/src/components/features/home/ModuleTabs'
import { IslandPath } from '@/src/components/features/home/IslandPath'
import { LockedModuleView } from '@/src/components/features/home/LockedModuleView'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { MOCK_HOME_STATS, MOCK_HOME_MODULES } from '@/src/constants/home'
import { getModuleProgress, getLockedModuleMessage } from '@/src/utils/home'

export default function HomeScreen() {
  const [selectedModuleId, setSelectedModuleId] = useState(MOCK_HOME_MODULES[0].id)

  const selectedModule =
    MOCK_HOME_MODULES.find((m) => m.id === selectedModuleId) ?? MOCK_HOME_MODULES[0]

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Mobile-first: en desktop/tablet el home se acota a una columna centrada
          (mismo criterio que las pantallas de auth) para no estirar el zigzag. */}
      <View className="mx-auto w-full max-w-3xl flex-1">
        <View className="w-full gap-4 px-5 pb-3 pt-4">
          <StatsHeader stats={MOCK_HOME_STATS} />
          {/* La barra mide el progreso del módulo abierto (islas completadas / 5). */}
          <ProgressBar progress={getModuleProgress(selectedModule)} />
        </View>

        <ModuleTabs
          modules={MOCK_HOME_MODULES}
          selectedId={selectedModuleId}
          onSelect={setSelectedModuleId}
        />

        {selectedModule.state === 'unlocked' ? (
          <IslandPath
            module={selectedModule}
            // Placeholder hasta que exista la vista de lección.
            onIslandPress={(n) =>
              Alert.alert('Próximamente', `Las lecciones de la isla ${n} estarán disponibles pronto.`)
            }
          />
        ) : (
          <LockedModuleView message={getLockedModuleMessage(MOCK_HOME_MODULES, selectedModule)} />
        )}
      </View>
    </SafeAreaView>
  )
}
