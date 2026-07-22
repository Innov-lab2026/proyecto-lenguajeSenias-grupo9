import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'

const STICKERS_ADQUIRED = [
  { id: '1', name: 'Argentina', image: require('@/assets/images/home/carpi-1.png') },
  { id: '2', name: 'Estudiante', image: require('@/assets/images/home/carpi-2.png') },
  { id: '3', name: 'Rockstar', image: require('@/assets/images/home/carpi-1.png') },
]

const STICKERS_TO_UNLOCK = [
  { id: '4', name: 'Básico', price: 300, type: 'Básico' },
  { id: '5', name: 'Estándar', price: 600, type: 'Estándar' },
  { id: '6', name: 'Premium', price: 1200, type: 'Premium' },
]


export function StickersList() {
  const handleBuy = (type: string, price: number) => {
    Alert.alert(
      'Comprar Sticker',
      `¿Deseas comprar el sticker ${type} por ${price} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar', onPress: () => Alert.alert('Éxito', '¡Sticker adquirido!') }
      ]
    )
  }

  return (
    <View className="mt-8 px-5 pb-10">
      <Text className="font-nunito text-4xl font-bold text-ink mb-2">Stickers</Text>
      
      <Text className="font-nunito text-xl font-bold text-ink mb-4">Adquiridos</Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {STICKERS_ADQUIRED.map((s) => (
          <View key={s.id} className="w-[30%] aspect-square rounded-2xl overflow-hidden border border-black/5">
            <Image 
              source={s.image} 
              contentFit="cover" 
              className="w-full h-full"
            />
          </View>
        ))}
      </View>

      <Text className="font-nunito text-lg font-bold text-ink mb-3">A desbloquear</Text>
      <View className="flex-row flex-wrap gap-3">
        {STICKERS_TO_UNLOCK.map((s) => (
          <Pressable 
            key={s.id} 
            onPress={() => handleBuy(s.type, s.price)}
            className="w-[30%] aspect-square rounded-2xl overflow-hidden bg-black/5 items-center justify-center border border-dashed border-black/20"
          >
            <View className="bg-primary/20 p-2 rounded-full mb-1">
              <Text className="font-nunito text-[10px] font-bold text-ink">{s.price}</Text>
            </View>
            <Text className="font-nunito text-[10px] text-muted">{s.type}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
