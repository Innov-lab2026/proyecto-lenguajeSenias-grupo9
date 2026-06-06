import { View, Text } from 'react-native'
import { Button } from '@/src/components/common/Button'
import { useLogout } from '@/src/hooks/features/auth/useLogout'

export default function HomeScreen() {
  const logout = useLogout()

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-5">
      <Text className="text-2xl font-bold text-ink">LSA App 👋</Text>
      <Button label="Cerrar sesión" variant="ghost" onPress={logout} className="max-w-xs" />
    </View>
  )
}
