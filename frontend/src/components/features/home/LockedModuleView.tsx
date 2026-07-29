import { Text, View } from 'react-native'
import { Image } from 'expo-image'

interface LockedModuleViewProps {
  message: string
}

/**
 * Vista de un módulo bloqueado (diseño 02-home.png): mensaje con lo que falta
 * completar y carpi-2 leyendo (el globo "…" ya viene incluido en el PNG).
 */
export function LockedModuleView({ message }: LockedModuleViewProps) {
  return (
    <View className="flex-1 items-center justify-center bg-panel px-8">
      <Text className="text-center font-nunito text-lg font-bold text-ink">{message}</Text>
      <Image
        source={require('@/assets/images/home/carpi-2.png')}
        style={{ width: 280, height: 280, marginTop: 24 }}
        contentFit="contain"
        accessibilityLabel="Carpincho leyendo el libro de Lengua de Señas Argentina"
      />
    </View>
  )
}
