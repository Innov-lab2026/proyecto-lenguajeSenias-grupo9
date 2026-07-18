import { useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatsHeader } from '@/src/components/features/home/StatsHeader'
import { ModuleTabs } from '@/src/components/features/home/ModuleTabs'
import { ProgressBar } from '@/src/components/common/ProgressBar'
import { MOCK_HOME_STATS, MOCK_HOME_MODULES } from '@/src/constants/home'
import { getModuleProgress } from '@/src/utils/home'

export default function HomeScreen() {
  const [selectedModuleId, setSelectedModuleId] = useState(MOCK_HOME_MODULES[0].id)

  const selectedModule =
    MOCK_HOME_MODULES.find((m) => m.id === selectedModuleId) ?? MOCK_HOME_MODULES[0]

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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

      {/* TODO(paso D/E): camino de islas o vista de módulo bloqueado según selectedModule. */}
      <View className="flex-1 bg-panel" />
    </SafeAreaView>
  )
}
