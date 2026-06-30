import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/src/utils/cn'
import type { Module } from '@/src/types/learning'

interface ModuleTabsProps {
  modules: Module[]
  selectedId: string
  onSelect: (moduleId: string) => void
}

function ModuleTab({
  module,
  isSelected,
  onPress,
}: {
  module: Module
  isSelected: boolean
  onPress: () => void
}) {
  const isLocked = module.state === 'locked'
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (isLocked) return
    scale.value = withSpring(0.95, { damping: 15 })
  }

  const handlePressOut = () => {
    if (isLocked) return
    scale.value = withSpring(1, { damping: 15 })
  }

  if (isLocked) {
    return (
      <View
        className="h-10 w-12 items-center justify-center rounded-2xl bg-muted/10"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
      >
        <Ionicons name="lock-closed" size={18} color="#6F706F" />
      </View>
    )
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="tab"
        accessibilityState={{ selected: isSelected }}
        className={cn(
          'h-10 items-center justify-center rounded-2xl px-5 transition-all',
          isSelected
            ? 'bg-surface shadow-sm'
            : 'bg-transparent'
        )}
      >
        <Text
          className={cn(
            'font-nunito font-bold',
            isSelected ? 'text-base text-ink' : 'text-sm text-muted'
          )}
        >
          {module.title}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

export function ModuleTabs({ modules, selectedId, onSelect }: ModuleTabsProps) {
  return (
    <View className="w-full bg-background/80 px-3 py-2">
      <View className="rounded-3xl bg-muted/10 px-1 py-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row items-center gap-1"
        >
          {modules.map((mod) => (
            <ModuleTab
              key={mod.id}
              module={mod}
              isSelected={selectedId === mod.id}
              onPress={() => onSelect(mod.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  )
}
