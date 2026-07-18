import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/src/utils/cn'
import type { HomeModule } from '@/src/types/home'

interface ModuleTabsProps {
  modules: HomeModule[]
  selectedId: string
  onSelect: (moduleId: string) => void
}

/**
 * Pestañas de módulos pegadas al panel de islas: la seleccionada resalta en
 * azul y más alta; el resto va en gris. Los módulos bloqueados muestran un
 * candado y también son seleccionables — al elegirlos se muestra la vista de
 * módulo bloqueado (diseño 02-home.png).
 */
export function ModuleTabs({ modules, selectedId, onSelect }: ModuleTabsProps) {
  return (
    <View className="w-full flex-row items-end gap-1">
      {modules.map((module) => {
        const isSelected = module.id === selectedId
        const isLocked = module.state === 'locked'

        return (
          <Pressable
            key={module.id}
            onPress={() => onSelect(module.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={isLocked ? `${module.title} (bloqueado)` : module.title}
            className={cn(
              'items-center justify-center gap-0.5 rounded-t-xl active:opacity-90',
              isSelected ? 'h-14 flex-[1.4] bg-secondary' : 'h-12 flex-1 bg-tab-locked',
            )}
          >
            <Text
              className={cn('font-nunito font-bold text-white', isSelected ? 'text-lg' : 'text-sm')}
            >
              {module.title}
            </Text>
            {isLocked ? <Ionicons name="lock-closed" size={12} color="#FFFFFF" /> : null}
          </Pressable>
        )
      })}
    </View>
  )
}
