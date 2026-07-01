import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/src/components/common/Button'
import { useLogout } from '@/src/hooks/features/auth/useLogout'

const mockProfile = {
  username: 'juanperez',
  streakDays: 12,
  totalPoints: 1540,
}

export default function ProfileScreen() {
  const logout = useLogout()

  return (
    <SafeAreaView className="flex-1 bg-background px-5" edges={['top']}>
      <View className="flex-1 justify-start items-center gap-6 pt-8 px-8">
        <View className="w-full rounded-3xl border border-muted/20 bg-surface p-6 shadow-sm">
          <Text className="font-nunito text-3xl font-bold text-ink">Mi Perfil</Text>
          <Text className="font-nunito text-sm text-muted mt-2">
            Visualiza tus estadísticas, logros y progreso acumulado.
          </Text>
        </View>

        <View className="w-full rounded-3xl bg-surface p-6 shadow-sm border border-muted/20">
          <Text className="font-nunito text-lg font-semibold text-ink mb-4">Resumen de usuario</Text>
          <View className="rounded-2xl bg-background/70 p-4">
            <View className="mb-4">
              <Text className="font-nunito text-sm text-muted">Nombre de usuario</Text>
              <Text className="font-nunito text-xl font-bold text-ink">{mockProfile.username}</Text>
            </View>
            <View className="flex-row justify-between gap-4">
              <View className="flex-1 rounded-2xl bg-primary/10 p-4">
                <Text className="font-nunito text-xs uppercase text-muted">Racha</Text>
                <Text className="font-nunito text-2xl font-bold text-primary mt-2">{mockProfile.streakDays}</Text>
                <Text className="font-nunito text-sm text-muted">días seguidos</Text>
              </View>
              <View className="flex-1 rounded-2xl bg-secondary/10 p-4">
                <Text className="font-nunito text-xs uppercase text-muted">Puntos</Text>
                <Text className="font-nunito text-2xl font-bold text-secondary mt-2">{mockProfile.totalPoints}</Text>
                <Text className="font-nunito text-sm text-muted">puntos totales</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="pb-6 px-5">
        <Button label="Cerrar sesión" variant="ghost" onPress={logout} className="w-full" />
      </View>
    </SafeAreaView>
  )
}
