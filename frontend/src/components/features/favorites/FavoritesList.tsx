import { View, Text, Pressable, ScrollView, Alert } from 'react-native'
import { useState } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/src/utils/cn'

type FavoriteType = 'lesson' | 'letter'

interface FavoriteItem {
  id: string
  type: FavoriteType
  title: string
  subtitle?: string
  image?: any
}

const MOCK_FAVORITES: FavoriteItem[] = [
  { id: '1', type: 'lesson', title: 'Nivel 1, saludos', subtitle: 'Ver lección' },
  { id: '2', type: 'lesson', title: 'Nivel 2, hospital', subtitle: 'Ver lección' },
]

export function FavoritesList() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(MOCK_FAVORITES)

  const handleToggleFavorite = (id: string, title: string) => {
    Alert.alert(
      '¿Quitar de favoritos?',
      `Se eliminará "${title}" de tu lista.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Quitar', 
          style: 'destructive',
          onPress: () => setFavorites(prev => prev.filter(item => item.id !== id))
        }
      ]
    )
  }

  if (favorites.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-10 pb-20">
        <Image 
          source={require('@/assets/images/home/carpi-2.png')} 
          className="w-48 h-48 mb-6"
          contentFit="contain"
        />
        <Text className="font-nunito text-2xl font-bold text-center text-ink mb-2">
          Nada por aquí...
        </Text>
        <Text className="font-nunito text-base text-center text-muted">
          Agregá ejercicios ou letras presionando el corazón para verlas acá.
        </Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap gap-4 pb-10">
        {favorites.map((item) => (
          <View key={item.id} className="w-[47%] mb-2">
            <Pressable 
              className="aspect-square bg-surface rounded-[32px] items-center justify-center border-b-4 border-black/5 active:mt-1 active:border-b-0 relative overflow-hidden"
              onPress={() => Alert.alert('Próximamente', `Abriendo ${item.title}`)}
            >
              <View className="items-center bg-accent/20 w-full h-full justify-center">
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-sm">
                  <Ionicons name="play" size={32} color="#4A90E2" className="ml-1" />
                </View>
              </View>
              
              <Pressable 
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-sm"
                onPress={() => handleToggleFavorite(item.id, item.title)}
              >
                <Ionicons name="heart" size={20} color="#EF4444" />
              </Pressable>
            </Pressable>
            <Text className="font-nunito text-sm font-bold text-ink mt-3 text-center px-1" numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
