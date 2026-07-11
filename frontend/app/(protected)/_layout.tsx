import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Slot } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SideBar } from '@/src/components/features/navigation/SideBar'
import { BottomBar } from '@/src/components/features/navigation/BottomBar'
import { Button } from '@/src/components/common/Button'
import { useResponsive } from '@/src/hooks/common/useResponsive'
import { useProfile } from '@/src/hooks/features/profile/useProfile'
import { useLogout } from '@/src/hooks/features/auth/useLogout'
import { isProfileComplete } from '@/src/types/profile'
import { CompleteProfileScreen } from '@/src/components/features/profile/CompleteProfileScreen'

export default function ProtectedLayout() {
  const { isMobile, isTablet } = useResponsive()
  const { data: profile, isPending, isError, refetch } = useProfile()
  const logout = useLogout()

  // Cargando el perfil: spinner centrado (evita el flash de pantalla en blanco).
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#4A90E2" />
      </View>
    )
  }

  // Error al traer el perfil (backend caído / 5xx): no entramos a ciegas salteando
  // el gate — mostramos un estado recuperable con reintento y salida.
  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Text className="text-center font-nunito text-lg font-bold text-ink">
          No pudimos cargar tu perfil
        </Text>
        <Text className="text-center font-nunito text-sm font-normal text-muted">
          Revisá tu conexión e intentá de nuevo.
        </Text>
        <Button label="Reintentar" onPress={() => void refetch()} className="mt-1 max-w-xs" />
        <Pressable onPress={logout} accessibilityRole="link" hitSlop={8}>
          <Text className="font-nunito text-sm font-bold text-secondary">Cerrar sesión</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  // Signup por Google sin país/género/fecha: completar antes de entrar a la app.
  if (profile && !isProfileComplete(profile)) {
    return <CompleteProfileScreen />
  }

  if (isMobile) {
    return (
      // bg-surface: la franja del inset inferior (debajo de la BottomBar) debe
      // verse blanca como la barra; las pantallas pintan su propio bg-background.
      <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
        <View className="flex-1">
          <Slot />
        </View>
        <BottomBar />
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 flex-row bg-background">
      <SideBar isTablet={isTablet} />
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  )
}
