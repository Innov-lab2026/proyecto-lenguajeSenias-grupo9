import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Button } from '@/src/components/common/Button'

/**
 * Pantalla para rutas inexistentes (ruta especial +not-found de Expo Router).
 * Cubre el "Unmatched Route" en local/nativo; en Vercel se sirve como 404.html
 * (ver script build en package.json). "Volver al inicio" navega a "/", que el
 * guard resuelve según la sesión: home si está autenticado, bienvenida si no.
 */
export default function NotFoundScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-8">
      <View className="w-full max-w-md items-center gap-3">
        <Image
          source={require('@/assets/images/auth/capi-body.webp')}
          style={{ width: 140, height: 140 }}
          contentFit="contain"
          accessibilityLabel="Carpincho de CarpiSeñas"
        />
        <Text className="font-nunito text-7xl font-black text-secondary">404</Text>
        <Text className="text-center font-nunito text-lg font-bold text-ink">
          Página no encontrada
        </Text>
        <Text className="text-center font-nunito text-sm font-normal text-muted">
          La página que buscás no existe o fue movida.
        </Text>
        <Button
          label="Volver al inicio"
          onPress={() => router.replace('/')}
          className="mt-3 max-w-xs"
        />
      </View>
    </SafeAreaView>
  )
}
