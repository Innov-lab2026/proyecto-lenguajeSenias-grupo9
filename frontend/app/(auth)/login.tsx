import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthCard } from '@/src/components/features/auth/AuthCard'

export default function AuthScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-5">
        <AuthCard
          onSubmit={(mode, values) => {
            // TODO(paso 7): cablear useLogin/useRegister + navegación.
            console.log('auth submit', mode, values)
          }}
        />
      </View>
    </SafeAreaView>
  )
}
