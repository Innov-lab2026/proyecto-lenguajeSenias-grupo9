import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { useModules } from '@/src/hooks/features/lessons/useModules'
import { useCompletedLessons } from '@/src/hooks/features/lessons/useCompletedLessons'
import { useAllLessons } from '@/src/hooks/features/lessons/useAllLessons'
import { cn } from '@/src/utils/cn'

export function AchievementsList() {
  const modulesQuery = useModules()
  const completedLessonsQuery = useCompletedLessons()
  const lessonsQuery = useAllLessons()

  const isLoading = modulesQuery.isPending || completedLessonsQuery.isPending || lessonsQuery.isPending

  if (isLoading) {
    return (
      <View className="py-10 justify-center items-center">
        <ActivityIndicator size="small" color="#5F9BA4" />
      </View>
    )
  }

  const completedLessonIds = new Set((completedLessonsQuery.data ?? []).map((c) => c.lesson_id))
  const allLessons = lessonsQuery.data ?? []

  const lessonsOf = (moduleId: string) =>
    allLessons.filter((l) => l.module_id === moduleId)

  const isModuleComplete = (moduleId: string) => {
    const lessons = lessonsOf(moduleId)
    return lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l.id))
  }

  const sortedModules = [...(modulesQuery.data ?? [])].sort((a, b) => a.order - b.order)

  const achievements = [
    {
      id: 'mod1',
      title: 'Principiante',
      subtitle: 'Completá el módulo 1 para obtenerlo',
      image: require('@/assets/images/lessons/banderines/banderin_nivel5.svg'),
      isUnlocked: sortedModules[0] ? isModuleComplete(sortedModules[0].id) : false,
    },
    {
      id: 'mod2',
      title: 'Intermedio',
      subtitle: 'Completá el módulo 2 para obtenerlo',
      image: require('@/assets/images/lessons/banderines/banderin_nivel10.svg'),
      isUnlocked: sortedModules[1] ? isModuleComplete(sortedModules[1].id) : false,
    },
    {
      id: 'mod3',
      title: 'Experto',
      subtitle: 'Completá el módulo 3 para obtenerlo',
      image: require('@/assets/images/lessons/banderines/banderin_nivel15.svg'),
      isUnlocked: sortedModules[2] ? isModuleComplete(sortedModules[2].id) : false,
    },
  ]

  return (
    <View className="mt-2 px-5">
      <Text className="font-nunito text-3xl font-bold text-ink mb-4">Logros</Text>

      <View className="flex-row justify-between">
        {achievements.map((item) => (
          <View
            key={item.id}
            className="flex-1 aspect-[3/4] border border-black/10 rounded-2xl items-center justify-between overflow-hidden bg-white mx-1 shadow-sm"
          >
            <View className="flex-1 items-center justify-center pt-4 pb-2">
              <Image
                source={item.image}
                className={cn("w-16 h-20", !item.isUnlocked && "opacity-35 grayscale")}
                style={!item.isUnlocked ? { tintColor: '#9BA8B1' } : undefined}
                contentFit="contain"
              />
            </View>
            <View className="bg-[#1F2937] w-full py-2 px-1 items-center justify-center">
              <Text className="font-nunito text-white font-bold text-xs text-center leading-tight">
                {item.title}
              </Text>
              <Text className="font-nunito text-white/60 text-[8px] text-center mt-0.5 leading-tight">
                {item.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
