import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/src/components/common/Button'
import { useLogout } from '@/src/hooks/features/auth/useLogout'

export default function ProfileScreen() {
  const logout = useLogout()

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-5 gap-6" edges={['top']}>
      <View className="items-center">
        <Text className="font-nunito text-2xl font-bold text-ink">Mi Perfil</Text>
        <Text className="font-nunito text-sm text-muted mt-2 text-center">
          Visualiza tus estadísticas, logros y progreso acumulado.
        </Text>
      </View>
      <Button label="Cerrar sesión" variant="ghost" onPress={logout} className="max-w-xs" />
    </SafeAreaView>
  )
}
