import { View, Text, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/src/utils/cn'
import { useFavoritesStore, type FavoriteItem } from '@/src/store/favoritesStore'
import { useModules } from '@/src/hooks/features/lessons/useModules'
import { useCompletedLessons } from '@/src/hooks/features/lessons/useCompletedLessons'
import { useAllLessons } from '@/src/hooks/features/lessons/useAllLessons'
import { LessonVideo } from '@/src/components/features/lessons/LessonVideo'
import { usePreferencesStore } from '@/src/store/preferencesStore'

/** Componente de lista de favoritos: agrupa favoritos por módulos (y su estado de bloqueo) y abecedario. */
export function FavoritesList() {
  const favoritesStore = useFavoritesStore()
  const isMuted = usePreferencesStore((s) => s.isMuted)
  const [playingItem, setPlayingItem] = useState<FavoriteItem | null>(null)

  const modulesQuery = useModules()
  const completedLessonsQuery = useCompletedLessons()
  const lessonsQuery = useAllLessons()

  // Hidratar favoritos al montar
  useEffect(() => {
    favoritesStore.loadFavorites()
  }, [])

  const handleToggleFavorite = (id: string, title: string) => {
    Alert.alert(
      '¿Quitar de favoritos?',
      `Se eliminará "${title}" de tu lista.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => favoritesStore.removeFavorite(id)
        }
      ]
    )
  }

  const isLoading =
    modulesQuery.isPending ||
    completedLessonsQuery.isPending ||
    lessonsQuery.isPending

  // Vista vacía general
  if (favoritesStore.items.length === 0) {
    return (
      <View className="flex-1 items-center justify-start px-10 pt-16">
        <Text className="font-nunito text-lg font-bold text-center text-ink mb-20 px-4">
          Agrega tus ejercicios o lecciones favoritas.
        </Text>
        <Image
          source={require('@/assets/images/home/carpi-2.png')}
          className="w-48 h-48"
          contentFit="contain"
        />
      </View>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    )
  }

  const completedLessonIds = new Set((completedLessonsQuery.data ?? []).map((c) => c.lesson_id))
  const allLessons = lessonsQuery.data ?? []
  const sortedModules = [...(modulesQuery.data ?? [])].sort((a, b) => a.order - b.order)

  // Un módulo está completo si tiene lecciones y todas están completadas
  const isModuleComplete = (moduleId: string) => {
    const lessons = allLessons.filter((l) => l.module_id === moduleId)
    return lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l.id))
  }

  // Obtener ID del módulo según su orden, con fallback de mock
  const getModuleIdByOrder = (order: number) => {
    return sortedModules.find(m => m.order === order)?.id ?? `mock-module-${order}`
  }

  const getModuleTitle = (order: number, defaultTitle: string) => {
    return sortedModules.find(m => m.order === order)?.title ?? defaultTitle
  }

  const modulesList = [
    { id: getModuleIdByOrder(1), number: 1, name: getModuleTitle(1, 'Módulo 1: Introducción') },
    { id: getModuleIdByOrder(2), number: 2, name: getModuleTitle(2, 'Módulo 2: Presentaciones') },
    { id: getModuleIdByOrder(3), number: 3, name: getModuleTitle(3, 'Módulo 3: Familia') }
  ]

  // Un módulo está bloqueado si el anterior no está completo
  const isModuleLocked = (moduleId: string) => {
    const m1Id = getModuleIdByOrder(1)
    if (moduleId === m1Id) return false

    const m2Id = getModuleIdByOrder(2)
    if (moduleId === m2Id) {
      return !isModuleComplete(m1Id)
    }

    return !isModuleComplete(m1Id) || !isModuleComplete(m2Id)
  }

  // Renderizar cada tarjeta de favoritos (isCarousel controla el ancho fijo y margen derecho)
  const renderFavoriteCard = (item: FavoriteItem, isCarousel: boolean = false) => {
    const isLetter = item.type === 'letter'
    const displayLetter = item.letter ?? item.title.replace('Letra ', '')

    // Dividir título en "Nivel X" y "Título de lección"
    const match = item.title.match(/Nivel\s+(\d+),\s+(.*)/i)
    const levelNumber = match ? match[1] : null
    const lessonTitle = match ? match[2].charAt(0).toUpperCase() + match[2].slice(1) : item.title

    return (
      <View key={item.id} className={cn(isCarousel ? 'w-28 mr-3' : 'w-[48%] mb-4')}>
        <Pressable
          className={cn(
            "aspect-square bg-[#BEE3F8]/30 rounded-[24px] items-center border-b-[3px] border-black/5 active:mt-0.5 active:border-b-0 relative overflow-hidden px-2.5",
            isLetter ? "justify-center" : "justify-between"
          )}
          onPress={() => setPlayingItem(item)}
        >
          {isLetter ? (
            <Text className="font-nunito text-5xl font-black text-[#4A90E2]">
              {displayLetter}
            </Text>
          ) : (
            <View className="flex-1 w-full items-center justify-between py-3">
              <View className="items-center w-full">
                {levelNumber && (
                  <Text className="font-nunito text-[10px] font-bold text-muted/60 text-center">
                    Nivel {levelNumber}
                  </Text>
                )}
                <Text className="font-nunito text-[10px] font-bold text-center text-muted leading-tight" numberOfLines={1}>
                  {lessonTitle}
                </Text>
              </View>

              {item.subtitle ? (
                <View className="flex-1 justify-center items-center w-full mt-1">
                  <Text className="font-nunito text-xs font-black text-center text-secondary leading-tight px-1" numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </View>
              ) : (
                <View className="flex-1 justify-center items-center w-full mt-1">
                  <Text className="font-nunito text-xs font-black text-center text-ink leading-tight" numberOfLines={2}>
                    {lessonTitle}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Pressable>
      </View>
    )
  }

  const alphabetFavorites = favoritesStore.items
    .filter((item) => item.type === 'letter')
    .sort((a, b) => {
      const la = (a.letter ?? a.title.replace('Letra ', '')).toUpperCase()
      const lb = (b.letter ?? b.title.replace('Letra ', '')).toUpperCase()
      return la.localeCompare(lb)
    })
  const hasLessonFavorites = favoritesStore.items.some((item) => item.type === 'lesson')

  return (
    <View className="flex-1 w-full">
      <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
        {modulesList.map((m) => {
          const moduleFavorites = favoritesStore.items
            .filter((item) => item.type === 'lesson' && item.moduleNumber === m.number)
            .sort((a, b) => {
              // Ordenar por número de lección extraído del contentKey (mX-lY)
              const getLesson = (ck?: string) => {
                const match = ck?.match(/m\d+-l(\d+)/)
                return match ? parseInt(match[1]) : 999
              }
              return getLesson(a.contentKey) - getLesson(b.contentKey)
            })

          // Ocultar el grupo si no posee videos favoritos seleccionados
          if (moduleFavorites.length === 0) return null

          const isLocked = isModuleLocked(m.id)

          return (
            <View key={m.id} className="mb-8">
              <View className="px-5 mb-3">
                <Text className="font-nunito text-2xl font-bold text-ink">{m.name}</Text>
              </View>

              {isLocked ? (
                <View className="px-5">
                  <Text className="font-nunito text-sm text-muted mb-2 pr-6">
                    {m.number === 2
                      ? 'Bloqueado, completá el módulo 1 para empezar a agregar tus lecciones favoritas.'
                      : 'Bloqueado, completá los módulos anteriores para empezar a agregar tus lecciones favoritas.'}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {moduleFavorites.map((item) => renderFavoriteCard(item, true))}
                </ScrollView>
              )}
            </View>
          )
        })}

        {/* Divisor bonito entre módulos y Abecedario */}
        {hasLessonFavorites && alphabetFavorites.length > 0 && (
          <View className="flex-row items-center my-6 px-5">
            <View className="flex-1 h-[1px] bg-muted/20" />
          </View>
        )}

        {/* Sección Abecedario - se oculta si está vacía */}
        {alphabetFavorites.length > 0 && (
          <View className="mb-12">
            <View className="px-5 mb-3">
              <Text className="font-nunito text-2xl font-bold text-ink">Abecedario</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {alphabetFavorites.map((item) => renderFavoriteCard(item, true))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Modal para reproducir el video favorito */}
      <Modal
        visible={playingItem !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPlayingItem(null)}
      >
        <View className="flex-1 max-w-2xl mx-auto justify-center items-center relative">
          <Pressable
            className="absolute top-10 right-5 z-50 p-2 bg-black/50 rounded-full"
            onPress={() => setPlayingItem(null)}
          >
            <Ionicons name="close" size={32} color="white" />
          </Pressable>
          {playingItem && playingItem.videoUrl ? (
            <View className="w-full h-full max-h-[85%] relative justify-center items-center">
              <LessonVideo
                uri={playingItem.videoUrl}
                className="w-full h-full"
                muted={isMuted}
                autoPlay={true}
              />
              {/* Botón de corazón en la esquina inferior derecha para desfavoritar (estilo Instagram) */}
              <Pressable
                onPress={() => favoritesStore.toggleFavorite(playingItem)}
                accessibilityRole="button"
                accessibilityLabel={
                  favoritesStore.isFavorite(playingItem.id)
                    ? 'Quitar de favoritos'
                    : 'Añadir a favoritos'
                }
                hitSlop={8}
                className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-black/40 z-50 border border-white/20 active:scale-95"
              >
                <Ionicons
                  name={favoritesStore.isFavorite(playingItem.id) ? 'heart' : 'heart-outline'}
                  size={30}
                  color={favoritesStore.isFavorite(playingItem.id) ? '#EF4444' : '#FFFFFF'}
                />
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  )
}
